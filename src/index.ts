#!/usr/bin/env node

import type { AxiosError } from 'axios';
const axios = require('axios');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  McpError,
  ErrorCode
} = require('@modelcontextprotocol/sdk/types.js');

interface CallToolRequest {
  params: {
    name: string;
    arguments?: {
      prompt?: string;
    };
  };
}

interface ReplicateErrorResponse {
  detail?: string;
}

// Check environment variable
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN environment variable is required");
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: "https://api.replicate.com/v1",
  headers: {
    Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
    "Content-Type": "application/json",
    "Prefer": "wait"
  }
});

// Create MCP server
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

// List available tools
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

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
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
    const axiosError = error as AxiosError<ReplicateErrorResponse>;
    if (axiosError.isAxiosError) {
      const errorMessage = axiosError.response?.data?.detail || axiosError.message;
      throw new McpError(
        ErrorCode.InternalError,
        `Replicate API error: ${errorMessage}`
      );
    }
    if (error instanceof Error) {
      throw new McpError(ErrorCode.InternalError, error.message);
    }
    throw new McpError(ErrorCode.InternalError, String(error));
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Flux Schnell MCP server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Server error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
