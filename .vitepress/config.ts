import { defineConfig, DefaultTheme } from "vitepress";
import { buildEnd } from "./config/buildEnd";
import { sidebar } from "./config/sidebar";
import { nav } from "./config/navbar";
import { footnote } from "@mdit/plugin-footnote";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

const ogDescription =
  "Zotero 中文社区，Zotero 中文维护小组，Zotero 插件，Zotero 中文 CSL 样式";
const ogImage = "/logo.png";
const ogTitle = "Zotero 中文社区";
const ogUrl = "https://zotero-chinese.com";

export default defineConfig({
  title: `Zotero 中文社区`,
  description: "Zotero 非官方中文维护小组",
  lang: "zh-CN",

  srcDir: "./src",
  srcExclude: ["**/wiki/*.md", "**/plugins/backend/**/*.*"],
  outDir: "dist",

  rewrites: {
    "wiki/src/:id+": ":id+",
  },

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.png" }],
    [
      "link",
      { rel: "alternate", type: "application/rss+xml", href: "/rss.rss" },
    ],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: ogTitle }],
    ["meta", { property: "og:image", content: ogImage }],
    ["meta", { property: "og:url", content: ogUrl }],
    ["meta", { property: "og:description", content: ogDescription }],
    ["meta", { name: "theme-color", content: "#646cff" }],
    // TODO: 添加谷歌分析
    // [
    //   "script",
    //   { async: "", src: "https://www.googletagmanager.com/gtag/js?id=TAG_ID" },
    // ],
    // [
    //   "script",
    //   {},
    //   `window.dataLayer = window.dataLayer || [];
    //   function gtag(){dataLayer.push(arguments);}
    //   gtag('js', new Date());
    //   gtag('config', 'TAG_ID');`,
    // ],
  ],

  themeConfig: {
    logo: "/logo.png",
    nav: nav,
    sidebar: sidebar,

    editLink: {
      pattern: "https://github.com/zotero-chinese/wiki/edit/main/docs/:path",
      text: "对本页提出修改建议",
    },

    externalLinkIcon: true,

    socialLinks: [
      { icon: "github", link: "https://github.com/zotero-chinese/" },
    ],

    search: {
      provider: "local",
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                },
              },
            },
          },
        },
      },
    },

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

  markdown: {
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
      lazyLoading: true,
    },
    config: (md) => {
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
    // @ts-ignore
    ssr: {
      noExternal: [
        "element-plus",
        "highcharts",
        "highcharts-vue",
        "@highcharts/dashboards",
      ],
    },
  },
});
