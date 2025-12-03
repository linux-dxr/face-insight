import * as faceapi from 'face-api.js';
import { FaceDetectionData } from '../types';

// Using a public CDN for models to ensure the app works without local model files
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

// Track model loading status to prevent duplicate loads
let modelsLoaded = false;

export const loadModels = async (): Promise<void> => {
  // If models are already loaded, return immediately
  if (modelsLoaded) {
    console.log("Models already loaded, skipping...");
    return;
  }
  
  try {
    console.log("开始加载人脸检测模型...");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    console.log("人脸检测模型加载完成");
  } catch (error) {
    console.error("Failed to load face-api models", error);
    throw new Error("Failed to load face detection models.");
  }
};

export const detectFace = async (video: HTMLVideoElement): Promise<FaceDetectionData | null> => {
  // Using TinyFaceDetector for high FPS
  const options = new faceapi.TinyFaceDetectorOptions();
  
  const detection = await faceapi
    .detectSingleFace(video, options)
    .withFaceLandmarks();

  if (!detection) return null;

  return {
    box: {
      x: detection.detection.box.x,
      y: detection.detection.box.y,
      width: detection.detection.box.width,
      height: detection.detection.box.height,
    },
    score: detection.detection.score,
    landmarks: detection.landmarks.positions,
  };
};

export const drawFaceData = (
  canvas: HTMLCanvasElement,
  data: FaceDetectionData,
  videoDims: { width: number; height: number }
) => {
  // 添加保护措施，防止canvas为null或无法获取context
  if (!canvas) {
    console.warn('Canvas is null, skipping face data drawing');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('Could not get 2D context from canvas, skipping face data drawing');
    return;
  }

  // Clear previous frame
  ctx.clearRect(0, 0, videoDims.width, videoDims.height);

  // Draw Box
  ctx.strokeStyle = '#38bdf8'; // Sky blue
  ctx.lineWidth = 2;
  ctx.strokeRect(data.box.x, data.box.y, data.box.width, data.box.height);

  // Draw Score
  ctx.fillStyle = '#38bdf8';
  ctx.font = '14px Inter';
  ctx.fillText(`Score: ${(data.score * 100).toFixed(0)}%`, data.box.x, data.box.y - 10);

  // Draw Landmarks
  ctx.fillStyle = '#10b981'; // Emerald
  data.landmarks.forEach((pt) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
};
