export interface GeminiAnalysisResult {
  emotion: string;
  ageRange: string;
  gender: string;
  expressionAnalysis: string;
  distinctiveFeatures: string[];
  lightingCondition: string;
  faceShape: string;
}

// 支持的AI模型类型
export enum AIModel {
  GEMINI = 'gemini',
  QWEN = 'qwen'
}

// AI模型配置
export interface AIModelConfig {
  id: AIModel;
  name: string;
  description: string;
  icon: string;
}

export enum DetectionStatus {
  IDLE = 'IDLE',
  LOADING_MODELS = 'LOADING_MODELS',
  DETECTING = 'DETECTING',
  ERROR = 'ERROR',
}

export interface Point {
  x: number;
  y: number;
}

export interface FaceDetectionData {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  score: number;
  landmarks: Point[];
}
