import { defineConfig, DefaultTheme } from "vitepress";
// import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { buildEnd } from "./config/buildEnd";
import { sidebar } from "./config/sidebar";
import { nav } from "./config/navbar";
import { footnote } from "@mdit/plugin-footnote";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

const ogDescription = "Next Generation Frontend Tooling";
const ogImage = "https://vitejs.dev/og-image.png";
const ogTitle = "Vite";
const ogUrl = "https://vitejs.dev";

export default defineConfig({
  title: `Zotero 中文社区`,
  description: "Next Generation Frontend Tooling",
  lang: "zh-CN",

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    [
      "link",
      { rel: "alternate", type: "application/rss+xml", href: "/blog.rss" },
    ],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: ogTitle }],
    ["meta", { property: "og:image", content: ogImage }],
    ["meta", { property: "og:url", content: ogUrl }],
    ["meta", { property: "og:description", content: ogDescription }],
    ["meta", { name: "theme-color", content: "#646cff" }],
  ],

  srcExclude: ["**/wiki/*.md", "**/wiki/index.md", "**/plugins/backend/**/*.*"],

  rewrites: {
    "wiki/src/:id+": ":id+",
  },

  themeConfig: {
    logo: "/logo.png",
    nav: nav,
    sidebar: sidebar,

    editLink: {
      pattern: "https://github.com/zotero-chinese/wiki/edit/main/docs/:path",
      text: "Suggest changes to this page",
    },

    externalLinkIcon: true,

    socialLinks: [
      //   { icon: "mastodon", link: "https://elk.zone/m.webtoo.ls/@vite" },
      //   { icon: "twitter", link: "https://twitter.com/vite_js" },
      //   { icon: "discord", link: "https://chat.vitejs.dev" },
      { icon: "github", link: "https://github.com/zotero-chinese/" },
    ],

    footer: {
      message: `本工作以 知识共享 署名-相同方式共享 和 MIT 协议共享`,
      copyright: "版权所有 © 2020-至今 Zotero 中文社区及其贡献者",
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    outline: {
      label: "页面导航",
      level: [2, 3],
    },

    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },

    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
  },

  transformPageData(pageData) {
    const canonicalUrl = `${ogUrl}/${pageData.relativePath}`
      .replace(/\/index\.md$/, "/")
      .replace(/\.md$/, "/");
    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.unshift([
      "link",
      { rel: "canonical", href: canonicalUrl },
    ]);
    return pageData;
  },
  markdown: {
    // codeTransformers: [transformerTwoslash()],
    container: {
      tipLabel: "提示",
      warningLabel: "警告",
      dangerLabel: "危险",
      cautionLabel: "危险",
      infoLabel: "信息",
      noteLabel: "注",
      detailsLabel: "详细信息",
    },
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true,
    },
    config: (md) => {
      // 使用更多的 Markdown-it 插件！
      md.use(footnote);
    },
  },
  buildEnd,

  vite: {
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  },
});
