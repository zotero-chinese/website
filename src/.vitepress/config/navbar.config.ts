import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.NavItem[] = [
  { text: '百科全书', link: '/user-guide/', activeMatch: '/user-guide/' },
  { text: '插件商店', link: '/plugins/', activeMatch: '/plugins/' },
  { text: 'CSL 样式', link: '/styles/', activeMatch: '/styles/' },
  { text: '转换器', link: '/translators/', activeMatch: '/translators/' },
  {
    text: '更多资源',
    items: [
      {
        text: '开发指南',
        items: [
          {
            text: '插件开发指南',
            link: '/plugin-dev-guide/',
          },
          {
            text: 'CSL 开发指南',
            link: '/csl-dev-guide/',
          },
          {
            text: 'Translator 开发指南',
            link: '/translator-dev-guide/',
          },
        ],
      },
      {
        text: '最好的中文社区',
        items: [
          { text: '关于我们', link: '/about' },
          { text: '贡献者名单', link: '/contributors' },
          { text: '贡献指南', link: '/contributing/' },
        ],
      },
    ],
  },
]
