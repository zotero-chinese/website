import { resolve } from 'node:path'
import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite'

import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'

import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import VueDevTools from 'vite-plugin-vue-devtools'

import { contributors } from '../data/contributors'
import { MarkdownTransform } from '../plugins/markdownTransform'

export default defineConfig({
  define: {
    // 启用生产环境构建下激活不匹配的详细警告
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
  },
  resolve: {
    alias: {
      // @theme -> themeDir is a build-in alias of VitePress
      '@wiki': resolve('src/wiki/'),
      '@data': resolve('src/.vitepress/data/'),
    },
  },
  plugins: [
    Inspect(),
    VueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),

    /**
     * unplugin-vue-components
     *
     * @see https://github.com/unplugin/unplugin-vue-components?tab=readme-ov-file#usage
     */
    Components({
      dirs: ['src/.vitepress/theme/components'],
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({ prefix: 'i' }),
      ],
    }),

    /**
     * unplugin-icons
     *
     * @see https://github.com/unplugin/unplugin-icons?tab=readme-ov-file#configuration
     */
    Icons(),

    MarkdownTransform(),

    // Git Changelog
    GitChangelog({
      include: ['src/wiki/**/*.md', 'src/styles/detail/src/**/*.csl'],
      repoURL: () => 'https://github.com/zotero-chinese/wiki',
      rewritePathsBy: {
        handler: (_commit, path) => {
          if (path) {
            // styles/detail/src/*/*.csl -> styles/detail/src/*/index.md
            if (path.match('styles/detail/src')) {
              return `${path.substring(0, path.lastIndexOf('/'))}/index.md`
            }
          }
          return path
        },
      },
      mapAuthors: contributors,
    }),
    GitChangelogMarkdownSection({
      exclude: (id) => {
        if (id.match('src/wiki/')) {
          if (id.endsWith('src/wiki/index.md') || id.endsWith('src/wiki/contributors.md'))
            return true
          return false
        }
        if (id.match('src/styles/detail/src'))
          return false
        return true
      },
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
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks(id) {
  //         if (id.includes('virtual:nolebase-git-changelog'))
  //           return 'git-changelog'
  //       },
  //     },
  //   },
  // },
})
