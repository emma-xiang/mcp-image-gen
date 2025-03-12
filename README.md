# AI图像生成器

这是一个基于Web的AI图像生成应用程序，允许用户通过输入文本描述来生成精美的图像。该应用程序使用Flux Schnell AI模型（通过Replicate API）来生成图像，并提供了多种艺术风格的示例提示词。

## 功能特点

- 简洁直观的用户界面
- 文本到图像的生成功能
- 多种艺术风格的示例（印象派、立体主义、超现实主义等）
- 实时图像生成和显示
- 响应式设计，适配各种设备

## 技术栈

- 前端：HTML, CSS, JavaScript（原生）
- 后端：Node.js
- 图像生成：Replicate API (Flux Schnell模型)
- 环境变量管理：dotenv

## 安装与设置

1. 克隆仓库
   ```
   git clone https://github.com/yourusername/mcp-image-gen.git
   cd mcp-image-gen
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 创建环境变量文件
   在项目根目录创建一个`.env`文件，并添加以下内容：
   ```
   REPLICATE_API_TOKEN=your_replicate_api_token
   ```
   请将`your_replicate_api_token`替换为您的Replicate API令牌。您可以在[Replicate](https://replicate.com/)网站上注册并获取API令牌。

## 使用方法

1. 启动服务器
   ```
   node server.js
   ```

2. 在浏览器中访问应用程序
   ```
   http://localhost:3000
   ```

3. 在文本框中输入描述，或点击示例卡片使用预设的提示词

4. 点击"生成图像"按钮，等待图像生成完成

## 示例提示词

应用程序提供了多种艺术风格的示例提示词，包括：

- 印象派风格（莫奈）
- 立体主义风格（毕加索）
- 超现实主义风格（达利）
- 浮世绘风格（北斋）
- 新艺术运动风格（穆夏）
- 波普艺术风格（安迪·沃霍尔）

点击任意示例卡片可以自动填充相应的提示词。

## 项目结构

```
mcp-image-gen/
├── .env                      # 环境变量文件（包含API令牌）
├── .gitignore                # Git忽略文件
├── 404.html                  # 404错误页面
├── index.html                # 主页面
├── package.json              # 项目依赖
├── server.js                 # Node.js服务器
├── flux-schnell-mcp/         # Flux Schnell MCP工具
│   └── replicate-image-generator.js  # 图像生成脚本
└── images/                   # 示例图片
    ├── art-nouveau.jpg
    ├── cubism.jpg
    ├── impressionism.jpg
    ├── pop-art.jpg
    ├── surrealism.jpg
    └── ukiyo-e.jpg
```

## 注意事项

- 此应用程序需要有效的Replicate API令牌才能运行
- 图像生成可能需要几秒钟到几十秒钟不等，取决于服务器负载
- 生成的图像由Replicate托管，可能会在一段时间后过期

## 许可证

[MIT](LICENSE)