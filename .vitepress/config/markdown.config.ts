import type { UserConfig } from 'vitepress'
import { footnote } from '@mdit/plugin-footnote'
import { markdown as _markdown } from '../../src/wiki/.vitepress/config/markdown'

export const markdown: UserConfig['markdown'] = {
  ..._markdown,
  config: (md) => {
    md.use(footnote)
  },
}
