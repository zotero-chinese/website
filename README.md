# Zotero 中文社区站点前端

[![CI](https://github.com/zotero-chinese/website/actions/workflows/ci.yml/badge.svg)](https://github.com/zotero-chinese/website/actions/workflows/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/aaa3fdac-5809-409e-b99d-012a232fed18/deploy-status)](https://app.netlify.com/sites/zotero-zh/deploys)

Zotero 中文社区官方网站源码。

## 访问

- Zotero 中文社区主域名：<https://zotero-chinese.com/>
- GitHub Pages: <https://zotero-chinese.github.io>

## 贡献指南

网站使用 VitePress + Vue + TypeScript + Element Plus 进行开发。

- 文档部分将 `zotero-chinese/wiki` 仓库内容以 Git 子模块方式从本仓库渲染，其路由 `wiki` 被 VitePress 重写为 `/`。
- 插件商店、CSL 商店、Translators 商店分别自定义了一些 Vue 组件，在 VitePress 构建时从本地或远程获取数据并渲染。

在开发前，请确保已安装 Node.js LTS 和 Git。

```bash
# Clone 子模块是不可省略的
git clone --recursive https://github.com/zotero-chinese/website.git

# Enable pnpm
corepack enable

# Install deps
pnpm install

# Fetch data
pnpm fetch-data

# Development
pnpm dev

# Build
pnpm build

# Lint
pnpm lint
```

## 贡献者

感谢所有贡献者！

[![contributors](https://contrib.rocks/image?repo=zotero-chinese/website)](https://github.com/zotero-chinese/website/graphs/contributors)

## 协议

Git 子模块以其对应的协议分发。

其余部分均采用 MIT 协议分发。
