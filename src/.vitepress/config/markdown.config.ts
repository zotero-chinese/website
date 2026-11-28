import type { UserConfig } from 'vitepress'
import { markdown as _markdown } from '../../wiki/.vitepress/markdown.ts'
import { restoreHtmlInlineLinkLevel } from '../utils/html-inline-link.ts'

const WIKI_CONFIG = _markdown?.config

export const markdown: UserConfig['markdown'] = {
  ..._markdown,
  config: async (md) => {
    await WIKI_CONFIG?.(md)
    // 须在 wiki 的配置之后，覆盖 VitePress `componentPlugin` 装上的 html_inline
    restoreHtmlInlineLinkLevel(md)
  },
}
