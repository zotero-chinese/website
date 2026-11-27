import type { SiteConfig } from 'vitepress'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/**
 * 参与时间戳统计的 git 仓库（相对站点源目录）
 *
 * 顺序必须「由深到浅」：子模块内的文件同样位于 `src/` 之下，
 * 若主仓库排在前会先把它们认领走，导致子模块页面取不到时间戳。
 *
 * 站点内容分布在主仓库与三个子模块中，`git log` 必须在各自的仓库里执行。
 * 每个仓库只需一次遍历，避免逐文件 spawn——逐文件读取 464 个文件约需 27 秒。
 */
const REPOSITORIES = ['styles/detail', 'blog/blog-repo', 'wiki', '.'] as const

type CacheTimestamps = (root: string, pathspec?: string[]) => Promise<void>
type ReadTimestamp = (file: string) => Promise<number>

/** 统一成正斜杠，Windows 下 git 与 VitePress 均以正斜杠识路径 */
function slash(file: string): string {
  return file.split(path.sep).join('/')
}

/**
 * 批量获取源文件的最近提交时间
 *
 * @param srcDir    站点源目录的绝对路径
 * @param files     源文件的绝对路径
 * @returns 「绝对路径（正斜杠）→ 毫秒时间戳」，未纳入 git 跟踪的文件不会出现
 *
 * 注意：`cacheAllGitTimestamps` 会重置 VitePress 的全局时间戳缓存，
 * 因此必须「预填充一个仓库 → 立即读取该仓库的时间戳」交替进行，
 * 不能先全部预填充再统一读取，否则只有最后一个仓库能命中缓存。
 */
export async function collectGitTimestamps(
  srcDir: string,
  files: string[],
  cacheAllGitTimestamps: CacheTimestamps,
  getGitTimestamp: ReadTimestamp,
): Promise<Map<string, number>> {
  const timestamps = new Map<string, number>()
  const pending = [...new Set(files.map(slash))]

  for (const dir of REPOSITORIES) {
    const root = slash(path.resolve(srcDir, dir))
    const owned = pending.filter((file) => file.startsWith(`${root}/`))
    if (!owned.length) continue

    // 子模块尚未初始化时目录不存在，`git rev-parse` 会抛错；
    // 这些页面缺少 lastmod 不影响其余页面。
    try {
      await cacheAllGitTimestamps(root, [':(glob)**/*.md'])
    } catch {
      continue
    }

    for (const file of owned) {
      const ts = await getGitTimestamp(file)
      if (ts > 0) timestamps.set(file, ts)
    }
  }

  return timestamps
}

/**
 * 为 sitemap 中的每个 `<url>` 补上 `<lastmod>`
 *
 * VitePress 只在启用 `lastUpdated` 时才写入 lastmod，而该选项会同时在页脚输出
 * 「最后更新」并只覆盖主仓库。这里改为在构建末尾直接回填 sitemap，
 * 既不给页面增加 UI，又能覆盖子模块。
 *
 * @returns 实际写入的条目数
 */
export async function applySitemapLastmod(
  config: SiteConfig,
  cacheAllGitTimestamps: CacheTimestamps,
  getGitTimestamp: ReadTimestamp,
): Promise<number> {
  // 未启用 sitemap 时无需处理
  if (!config.sitemap?.hostname) return 0

  const sitemapPath = path.join(config.outDir, 'sitemap.xml')
  if (!existsSync(sitemapPath)) return 0

  const xml = readFileSync(sitemapPath, 'utf8')
  // 已有 lastmod 说明由 VitePress 自己写入了，避免重复
  if (xml.includes('<lastmod>')) return 0

  // 复刻 generateSitemap 的「源文件 → URL」映射，用于把 URL 对回 git 记录。
  // `loc` 中的百分号编码在回填时会解码，故这里的 key 保持未编码形式。
  const sourceByUrl = new Map<string, string>()
  for (const page of config.pages) {
    const rewritten = config.rewrites.map[page] ?? page
    const url = rewritten
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, config.cleanUrls ? '' : '.html')
    // 与 `collectGitTimestamps` 的 key 保持一致，统一为正斜杠
    sourceByUrl.set(url, slash(path.resolve(config.srcDir, page)))
  }

  const timestamps = await collectGitTimestamps(
    config.srcDir,
    [...sourceByUrl.values()],
    cacheAllGitTimestamps,
    getGitTimestamp,
  )
  if (!timestamps.size) return 0

  let written = 0
  const patched = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner: string) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(inner)?.[1]
    if (!loc) return block
    // `loc` 是绝对地址且经过百分号编码（CSL 样式名含中文与括号），
    // 必须先解码才能与源文件路径对齐，否则这些页面全部拿不到 lastmod。
    let url = loc.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '')
    try {
      url = decodeURI(url)
    } catch {
      return block
    }
    const source = sourceByUrl.get(url)
    const ts = source && timestamps.get(source)
    if (!ts) return block
    written++
    // 按 sitemap 0.9 的 schema，lastmod 必须紧跟在 loc 之后、
    // 位于 changefreq / priority / xhtml:link 之前。
    const withLastmod = inner.replace(
      /<\/loc>/,
      `</loc><lastmod>${new Date(ts).toISOString()}</lastmod>`,
    )
    return `<url>${withLastmod}</url>`
  })

  if (written) writeFileSync(sitemapPath, patched)
  return written
}
