import type { Author } from '@nolebase/vitepress-plugin-git-changelog'
import { wikiContributors } from '../../wiki/.vitepress/contributors'

export const contributors: Author[] = [
  ...(wikiContributors as Author[]),
]

export const creatorNames = contributors.map(c => c.name)
export const creatorUsernames = contributors.map(c => c.username || '')
