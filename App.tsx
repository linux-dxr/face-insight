import React, { useEffect } from 'react';
import FaceScanner from './components/FaceScanner';
import AnalysisPanel from './components/AnalysisPanel';
import { GeminiAnalysisResult } from './types';
import * as faceService from './services/faceService';

function App() {
  const [analysisResult, setAnalysisResult] = React.useState<GeminiAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const faceScannerRef = React.useRef<{ triggerAnalysis: () => void } | null>(null);

  // Preload models when app starts
  useEffect(() => {
    faceService.loadModels().catch(err => {
      console.warn("模型预加载失败，将在摄像头初始化时重试:", err);
    });
  }, []);

  const handleAnalysisComplete = (result: GeminiAnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    // 调用FaceScanner组件中的分析函数
    if (faceScannerRef.current) {
      faceScannerRef.current.triggerAnalysis();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            面部分析洞察
          </h1>
          <div className="text-xs sm:text-sm text-gray-400">
            AI Powered Face Analysis
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Analysis Panel Section - now on the left for desktop, top for mobile */}
          <div className="order-1 lg:order-1">
            <AnalysisPanel 
              result={analysisResult} 
              isAnalyzing={isAnalyzing}
              onStartAnalysis={handleStartAnalysis}
            />
          </div>
          
          {/* Camera Section - now on the right for desktop, bottom for mobile */}
          <div className="order-2 lg:order-2">
            <FaceScanner 
              ref={faceScannerRef}
              onAnalysisComplete={handleAnalysisComplete} 
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 backdrop-blur-sm bg-black/20 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-gray-400">
              © 2025 面部分析洞察. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400">
              <span>Powered by</span>
              <span className="text-blue-400">Gemini</span>
              <span>&</span>
              <span className="text-blue-400">通义千问</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;