 import React, { useState } from 'react';
import { Brain, Sparkles, TrendingUp, Eye, Zap, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { GeminiAnalysisResult } from '../types';

interface AnalysisPanelProps {
  result: GeminiAnalysisResult | null;
  isAnalyzing?: boolean;
  onStartAnalysis?: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
  result, 
  isAnalyzing = false,
  onStartAnalysis 
}) => {
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  // Simulate analysis progress when isAnalyzing is true
  React.useEffect(() => {
    if (isAnalyzing) {
      setAnalysisProgress(0);
      setAnalysisStep('准备分析图像...');
      
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          
          const newProgress = prev + 10;
          
          // Update step based on progress
          if (newProgress <= 20) {
            setAnalysisStep('捕获图像...');
          } else if (newProgress <= 40) {
            setAnalysisStep('检测面部特征...');
          } else if (newProgress <= 60) {
            setAnalysisStep('分析情绪状态...');
          } else if (newProgress <= 80) {
            setAnalysisStep('生成分析报告...');
          } else if (newProgress < 100) {
            setAnalysisStep('完成分析...');
          } else {
            setAnalysisStep('分析完成！');
          }
          
          return newProgress;
        });
      }, 200);
      
      return () => clearInterval(interval);
    } else {
      setAnalysisProgress(0);
      setAnalysisStep('');
    }
  }, [isAnalyzing]);

  if (!result) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-6 h-full flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">准备开始分析</h3>
          <p className="text-gray-400 mb-6 max-w-md">
            点击下方按钮，AI 将分析您的面部特征，提供深度洞察报告
          </p>
          <button
            onClick={onStartAnalysis}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                开始分析
              </>
            )}
          </button>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-300">深度分析</p>
              <p className="text-xs text-gray-500">基于先进AI模型的精准面部特征识别</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-300">实时反馈</p>
              <p className="text-xs text-gray-500">即时获取详细的面部分析报告</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-300">隐私保护</p>
              <p className="text-xs text-gray-500">所有分析均在本地完成，确保数据安全</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analysis in progress state
  if (isAnalyzing) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-6 h-full flex flex-col justify-center">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-slate-800 flex items-center justify-center">
              <Brain className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <svg className="absolute inset-0 w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-slate-700"
              />
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - analysisProgress / 100)}`}
                className="text-blue-500 transition-all duration-300 ease-out"
              />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">AI 正在分析</h3>
          <p className="text-gray-400 mb-4">{analysisStep}</p>
          
          <div className="w-full max-w-xs bg-slate-700 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <div className={`text-center p-3 rounded-lg transition-all ${analysisProgress >= 20 ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-700/30 border border-slate-600/30'}`}>
              <Eye className={`w-6 h-6 mx-auto mb-1 ${analysisProgress >= 20 ? 'text-blue-400' : 'text-gray-500'}`} />
              <p className="text-xs text-gray-400">特征检测</p>
            </div>
            <div className={`text-center p-3 rounded-lg transition-all ${analysisProgress >= 50 ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-slate-700/30 border border-slate-600/30'}`}>
              <Brain className={`w-6 h-6 mx-auto mb-1 ${analysisProgress >= 50 ? 'text-purple-400' : 'text-gray-500'}`} />
              <p className="text-xs text-gray-400">情绪分析</p>
            </div>
            <div className={`text-center p-3 rounded-lg transition-all ${analysisProgress >= 80 ? 'bg-green-500/20 border border-green-500/30' : 'bg-slate-700/30 border border-slate-600/30'}`}>
              <Sparkles className={`w-6 h-6 mx-auto mb-1 ${analysisProgress >= 80 ? 'text-green-400' : 'text-gray-500'}`} />
              <p className="text-xs text-gray-400">生成报告</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          AI 分析报告
        </h2>
        <button
          onClick={onStartAnalysis}
          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          重新分析
        </button>
      </div>
      
      <div className="space-y-6">
        {/* 人口统计信息 */}
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            人口统计信息
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">年龄范围</p>
              <p className="text-lg font-medium text-white">{result.ageRange}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">性别</p>
              <p className="text-lg font-medium text-white">{result.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">种族</p>
              <p className="text-lg font-medium text-white">{result.ethnicity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">吸引力评分</p>
              <p className="text-lg font-medium text-white">{result.attractiveness}</p>
            </div>
          </div>
        </div>

        {/* 情绪分析 */}
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            情绪分析
          </h3>
          <div className="space-y-2">
            {result.emotions.map((emotion, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{emotion.type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-600/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${emotion.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-right">{emotion.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 显著特征 */}
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-400" />
            显著特征
          </h3>
          <ul className="space-y-2">
            {result.prominentFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                <span className="text-sm text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 技术特征 */}
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            技术特征
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {result.technicalFeatures.map((feature, index) => (
              <div key={index}>
                <p className="text-sm text-gray-400">{feature.type}</p>
                <p className="text-lg font-medium text-white">{feature.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI 生成总结 */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-lg p-4 border border-blue-500/20">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            AI 生成总结
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">{result.summary}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;