import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
// import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
// import "@shikijs/vitepress-twoslash/style.css";
import "./styles/vars.css";
import HomeSponsors from "./components/HomeSponsors.vue";
// import AsideSponsors from "./components/AsideSponsors.vue";
import SvgImage from "./components/SvgImage.vue";
import "element-plus/theme-chalk/dark/css-vars.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import Giscus from "./components/Giscus.vue";
// import HighchartsVue from "highcharts-vue";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
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
  },
} satisfies Theme;
