import type { UserConfig } from 'vitepress'
import { footnote } from '@mdit/plugin-footnote'
import { mark } from '@mdit/plugin-mark'
import { markdown as _markdown } from '../../src/wiki/.vitepress/config/markdown'

export const markdown: UserConfig['markdown'] = {
  ..._markdown as Omit<UserConfig['markdown'], 'config'>,
  config: (md) => {
    md.use(footnote)
    md.use(mark)
  },
}
