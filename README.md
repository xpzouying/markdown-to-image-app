# Markdown 转图片应用

这是一个使用 [markdown-to-image](https://github.com/gcui-art/markdown-to-image) 包构建的 React 应用，可以将 Markdown 内容转换为精美的图片。

## 功能

- 编辑 Markdown 内容
- 上传 Markdown 文件
- 选择不同的主题和尺寸
- 自定义标题和页脚
- 导出为 PNG 图片
- API 支持：通过 API 提交和获取 Markdown 内容

## 安装

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/markdown-to-image-app.git
cd markdown-to-image-app
```

2. 安装依赖：

```bash
npm install
# 或
pnpm install
# 或
yarn
```

## 运行应用

### 仅运行前端

```bash
npm start
# 或
pnpm start
# 或
yarn start
```

### 同时运行前端和 API 服务器

```bash
npm run dev
# 或
pnpm run dev
# 或
yarn dev
```

应用将在 http://localhost:3000 上运行，API 服务器将在 http://localhost:3001 上运行。

## 使用方法

1. **编辑 Markdown**：在左侧文本区域输入或修改 Markdown 内容。
2. **上传文件**：点击"选择文件"按钮上传 Markdown 文件。
3. **自定义外观**：修改标题、页脚、主题和尺寸。
4. **预览**：在右侧实时预览生成的图片。
5. **导出**：点击"导出为 PNG"按钮下载图片。

## API 使用方法

### 提交 Markdown 到 API

发送 POST 请求到 `http://localhost:3001/api/markdown` 端点，请求体为 JSON 格式：

```json
{
  "markdown": "# 你的 Markdown 内容"
}
```

成功响应：

```json
{
  "success": true,
  "filename": "markdown-1620000000000.md",
  "url": "/api/markdown/markdown-1620000000000.md"
}
```

### 获取 Markdown 内容

发送 GET 请求到 `http://localhost:3001/api/markdown/:filename`，其中 `:filename` 是之前响应中返回的文件名。

## 部署到 Vercel

1. 安装 Vercel CLI：

```bash
npm install -g vercel
```

2. 登录到 Vercel：

```bash
vercel login
```

3. 部署应用：

```bash
vercel
```

按照提示完成部署过程。

## 许可证

MIT
