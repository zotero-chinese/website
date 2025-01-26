import type { Theme } from 'vitepress'
import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client'
// @ts-expect-error no types
import nprogress from 'nprogress'
import DefaultTheme from 'vitepress/theme'
import { h, type Plugin } from 'vue'

import DocFooter from './components/DocFooter.vue'
import Giscus from './components/Giscus.vue'
import Market from './components/Market.vue'
import SvgImage from './components/SvgImage.vue'

// CSS
import './styles/vars.css'
import './styles/custom.css'
import './styles/csl-styles.css'
import './styles/nprogress.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // Element Plus Dark mode support: https://element-plus.org/zh-CN/guide/dark-mode.html
import '@nolebase/vitepress-plugin-git-changelog/client/style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'doc-footer-before': () => [h(DocFooter)],
      // "home-features-after": () => h(HomeSponsors),
      // "aside-ads-before": () => h(AsideSponsors),
      'doc-after': () => h(Giscus),
    })
  },
  enhanceApp({ app, router }) {
    // Vue App Enhance
    app.component('SvgImage', SvgImage)
    app.component('Market', Market)

    // https://nolebase-integrations.ayaka.io/pages/zh-CN/integrations/vitepress-plugin-git-changelog/
    app.use(NolebaseGitChangelogPlugin as Plugin, {
      displayAuthorsInsideCommitLine: true,
    })

    // Router Enhance
    // nprogress
    if (!import.meta.env.SSR) {
      nprogress.configure({ showSpinner: false })
      const _cacheBeforeRouteChange = router.onBeforeRouteChange
      const _cacheAfterRouteChange = router.onAfterRouteChanged
      router.onBeforeRouteChange = (to) => {
        nprogress.start()
        _cacheBeforeRouteChange?.(to)
      }
      router.onAfterRouteChanged = (to) => {
        _cacheAfterRouteChange?.(to)
        nprogress.done()
      }
    }
  },
} satisfies Theme
