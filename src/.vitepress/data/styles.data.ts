import fs from 'fs-extra'

/**
 * 索引页使用的精简样式信息。
 *
 * 完整数据（含 citations/bibliography 等详情字段）由 dataAssets 插件
 * 生成到 `public/styles-data/<key>.json`，按需 fetch。
 */
export interface StyleSummary {
  /** 样式目录名，也用作详情页 URL 的一部分 */
  dir: string
  /** 样式文件名 */
  file: string
  title: string
  id: string
  summary?: string
  citation_format?: string
  field?: string
  updated?: string
  tags?: string[]
  /** 完整数据 JSON 的文件 key（FNV-1a 64 位哈希） */
  key: string
}

declare const data: StyleSummary[]
export { data }

/** FNV-1a 64 位哈希，与浏览器端实现保持一致 */
export function styleKey(input: string): string {
  let h = 0xcbf29ce484222325n
  for (let i = 0; i < input.length; i++) {
    h ^= BigInt(input.charCodeAt(i))
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn
  }
  return h.toString(16)
}

function getSortKeys(title: string): string[] {
  const keys: string[] = []

  // 先按照样式类型排序
  let style_type = 'c'
  if (/法学引注手册|中国高等学校自然科学学报编排规范|综合性期刊文献引证技术规范/.test(title)) {
    // 综合性样式在最前
    style_type = 'a'
  } else if (/GB/.test(title)) {
    // 国标
    style_type = 'b'
  } else if (title.startsWith('导出')) {
    style_type = 'z'
  }
  keys.push(style_type)

  // 国标按时间逆序
  const year = title.match(/GB[-/\s]T[-\s]7714[-—](\d\d\d\d)/)
  keys.push(year ? (9999 - Number.parseInt(year[1])).toString() : '9999')

  // 可按标题长度递增
  keys.push(title.replace(/[，（]/, ' ').replace('）', ''))

  return keys
}

export default {
  watch: ['../../styles/detail/**/metadata.json'],
  load(watchedFiles: string[]) {
    // watchFiles 是一个所匹配文件的绝对路径的数组。

    return watchedFiles
      .map((file) => {
        const full = fs.readJsonSync(file) as StyleFullResult
        return {
          dir: full.dir,
          file: full.file,
          title: full.title,
          id: full.id,
          summary: full.summary,
          citation_format: full.citation_format,
          field: full.field,
          updated: full.updated,
          tags: full.tags,
          key: styleKey(full.dir),
        } satisfies StyleSummary
      })
      .sort((a, b) => {
        const a_keys = getSortKeys(a.title)
        const b_keys = getSortKeys(b.title)
        for (let i = 0; i < a_keys.length; i++) {
          if (a_keys[i] !== b_keys[i]) {
            return a_keys[i].localeCompare(b_keys[i], 'zh', { numeric: true })
          }
        }
        return 0
      })
  },
}
