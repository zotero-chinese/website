import type { UserConfig } from 'vitepress'
import { markdown as _markdown } from '../../wiki/.vitepress/markdown'

export const markdown: UserConfig['markdown'] = {
  ..._markdown,
}
