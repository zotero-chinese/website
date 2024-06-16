import { defineConfig } from "vitepress";
import { withPwa } from "@vite-pwa/vitepress";

import { buildEnd } from "./config/buildEnd.config";
import { sidebar } from "./config/sidebar.config";
import { nav } from "./config/navbar.config";
import { markdown } from "./config/markdown.config";
import { head } from "./config/head.config";
import vite from "./config/vite.config";

export default withPwa(
  defineConfig({
    title: "Zotero 中文社区",
    description: "Zotero 非官方中文维护小组",
    lang: "zh-CN",

    // srcDir: "./src",
    // srcExclude: ["**/wiki/*.md"],
    outDir: "dist",

    rewrites: {
      "wiki/:id+": ":id+",
      "styles/detail/src/:id+": "styles/:id+",
    },
    cleanUrls: true,

    head,

    themeConfig: {
      logo: "/logo.png",
      nav: nav,
      sidebar: sidebar,

      editLink: {
        pattern: ({ filePath }) => {
          if (filePath.startsWith("wiki")) {
            return `https://github.com/zotero-chinese/wiki/edit/main/${filePath.replace("wiki/", "")}`;
          } else {
            return `https://github.com/zotero-chinese/website/edit/main/:path`;
          }
        },
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
          _render(src, env, md) {
            if (env.frontmatter?.search === false) return "";
            if (env.relativePath.startsWith("styles")) return "";
            if (env.relativePath.startsWith("plugins")) return "";
            if (env.relativePath.startsWith("translators")) return "";
            const html = md.render(src, env);
            return html;
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

      // lastUpdated: {
      //   text: "最后更新于",
      //   formatOptions: {
      //     dateStyle: "short",
      //     timeStyle: "medium",
      //   },
      // },

      returnToTopLabel: "回到顶部",
      sidebarMenuLabel: "菜单",
      darkModeSwitchLabel: "主题",
      lightModeSwitchTitle: "切换到浅色模式",
      darkModeSwitchTitle: "切换到深色模式",
      notFound: {
        title: "页面未找到",
        quote: "从前有座山，山上有座庙，庙里有个页面，现在找不到...",
        linkText: "返回首页",
      },
    },

    markdown,

    buildEnd,

    vite,
    metaChunk: true,

    sitemap: {
      hostname: "https://zotero-chinese.com",
    },

    pwa: {
      // mode: "development",
      outDir: "dist",
      registerType: "autoUpdate",
      injectRegister: "script-defer",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Zotero 中文社区",
        short_name: "ZoteroChinese",
        theme_color: "#ffffff",
        icons: [
          {
            src: "logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{css,js,html,svg,png,ico,txt,woff2}"],
      },
      experimental: {
        includeAllowlist: true,
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        navigateFallback: "/",
      },
    },
  }),
);
