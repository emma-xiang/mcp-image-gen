# Flux Schnell MCP Server

一个基于MCP（Model Context Protocol）的服务器，用于通过Replicate API调用Flux Schnell模型生成图片。

## 功能特点

- 提供`generate_image`工具用于生成图片
- 支持自定义文本提示词
- 自动处理与Replicate API的通信
- 完整的错误处理和响应

## 前置要求

1. Node.js (v14或更高版本)
2. Replicate API Token
3. MCP兼容的环境（如Claude Desktop）

## 获取Replicate API Token

1. 访问 [Replicate官网](https://replicate.com/) 并注册账号
2. 登录后访问 [API Tokens页面](https://replicate.com/account/api-tokens)
3. 点击"Create API token"创建新的token
4. 复制生成的token（格式如：r8_xxxxxx）

## 安装

1. 克隆项目并安装依赖：
```bash
git clone [repository-url]
cd flux-schnell-mcp
npm install
```

2. 构建服务器：
```bash
npm run build
```

## 配置

### Claude Desktop配置

1. 打开配置文件：
   - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`

2. 添加服务器配置：
```json
{
  "mcpServers": {
    "flux-schnell": {
      "command": "node",
      "args": ["/path/to/flux-schnell-mcp/build/index.js"],
      "env": {
        "REPLICATE_API_TOKEN": "your-replicate-api-token"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### VSCode Roo配置

1. 打开配置文件：
   - Linux: `~/.vscode-remote/data/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`
   - MacOS: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`
   - Windows: `%APPDATA%/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`

2. 添加与上述相同的服务器配置。

## 使用方法

服务器提供了一个名为`generate_image`的工具，可以通过MCP调用：

```typescript
<use_mcp_tool>
<server_name>flux-schnell</server_name>
<tool_name>generate_image</tool_name>
<arguments>
{
  "prompt": "a beautiful sunset over the ocean, digital art style"
}
</arguments>
</use_mcp_tool>
```

### 参数说明

- `prompt`: 用于生成图片的文本描述（必填）
  - 建议使用详细的描述来获得更好的生成结果
  - 可以包含风格、场景、细节等信息

### 响应格式

服务器将返回Replicate API的完整响应，包含生成的图片URL和其他元数据。

## 调试

由于MCP服务器通过stdio通信，调试可能比较困难。推荐使用[MCP Inspector](https://github.com/modelcontextprotocol/inspector)：

```bash
npm run inspector
```

Inspector将提供一个URL，可以在浏览器中访问调试工具。

## 注意事项

1. 请妥善保管您的Replicate API Token，不要将其分享给他人
2. 确保在配置文件中使用正确的文件路径
3. 生成图片可能需要一些时间，请耐心等待响应
4. 如遇到错误，请检查API Token是否正确，以及网络连接是否正常
