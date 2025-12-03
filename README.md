# Face Insight - 人脸分析应用

这是一个基于Next.js和React的人脸分析应用，支持使用Google Gemini和通义千问两种AI模型进行人脸分析。

## 功能特点

- 📸 实时摄像头捕获
- 🤖 支持两种AI模型：Google Gemini和通义千问
- 🎭 人脸表情和特征分析
- 📊 详细的分析结果展示

## 环境变量配置

### Google Gemini API
在项目根目录创建`.env.local`文件，添加以下内容：
```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 通义千问API
在`.env.local`文件中添加：
```
QWEN_API_KEY=your_qwen_api_key_here
```

## 如何获取API密钥

### Google Gemini API
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的API密钥
3. 将密钥添加到`.env.local`文件中

### 通义千问API
1. 访问 [阿里云DashScope控制台](https://dashscope.console.aliyun.com/)
2. 登录并创建API密钥
3. 将密钥添加到`.env.local`文件中

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
   - 复制`.env.example`到`.env.local`
   - 添加你的API密钥

3. 启动开发服务器：
```bash
npm run dev
```

4. 在浏览器中打开 [http://localhost:5173](http://localhost:5173)

## 使用方法

1. 选择AI模型（Gemini或通义千问）
2. 点击"允许摄像头"按钮
3. 调整摄像头位置，确保人脸清晰可见
4. 点击"使用 [模型名称] 分析"按钮
5. 查看分析结果

## 技术栈

- Next.js 15.1.6
- React 18.2.0
- TypeScript
- Tailwind CSS
- react-webcam
- Google Generative AI SDK
- 通义千问API

## 注意事项

- 确保浏览器允许访问摄像头
- API密钥不要提交到版本控制系统
- 通义千问API需要有效的阿里云账户和API密钥
