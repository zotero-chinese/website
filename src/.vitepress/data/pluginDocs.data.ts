/**
 * 插件文档索引（构建期数据）。
 *
 * 扫描 wiki 子模块中 user-guide/plugins/ 下的文档，
 * 读取各文档 frontmatter 中的 `plugin` 字段（插件仓库，如 `windingwind/zotero-better-notes`），
 * 建立「插件仓库 → 文档页」的映射，供插件列表页、下载抽屉与文档页组件使用。
 *
 * 文档与插件仓库的对应关系由文档自身（wiki 仓库）维护，此处只做扫描；
 * frontmatter 为受控格式（`plugin: owner/repo` 单行），用正则提取即可，
 * 无需引入 YAML 解析依赖。
 */
import { globSync, readFileSync } from 'node:fs'
import path from 'node:path'

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
      const repo = extractPluginRepo(readFileSync(file, 'utf8'))
      if (!repo) continue
      const rel = file.replaceAll('\\', '/').split('user-guide/plugins/')[1]
      if (!rel) continue
      // 目录 index 页规范化为目录 URL（如 translate/index → /user-guide/plugins/translate/）
      const url = `/user-guide/plugins/${rel.replace(/\.md$/, '').replace(/\/index$/, '/')}`
      docs.push({
        repo: repo.toLowerCase(),
        url,
        title: path.basename(rel, '.md'),
      })
    }
    // 同一插件多页时（如 translate/ 主文档 + 各翻译引擎配置页），
    // 主文档（目录 index 页）优先作为商店的文档入口
    return docs.sort((a, b) => {
      const aMain = a.url.endsWith('/') ? 0 : 1
      const bMain = b.url.endsWith('/') ? 0 : 1
      return aMain - bMain || a.url.length - b.url.length
    })
  },
}

/** 从 md 的 frontmatter 中提取 `plugin` 字段（插件仓库），无则返回 undefined */
function extractPluginRepo(code: string): string | undefined {
  const fm = code.match(/^---\n([\s\S]*?)\n---/)
  if (!fm) return undefined
  const line = fm[1].match(/^plugin:\s*(.+)$/m)
  if (!line) return undefined
  return line[1].trim().replace(/^["']|["']$/g, '')
}
