import { defineConfig } from 'vitepress'
import { buildEnd } from './config/buildEnd.config.ts'
import { head } from './config/head.config.ts'
import { markdown } from './config/markdown.config.ts'
import { nav, navEn } from './config/navbar.config.ts'
import { sidebar } from './config/sidebar.config.ts'
import { transformHead, transformPageData } from './config/transform.config.ts'
import vite from './config/vite.config.ts'

const RssIcon = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 448 512"><title>RSS</title><path d="M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zM112 416c-26.51 0-48-21.49-48-48s21.49-48 48-48s48 21.49 48 48s-21.49 48-48 48zm157.533 0h-34.335c-6.011 0-11.051-4.636-11.442-10.634c-5.214-80.05-69.243-143.92-149.123-149.123c-5.997-.39-10.633-5.431-10.633-11.441v-34.335c0-6.535 5.468-11.777 11.994-11.425c110.546 5.974 198.997 94.536 204.964 204.964c.352 6.526-4.89 11.994-11.425 11.994zm103.027 0h-34.334c-6.161 0-11.175-4.882-11.427-11.038c-5.598-136.535-115.204-246.161-251.76-251.76C68.882 152.949 64 147.935 64 141.774V107.44c0-6.454 5.338-11.664 11.787-11.432c167.83 6.025 302.21 141.191 308.205 308.205c.232 6.449-4.978 11.787-11.432 11.787z" fill="currentColor"></path></svg>`

export default defineConfig({
  title: 'Zotero 中文社区',
  description: 'Zotero 中文维护小组',
  lang: 'zh-CN',

  srcExclude: [
    'wiki/index.md',
    // '**/README.md',
    '**/_template.md',
    '**/.vitepress/**',
    'styles/detail/src/index.md',
    // 与 `wiki/user-guide/index.md` 经 rewrites 后同为 `/user-guide/`，会产生重复页面
    'en/wiki/**',
  ],
  // outDir: 'dist',

  rewrites: {
    'wiki/:id+': ':id+',
    'styles/detail/src/:id+': 'styles/:id+',
    'blog/blog-repo/posts/:id+': 'blog/posts/:id+',

    // 'en/:id+': '/:id+',
    'en/wiki/:id+': ':id+',
    // 'en/styles/detail/src/:id+': '/styles/:id+',
    // 'en/blog/blog-repo/posts/:id+': '/blog/posts/:id+',
  },
  cleanUrls: true,

  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      title: 'Zotero 中文社区',
      description: 'Zotero 中文维护小组',
      head: [
        ...head,
        [
          'meta',
          {
            name: 'keywords',
            content:
              'Zotero, Zotero中文, Zotero中文社区, Zotero教程, Zotero下载, Zotero插件, Zotero插件商店, Zotero参考文献格式, Zotero引用格式, CSL样式, GB/T 7714, 中文引用格式, Zotero Translator, 文献管理软件',
          },
        ],
        ['meta', { property: 'og:title', content: 'Zotero 中文社区' }],
        [
          'meta',
          {
            property: 'og:description',
            content: 'Zotero 中文使用手册、插件商店、CSL 样式、Translator 及开发者文档',
          },
        ],
      ],
      themeConfig: {
        nav,
        sidebar,

        footer: {
          message: `Zotero 是 Corporation for Digital Scholarship 的注册商标，本站与该机构无从属或关联关系`,
          copyright:
            '本工作以 知识共享 署名 - 相同方式共享 和 MIT 协议共享，版权所有 © 2020-至今 Zotero 中文社区及其贡献者',
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'Zotero Chinese Community',
      description: 'Zotero Chinese Community Maintenance Team, Zotero Plugin Market, CSL-M Styles.',
      head: [
        ...head,
        [
          'meta',
          {
            name: 'keywords',
            content:
              'Zotero, Zotero Chinese, Zotero Chinese Community, Zotero Plugin, Zotero Plugin Store, Zotero Plugin Market, Zotero Plugin Marketplace, Zotero Chinese CSL Style, GB/T 7714',
          },
        ],
        ['meta', { property: 'og:title', content: 'Zotero Chinese Community' }],
        [
          'meta',
          {
            property: 'og:description',
            content:
              'Zotero Chinese Community, Zotero Plugin Store, Zotero Plugin Market, Zotero Chinese CSL Style',
          },
        ],
      ],
      link: '/en/',
      themeConfig: {
        nav: navEn,
        sidebar,

        notFound: {
          title: 'Page Not Found',
          quote: 'NOTE: Some pages are only available in Chinese!',
          link: '/en/',
          linkText: 'Take me home',
        },

        footer: {
          message: `Zotero is a registered trademark of the Corporation for Digital Scholarship. This site is not affiliated with or endorsed by Corporation for Digital Scholarship.`,
          copyright:
            'This work is shared under the CC BY-SA and MIT licenses. Copyright © 2020-present Zotero Chinese Community and its contributors.',
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.png',

    editLink: {
      pattern: ({ filePath }) => {
        if (filePath.startsWith('wiki')) {
          return `https://github.com/zotero-chinese/wiki/edit/main/${filePath.replace('wiki/', '')}`
        } else {
          return `https://github.com/zotero-chinese/website/edit/main/src/${filePath}`
        }
      },
      text: '在 GitHub 上修改此页',
    },

    externalLinkIcon: true,

    socialLinks: [
      // 由于 VitePress 的社交媒体链接不支持动态生成，我们自行实现了 GitHub 图标，故无需再次设置
      // { icon: 'github', link: 'https://github.com/zotero-chinese/' },
      { icon: { svg: RssIcon }, link: '/feed.xml', ariaLabel: 'RSS Feed' },
    ],

    search: {
      provider: 'local',
      options: {
        // https://vitepress.dev/zh/reference/default-theme-search#example-excluding-pages-from-search
        _render(src, env, md) {
          const html = md.render(src, env)
          if (env.frontmatter?.search === false) return ''
          if (!env.relativePath.startsWith('wiki')) return ''
          return html
        },
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
          en: {
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search',
              },
              modal: {
                noResultsText: 'No results found',
                resetButtonTitle: 'Clear search',
                footer: {
                  selectText: 'to select',
                  navigateText: 'to navigate',
                },
              },
            },
          },
        },
      },
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
      level: [2, 3],
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    notFound: {
      title: '页面未找到',
      quote: '从前有座山，山上有座庙，庙里有个页面，现在找不到...',
      linkText: '返回首页',
    },
  },

  markdown,

  // SEO：为每页生成唯一的 title / description / canonical / JSON-LD
  transformPageData,
  transformHead,

  ignoreDeadLinks: [
    // ignore all localhost links
    /^https?:\/\/localhost/,
  ],

  buildEnd,

  vite,

  sitemap: {
    hostname: 'https://zotero-chinese.com',
    transformItems: (items) => {
      // 站点导航中不可达、对搜索用户无价值的页面不进 sitemap：
      // 仓库自述（AGENTS/README）、行为准则、贡献者名单等。
      // 注意 item.url 是不带前导斜杠的相对路径（如 `about`），需先归一化再匹配。
      const excluded =
        /^\/?(AGENTS|README|code_of_conduct|contributors?|public\/readme?)(\.html)?$/i
      // 同一 URL 可能因 rewrites 或多语言分组被写入多次，
      // 重复的 <url> 会稀释 sitemap 质量，这里按 loc 去重。
      const seen = new Set<string>()
      return items.filter((item) => {
        const loc = typeof item === 'string' ? item : item.url
        const pathname = loc.replace(/^https?:\/\/[^/]+/, '').replace(/\.html$/, '')
        if (excluded.test(pathname)) return false
        if (seen.has(loc)) return false
        seen.add(loc)
        return true
      })
    },
  },
})
