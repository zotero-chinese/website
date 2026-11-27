import type { Theme } from 'vitepress'
import type { Plugin } from 'vue'
import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client'
import { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus/es'

// @ts-expect-error no types
import nprogress from 'nprogress'
import DefaultTheme from 'vitepress/theme'
import Market from './components/Market.vue'

import SvgImage from './components/SvgImage.vue'
import Layout from './Layout.vue'

// CSS
import './styles/vars.css'
import './styles/custom.css'
import './styles/csl-styles.css'
import './styles/nprogress.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // Element Plus Dark mode support: https://element-plus.org/zh-CN/guide/dark-mode.html
import '@nolebase/vitepress-plugin-git-changelog/client/style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    // Vue App Enhance
    app.component('SvgImage', SvgImage)
    app.component('Market', Market)

    // Element Plus SSR：提供确定性的 id 与 z-index 上下文，避免构建时
    // 输出 [IdInjection] / [ZIndexInjection] 警告并保证 hydration 一致
    // https://element-plus.org/zh-CN/guide/ssr.html#提供-id-注入内容
    app.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 })
    app.provide(ZINDEX_INJECTION_KEY, { current: 0 })

    // https://nolebase-integrations.ayaka.io/pages/zh-CN/integrations/vitepress-plugin-git-changelog/
    app.use(NolebaseGitChangelogPlugin as Plugin, {
      displayAuthorsInsideCommitLine: true,
    })

    // Router Enhance
    // nprogress
    if (!import.meta.env.SSR) {
      nprogress.configure({ showSpinner: false })
      const _cacheBeforeRouteChange = router.onBeforeRouteChange
      const _cacheAfterRouteChange = router.onAfterRouteChange
      router.onBeforeRouteChange = (to) => {
        nprogress.start()
        _cacheBeforeRouteChange?.(to)
      }
      router.onAfterRouteChange = (to) => {
        _cacheAfterRouteChange?.(to)
        nprogress.done()
      }
    }
  },
} satisfies Theme
