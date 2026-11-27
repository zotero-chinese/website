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
 *   pnpm seo:push                # 推送新增/变更/到期重推的 URL
 *   pnpm seo:push --limit 10     # 只推优先级最高的 10 条
 *   pnpm seo:push --all          # 忽略状态，按优先级全量推送
 *   pnpm seo:push --dry-run      # 只打印，不发请求
 *
 * ## 为什么需要增量
 *
 * 百度普通收录的每日配额有限（本站实测 10 条/天），配额耗尽后多余的 URL 会被
 * 直接丢弃。全量推送 571 条的结果是：每天只有排在最前面的 10 条进队列，而且
 * 天天推同样的 10 条，后面的页面永远轮不到。因此脚本做了三件事：
 *
 * 1. **增量筛选**：状态文件记录每个 URL 的 `lastmod` 与 `pushedAt`，
 *    只推「没推过的」「lastmod 变了的」以及「推过太久该重试的」。
 * 2. **优先级排序**：按页面类型排序（见 `URL_PRIORITY`），配额不足时先保证
 *    首页、列表页、教程页，长尾的 CSL 样式页与转换器页排在最后。
 * 3. **余量回填 + TTL 重推**：当天变更数少于配额时，用剩余额度按优先级回填
 *    那些「推过但已超过 TTL」的页面，避免额度作废，也给被百度丢弃的页面
 *    第二次机会。
 *
 * ## 状态文件
 *
 * 默认 `.seo-push-state.json`（可用 `SEO_STATE_PATH` 覆盖）。本地运行会直接读写；
 * CI 中由 `actions/cache` 恢复与保存。状态丢失时退化为全量推送，不会推错页面。
 *
 * 环境变量：
 *   SITE_URL             站点地址，默认 https://zotero-chinese.com
 *   BAIDU_PUSH_TOKEN     百度搜索资源平台的推送 token
 *   INDEXNOW_KEY         必应 IndexNow 的 key
 *   BAIDU_DAILY_QUOTA    百度每日配额上限，超出部分不再发送（不设则以响应的 remain 为准）
 *   SEO_PROBE_SIZE       首批探测条数，默认 10；拿到 remain 后再按剩余额度扩容
 *   SEO_STATE_PATH       状态文件路径，默认 .seo-push-state.json
 *   SEO_RETRY_DAYS       推过多久后允许重推，默认 90
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const siteUrl = (process.env.SITE_URL || 'https://zotero-chinese.com').replace(/\/$/, '')
const sitemapPath = path.resolve('src/.vitepress/dist/sitemap.xml')
const statePath = path.resolve(process.env.SEO_STATE_PATH || '.seo-push-state.json')

/** 默认的重推间隔：超过这个天数未推送的页面会被重新排队 */
const DEFAULT_RETRY_DAYS = 90

/**
 * 首批探测条数
 *
 * 百度在「提交条数 > 当日剩余配额」时会整批拒绝并返回 `over quota`。
 * 初次运行时脚本不知道当天还剩多少配额，若直接提交全部 URL，一次就白白
 * 浪费一整天。因此第一批只提交少量 URL，拿到响应中的 `remain` 后再按剩余额度扩容。
 */
const DEFAULT_PROBE_SIZE = 10

interface Args {
  limit: number | undefined
  dryRun: boolean
  /** 忽略状态文件，按优先级全量推送 */
  all: boolean
}

/**
 * 页面类型优先级（数值越小越先推送）
 *
 * 这些是搜索意图最强、最能带来自然流量的着陆页。
 * `/styles/<样式名>/`（361 条）与 `/translators/<id>`（100 条）合计 461 条，
 * 数量远超配额且多为长尾页面，因此排在最后。
 */
const URL_PRIORITY: Array<{ pattern: RegExp; weight: number; label: string }> = [
  // 站点核心着陆页：首页与三大数据库列表页（搜索意图最强的入口）
  { pattern: /^https?:\/\/[^/]+\/(?:index\.html)?$/, weight: 0, label: '首页' },
  {
    pattern: /^https?:\/\/[^/]+\/(?:plugins|styles|translators)\/?$/,
    weight: 0,
    label: '插件商店/样式库/转换器列表',
  },
  {
    pattern: /^https?:\/\/[^/]+\/en\/(?:plugins|styles|translators)\/?$/,
    weight: 3,
    label: '英文列表页',
  },
  // 教程目录
  {
    pattern:
      /^https?:\/\/[^/]+\/(?:user-guide|plugin-dev-guide|csl-dev-guide|translator-dev-guide)\/?$/,
    weight: 1,
    label: '教程目录',
  },
  // 教程正文
  {
    pattern:
      /^https?:\/\/[^/]+\/(?:user-guide|plugin-dev-guide|csl-dev-guide|translator-dev-guide)\/./,
    weight: 2,
    label: '教程正文',
  },
  { pattern: /\/blog\//, weight: 3, label: '博客' },
  { pattern: /^https?:\/\/[^/]+\/plugins\/./, weight: 3, label: '插件页面' },
  { pattern: /^https?:\/\/[^/]+\/en\//, weight: 3, label: '英文页面' },
  { pattern: /^https?:\/\/[^/]+\/(?:contributing|about)(\/|$)/, weight: 4, label: '参与与关于' },
  // 长尾：CSL 样式详情页与转换器详情页
  { pattern: /^https?:\/\/[^/]+\/styles\//, weight: 5, label: 'CSL 样式详情' },
  { pattern: /^https?:\/\/[^/]+\/translators\//, weight: 5, label: '转换器详情' },
]

/**
 * 计算单条 URL 的排序键
 *
 * @param url 绝对地址
 */
function rankOf(url: string): { weight: number; rule: number } {
  const rule = URL_PRIORITY.findIndex((item) => item.pattern.test(url))
  return {
    weight: rule >= 0 ? URL_PRIORITY[rule].weight : 4,
    // `URL_PRIORITY` 的顺序本身也是意图强度顺序，用于同权重内的次级排序
    rule: rule >= 0 ? rule : URL_PRIORITY.length,
  }
}

function labelOf(url: string): string {
  return URL_PRIORITY.find((item) => item.pattern.test(url))?.label ?? '其他'
}

/**
 * 目录页（以 `/` 结尾）应比自己手下的正文页先推，否则配额用完后目录页排不上队。
 */
function isDirectory(url: string): boolean {
  return url.endsWith('/')
}

/**
 * 按优先级排序的比较函数
 *
 * 类型权重 → 规则顺序（保证同组连续输出）→ 目录页优先。
 * `lastmod` 不参与排序：新页面已经在筛选阶段进入 primary 队列，
 * 这里再按时间排会让同一栏目的页面顺序变得随机。
 */
function compareByPriority(a: string, b: string): number {
  const ra = rankOf(a)
  const rb = rankOf(b)
  return (
    ra.weight - rb.weight ||
    ra.rule - rb.rule ||
    Number(isDirectory(b)) - Number(isDirectory(a)) ||
    a.localeCompare(b)
  )
}

/**
 * 解析参数
 */
function parseArgs(argv: string[]): Args {
  const limitIndex = argv.indexOf('--limit')
  const limit = limitIndex >= 0 ? Number(argv[limitIndex + 1]) : undefined
  return {
    limit: Number.isFinite(limit) && limit! > 0 ? limit : undefined,
    dryRun: argv.includes('--dry-run'),
    all: argv.includes('--all'),
  }
}

interface SitemapEntry {
  url: string
  /** 毫秒时间戳，0 表示 sitemap 中没有 lastmod（如动态路由生成的页面） */
  lastmod: number
}

/**
 * 读取 sitemap 中的 URL 及其 lastmod
 */
function readEntries(): SitemapEntry[] {
  let xml: string
  try {
    xml = readFileSync(sitemapPath, 'utf8')
  } catch {
    console.error(`[seo] 未找到 sitemap：${sitemapPath}`)
    console.error('[seo] 请先执行 `pnpm build`。')
    process.exit(1)
  }

  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map((m) => {
      const inner = m[1]
      const url = /<loc>([^<]+)<\/loc>/.exec(inner)?.[1] ?? ''
      const lastmod = Date.parse(/<lastmod>([^<]+)<\/lastmod>/.exec(inner)?.[1] ?? '')
      return { url, lastmod: Number.isNaN(lastmod) ? 0 : lastmod }
    })
    .filter((entry) => entry.url)
}

/**
 * 状态文件中的单条记录
 */
interface StateEntry {
  /** 推送时该 URL 的 lastmod（毫秒），0 表示当时 sitemap 无 lastmod */
  lastmod: number
  /** 最近一次成功推送的时间（毫秒） */
  pushedAt: number
}

interface State {
  version: 1
  urls: Record<string, StateEntry>
}

function loadState(): State {
  try {
    const parsed = JSON.parse(readFileSync(statePath, 'utf8')) as Partial<State>
    if (parsed?.version !== 1 || typeof parsed.urls !== 'object' || !parsed.urls) {
      throw new Error('状态文件格式不符，按空状态处理')
    }
    return { version: 1, urls: parsed.urls }
  } catch (error) {
    // 首次运行、缓存被驱逐、文件损坏都会走到这里，退化为全量推送是安全的
    if (error instanceof SyntaxError) console.warn('[seo] 状态文件解析失败，本次按全量处理。')
    return { version: 1, urls: {} }
  }
}

function saveState(state: State): void {
  // 保持稳定顺序，让缓存内容可读、便于 diff
  const urls = Object.fromEntries(Object.entries(state.urls).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(statePath, `${JSON.stringify({ version: 1, urls }, null, 2)}\n`)
}

/** 候选 URL 的入选原因 */
type Reason = 'new' | 'changed' | 'stale' | 'retry' | 'unchanged'

const REASON_LABEL: Record<Reason, string> = {
  new: '新增页面',
  changed: '内容已变更',
  stale: '超过重推间隔',
  retry: '无 lastmod，定期重试',
  unchanged: '无需推送',
}

interface Candidate {
  url: string
  lastmod: number
  reason: Reason
}

/**
 * 把 sitemap 与状态文件对照，分出本次要推送的候选
 *
 * 返回 primary（新增 / 变更）与 secondary（TTL 到期重推）两组。
 * primary 优先占用配额，secondary 用剩余额度回填。
 *
 * 注意：动态路由页面（`/translators/<id>`）在 sitemap 中没有 lastmod，
 * 无法判断内容是否变化，只能按 TTL 定期重试（否则永远不会被推送）。
 */
function selectCandidates(
  entries: SitemapEntry[],
  state: State,
  now: number,
  ttlMs: number,
): { primary: Candidate[]; secondary: Candidate[]; unchanged: number } {
  const primary: Candidate[] = []
  const secondary: Candidate[] = []
  let unchanged = 0

  for (const entry of entries) {
    const known = state.urls[entry.url]
    if (!known) {
      primary.push({ ...entry, reason: 'new' })
      continue
    }

    // 有 lastmod 就能精确判断内容是否变化
    if (entry.lastmod > 0) {
      if (entry.lastmod !== known.lastmod) {
        primary.push({ ...entry, reason: 'changed' })
      } else if (now - known.pushedAt >= ttlMs) {
        secondary.push({ ...entry, reason: 'stale' })
      } else {
        unchanged++
      }
      continue
    }

    // 无 lastmod：只能靠时间判断，且一旦推送过就再也检测不到变化，
    // 因此必须按 TTL 定期重试，否则这些页面永远停在首次推送的状态。
    if (now - known.pushedAt >= ttlMs) {
      secondary.push({ ...entry, reason: 'retry' })
    } else {
      unchanged++
    }
  }

  primary.sort((a, b) => compareByPriority(a.url, b.url))
  secondary.sort((a, b) => compareByPriority(a.url, b.url))
  return { primary, secondary, unchanged }
}

/**
 * 百度普通收录推送的单次结果
 */
interface BaiduResult {
  ok: boolean
  /** 当日剩余配额，仅在 ok 时可信 */
  remain?: number
  /** 本次成功提交的条数 */
  success?: number
}

/**
 * 百度普通收录推送
 *
 * 响应体形如：
 * - 成功：`{"remain":9,"success":1}`
 * - 超额：`{"error":400,"message":"over quota"}`
 * - 站点未验证/参数错误：`{"error":400,"message":"site init fail"}`
 *
 * @see https://ziyuan.baidu.com/college/documentinfo?id=1954
 */
async function pushBaidu(urls: string[], token: string): Promise<BaiduResult> {
  // `site` 必须与百度搜索资源平台中已验证的站点一致，且只传域名（不带协议、不带斜杠）。
  // 传 `https://example.com` 会得到 `{"error":400,"message":"site init fail"}`。
  const host = new URL(siteUrl).host
  const endpoint = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(host)}&token=${encodeURIComponent(token)}`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: urls.join('\n'),
  })

  const text = await response.text()
  if (!response.ok) {
    console.error(`[seo] 百度推送失败 ${response.status}: ${text}`)
    return { ok: false }
  }

  // 百度对不可用 URL 也会返回 200，真正结果在响应体里
  let body: { remain?: number; success?: number; not_valid?: string[]; message?: string } = {}
  try {
    body = JSON.parse(text)
  } catch {
    console.log(`[seo] 百度推送响应: ${text}`)
    return { ok: true }
  }

  if (body.message) console.error(`[seo] 百度返回错误：${body.message}`)

  const invalid = body.not_valid?.length ?? 0
  console.log(
    `[seo] 百度推送：提交 ${urls.length} 条，成功 ${body.success ?? '?'} 条` +
      (invalid ? `，无效 ${invalid} 条` : '') +
      (body.remain === undefined ? '' : `，今日剩余 ${body.remain} 条`),
  )
  if (invalid) console.warn(`[seo] 无效 URL：${body.not_valid!.join(', ')}`)

  return { ok: body.success !== 0, remain: body.remain, success: body.success }
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
  const now = Date.now()
  const retryDays = Number(process.env.SEO_RETRY_DAYS) || DEFAULT_RETRY_DAYS
  const ttlMs = retryDays * 24 * 60 * 60 * 1000

  const entries = readEntries()
  const entryByUrl = new Map(entries.map((entry) => [entry.url, entry]))
  const state = args.all ? { version: 1 as const, urls: {} } : loadState()
  if (args.all) console.log('[seo] --all：忽略状态文件，按优先级全量推送。')

  const { primary, secondary, unchanged } = selectCandidates(entries, state, now, ttlMs)

  console.log(
    `[seo] sitemap ${entries.length} 条：新增 ${primary.filter((c) => c.reason === 'new').length} 条，` +
      `变更 ${primary.filter((c) => c.reason === 'changed').length} 条，` +
      `可重推 ${secondary.length} 条，跳过 ${unchanged} 条`,
  )

  // primary 先占位，secondary 用剩余额度回填
  const queue = [...primary]

  if (args.dryRun) {
    const capped = args.limit ? queue.slice(0, args.limit) : queue
    printQueue([...capped, ...secondary], now, ttlMs)
    console.log(
      `\n[seo] dry-run：按当前配额最多可推送 ${capped.length} 条新增/变更 + ${secondary.length} 条回填`,
    )
    return
  }

  const baiduToken = process.env.BAIDU_PUSH_TOKEN
  const indexNowKey = process.env.INDEXNOW_KEY

  if (!baiduToken && !indexNowKey) {
    console.warn('[seo] 未配置 BAIDU_PUSH_TOKEN 或 INDEXNOW_KEY，跳过推送。')
    console.warn('[seo] 百度推送 token 可在 https://ziyuan.baidu.com 的「普通收录」中获取。')
    return
  }

  // IndexNow 没有配额限制（单次 1 万条），全量重推的成本可以忽略，
  // 因此不做增量筛选：让它每次都拿到完整的 URL 列表，行为更可预期。
  if (indexNowKey) {
    const allUrls = entries.map((entry) => entry.url)
    for (let i = 0; i < allUrls.length; i += 10000) {
      await pushIndexNow(allUrls.slice(i, i + 10000), indexNowKey)
    }
  }

  if (!baiduToken) {
    if (!args.dryRun) saveState(state)
    return
  }

  // 百度普通收录：单次最多 1000 条，且每日有配额（本站实测 10 条/天）。
  // 配额耗尽后百度会返回错误并丢弃整个批次，因此根据上一次响应的 remain 提前收手。
  const quota = Number(process.env.BAIDU_DAILY_QUOTA)
  const quotaCap = Number.isFinite(quota) && quota > 0 ? quota : Number.POSITIVE_INFINITY
  // `--limit` 是比配额更硬的约束，两者取小
  const cap = Math.min(quotaCap, args.limit ?? Number.POSITIVE_INFINITY)

  let todo: Candidate[] = queue
  if (todo.length === 0) {
    // 当天没有新增/变更，纯靠第二梯队回填，避免配额作废
    if (!secondary.length) {
      console.log('[seo] 全部页面均为最新，今天无需推送。')
      saveState(state)
      return
    }
    console.log(`[seo] 无新增或变更页面，改用剩余配额回填 ${secondary.length} 条到期页面。`)
    todo = secondary
  } else if (secondary.length) {
    // 新增/变更占完配额后再回填，避免长尾页面挤掉当天的真实变更
    const room = Number.isFinite(cap) ? Math.max(0, cap - todo.length) : secondary.length
    const backfill = secondary.slice(0, room)
    if (backfill.length) {
      console.log(`[seo] 用剩余配额回填 ${backfill.length} 条到期页面。`)
      todo = [...todo, ...backfill]
    }
  }

  if (Number.isFinite(cap)) todo = todo.slice(0, cap)

  // 首批保守发送，避免「提交数 > 剩余配额」被整批拒绝；
  // 拿到 remain 后下一轮就能按真实剩余额度扩容。
  const probeSize = Number(process.env.SEO_PROBE_SIZE) || DEFAULT_PROBE_SIZE
  let remain = Math.min(cap, probeSize)
  const accepted: Candidate[] = []
  for (let i = 0; i < todo.length && remain > 0;) {
    const batch = todo.slice(i, Math.min(i + remain, todo.length))
    const result = await pushBaidu(
      batch.map((c) => c.url),
      baiduToken,
    )
    if (!result.ok) break
    i += batch.length
    remain = result.remain ?? 0

    // 百度返回的是整批的成功数，不指明具体哪些成功。
    // 若成功数小于提交数，按「顺序处理」的约定只记录前 success 条，
    // 未能计入的旧记录保留，明天会被重新判定为待推送。
    const okCount = Math.min(result.success ?? batch.length, batch.length)
    accepted.push(...batch.slice(0, okCount))
    if (okCount < batch.length) {
      console.warn(`[seo] 本批只成功 ${okCount}/${batch.length} 条（配额或去重），其余留待下次。`)
    }
  }

  for (const candidate of accepted) {
    state.urls[candidate.url] = {
      // 记录推送当时的 lastmod，取 sitemap 中的值
      lastmod: entryByUrl.get(candidate.url)?.lastmod ?? 0,
      pushedAt: now,
    }
  }

  // 已经不在 sitemap 中的 URL（页面被删除或改了路径）不再保留，
  // 否则状态文件会随时间无限膨胀，并让「已推送」统计失真。
  for (const url of Object.keys(state.urls)) {
    if (!entryByUrl.has(url)) delete state.urls[url]
  }

  saveState(state)

  const ttlHint = `记录 ${Object.keys(state.urls).length}/${entries.length} 条`
  if (accepted.length === 0) {
    console.log(`[seo] 未成功推送任何 URL（${ttlHint}）。`)
    return
  }
  console.log(
    `[seo] 完成：成功推送 ${accepted.length} 条（${ttlHint}，重推间隔 ${retryDays} 天）。`,
  )
}

/**
 * dry-run 时按原因分组打印，便于人工核对筛选逻辑
 */
function printQueue(candidates: Candidate[], now: number, ttlMs: number): void {
  if (!candidates.length) {
    console.log('[seo] 没有需要推送的 URL。')
    return
  }

  let current = ''
  for (const candidate of candidates) {
    const label = `${REASON_LABEL[candidate.reason]} · ${labelOf(candidate.url)}`
    if (label !== current) {
      current = label
      console.log(`\n# ${label}`)
    }
    const age = candidate.lastmod
      ? `lastmod ${new Date(candidate.lastmod).toISOString().slice(0, 10)}`
      : `无 lastmod，重推间隔 ${Math.round(ttlMs / 86400000)} 天`
    console.log(`${candidate.url}  (${age}, 当前 ${new Date(now).toISOString().slice(0, 10)})`)
  }
}

await main()
