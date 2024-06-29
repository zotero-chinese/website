import { wikiContributors } from '../../src/wiki/.vitepress/contributors'
import type { WikiContributor } from '../../src/wiki/.vitepress/contributors'

export interface SocialEntry {
  type: 'github' | 'twitter' | 'email'
  icon: string
  link: string
}

export interface Creator extends WikiContributor {
  name: string
  username: string
  avatar?: string
  title?: string
  org?: string
  desc?: string
  links?: SocialEntry[]
  nameAliases?: string[]
  emailAliases?: string[]
}

export const contributors: Creator[] = [
  {
    name: 'Northword',
    username: 'northword',
    title: '开发者',
    nameAliases: ['renovate[bot]', 'ImgBotApp'],
    emailAliases: [
      '29139614+renovate[bot]@users.noreply.github.com',
      '44738481+northword@users.noreply.github.com',
      'ImgBotHelp@gmail.com',
    ],
  },
  ...(wikiContributors as Creator[]),
]

export const creatorNames = contributors.map(c => c.name)
export const creatorUsernames = contributors.map(c => c.username || '')
