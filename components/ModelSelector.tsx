import React from 'react';
import { AIModel, AIModelConfig } from '../types';
import { Brain, Cloud } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

// 可用的AI模型配置
const AI_MODELS: AIModelConfig[] = [
  {
    id: AIModel.GEMINI,
    name: 'Google Gemini',
    description: 'Google的多模态大模型，提供高质量的人脸分析',
    icon: 'brain'
  },
  {
    id: AIModel.QWEN,
    name: '通义千问',
    description: '阿里云的多模态大模型，支持中文场景优化',
    icon: 'cloud'
  }
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain':
        return <Brain className="w-5 h-5" />;
      case 'cloud':
        return <Cloud className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-slate-300 mb-3">选择AI模型</h3>
      <div className="grid grid-cols-2 gap-3">
        {AI_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`p-3 rounded-lg border transition-all flex flex-col h-full ${
              selectedModel === model.id
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {getIcon(model.icon)}
              <span className="font-medium">{model.name}</span>
            </div>
            <p className="text-xs text-left opacity-80 flex-grow">{model.description}</p>
          </button>
        ))}
      </div>
      
      <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
        <p className="text-xs text-slate-400">
          {selectedModel === AIModel.GEMINI && (
            <>使用Google Gemini进行人脸分析。需要设置API_KEY环境变量。</>
          )}
          {selectedModel === AIModel.QWEN && (
            <>使用通义千问进行人脸分析。需要设置QWEN_ACCESS_KEY_ID和QWEN_ACCESS_KEY_SECRET环境变量。</>
          )}
        </p>
      </div>
    </div>
  );
};

export default ModelSelector;