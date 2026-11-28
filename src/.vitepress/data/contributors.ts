import type { WikiContributor } from '../../wiki/.vitepress/contributors.ts'
import { wikiContributors } from '../../wiki/.vitepress/contributors.ts'

/**
 * 贡献者信息
 *
 * 直接复用 wiki 子模块的名单类型与数据，字段完全一致：
 * `name` 为展示名称，`github` 用于生成头像与主页，`alias` 用于合并同一人的多个署名。
 * 需要新增或修正贡献者时，请直接修改 `src/wiki/.vitepress/contributors.ts`。
 */
export type ContributorInfo = WikiContributor

export const contributorInfos: ContributorInfo[] = wikiContributors
