/**
 * 插件文档索引（构建期数据）。
 *
 * 扫描 wiki 子模块中 user-guide/plugins/ 下的文档，
 * 读取各文档 frontmatter 中的 `plugin` 字段（插件仓库，如 `windingwind/zotero-better-notes`），
 * 建立「插件仓库 → 文档页」的映射，供插件列表页、下载抽屉与文档页组件使用。
 *
 * 文档与插件仓库的对应关系由文档自身（wiki 仓库）维护，此处只做扫描。
 */
import { globSync, readFileSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export interface PluginDoc {
  /**
   * 插件仓库（统一转为小写，便于与商店数据匹配）
   */
  repo: string
  /**
   * 文档页 URL，如 /user-guide/plugins/better-notes
   */
  url: string
  /**
   * 文档标题（frontmatter.title，缺省时用文件名）
   */
  title: string
}

declare const data: PluginDoc[]
export { data }

export default {
  async load(): Promise<PluginDoc[]> {
    const docs: PluginDoc[] = []
    const files = globSync('src/wiki/user-guide/plugins/**/*.md')
    for (const file of files) {
      const fileContent = readFileSync(file, 'utf8')
      const { data: frontmatter } = matter(fileContent)
      const repo = frontmatter.plugin
      if (typeof repo !== 'string' || !repo) continue
      const name = path.basename(file, '.md')
      docs.push({
        repo: repo.toLowerCase(),
        url: `/user-guide/plugins/${name}`,
        title: typeof frontmatter.title === 'string' && frontmatter.title ? frontmatter.title : name,
      })
    }
    return docs
  },
}
