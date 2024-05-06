import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";

// CSS
import "./styles/vars.css";

// Components
import HomeSponsors from "./components/HomeSponsors.vue";
// import AsideSponsors from "./components/AsideSponsors.vue";
import SvgImage from "./components/SvgImage.vue";
import Giscus from "./components/Giscus.vue";
import DocFooter from "./components/DocFooter.vue";

// element plus icon
import "element-plus/theme-chalk/dark/css-vars.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// Git Changelog
import { NolebaseGitChangelogPlugin } from "@nolebase/vitepress-plugin-git-changelog/client";
import "@nolebase/vitepress-plugin-git-changelog/client/style.css";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      "doc-footer-before": () => [h(DocFooter)],
      // "home-features-after": () => h(HomeSponsors),
      // "aside-ads-before": () => h(AsideSponsors),
      "doc-after": () => h(Giscus),
    });
  },
  enhanceApp({ app }) {
    app.component("SvgImage", SvgImage);
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component);
    }
    app.use(NolebaseGitChangelogPlugin);
  },
} satisfies Theme;
