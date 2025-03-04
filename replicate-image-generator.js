#!/usr/bin/env node

// 简单的图像生成脚本，使用Replicate API
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error("错误: 需要设置REPLICATE_API_TOKEN环境变量");
  process.exit(1);
}

// 检查命令行参数
if (process.argv.length < 3) {
  console.error("用法: node replicate-image-generator.js \"图像提示文本\"");
  process.exit(1);
}

const prompt = process.argv[2];
console.log(`使用提示: "${prompt}" 生成图像...`);

// 使用Replicate API生成图像
async function generateImage(prompt) {
  try {
    const response = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: {
          prompt: prompt
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("预测创建成功，ID:", data.id);
    
    // 如果API没有立即返回输出，我们需要轮询获取结果
    if (data.status === "starting" || data.status === "processing") {
      return await pollForResult(data.id);
    }
    
    return data;
  } catch (error) {
    console.error("生成图像时出错:", error.message);
    process.exit(1);
  }
}

// 轮询获取结果
async function pollForResult(predictionId) {
  console.log("等待生成完成...");
  
  let attempts = 0;
  const maxAttempts = 30; // 最多等待30次，每次间隔2秒
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          "Authorization": `Bearer ${REPLICATE_API_TOKEN}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "succeeded") {
        return data;
      } else if (data.status === "failed") {
        throw new Error(`预测失败: ${data.error || "未知错误"}`);
      }
      
      // 继续等待
      await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
      attempts++;
      
    } catch (error) {
      console.error("轮询结果时出错:", error.message);
      process.exit(1);
    }
  }
  
  throw new Error("生成图像超时");
}

// 执行生成
generateImage(prompt)
  .then(result => {
    if (result.output) {
      console.log("\n生成成功! 图像URL:");
      console.log(result.output);
    } else {
      console.log("生成完成，但没有输出:", result);
    }
  })
  .catch(error => {
    console.error("执行过程中出错:", error.message);
    process.exit(1);
  });