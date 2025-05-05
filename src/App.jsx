import React, { useState, useRef } from 'react';
import 'markdown-to-image/dist/style.css';
import { Md2Poster, Md2PosterContent, Md2PosterHeader, Md2PosterFooter } from 'markdown-to-image';
import { toPng } from 'html-to-image';
import './App.css';

function App() {
  const [markdown, setMarkdown] = useState(`# 这是一个示例标题

这是一些 **粗体** 和 *斜体* 文本。

## 子标题

- 列表项 1
- 列表项 2
- 列表项 3

> 这是一段引用文本

\`\`\`javascript
console.log('Hello, World!');
\`\`\``);

  const [theme, setTheme] = useState('SpringGradientWave');
  const [headerText, setHeaderText] = useState('我的 Markdown 海报');
  const [footerText, setFooterText] = useState('由 markdown-to-image 生成');
  const [size, setSize] = useState('mobile');

  const posterRef = useRef(null);

  // 可用的主题
  const themes = [
    'SpringGradientWave',
    'SpringPink',
    'SpringLake',
    'SpringGreenStream',
    'SpringYellowWarm',
    'SpringGreenWarm',
    'SpringPurpleGradient',
    'Minimal',
    'MinimalDark'
  ];

  // 可用的尺寸
  const sizes = [
    'mobile',     // 手机尺寸
    'pad',        // 平板尺寸
    'desktop',    // 桌面尺寸
    'instagram',  // Instagram 尺寸
    'twitter',    // Twitter/X 尺寸
    'facebook'    // Facebook 尺寸
  ];

  // 导出为图片
  const exportToPng = () => {
    if (posterRef.current === null) {
      alert('无法找到海报元素');
      return;
    }

    toPng(posterRef.current, { cacheBust: true, quality: 1 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'markdown-poster.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('导出图片出错:', error);
        alert('导出图片失败: ' + error.message);
      });
  };

  // 从文件中读取 Markdown
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setMarkdown(e.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      <h1>Markdown 到图片转换器</h1>

      <div className="app-content">
        <div className="editor-panel">
          <h2>编辑 Markdown</h2>

          <div className="form-group">
            <label>上传 Markdown 文件：</label>
            <input
              type="file"
              accept=".md,.txt,.markdown"
              onChange={handleFileUpload}
            />
          </div>

          <div className="form-group">
            <label>标题：</label>
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>页脚：</label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>主题：</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              {themes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>尺寸：</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {sizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Markdown 内容：</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={10}
            />
          </div>

          <button
            className="export-button"
            onClick={exportToPng}
          >
            导出为 PNG
          </button>
        </div>

        <div className="preview-panel">
          <h2>预览</h2>
          <div className="preview-container" ref={posterRef}>
            <Md2Poster theme={theme} size={size}>
              <Md2PosterHeader>
                {headerText}
              </Md2PosterHeader>
              <Md2PosterContent>
                {markdown}
              </Md2PosterContent>
              <Md2PosterFooter>
                {footerText}
              </Md2PosterFooter>
            </Md2Poster>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
