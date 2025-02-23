#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// 检查环境变量
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN environment variable is required");
}

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: "https://api.replicate.com/v1",
  headers: {
    Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
    "Content-Type": "application/json",
    "Prefer": "wait"
  }
});

// 创建MCP服务器
const server = new Server(
  {
    name: "flux-schnell-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 列出可用的工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_image",
        description: "Generate an image using Flux Schnell model",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "Text prompt for image generation"
            }
          },
          required: ["prompt"]
        }
      }
    ]
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "generate_image") {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }

  const prompt = String(request.params.arguments?.prompt);
  if (!prompt) {
    throw new McpError(ErrorCode.InvalidParams, "Prompt is required");
  }

  try {
    const response = await axiosInstance.post("/models/black-forest-labs/flux-schnell/predictions", {
      input: {
        prompt: prompt
      }
    });

    return {
      content: [{
        type: "text",
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new McpError(
        ErrorCode.InternalError,
        `Replicate API error: ${error.response?.data?.detail || error.message}`
      );
    }
    throw error;
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Flux Schnell MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
