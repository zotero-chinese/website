import { defineConfig } from 'vitepress'
import { buildEnd } from './config/buildEnd.config'
import { head } from './config/head.config'
import { markdown } from './config/markdown.config'
import { nav } from './config/navbar.config'
import { sidebar } from './config/sidebar.config'
import vite from './config/vite.config'

const RssIcon = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 448 512"><title>RSS</title><path d="M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zM112 416c-26.51 0-48-21.49-48-48s21.49-48 48-48s48 21.49 48 48s-21.49 48-48 48zm157.533 0h-34.335c-6.011 0-11.051-4.636-11.442-10.634c-5.214-80.05-69.243-143.92-149.123-149.123c-5.997-.39-10.633-5.431-10.633-11.441v-34.335c0-6.535 5.468-11.777 11.994-11.425c110.546 5.974 198.997 94.536 204.964 204.964c.352 6.526-4.89 11.994-11.425 11.994zm103.027 0h-34.334c-6.161 0-11.175-4.882-11.427-11.038c-5.598-136.535-115.204-246.161-251.76-251.76C68.882 152.949 64 147.935 64 141.774V107.44c0-6.454 5.338-11.664 11.787-11.432c167.83 6.025 302.21 141.191 308.205 308.205c.232 6.449-4.978 11.787-11.432 11.787z" fill="currentColor"></path></svg>`

export default defineConfig({
  title: 'Zotero 中文社区',
  description: 'Zotero 非官方中文维护小组',
  lang: 'zh-CN',

  srcExclude: ['wiki/index.md', '**/README.md', '**/_template.md'],
  // outDir: 'dist',

  rewrites: {
    'wiki/:id+': ':id+',
    'styles/detail/src/:id+': 'styles/:id+',
    'blog/blog-repo/posts/:id+': 'blog/posts/:id+',
  },
  cleanUrls: true,

  head,

  themeConfig: {
    logo: '/logo.png',
    nav,
    sidebar,

    editLink: {
      pattern: ({ filePath }) => {
        if (filePath.startsWith('wiki')) {
          return `https://github.com/zotero-chinese/wiki/edit/main/${filePath.replace('wiki/', '')}`
        }
        else {
          return `https://github.com/zotero-chinese/website/edit/main/src/${filePath}`
        }
      },
      text: '在 GitHub 上修改此页',
    },

    externalLinkIcon: true,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/zotero-chinese/' },
      { icon: { svg: RssIcon }, link: '/feed.xml', ariaLabel: 'RSS Feed' },
    ],

    search: {
      provider: 'local',
      options: {
        // https://vitepress.dev/zh/reference/default-theme-search#example-excluding-pages-from-search
        _render(src, env, md) {
          const html = md.render(src, env)
          if (env.frontmatter?.search === false)
            return ''
          if (!env.relativePath.startsWith('wiki'))
            return ''
          return html
        },
        locales: {
          zh: {
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
        },
      },
    },

    footer: {
      message: `本工作以 知识共享 署名-相同方式共享 和 MIT 协议共享`,
      copyright: '版权所有 © 2020-至今 Zotero 中文社区及其贡献者',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
      level: [2, 3],
    },

    // lastUpdated: {
    //   text: "最后更新于",
    //   formatOptions: {
    //     dateStyle: "short",
    //     timeStyle: "medium",
    //   },
    // },

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
  ignoreDeadLinks: [
    // ignore all localhost links
    /^https?:\/\/localhost/,
  ],

  buildEnd,

  vite,
  metaChunk: true,

  sitemap: {
    hostname: 'https://zotero-chinese.com',
  },
})
