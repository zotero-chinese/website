import { defineConfig } from 'vite'
// import type { UserConfig } from "vitepress";

import Inspect from 'vite-plugin-inspect'
import VueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite'
import { MarkdownTransform } from '.vitepress/plugins/markdownTransform'

export default defineConfig({
  define: {
    // 启用生产环境构建下激活不匹配的详细警告
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
  },
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
      include: ['src/wiki/**/*.md'],
      repoURL: () => 'https://github.com/zotero-chinese/wiki',
    }),
    GitChangelogMarkdownSection({
      exclude: id =>
        !id.match('src/wiki/') || id.endsWith('src/wiki/index.md'),
    }),
  ],
  ssr: {
    noExternal: [
      'element-plus',
      'highcharts',
      'highcharts-vue',
      '@highcharts/dashboards',
    ],
  },
})
