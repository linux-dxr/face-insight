import { GeminiAnalysisResult } from "../types";

// 通义千问API配置
const apiKey = import.meta.env.VITE_QWEN_API_KEY || '';

// 临时存储API密钥（仅用于测试）
let tempApiKey: string = '';

// 设置临时API密钥
export const setTempQwenApiKey = (key: string) => {
  tempApiKey = key;
};

// 获取API密钥（优先使用临时密钥）
const getApiKey = () => {
  return tempApiKey || apiKey;
};

// 简单的Base64转URL安全的Base64
const base64ToUrlSafe = (base64: string): string => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// 将Base64图片转换为通义千问API需要的格式
const prepareImageForQwen = (base64Image: string): string => {
  // 移除data:image/...;base64,前缀
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
  // 转换为URL安全的Base64
  return base64ToUrlSafe(cleanBase64);
};

// 调用通义千问API进行人脸分析
export const analyzeFaceWithQwen = async (base64Image: string): Promise<GeminiAnalysisResult> => {
  const currentApiKey = getApiKey();
  
  if (!currentApiKey) {
    throw new Error("通义千问API密钥未配置，请设置QWEN_API_KEY环境变量或在界面中输入API密钥");
  }

  const imageData = prepareImageForQwen(base64Image);

  // 构建请求体 - 使用OpenAI兼容格式
  const requestBody = {
    model: "qwen-vl-plus",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageData}`
            }
          },
          {
            type: "text",
            text: `请分析这张图片中的人脸。提供关于表情、估计人口统计学特征和视觉特征的详细评估。请务必使用中文回答所有字段，并以JSON格式返回，包含以下字段：
            - emotion: 显示的主要情绪（例如：快乐、中性、惊讶）
            - ageRange: 估计年龄范围（例如：25-30）
            - gender: 估计性别表现
            - expressionAnalysis: 描述微表情的详细句子
            - distinctiveFeatures: 视觉特征列表（例如：眼镜、胡须、耳环、伤疤）
            - lightingCondition: 面部的光照情况描述
            - faceShape: 估计的脸型`
          }
        ]
      }
    ]
  };

  try {
    // 使用fetch直接调用通义千问API - OpenAI兼容端点
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentApiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("通义千问API错误响应:", errorText);
      throw new Error(`通义千问API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("通义千问API响应:", data);
    
    if (data.code && data.code !== '200') {
      throw new Error(`通义千问API错误: ${data.message}`);
    }

    // 提取回复文本 - OpenAI兼容格式
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("通义千问API返回了空内容");
    }

    // 尝试从回复中提取JSON
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("无法从通义千问回复中提取JSON");
    }

    const result = JSON.parse(jsonMatch[0]) as GeminiAnalysisResult;
    return result;
  } catch (error) {
    console.error("通义千问API调用失败:", error);
    throw error;
  }
};