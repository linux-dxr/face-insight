import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Camera, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import * as faceService from '../services/faceService';
import * as geminiService from '../services/geminiService';
import * as qwenService from '../services/qwenService';
import { DetectionStatus, GeminiAnalysisResult, AIModel } from '../types';
import ModelSelector from './ModelSelector';
import ApiKeyInput from './ApiKeyInput';

interface FaceScannerProps {
  onAnalysisComplete: (result: GeminiAnalysisResult) => void;
  isAnalyzing?: boolean;
}

const FaceScanner = forwardRef<{ triggerAnalysis: () => void }, FaceScannerProps>(
  ({ onAnalysisComplete, isAnalyzing = false }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraReady, setCameraReady] = useState<boolean>(false); // Start with false
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<DetectionStatus>(DetectionStatus.LOADING_MODELS);
    const [selectedModel, setSelectedModel] = useState<AIModel>(AIModel.GEMINI);
    const [isMockCamera, setIsMockCamera] = useState<boolean>(false); // Track if using mock camera
    const [mockCameraEnabled, setMockCameraEnabled] = useState<boolean>(false); // Track if mock camera is enabled via toggle
    const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false); // Track if API key input modal is shown
    const [qwenApiKeySet, setQwenApiKeySet] = useState<boolean>(false); // Track if Qwen API key is set
    const [geminiApiKeySet, setGeminiApiKeySet] = useState<boolean>(false); // Track if Gemini API key is set
    const [apiKeyModelType, setApiKeyModelType] = useState<'qwen' | 'gemini'>('qwen'); // Track which model's API key is being set
    const detectionLoopRef = useRef<number | null>(null);

    // Function to handle capture and analysis - defined before useImperativeHandle
    const handleCaptureAndAnalyze = useCallback(async () => {
      if (!videoRef.current) return;

      // Create a temporary canvas to capture the current frame
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = videoRef.current.videoWidth;
      tempCanvas.height = videoRef.current.videoHeight;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = tempCanvas.toDataURL('image/png');

      try {
        let result: GeminiAnalysisResult;
        
        if (selectedModel === AIModel.GEMINI) {
          result = await geminiService.analyzeFaceWithGemini(base64);
        } else if (selectedModel === AIModel.QWEN) {
          result = await qwenService.analyzeFaceWithQwen(base64);
        } else {
          throw new Error("未知的AI模型");
        }
        
        onAnalysisComplete(result);
      } catch (err) {
        console.error(err);
        const modelName = selectedModel === AIModel.GEMINI ? "Gemini" : "通义千问";
        setError(`${modelName} 分析失败，请检查 API Key。`);
      }
    }, [onAnalysisComplete, selectedModel]);

    // Function to manually trigger model loading
    const handleLoadModels = useCallback(async () => {
      if (status === DetectionStatus.LOADING_MODELS) {
        // Already loading, do nothing
        return;
      }
      
      setStatus(DetectionStatus.LOADING_MODELS);
      try {
        await faceService.loadModels();
        setStatus(DetectionStatus.DETECTING);
      } catch (err) {
        console.error("模型加载失败:", err);
        setError("模型加载失败，请刷新页面重试。");
        setStatus(DetectionStatus.ERROR);
      }
    }, [status]);

    // Expose the triggerAnalysis function to parent component
    useImperativeHandle(ref, () => ({
      triggerAnalysis: handleCaptureAndAnalyze
    }), [handleCaptureAndAnalyze]);

    // Function to create a mock camera stream
    const createMockCameraStream = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("无法创建Canvas上下文");
      }
      
      let frameCount = 0;
      const drawFrame = () => {
        // Clear canvas with a dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a grid pattern to make it more obvious it's a mock camera
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 40) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(canvas.width, i);
          ctx.stroke();
        }
        
        // Draw a simple animated face
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        
        // Face outline
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Eyes
        const eyeOffsetX = 30;
        const eyeOffsetY = 20;
        const eyeRadius = 10;
        
        // Left eye
        ctx.fillStyle = '#4a9eff';
        ctx.beginPath();
        ctx.arc(centerX - eyeOffsetX, centerY - eyeOffsetY, eyeRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX, centerY - eyeOffsetY, eyeRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Nose
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX, centerY + 10);
        ctx.stroke();
        
        // Mouth (animated)
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const mouthY = centerY + 30 + Math.sin(frameCount * 0.05) * 10;
        ctx.arc(centerX, mouthY, 30, 0, Math.PI);
        ctx.stroke();
        
        frameCount++;
      };
      
      // Draw initial frame
      drawFrame();
      
      // Create stream from canvas
      const stream = canvas.captureStream(30);
      
      // Continue drawing frames
      const interval = setInterval(drawFrame, 1000 / 30);
      
      // Store interval ID for cleanup
      (stream as any).mockInterval = interval;
      
      return stream;
    };

    // Function to manually switch to mock camera
    const switchToMockCamera = () => {
      // Clean up existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        // Clean up mock camera interval if exists
        if ((stream as any).mockInterval) {
          clearInterval((stream as any).mockInterval);
        }
      }
      
      console.log("手动切换到模拟摄像头");
      const mockStream = createMockCameraStream();
      setStream(mockStream);
      setIsMockCamera(true);
      setCameraReady(true);
      setStatus(DetectionStatus.DETECTING);
      
      // Set the mock stream to video element after a short delay
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mockStream;
          videoRef.current.play().catch(e => console.error("播放模拟流失败:", e));
        }
      }, 100);
    };

    // Function to switch to mock camera with error handling
    const switchToMockCameraWithErrorHandling = () => {
      try {
        const mockStream = createMockCameraStream();
        setStream(mockStream);
        setIsMockCamera(true);
        setCameraReady(true);
        setStatus(DetectionStatus.LOADING_MODELS); // Set to loading models state
        // Set the mock stream to video element after a short delay
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = mockStream;
            videoRef.current.play().catch(e => console.error("播放模拟流失败:", e));
          }
        }, 100);
      } catch (mockErr) {
        console.error("模拟摄像头初始化也失败了:", mockErr);
        setError("摄像头和模拟摄像头都无法初始化。请刷新页面重试。");
      }
    };

    // Function to switch back to real camera
    const switchToRealCamera = async () => {
      // Clean up existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        // Clean up mock camera interval if exists
        if ((stream as any).mockInterval) {
          clearInterval((stream as any).mockInterval);
        }
      }
      
      setStream(null);
      setIsMockCamera(false);
      setCameraReady(false);
      
      try {
        // Try to access the real camera
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 650 },
            facingMode: "user" 
          } 
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              setCameraReady(true);
            }
          };
        }
      } catch (err) {
        console.error("无法访问真实摄像头:", err);
        setError("无法访问真实摄像头，请检查设备权限。");
      }
    };

    // Function to toggle mock camera
    const toggleMockCamera = () => {
      if (mockCameraEnabled) {
        // Switch to mock camera
        switchToMockCamera();
      } else {
        // Switch to real camera
        if (isMockCamera) {
          switchToRealCamera();
        }
      }
    };

    // Effect to handle mock camera toggle
    useEffect(() => {
      toggleMockCamera();
    }, [mockCameraEnabled]);

    // Initialize Camera first
    useEffect(() => {
      const initCamera = async () => {
        try {
          // First check if mediaDevices is available
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("您的浏览器不支持摄像头访问功能。");
          }

          // Check if user wants to use mock camera
          if (mockCameraEnabled) {
            console.log("用户选择使用模拟摄像头");
            // Create a mock camera using a canvas
            const mockStream = createMockCameraStream();
            setStream(mockStream);
            setIsMockCamera(true);
            setCameraReady(true);
            setStatus(DetectionStatus.LOADING_MODELS); // Set to loading models state
            // Set the mock stream to video element after a short delay
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.srcObject = mockStream;
                videoRef.current.play().catch(e => console.error("播放模拟流失败:", e));
              }
            }, 100);
            return;
          }

          // Start loading models in background immediately
          const modelLoadingPromise = faceService.loadModels().then(() => {
            console.log("模型加载完成");
            setStatus(DetectionStatus.DETECTING);
          }).catch(err => {
            console.error("模型加载失败:", err);
            // Still allow camera usage even if models fail
            setStatus(DetectionStatus.DETECTING);
          });

          // Try to access the camera with minimal constraints for fastest initialization
          const videoConstraints = {
            facingMode: "user"
          };

          console.log("使用简化视频约束:", videoConstraints);

          // Try to access the camera
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: videoConstraints
          });
          
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            
            // Play immediately without waiting for metadata in most cases
            videoRef.current.play()
              .then(() => {
                console.log("摄像头成功启动");
                setCameraReady(true);
                setStatus(DetectionStatus.LOADING_MODELS); // Set to loading models state
              })
              .catch(e => {
                console.error("摄像头播放失败:", e);
                // Fallback to mock camera
                const mockStream = createMockCameraStream();
                setStream(mockStream);
                setIsMockCamera(true);
                setCameraReady(true);
                setStatus(DetectionStatus.LOADING_MODELS); // Set to loading models state
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.srcObject = mockStream;
                    videoRef.current.play().catch(err => console.error("播放模拟流失败:", err));
                  }
                }, 100);
              });
          }
        } catch (err: any) {
          console.error("摄像头初始化错误:", err);
          
          // Provide more specific error messages
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError("摄像头访问权限被拒绝。请允许网页访问摄像头。点击下方按钮重试或切换到模拟摄像头。");
          } else if (err.name === 'NotFoundError' || err.name === 'DeviceNotFoundError') {
            setError("未找到可用的摄像头设备。请检查设备连接或切换到模拟摄像头。");
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            setError("摄像头已被其他应用占用。请关闭其他使用摄像头的应用，然后刷新页面重试。");
          } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
            // Try again with default constraints
            console.log("摄像头不支持请求的分辨率，尝试使用默认设置");
            try {
              const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
              setStream(fallbackStream);
              if (videoRef.current) {
                videoRef.current.srcObject = fallbackStream;
                videoRef.current.play()
                  .then(() => {
                    console.log("摄像头成功启动（使用默认设置）");
                    setCameraReady(true);
                    setStatus(DetectionStatus.LOADING_MODELS);
                  })
                  .catch(e => {
                    throw e; // Re-throw to use fallback handling below
                  });
              }
            } catch (fallbackErr) {
              console.error("使用默认设置仍然失败:", fallbackErr);
              // Fallback to mock camera
              switchToMockCameraWithErrorHandling();
            }
          } else {
            // Fallback to mock camera on any other error
            console.log("摄像头初始化失败，切换到模拟摄像头");
            switchToMockCameraWithErrorHandling();
          }
        }
      };

      initCamera();

      return () => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          // Clean up mock camera interval if exists
          if ((stream as any).mockInterval) {
            clearInterval((stream as any).mockInterval);
          }
        }
        if (detectionLoopRef.current) {
          cancelAnimationFrame(detectionLoopRef.current);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    // Real-time Detection Loop - only run when both camera and model are ready
    const startDetection = useCallback(() => {
      if (!videoRef.current || !canvasRef.current || !stream) return;

      const detect = async () => {
        if (videoRef.current && videoRef.current.readyState === 4 && canvasRef.current) {
          // Match canvas dimensions to video
          const dims = {
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
          };
          
          canvasRef.current.width = dims.width;
          canvasRef.current.height = dims.height;

          // Only try to detect faces if models are loaded
          if (status === DetectionStatus.DETECTING) {
            const faceData = await faceService.detectFace(videoRef.current);
            
            if (faceData && canvasRef.current) {
              faceService.drawFaceData(canvasRef.current, faceData, dims);
            } else if (canvasRef.current) {
               // Clear canvas if no face
               const ctx = canvasRef.current.getContext('2d');
               ctx?.clearRect(0, 0, dims.width, dims.height);
            }
          }
        }
        detectionLoopRef.current = requestAnimationFrame(detect);
      };

      detect();
    }, [status, stream]);

    useEffect(() => {
      if (status === DetectionStatus.LOADING_MODELS || status === DetectionStatus.DETECTING) {
        startDetection();
      }
    }, [status, startDetection]);

    // Error state
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-6 rounded-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-xl font-medium mb-2">摄像头错误</p>
          <p className="text-gray-300 text-center mb-6">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Retry button */}
            <button
              onClick={() => {
                setError(null);
                window.location.reload(); // Refresh the page to retry
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              刷新页面重试
            </button>
            
            {/* Switch to mock camera button */}
            <button
              onClick={() => {
                setError(null);
                setMockCameraEnabled(true); // Switch to mock camera on retry
              }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              使用模拟摄像头
            </button>
            
            {/* Reload models button */}
            <button
              onClick={handleLoadModels}
              disabled={status === DetectionStatus.LOADING_MODELS}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                status === DetectionStatus.LOADING_MODELS
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {status === DetectionStatus.LOADING_MODELS ? '模型加载中...' : '重新加载模型'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto">
        {/* Model selector - always show */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center bg-gray-800 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setSelectedModel(AIModel.GEMINI)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedModel === AIModel.GEMINI
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Gemini
            </button>
            <button
              onClick={() => setSelectedModel(AIModel.QWEN)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedModel === AIModel.QWEN
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              通义千问
            </button>
          </div>
        </div>
        
        {/* API Key setting button for selected model */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              setApiKeyModelType(selectedModel === AIModel.GEMINI ? 'gemini' : 'qwen');
              setShowApiKeyInput(true);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              (selectedModel === AIModel.GEMINI && geminiApiKeySet) || 
              (selectedModel === AIModel.QWEN && qwenApiKeySet)
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-yellow-600 text-white shadow-md'
            }`}
          >
            {selectedModel === AIModel.GEMINI 
              ? (geminiApiKeySet ? 'API密钥已设置' : '设置Gemini API密钥')
              : (qwenApiKeySet ? 'API密钥已设置' : '设置通义千问API密钥')
            }
          </button>
        </div>

        {/* Video Container */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-secondary shadow-2xl bg-black">
          {/* Camera initialization state - show different messages based on current status */}
          {!cameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-50 text-white">
              <RefreshCw className="w-8 h-8 animate-spin text-accent mb-2" />
              <p className="text-sm font-medium">
                {status === DetectionStatus.LOADING_MODELS ? '正在加载面部识别模型...' : '正在初始化摄像头...'}
              </p>
              <p className="text-xs text-gray-400 mt-2 text-center px-4">
                {status === DetectionStatus.LOADING_MODELS 
                  ? '这可能需要几秒钟时间，请耐心等待...' 
                  : '正在尝试访问摄像头设备，请稍候...\n如果长时间无响应，请检查摄像头权限设置。'}
              </p>
            </div>
          )}
          
          {stream && (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play();
                    setCameraReady(true);
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" // Mirror effect
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none"
              />
            </>
          )}
          
          {/* Show mock camera indicator when using mock camera */}
           {stream && cameraReady && isMockCamera && (
             <div className="absolute bottom-4 left-4 bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                 <span className="text-xs font-mono text-white">模拟摄像头</span>
               </div>
             </div>
           )}
          
          {/* Status indicators - always show when stream is available */}
          {cameraReady && (
            <>
              {/* Camera status indicator */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-mono text-gray-200">摄像头已就绪</span>
                </div>
              </div>
              
              {/* Model status indicator */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status === DetectionStatus.DETECTING ? 'bg-green-500 animate-pulse' : status === DetectionStatus.LOADING_MODELS ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-xs font-mono text-gray-200">
                     {status === DetectionStatus.DETECTING ? '模型已就绪' : status === DetectionStatus.LOADING_MODELS ? '模型加载中...' : '模型离线'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mock Camera Toggle - Mobile optimized */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-300">真实摄像头</span>
            <button
              onClick={() => setMockCameraEnabled(!mockCameraEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                mockCameraEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  mockCameraEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-300">模拟摄像头</span>
          </div>
        </div>

        {/* Controls - Mobile optimized layout */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full">
          {/* 使用模拟摄像头按钮已移除 */}
        </div>
        
        <p className="mt-4 text-xs text-slate-500 text-center max-w-md">
          由 face-api.js 提供实时追踪 (TensorFlow.js) 及大模型提供深度语义理解。
        </p>
        
        {/* API Key Input Modal */}
        {showApiKeyInput && (
          <ApiKeyInput
            onApiKeySet={() => {
              if (apiKeyModelType === 'qwen') {
                setQwenApiKeySet(true);
              } else {
                setGeminiApiKeySet(true);
              }
            }}
            onClose={() => setShowApiKeyInput(false)}
            modelType={apiKeyModelType}
          />
        )}
      </div>
    );
  }
);

FaceScanner.displayName = 'FaceScanner';

export default FaceScanner;