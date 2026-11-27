/**
 * 向搜索引擎主动推送站点 URL
 *
 * 被动等待爬虫发现新页面通常需要数天到数周，主动推送可以把这个过程压缩到分钟级。
 * 对于百度，这是「zotero 中文社区」这类关键词排名提升最直接的一环；
 * 在此之前必须先在百度搜索资源平台完成站点验证并取得 token。
 *
 * 支持：
 * - 百度普通收录（需要 `BAIDU_PUSH_TOKEN`）
 * - 必应 IndexNow（需要 `INDEXNOW_KEY`）
 *
 * 用法：
 *   pnpm seo:push                # 推送 sitemap 中的全部 URL
 *   pnpm seo:push --limit 50     # 仅推送前 50 条（新页面较多时按需使用）
 *   pnpm seo:push --dry-run      # 只打印，不发请求
 *
 * 环境变量：
 *   SITE_URL             站点地址，默认 https://zotero-chinese.com
 *   BAIDU_PUSH_TOKEN     百度搜索资源平台的推送 token
 *   INDEXNOW_KEY         必应 IndexNow 的 key
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

const siteUrl = (process.env.SITE_URL || 'https://zotero-chinese.com').replace(/\/$/, '')
const sitemapPath = path.resolve('src/.vitepress/dist/sitemap.xml')

interface Args {
  limit: number | undefined
  dryRun: boolean
}

function parseArgs(argv: string[]): Args {
  const limitIndex = argv.indexOf('--limit')
  const limit = limitIndex >= 0 ? Number(argv[limitIndex + 1]) : undefined
  return {
    limit: Number.isFinite(limit) && limit! > 0 ? limit : undefined,
    dryRun: argv.includes('--dry-run'),
  }
}

/**
 * 从构建产物中提取 URL 列表
 */
function readUrls(): string[] {
  let xml: string
  try {
    xml = readFileSync(sitemapPath, 'utf8')
  } catch {
    console.error(`[seo] 未找到 sitemap：${sitemapPath}`)
    console.error('[seo] 请先执行 `pnpm build`。')
    process.exit(1)
  }
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

/**
 * 百度普通收录推送
 *
 * @see https://ziyuan.baidu.com/college/documentinfo?id=1954
 */
async function pushBaidu(urls: string[], token: string): Promise<void> {
  const endpoint = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(siteUrl)}&token=${encodeURIComponent(token)}`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: urls.join('\n'),
  })

  const text = await response.text()
  if (!response.ok) {
    console.error(`[seo] 百度推送失败 ${response.status}: ${text}`)
    return
  }
  console.log(`[seo] 百度推送响应: ${text}`)
}

/**
 * 必应 IndexNow 推送
 *
 * @see https://www.indexnow.org/documentation
 */
async function pushIndexNow(urls: string[], key: string): Promise<void> {
  const host = new URL(siteUrl).host
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${siteUrl}/${key}.txt`,
      urlList: urls,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error(`[seo] IndexNow 推送失败 ${response.status}: ${text}`)
    return
  }
  console.log(`[seo] IndexNow 推送成功（${urls.length} 条）`)
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  let urls = readUrls()

  if (args.limit) urls = urls.slice(0, args.limit)

  console.log(`[seo] 待推送 ${urls.length} 条 URL`)

  if (args.dryRun) {
    console.log(urls.join('\n'))
    return
  }

  const baiduToken = process.env.BAIDU_PUSH_TOKEN
  const indexNowKey = process.env.INDEXNOW_KEY

  if (!baiduToken && !indexNowKey) {
    console.warn('[seo] 未配置 BAIDU_PUSH_TOKEN 或 INDEXNOW_KEY，跳过推送。')
    console.warn('[seo] 百度推送 token 可在 https://ziyuan.baidu.com 的「普通收录」中获取。')
    return
  }

  // 百度单次最多 1000 条（普通收录）
  if (baiduToken) {
    for (let i = 0; i < urls.length; i += 1000) {
      await pushBaidu(urls.slice(i, i + 1000), baiduToken)
    }
  }

  if (indexNowKey) {
    // IndexNow 单次最多 10000 条
    for (let i = 0; i < urls.length; i += 10000) {
      await pushIndexNow(urls.slice(i, i + 10000), indexNowKey)
    }
  }
}

await main()
