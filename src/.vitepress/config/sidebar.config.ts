import type { DefaultTheme } from 'vitepress'
import { omit } from 'radash'
import { sidebar as wikiSideBar } from '../../wiki/.vitepress/sidebar'

export const sidebar: DefaultTheme.Sidebar = {
  ...(omit(wikiSideBar, ['/contributing/'])),
  '/styles/detail/': [],
  '/blog/': [],
  '/': [
    { text: '关于我们', link: '/about' },
    { text: '贡献者名单', link: '/contributors' },
    { text: '社区公约', link: '/code_of_conduct' },
    {
      text: '贡献者指南',
      collapsed: false,
      items: [...wikiSideBar['/contributing/']],
    },
  ],
}
