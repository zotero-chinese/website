import type { UserConfig } from 'vitepress'

const ogImage = '/logo.png'
const ogUrl = 'https://zotero-chinese.com'

export const head: NonNullable<UserConfig['head']> = [
  ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.png' }],
  ['link', { rel: 'alternate', type: 'application/rss+xml', href: '/feed.xml' }],
  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { property: 'og:image', content: ogImage }],
  ['meta', { property: 'og:url', content: ogUrl }],
  ['meta', { name: 'theme-color', content: '#646cff' }],
  // 谷歌分析
  [
    'script',
    {
      async: '',
      src: 'https://www.googletagmanager.com/gtag/js?id=G-YHYFX0LRZK',
    },
  ],
  [
    'script',
    {},
    `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-YHYFX0LRZK');`,
  ],
]
