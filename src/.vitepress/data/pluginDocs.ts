/**
 * 插件文档索引的查询辅助。
 *
 * 注意：VitePress 的 `.data.ts` 模块在运行时会被整体替换为 `export const data`，
 * 无法提供具名导出，因此查询函数放在此处（常规模块）。
 */
import { data as pluginDocs } from './pluginDocs.data'
import type { PluginDoc } from './pluginDocs.data'

/**
 * 根据插件仓库查找文档页 URL（大小写不敏感）。
 *
 * 无对应文档时返回 undefined。
 */
export function getPluginDocUrl(repo: string): string | undefined {
  return (pluginDocs as PluginDoc[]).find((d) => d.repo === repo.toLowerCase())?.url
}

export type { PluginDoc } from './pluginDocs.data'
