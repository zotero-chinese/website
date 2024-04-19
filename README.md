# Zotero 中文社区站点前端

Zotero 中文社区官方网站源码。

## 状态

此仓库处于积极开发中，尚未稳定和上线。

## 访问

- Zotero 中文社区主域名：<https://zotero-chinese.com/>
- GitHub Pages: <https://zotero-chinese.github.io>

## 开发指南

网站使用 VitePress + Vue + TypeScript + Element Plus 进行开发。

- 文档部分将 `zotero-chinese/wiki` 仓库内容以 Git 子模块方式从本仓库渲染，其路由 `wiki` 被 VitePress 重写为 `/`。
- 插件商店、CSL 商店、Translators 商店分别自定义了一些 Vue 组件，在 VitePress 构建时从本地或远程获取数据并渲染。

在开发前，请确保已安装 Node.js 最新 LTS 版本和 Git。

```bash
# clone

# init
npm install -g pnpm


# development
pnpm dev

# build
pnpm build
```

## 协议

Git 子模块以其对应的协议分发。

其余部分均采用 MIT 协议分发。
