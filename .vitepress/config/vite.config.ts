import { defineConfig } from "vite";
// import type { UserConfig } from "vitepress";

import Inspect from "vite-plugin-inspect";
import VueDevTools from "vite-plugin-vue-devtools";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from "@nolebase/vitepress-plugin-git-changelog/vite";
import { MarkdownTransform } from ".vitepress/plugins/markdownTransform";

export default defineConfig({
  plugins: [
    Inspect(),
    VueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    MarkdownTransform(),

    // Git Changelog
    GitChangelog({
      includeDirs: ["src/wiki/**/*.md"],
      repoURL: () => "https://github.com/zotero-chinese/wiki",
    }),
    GitChangelogMarkdownSection({
      exclude: (id) =>
        !id.match("src/wiki/") || id.endsWith("src/wiki/index.md"),
    }),
  ],
  // @ts-ignore
  ssr: {
    noExternal: [
      "element-plus",
      "highcharts",
      "highcharts-vue",
      "@highcharts/dashboards",
    ],
  },
});
