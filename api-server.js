const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 确保临时目录存在
const tempDir = path.join(__dirname, 'temp');
const ensureTempDir = async () => {
  try {
    await fs.mkdir(tempDir, { recursive: true });
    console.log(`临时目录已创建: ${tempDir}`);
  } catch (err) {
    console.error('创建临时目录失败:', err);
  }
};

// 将 Markdown 转换为图片并返回 base64 编码
app.post('/api/markdown-to-image', async (req, res) => {
  let browser = null;

  try {
    const { markdown, theme = 'SpringGradientWave', size = 'mobile', header = '', footer = '' } = req.body;

    if (!markdown) {
      return res.status(400).json({ error: '缺少必要的 Markdown 内容' });
    }

    // 创建包含自定义 html-to-image 导出功能的 HTML 页面
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Markdown to Image</title>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/html-to-image@1.11.11/dist/html-to-image.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/markdown-to-image@0.0.12/dist/style.css">
        <script src="https://unpkg.com/markdown-to-image@0.0.12/dist/markdown-to-image.js"></script>
        <style>
          body { margin: 0; padding: 20px; background-color: white; }
          #root { width: 100%; padding: 20px; }
          #exportButton {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
          #status {
            text-align: center;
            margin: 20px 0;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div id="status">加载中...</div>
        <div id="root"></div>
        <button id="exportButton">导出为PNG</button>

        <script>
          // 全局变量，用于存储生成的图片数据
          window.generatedImageData = null;

          const markdown = ${JSON.stringify(markdown)};

          function initializeApp() {
            try {
              // 检查 markdown-to-image 是否已加载
              if (typeof MarkdownToImage === 'undefined') {
                document.getElementById('status').textContent = 'markdown-to-image 组件加载失败';
                return;
              }

              const { Md2Poster, Md2PosterContent, Md2PosterHeader, Md2PosterFooter } = MarkdownToImage;

              // 渲染 React 组件
              const App = () => React.createElement(
                Md2Poster,
                {
                  theme: "${theme}",
                  size: "${size}"
                },
                [
                  React.createElement(
                    Md2PosterHeader,
                    { key: "header" },
                    "${header}"
                  ),
                  React.createElement(
                    Md2PosterContent,
                    { key: "content" },
                    markdown
                  ),
                  React.createElement(
                    Md2PosterFooter,
                    { key: "footer" },
                    "${footer}"
                  )
                ]
              );

              ReactDOM.render(React.createElement(App), document.getElementById('root'));
              document.getElementById('status').textContent = '组件已加载，可以导出图片';

              // 导出按钮事件处理
              document.getElementById('exportButton').addEventListener('click', () => {
                // 查找正确的容器元素 - 使用你指定的选择器
                const element = document.querySelector('div.markdown-to-image-root');

                if (element) {
                  document.getElementById('status').textContent = '正在生成图片...';

                  // 使用 html-to-image 生成图片
                  htmlToImage.toPng(element, {
                    cacheBust: true,
                    pixelRatio: 2
                  })
                  .then(function (dataUrl) {
                    window.generatedImageData = dataUrl;
                    document.getElementById('status').textContent = '图片生成成功!';
                  })
                  .catch(function (error) {
                    console.error('导出图片出错:', error);
                    document.getElementById('status').textContent = '图片生成失败: ' + error.message;
                  });
                } else {
                  document.getElementById('status').textContent = '无法找到 markdown-to-image-root 元素';
                }
              });
            } catch (error) {
              console.error('初始化失败:', error);
              document.getElementById('status').textContent = '初始化失败: ' + error.message;
            }
          }

          // 等待页面完全加载后初始化
          window.addEventListener('load', initializeApp);
        </script>
      </body>
      </html>
    `;

    // 启动 Puppeteer
    console.log('启动 Puppeteer...');
    browser = await puppeteer.launch({
      headless: false, // 使用有头模式便于调试
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,1024'],
      defaultViewport: null
    });

    const page = await browser.newPage();

    // 设置超时时间
    page.setDefaultTimeout(30000);

    // 监听控制台输出
    page.on('console', msg => console.log('浏览器控制台:', msg.text()));

    // 加载 HTML 内容
    console.log('加载 HTML 内容...');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // 等待页面加载完成
    console.log('等待页面加载完成...');
    await page.waitForFunction('typeof MarkdownToImage !== "undefined"', { timeout: 30000 })
      .catch(err => {
        console.error('MarkdownToImage 组件加载失败:', err);
        throw new Error('组件加载失败，请检查网络连接或组件 URL');
      });

    // 等待组件渲染完成 - 使用你提供的选择器
    console.log('等待组件渲染完成 (查找 div.markdown-to-image-root 元素)...');
    await page.waitForSelector('div.markdown-to-image-root', { timeout: 30000, visible: true })
      .catch(err => {
        console.error('找不到 div.markdown-to-image-root 元素:', err);
        throw new Error('找不到 div.markdown-to-image-root 元素，可能是组件结构已更改');
      });

    // 截屏以便调试
    console.log('保存屏幕截图用于调试...');
    await page.screenshot({ path: path.join(tempDir, 'debug-screenshot.png') });

    // 获取元素尺寸
    const dimensions = await page.evaluate(() => {
      const element = document.querySelector('div.markdown-to-image-root');
      return element ? {
        width: element.offsetWidth,
        height: element.offsetHeight
      } : null;
    });

    if (!dimensions) {
      throw new Error('无法获取元素尺寸，可能是元素不可见或未正确渲染');
    }

    // 点击导出按钮
    console.log('点击导出按钮...');
    await page.click('#exportButton');

    // 等待图片生成完成
    console.log('等待图片生成完成...');
    await page.waitForFunction('window.generatedImageData !== null', { timeout: 30000 })
      .catch(err => {
        console.error('图片生成超时:', err);
        throw new Error('图片生成超时，可能是 html-to-image 库执行失败');
      });

    // 获取生成的图片数据
    console.log('获取图片数据...');
    const imageData = await page.evaluate(() => window.generatedImageData);

    // 关闭浏览器
    if (browser) {
      await browser.close();
      browser = null;
    }

    // 返回结果
    console.log('返回图片数据...');
    res.json({
      success: true,
      imageData,
      dimensions
    });

  } catch (error) {
    console.error('转换失败:', error);
    res.status(500).json({
      error: '服务器错误',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // 确保浏览器关闭
    if (browser) {
      await browser.close();
    }
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`API 服务器运行在端口 ${PORT}`);
  ensureTempDir();
});
