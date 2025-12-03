import React, { useState } from 'react';
import { setTempQwenApiKey } from '../services/qwenService';
import { setTempGeminiApiKey } from '../services/geminiService';

interface ApiKeyInputProps {
  onApiKeySet: () => void;
  onClose: () => void;
  modelType: 'qwen' | 'gemini';
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet, onClose, modelType }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('请输入有效的API密钥');
      return;
    }
    
    setIsSaving(true);
    
    // 根据模型类型设置对应的API密钥
    if (modelType === 'qwen') {
      setTempQwenApiKey(apiKey.trim());
    } else if (modelType === 'gemini') {
      setTempGeminiApiKey(apiKey.trim());
    }
    
    // 模拟保存过程
    setTimeout(() => {
      setIsSaving(false);
      onApiKeySet();
      onClose();
    }, 500);
  };

  const getModelName = () => {
    return modelType === 'qwen' ? '通义千问' : 'Gemini';
  };

  const getApiHelpUrl = () => {
    return modelType === 'qwen' 
      ? 'https://bailian.console.aliyun.com/' 
      : 'https://makersuite.google.com/app/apikey';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">设置{getModelName()}API密钥</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            请输入您的{getModelName()}API密钥。此密钥仅在当前会话中使用，不会保存到文件中。
          </p>
          <a 
            href={getApiHelpUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline"
          >
            如何获取API密钥？
          </a>
        </div>
        
        <div className="mb-4">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
            API密钥
          </label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={modelType === 'qwen' ? 'sk-xxxxxxxxxxxxxxxxxxxxxxxx' : 'AIzaxxxxxxxxxxxxxxxxxxxxxxx'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;