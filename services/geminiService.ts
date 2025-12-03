import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';

// 临时存储API密钥（仅用于测试）
let tempApiKey: string = '';

// 设置临时API密钥
export const setTempGeminiApiKey = (key: string) => {
  tempApiKey = key;
};

// 获取API密钥（优先使用临时密钥）
const getApiKey = () => {
  return tempApiKey || apiKey;
};

// Initialize Gemini client
let ai: GoogleGenAI;

// 初始化或重新初始化Gemini客户端
const initializeGeminiClient = () => {
  const currentApiKey = getApiKey();
  if (!currentApiKey) {
    throw new Error("Gemini API密钥未配置");
  }
  ai = new GoogleGenAI({ apiKey: currentApiKey });
};

// 初始化客户端
try {
  initializeGeminiClient();
} catch (e) {
  console.warn("Gemini客户端初始化失败，将在设置API密钥后重试");
}

export const analyzeFaceWithGemini = async (base64Image: string): Promise<GeminiAnalysisResult> => {
  // 确保客户端已初始化
  try {
    initializeGeminiClient();
  } catch (e) {
    throw new Error("Gemini API密钥未配置，请设置API_KEY环境变量或在界面中输入API密钥");
  }
  
  // Strip the prefix if present
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/png",
            data: cleanBase64,
          },
        },
        {
          text: `请分析这张图片中的人脸。提供关于表情、估计人口统计学特征和视觉特征的详细评估。请务必使用中文回答所有字段。`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          emotion: { type: Type.STRING, description: "显示的主要情绪（例如：快乐、中性、惊讶）" },
          ageRange: { type: Type.STRING, description: "估计年龄范围（例如：25-30）" },
          gender: { type: Type.STRING, description: "估计性别表现" },
          expressionAnalysis: { type: Type.STRING, description: "描述微表情的详细句子" },
          distinctiveFeatures: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "视觉特征列表（例如：眼镜、胡须、耳环、伤疤）"
          },
          lightingCondition: { type: Type.STRING, description: "面部的光照情况描述" },
          faceShape: { type: Type.STRING, description: "估计的脸型" }
        },
        required: ["emotion", "ageRange", "gender", "expressionAnalysis", "distinctiveFeatures", "lightingCondition", "faceShape"]
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from Gemini API");
  }

  try {
    const result = JSON.parse(response.text) as GeminiAnalysisResult;
    return result;
  } catch (e) {
    console.error("Failed to parse Gemini JSON", e);
    throw new Error("Invalid JSON response from Gemini");
  }
};