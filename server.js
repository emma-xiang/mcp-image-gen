const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const url = require('url');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 处理图像生成请求
    if (pathname === '/generate-image' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { prompt } = JSON.parse(body);
                
                if (!prompt) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '缺少prompt参数' }));
                    return;
                }
                
                // 使用replicate-image-generator.js生成图像
                const command = `node ${path.join(__dirname, 'flux-schnell-mcp/replicate-image-generator.js')} "${prompt}"`;
                
                // 设置环境变量
                const env = {
                    ...process.env,
                    REPLICATE_API_TOKEN: 'r8_7Uq4Pjdo0iHz76eD8xydKdn4GjHxCK73EDjL7'
                };
                
                exec(command, { env }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`执行错误: ${error}`);
                        console.error(`标准输出: ${stdout}`);
                        console.error(`标准错误: ${stderr}`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: '生成图像时出错: ' + error.message }));
                        return;
                    }
                    
                    console.log('命令执行成功，输出:');
                    console.log(stdout);
                    
                    if (stderr) {
                        console.error(`标准错误输出: ${stderr}`);
                    }
                    
                    // 尝试从输出中提取JSON数组
                    let imageUrl = null;
                    try {
                        // 查找包含URL的JSON数组
                        const jsonMatch = stdout.match(/\[\s*'(https?:\/\/[^']+)'\s*\]/);
                        if (jsonMatch && jsonMatch[1]) {
                            imageUrl = jsonMatch[1];
                            console.log('从JSON数组中提取URL:', imageUrl);
                        } else {
                            // 尝试使用正则表达式查找任何URL
                            const urlRegex = /(https?:\/\/[^\s'"\]]+)/g;
                            const matches = stdout.match(urlRegex);
                            
                            if (matches && matches.length > 0) {
                                imageUrl = matches[matches.length - 1].trim();
                                console.log('使用正则表达式找到URL:', imageUrl);
                            }
                        }
                        
                        if (imageUrl) {
                            // 移除可能的尾部引号
                            imageUrl = imageUrl.replace(/['"]$/, '');
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ output: imageUrl }));
                        } else {
                            console.error('无法在输出中找到URL');
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: '无法获取生成的图像URL' }));
                        }
                    } catch (parseError) {
                        console.error('解析输出时出错:', parseError);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: '解析生成的图像URL时出错' }));
                    }
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '无效的请求数据' }));
            }
        });
        
        return;
    }
    
    // 处理静态文件请求
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 文件不存在
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // 服务器错误
                res.writeHead(500);
                res.end(`服务器错误: ${error.code}`);
            }
        } else {
            // 成功响应
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}/`);
});