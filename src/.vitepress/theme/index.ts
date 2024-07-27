import { type Plugin, h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

// CSS
import './styles/vars.css'
import './styles/custom.css'
import './styles/csl-styles.css'

// NProgress
// @ts-expect-error no types
import nprogress from 'nprogress'
import './styles/nprogress.css'

// Element Plus
// Dark mode support: https://element-plus.org/zh-CN/guide/dark-mode.html
import 'element-plus/theme-chalk/dark/css-vars.css'

// Git Changelog
// https://nolebase-integrations.ayaka.io/pages/zh-CN/integrations/vitepress-plugin-git-changelog/
import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client'
import '@nolebase/vitepress-plugin-git-changelog/client/style.css'

// Custom Components
import Giscus from './components/Giscus.vue'
import DocFooter from './components/DocFooter.vue'
import SvgImage from './components/SvgImage.vue'
import Market from './components/Market.vue'
// import HomeSponsors from "./components/HomeSponsors.vue";
// import AsideSponsors from "./components/AsideSponsors.vue";

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

    app.use(NolebaseGitChangelogPlugin as Plugin)

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
