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
cd website

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

# Lint & format & fix
pnpm check
```

插件搜索复用 Wiki 中带 `plugin` 标记的文档标题，并支持数据源中的可选 `nameZh`、`summaryZh`、`keywords` 字段。中文内容在 `zotero-plugins` 源清单维护；网站当前仍读取外部 scraper，切换数据源前，已有关联文档的中文标题即可用于搜索，无需另建别名清单。

同步插件数据时，Gitee 直链的更新时间取对应分支下 XPI 文件的最后一次提交时间，以修正上游沿用 GitHub 发布日期的情况。查询失败时同步会报错，不写入不完整的插件数据，也不使用采集时间代替更新时间。

运行插件回归检查（Node.js 24，需先检出项目源码）：

```bash
node --test checks/*.test.ts checks/*.test.mjs
```

## 贡献者

感谢所有贡献者！

[![contributors](https://contrib.rocks/image?repo=zotero-chinese/website)](https://github.com/zotero-chinese/website/graphs/contributors)

## 协议

Git 子模块以其对应的协议分发。

其余部分均采用 MIT 协议分发。
