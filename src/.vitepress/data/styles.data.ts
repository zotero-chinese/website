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
  field: string[]
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
  if (
    /法学引注手册（第二版|中国高等学校自然科学学报编排规范|综合性期刊文献引证技术规范/.test(title)
  ) {
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

/** CSL 样式的学科领域（`field`）取值与中文显示名。 */
export const STYLE_FIELD_LABELS: Record<string, string> = {
  anthropology: '人类学',
  astronomy: '天文学',
  biology: '生物学',
  botany: '植物学',
  chemistry: '化学',
  communications: '传播学',
  engineering: '工程学',
  // 用于 Harvard、APA 等通用样式，不属于具体学科
  'generic-base': '※通用基础',
  geography: '地理学',
  geology: '地质学',
  history: '历史学',
  humanities: '人文学科',
  law: '法学',
  linguistics: '语言学',
  literature: '文学',
  math: '数学',
  medicine: '医学',
  philosophy: '哲学',
  physics: '物理学',
  political_science: '政治学',
  psychology: '心理学',
  science: '自然科学',
  social_science: '社会科学',
  sociology: '社会学',
  theology: '神学',
  zoology: '动物学',
}

export function getFieldLabel(field: string | string[] | undefined): string[] {
  return field 
  ? [field].flat().map((v) => STYLE_FIELD_LABELS[v] ?? v) 
  : []
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
          field: getFieldLabel(full.field),
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
