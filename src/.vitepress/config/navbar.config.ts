import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.NavItem[] = [
  { text: '百科全书', link: '/user-guide/', activeMatch: '/user-guide/' },
  { text: '插件商店', link: '/plugins/', activeMatch: '^/plugins/' },
  { text: 'CSL 样式', link: '/styles/', activeMatch: '^/styles/' },
  { text: '转换器', link: '/translators/', activeMatch: '^/translators/' },
  {
    text: '开发者指南',
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
    text: '社区',
    items: [
      { text: '博客', link: '/blog/' },
      { text: '关于我们', link: '/about' },
      { text: '贡献者名单', link: '/contributors' },
      { text: '贡献指南', link: '/contributing/' },
    ],
  },
]

export const navEn: DefaultTheme.NavItem[] = [
  // { text: 'User Guide (zh)', link: '/en/user-guide/', activeMatch: '/en/user-guide/' },
  { text: 'Plugin Store', link: '/en/plugins/', activeMatch: '^/en/plugins/' },
  { text: 'CSL Styles', link: '/en/styles/', activeMatch: '^/en/styles/' },
  { text: 'Translators', link: '/en/translators/', activeMatch: '^/en/translators/' },
  {
    text: 'Developer Guide',
    items: [
      {
        text: 'Plugin Development',
        link: 'https://windingwind.github.io/doc-for-zotero-plugin-dev/',
      },
      {
        text: 'CSL Development',
        link: 'https://docs.citationstyles.org/en/stable/specification.html',
      },
      {
        text: 'Translator Development',
        link: '/translator-dev-guide/',
      },
    ],
  },
  {
    text: 'Community',
    items: [
      { text: 'Blog (Chinese)', link: '/blog/' },
      { text: 'About Us (Chinese)', link: '/about' },
      { text: 'Contributors (Chinese)', link: '/contributors' },
      { text: 'Contributing (Chinese)', link: '/contributing/' },
    ],
  },
]
