import type { GitPageData } from './data/git-types'

declare module 'vitepress' {
  interface PageData {
    /**
     * 页面的 Git 信息，由 `plugins/git.ts` 在构建期注入。
     *
     * 只有 wiki 文档页与 CSL 样式详情页会带上该字段。
     */
    git?: GitPageData
  }
}
