import type {
  HeadConfig,
  PageData,
  TransformContext,
  TransformPageContext,
  UserConfig,
} from 'vitepress'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { attachGitInfo } from '../plugins/git'
import { getDefaultTitle, getTextSummary } from '../utils/markdown'

const siteUrl = 'https://zotero-chinese.com'

/**
 * 站点名称，用于拼接页面标题
 */
const siteName = 'Zotero 中文社区'

/**
 * 生成页面 description 的最大字符数
 *
 * 百度快照摘要通常展示 78 个汉字以内，超出部分会被截断。
 */
const MAX_DESCRIPTION_LENGTH = 150

/**
 * 站点级兜底 description（仅在页面无法生成专属描述时使用）
 */
const fallbackDescription =
  'Zotero 中文社区提供 Zotero 中文教程、插件下载、中文 CSL 样式与转换器，帮助中文用户快速上手 Zotero 文献管理软件。'

/** CSL 样式详情页注入的 frontmatter 结构（见 plugins/markdownTransform.ts） */
interface StyleFrontmatter {
  title?: string
  dir?: string
  style_class?: string
  field?: string
  summary?: string
  publisher?: string
  contributor?: { name: string }[]
  author?: { name: string }[]
}

/**
 * 从 Markdown 源码正文中提取第一段有意义的文字，作为页面描述。
 *
 * 会跳过 frontmatter、代码块、HTML 注释、提示块标记、标题与图片，
 * 取到第一个正文段落即返回。
 */
function extractDescriptionFromSource(source: string): string {
  const body = source
    // 去除 frontmatter
    .replace(/^---[\s\S]*?\n---\s*\n/, '')
    // 去除 HTML 注释
    .replace(/<!--[\s\S]*?-->/g, '')
    // 去除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 去除 vitePress 提示块标记
    .replace(/^:::.*$/gm, '')

  for (const rawBlock of body.split(/\n\s*\n/)) {
    const block = rawBlock.trim()
    if (!block) continue
    // 跳过标题、图片、列表行首、表格、纯组件调用
    if (/^#{1,6}\s/.test(block)) continue
    if (block.startsWith('![')) continue
    if (/^<[A-Za-z]/.test(block)) continue
    if (/^[|>:-]/.test(block)) continue
    if (/^\s*[-*+]\s/.test(block)) continue
    if (/^\d+\.\s/.test(block)) continue

    const text = getTextSummary(block, MAX_DESCRIPTION_LENGTH)
    // 过短的段落（如「本文档由…」）不足以作为描述
    if (text && text.length >= 15) return text
  }

  return ''
}

/**
 * 读取页面所属的 Markdown 源文件
 */
function readSource(relativePath: string): string | undefined {
  const file = path.resolve('src', relativePath)
  if (!existsSync(file)) return undefined
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return undefined
  }
}

/**
 * 为 CSL 样式详情页生成标题与描述
 *
 * 这类页面的正文由 `styles` 子模块的脚本自动生成，不含 frontmatter title，
 * 因此需要从构建期注入的 `styleData` 中取名称。
 */
function cslPageMeta(pageData: PageData): { title?: string; description?: string } | undefined {
  // 注意：transformPageData 收到的 relativePath 已经应用过 rewrites，
  // CSL 样式详情页此时形如 `styles/IEEE（双语）/index.md`。
  // 因此以构建期注入的 `styleData` 字段作为判定依据，比路径前缀更可靠。
  const style = pageData.frontmatter.styleData as StyleFrontmatter | null | undefined
  if (!style) return undefined

  const name = style.title || (style.dir ?? '')
  if (!name) return undefined

  const bits: string[] = []
  // 把样式属性（引注格式、学科）写入描述，覆盖「GB/T 7714」「参考文献格式」等长尾搜索
  if (style.style_class) bits.push(`引注格式：${style.style_class}`)
  if (style.field) bits.push(`学科：${style.field}`)
  if (style.publisher) bits.push(`出版机构：${style.publisher}`)
  const contributors = [...(style.author ?? []), ...(style.contributor ?? [])]
    .map((v) => v.name)
    .filter(Boolean)
  if (contributors.length) bits.push(`贡献者：${contributors.join('、')}`)

  const description = [
    `「${name}」是 Zotero 中文社区维护的中文 CSL 样式，可用于 Zotero 与 Word 生成符合中文排版习惯的引注与参考文献表。`,
    bits.join('；'),
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, MAX_DESCRIPTION_LENGTH)

  return {
    title: `${name} 参考文献格式`,
    description,
  }
}

/**
 * 为转换器详情页生成标题与描述
 *
 * 这类页面由 `dynamic routes`（[translatorID].paths.ts）生成，
 * 实际数据位于 `pageData.params.translator`。
 */
function translatorPageMeta(
  pageData: PageData,
): { title?: string; description?: string } | undefined {
  if (!pageData.filePath.includes('[translatorID]')) return undefined

  // 转换器元数据位于 `params.translator.header` 下
  const translator = pageData.params?.translator as
    | {
        header?: { label?: string; creator?: string; target?: string; translatorType?: number }
        testCases?: { type?: string; items?: unknown }[]
      }
    | undefined
  const header = translator?.header
  if (!header?.label) return undefined

  const name = header.label
  const targets = (header.target ?? '')
    .split(/,\s*/)
    .map((v) => v.trim())
    .filter(Boolean)
    // 正则形式的匹配规则对用户无意义，改写成可读提示
    .map((v) => v.replace(/^\^?https\?:\/\//, '').replace(/\(.*$/, ''))

  const description = [
    `「${name}」是 Zotero 中文社区维护的中文网页转换器，可在 Zotero 中一键抓取该网站上的文献条目信息。`,
    targets.length ? `适用网站：${targets.slice(0, 3).join('、')}。` : '',
    header.creator ? `维护者：${header.creator}。` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, MAX_DESCRIPTION_LENGTH)

  return {
    title: `${name} 网页转换器`,
    description,
  }
}

/**
 * 为 wiki 文档页生成描述
 *
 * wiki 子模块的文档绝大多数没有写 `description`，
 * 这里从正文首段自动提取，避免全站共用一条描述。
 */
function contentPageMeta(pageData: PageData): { description?: string } | undefined {
  // filePath 为 rewrites 之前的原始路径（如 `wiki/user-guide/quick-start.md`），
  // 而 relativePath 是已经重写后的路由路径（如 `user-guide/quick-start.md`），
  // 判断文档归属与读取源文件都必须用 filePath。
  if (!pageData.filePath) return undefined
  if (!/^(wiki|blog)\//.test(pageData.filePath)) return undefined
  if (pageData.frontmatter.description) return undefined

  const source = readSource(pageData.filePath)
  if (!source) return undefined

  const extracted = extractDescriptionFromSource(source)
  if (!extracted) return undefined

  const title = pageData.frontmatter.title || getDefaultTitle(source)
  return {
    description: title ? `${title}：${extracted}`.slice(0, MAX_DESCRIPTION_LENGTH) : extracted,
  }
}

/**
 * 页面级 transformPageData
 *
 * 目标：让每个页面拥有唯一的 title 与 description。
 * VitePress 默认会把缺失 description 的页面回填为站点级 description
 * （当前为「Zotero 中文维护小组」），这会导致全站数百个页面描述完全一致，
 * 搜索引擎无法据此判断页面主题。
 */
export const transformPageData: UserConfig['transformPageData'] = (
  pageData: PageData,
  _ctx: TransformPageContext,
) => {
  // 挂载 Git 信息（贡献者与更新日志），供页面底部的 GitInfo 组件渲染
  attachGitInfo(pageData)

  // 404 页不参与索引
  if (pageData.relativePath === '404.md') {
    pageData.frontmatter.head = [
      ...(pageData.frontmatter.head ?? []),
      ['meta', { name: 'robots', content: 'noindex, follow' }],
    ]
    return
  }

  const csl = cslPageMeta(pageData)
  const translator = translatorPageMeta(pageData)
  const content = contentPageMeta(pageData)

  const title = csl?.title ?? translator?.title
  if (title) pageData.title = title

  // wiki 页面的标题补上「Zotero」上下文，提升与「zotero xxx」类查询的匹配度
  if (
    pageData.filePath.startsWith('wiki/') &&
    typeof pageData.title === 'string' &&
    pageData.title !== siteName &&
    !/zotero/i.test(pageData.title)
  ) {
    pageData.title = `Zotero ${pageData.title}`
  }

  // 描述优先级：显式 frontmatter > 页面类型推导 > 落地页模板 > 标题兜底
  // 注意：pageData.description 已被 VitePress 回填为站点级描述，
  // 因此不能直接判断它是否为空，必须以 frontmatter 是否显式书写为准。
  const landing = landingPageDescription(pageData)
  const description =
    (pageData.frontmatter.description as string | undefined) ||
    csl?.description ||
    translator?.description ||
    content?.description ||
    landing

  const finalDescription =
    description ||
    // 最后兜底：正文过短（如仅有提示块）的页面，用标题 + 站点定位组装，
    // 好过与其他数百个页面共用同一条站点口号。
    (() => {
      const pageTitle = pageData.title || (pageData.frontmatter.title as string | undefined)
      if (!pageTitle || pageTitle === siteName) return undefined
      return `${pageTitle} —— ${fallbackDescription}`.slice(0, MAX_DESCRIPTION_LENGTH)
    })()

  if (finalDescription) {
    pageData.description = finalDescription
    pageData.frontmatter.description = finalDescription
  }
}

/**
 * 主要落地页的专属描述
 *
 * 这些页面是「zotero 中文」「zotero 插件」「zotero 参考文献格式」等高意图
 * 关键词的着陆页，描述需要明确点出页面能提供什么，而不是复述站点口号。
 */
const LANDING_DESCRIPTIONS: Record<string, string> = {
  'index.md':
    'Zotero 中文社区官方站点：提供 Zotero 中文教程（百科全书）、Zotero 插件商店、中文 CSL 样式（含 GB/T 7714 参考文献格式）与中文网页转换器，帮助中文用户快速上手 Zotero 文献管理软件。',
  'plugins/index.md':
    'Zotero 插件商店收录了社区维护的中文插件，支持按 Zotero 版本、功能标签与作者筛选排序，并为每个插件提供国内镜像下载地址，解决 GitHub 下载缓慢的问题。',
  'en/plugins/index.md':
    'The Zotero Plugin Store lists community-maintained plugins with version and tag filters, plus download mirrors for users in mainland China.',
  'styles/index.md':
    '中文 CSL 样式库收录了 300 余个符合中文排版习惯的参考文献格式，涵盖 GB/T 7714（顺序编码制与著者-出版年制）以及各大高校学位论文格式，可在 Zotero 与 Word 中直接使用。',
  'en/styles/index.md':
    'A collection of Chinese CSL styles covering GB/T 7714 and Chinese university thesis formats, usable in Zotero and Word.',
  'translators/index.md':
    'Zotero 中文转换器收录了社区维护的网页抓取规则，支持知网、万方、维普、百度学术等中文文献站点，可在 Zotero 中一键抓取中文文献的条目信息。',
  'en/translators/index.md':
    'Zotero translators for Chinese websites, covering CNKI, Wanfang, VIP and Baidu Scholar, maintained by the Chinese community.',
  'blog/index.md': 'Zotero 中文社区的博客，发布版本更新说明、插件与样式动态以及社区活动记录。',
  'about.md':
    '了解 Zotero 中文社区：一个由志愿者组成的中文维护小组，负责维护 Zotero 中文文档、插件商店、中文 CSL 样式与转换器，与 Zotero 官方机构无从属关系。',
  'plugins/charts.md':
    'Zotero 插件排行榜：按 GitHub Star 数与下载量对社区插件排序，帮助用户快速发现最受欢迎的 Zotero 插件。',
  'plugins/deprecated.md':
    '已停止维护的 Zotero 插件清单，标明其最后的兼容版本与替代方案，避免安装后无法使用。',
  'plugins/value-added.md':
    'Zotero 付费插件与增值服务清单，记录各插件的收费方式与功能范围，供用户按需选择。',
  'blog/blog-repo/index.md': 'Zotero 中文社区博客文章归档，包含版本更新说明与社区动态。',
  'public/readme.md': 'Zotero 中文社区站点仓库说明。',
  'user-guide/index.md':
    'Zotero 百科全书：涵盖安装、添加与编辑条目、管理文库、创建参考文献、同步与备份、插件配置等 Zotero 中文使用教程，并汇总了最常见的问题与解决办法。',
}

/**
 * 取用落地页专属描述
 *
 * 传入的仍是原始源文件路径，需同时兼容中英文两种目录布局。
 */
function landingPageDescription(pageData: PageData): string | undefined {
  const key = pageData.filePath
  if (key && LANDING_DESCRIPTIONS[key]) return LANDING_DESCRIPTIONS[key]
  return undefined
}

/**
 * 判断是否为应被搜索引擎收录的页面
 *
 * 传入的是 rewrites 之前的原始路径（`pageData.filePath`）。
 * 仓库自述、行为准则、贡献者名单等页面在站点导航中不可达，
 * 收录它们只会在搜索结果里制造噪音。
 */
function isIndexable(filePath: string): boolean {
  if (!filePath) return false // 虚拟页面（如 404）
  if (filePath === '404.md') return false
  if (/^(AGENTS|README|code_of_conduct|contributors?)\.md$/i.test(filePath)) return false
  if (/\.vitepress\//.test(filePath)) return false
  return true
}

/**
 * 由页面路径推导站点内 URL
 *
 * 结果始终以 `/` 开头；目录形式页面保留尾部斜杠。
 */
function resolveRoutePath(page: string): string {
  const isIndex = /(^|\/)index\.md$/.test(page)
  // 去掉 `index.md` 与 `.md` 后缀，并归一化斜杠；先去掉首尾斜杠再统一拼接，
  // 否则 `plugins/index.md` 会得到 `plugins/` 而被再次追加斜杠，产生 `//`。
  const slug = page
    .replace(/(^|\/)index\.md$/, '')
    .replace(/\.md$/, '')
    .replace(/\/{2,}/g, '/')
    .replace(/^\//, '')
    .replace(/\/$/, '')

  if (!slug) return '/'
  return isIndex ? `/${slug}/` : `/${slug}`
}

/**
 * 页面级 transformHead
 *
 * 目标：
 * 1. 为每页补 `canonical`，收敛 github.io / netlify 预览站带来的重复内容；
 * 2. 把 `og:url`、`og:image` 等相对地址改成绝对地址（部分平台会忽略相对值）；
 * 3. 修正 `keywords` 语义（VitePress 配置中误用 property，应为 name）；
 * 4. 注入 JSON-LD 结构化数据，争取富摘要与 AI 搜索引用。
 */
export const transformHead: UserConfig['transformHead'] = async (ctx: TransformContext) => {
  const { page, siteData, pageData, title, description } = ctx

  // 注意：`page` 是 rewrites 之后的路径；`pageData.filePath` 才是原始源文件路径。
  // 这里按 VitePress 的输出约定推导 URL：
  //   `index.md`        -> `/`
  //   `plugins/index.md`-> `/plugins/`（输出为 plugins/index.html）
  //   `about.md`        -> `/about`（cleanUrls）
  const canonical = `${siteUrl}${resolveRoutePath(page)}`

  const head: HeadConfig[] = []

  if (isIndexable(pageData.filePath)) {
    head.push(['link', { rel: 'canonical', href: canonical }])
  }

  head.push(['meta', { property: 'og:url', content: canonical }])
  head.push(['meta', { property: 'og:image', content: `${siteUrl}/logo.png` }])
  head.push(['meta', { property: 'og:site_name', content: siteName }])
  head.push(['meta', { property: 'og:title', content: title }])
  head.push(['meta', { property: 'og:description', content: description }])
  head.push([
    'meta',
    { property: 'og:locale', content: siteData.lang === 'en-US' ? 'en_US' : 'zh_CN' },
  ])
  // 摘要与图片：百度、必应、Twitter/X 等平台的通用卡片
  head.push(['meta', { name: 'twitter:card', content: 'summary' }])
  head.push(['meta', { name: 'twitter:title', content: title }])
  head.push(['meta', { name: 'twitter:description', content: description }])
  head.push(['meta', { name: 'twitter:image', content: `${siteUrl}/logo.png` }])

  // 站点验证：值由构建环境提供（GitHub Actions 中来自 `${{ vars.* }}`）。
  // 三者互相独立，任一缺失都不应影响其余 head 标签的输出。
  const baiduVerification = process.env.BAIDU_SITE_VERIFICATION
  if (baiduVerification) {
    head.push(['meta', { name: 'baidu-site-verification', content: baiduVerification }])
  }
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION
  if (googleVerification) {
    head.push(['meta', { name: 'google-site-verification', content: googleVerification }])
  }
  const bingVerification = process.env.BING_SITE_VERIFICATION
  if (bingVerification) {
    head.push(['meta', { name: 'msvalidate.01', content: bingVerification }])
  }

  // 中英文页面互相声明，帮助搜索引擎识别语言版本而非重复内容。
  // 注意 `en/` 前缀只对确实存在的英文页面生效。
  const routePath = resolveRoutePath(page)
  const isEn = page.startsWith('en/')
  const counterpart = isEn ? routePath.replace(/^\/en(?=\/|$)/, '') || '/' : `/en${routePath}`
  head.push([
    'link',
    {
      rel: 'alternate',
      hreflang: isEn ? 'zh-CN' : 'en',
      href: `${siteUrl}${counterpart}`,
    },
  ])
  head.push(['link', { rel: 'alternate', hreflang: 'x-default', href: canonical }])

  head.push(...buildStructuredData({ canonical, title, description, pageData, siteData }))

  return head

  interface StructuredDataInput {
    canonical: string
    title: string
    description: string
    pageData: PageData
    siteData: TransformContext['siteData']
  }

  /**
   * 生成 JSON-LD 结构化数据
   *
   * 首页输出 WebSite + Organization（带 SearchAction，便于搜索引擎识别站内搜索），
   * 内容页输出 TechArticle / Article + BreadcrumbList。
   */
  function buildStructuredData(input: StructuredDataInput): HeadConfig[] {
    const { canonical, title, description, pageData, siteData } = input
    // 首页：文件路径为 `index.md`
    const isHome = pageData.filePath === 'index.md'

    const organization = {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      sameAs: ['https://github.com/zotero-chinese', 'https://gitee.com/zotero-chinese'],
    }

    const graph: Record<string, unknown>[] = []

    if (isHome) {
      graph.push({
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description,
        inLanguage: siteData.lang,
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/user-guide/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      })
      graph.push(organization)
    } else if (isIndexable(pageData.filePath)) {
      graph.push(organization)

      const isArticle = /^(wiki|blog)\//.test(pageData.filePath)
      const lastUpdated = pageData.lastUpdated
      graph.push({
        '@type': isArticle ? 'TechArticle' : 'WebPage',
        '@id': `${canonical}#page`,
        url: canonical,
        name: title,
        description,
        inLanguage: siteData.lang,
        isPartOf: { '@id': `${siteUrl}/#website` },
        ...(isArticle
          ? {
              headline: title,
              ...(lastUpdated
                ? {
                    dateModified: new Date(lastUpdated).toISOString(),
                  }
                : {}),
            }
          : {}),
      })

      // 面包屑：用 URL 分段构造，帮助搜索引擎理解站点层级
      const segments = canonical.replace(siteUrl, '').split('/').filter(Boolean)
      if (segments.length > 0) {
        const itemListElement = [{ '@type': 'ListItem', position: 1, name: '首页', item: siteUrl }]
        let acc = ''
        segments.forEach((segment, index) => {
          acc += `/${segment}`
          itemListElement.push({
            '@type': 'ListItem',
            position: index + 2,
            name: index === segments.length - 1 ? title : decodeURIComponent(segment),
            item: `${siteUrl}${acc}`,
          })
        })
        graph.push({
          '@type': 'BreadcrumbList',
          '@id': `${canonical}#breadcrumb`,
          itemListElement,
        })
      }
    }

    if (graph.length === 0) return []

    return [
      [
        'script',
        { type: 'application/ld+json' },
        JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      ],
    ]
  }
}
