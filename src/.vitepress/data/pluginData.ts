/* eslint-disable no-console */
/**
 * 插件数据共享模块。
 *
 * 索引页只使用精简后的 `PluginInfo`（避免把全部版本与下载镜像打进索引页 chunk），
 * 完整数据由 dataAssets 插件生成到 `src/public/plugin-data/<repo>.json`，
 * 供下载弹窗按需 fetch。
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { LATEST_ZOTERO_BETA_VERSION } from './constant'

export const pluginsLocalPath = path.resolve('src/.vitepress/data/_data/plugins.json')
// eslint-disable-next-line unused-imports/no-unused-vars
export const pluginsRemotePath =
  'https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/plugins.json'

export interface PluginInfoBase {
  /**
   * 插件仓库
   *
   * 例如：northword/zotero-format-metadata
   *
   * 注意前后均无 `/`
   */
  repo: string
  /**
   * 插件的发布地址信息
   */
  releases: ReleaseInfoBase[]

  tags: PluginTagType[]
  recommended: boolean
}

export interface ReleaseInfoBase {
  /**
   * 当前发布版对应的 Zotero 版本
   */
  targetZoteroVersion: string
  /**
   * 当前发布版对应的下载通道
   *
   * `latest`：最新正式发布；
   * `pre`：最新预发布；
   * `string`：发布对应的 `git.tag_name`；
   * 注意 `git.tag_name` 有的有 `v` 而有的没有，可以通过发布链接来判断
   * 程序执行后，`tagName` 将替换为实际的 `git.tag_name`
   */
  tagName: 'latest' | 'pre' | string
}

export interface PluginAuthor {
  name: string
  url: string
  avatar: string
}

/** 索引页使用的精简插件信息 */
export interface PluginInfo extends PluginInfoBase {
  /**
   * 插件名称
   */
  name: string
  releases: ReleaseInfoSlim[]
  /**
   * 插件最新发布时间（ISO 8601），取自 releases 中最新的 releaseDate；
   * 无 release 时为空字符串
   */
  lastUpdated: string
  description: string
  stars: number
  author: PluginAuthor
}

/** 索引页使用的精简发布信息（仅保留筛选与排序所需字段） */
export interface ReleaseInfoSlim extends ReleaseInfoBase {
  releaseDate: string
}

/** 下载弹窗使用的完整插件信息（来自静态 JSON） */
export interface PluginFullInfo extends PluginInfoBase {
  name: string
  releases: ReleaseInfo[]
  description: string
  stars: number
  author: PluginAuthor
}

export interface ReleaseInfo extends ReleaseInfoBase {
  /**
   * 插件 ID，自 XPI 中提取
   */
  id: string
  /**
   * 插件版本，自 XPI 中提取
   */
  xpiVersion: string
  /**
   * 各镜像的下载地址（权威数据）。
   *
   * 注意：`github` 键的值不一定是 GitHub 链接（如部分插件为 Gitee 直链），
   * 因此必须原样保留，不能按固定格式推导。
   */
  xpiDownloadUrl?: Record<string, string>
  /**
   * xpi 文件名，仅当 `xpiDownloadUrl` 缺失时用于兜底推导 GitHub 系列链接
   */
  xpiFileName?: string
  releaseDate: string
  minZoteroVersion: string
  maxZoteroVersion: string

  name?: string
  description?: string
}

/**
 * 插件标签
 */
export type PluginTagType =
  // 推荐列表
  | 'favorite'
  // 条目元数据维护
  | 'metadata'
  // UI相关
  | 'interface'
  // 附件管理相关
  | 'attachment'
  // 笔记增强
  | 'notes'
  // 阅读器增强
  | 'reader'
  // 效率增强、生产力工具
  | 'productivity'
  // 可视化、文库分析
  | 'visualization'
  // 第三方软件集成
  | 'integration'
  // ai
  | 'ai'
  // 字处理软件集成或增强
  | 'writing'
  // 开发者工具
  | 'developer'
  // 其他
  | 'others'
  | 'utility'

interface RawPlugin {
  repo: string
  name: string
  description: string
  stars: number
  /**
   * @deprecated Please use stars instead.
   */
  star?: number
  // 部分数据源记录的插件没有 author 字段，转换时会使用仓库所有者作为兜底。
  author?: Partial<PluginAuthor> | null
  tags: PluginTagType[]
  recommended: boolean
  releases: Array<RawRelease>
}

interface RawRelease {
  targetZoteroVersion: string
  tagName: string
  xpiDownloadUrl?: Record<string, string>
  releaseDate: string
  id: string
  xpiVersion: string
  name?: string
  description?: string
  minZoteroVersion: string
  maxZoteroVersion: string
}

const fav = [
  'windingwind/zotero-pdf-translate',
  'windingwind/zotero-better-notes',
  'northword/zotero-format-metadata',
]

const fav4zh = ['l0o0/jasminum']

const fav4en = ['']

/** 读取本地原始插件数据（与 fetch-data 脚本产物一致） */
export function readRawPlugins(): RawPlugin[] {
  if (!existsSync(pluginsLocalPath)) {
    console.log('Local plugins.json not found, will use empty data')
    return []
  }
  return JSON.parse(readFileSync(pluginsLocalPath).toString()) as RawPlugin[]
}

/**
 * 对原始数据做统一转换：
 * - 移除网站侧无用的 `star` 字段
 * - 增强 tags（favorite 标记）
 * - 按 xpiVersion 合并 releases，并按发布时间降序排序
 * - 删除 release 的 name/description
 * - 各镜像下载地址原样保留（可能为 Gitee 直链等非 GitHub 格式），
 *   同时提取 xpi 文件名作为下载链接缺失时的兜底
 */
export function transformPlugins(raw: RawPlugin[]): PluginFullInfo[] {
  return raw.map((p) => {
    const releases = mergeReleasesByXpiVersion(p.releases)
      .map((r) => {
        // 各镜像下载地址原样保留：`github` 键的值可能是 Gitee 直链等非 GitHub 链接，
        // 无法按固定格式推导，必须以数据为准；仅提取文件名作为无 URL 时的兑底
        const urls = r.xpiDownloadUrl
        const anyUrl = urls && Object.values(urls).find((u) => u)
        const xpiFileName = anyUrl ? anyUrl.split('/').pop()! : ''
        return {
          id: r.id,
          xpiVersion: r.xpiVersion,
          targetZoteroVersion: r.targetZoteroVersion,
          tagName: r.tagName,
          releaseDate: r.releaseDate,
          minZoteroVersion: r.minZoteroVersion,
          maxZoteroVersion: r.maxZoteroVersion,
          ...(urls && Object.keys(urls).length > 0 ? { xpiDownloadUrl: urls } : {}),
          ...(xpiFileName ? { xpiFileName } : {}),
        } as ReleaseInfo
      })
      // 数据源不保证按发布时间排序，这里统一按发布时间降序排列，
      // 保证 `releases[0]` 即最新版本（下载弹窗、lastUpdated 等也依赖此顺序）
      .sort((a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate))

    return {
      repo: p.repo,
      name: p.name,
      description: p.description,
      stars: p.stars,
      author: normalizeAuthor(p.author, p.repo),
      recommended: p.recommended,
      tags: [
        ...(fav.includes(p.repo) ? ['favorite'] : []),
        ...(fav4zh.includes(p.repo) ? ['favorite_zh'] : []),
        ...(fav4en.includes(p.repo) ? ['favorite_en'] : []),
        ...(![...fav, ...fav4zh, ...fav4en].includes(p.repo) && p.recommended
          ? ['favorite_en']
          : []),
        ...(p.tags || []),
      ] as PluginInfo['tags'],
      releases,
    }
  })
}

/**
 * 规范化插件作者信息。
 *
 * 插件数据由外部抓取器生成，部分插件（例如没有可读取仓库元数据的插件）可能没有
 * `author`。作者仍用于卡片展示、排序和筛选，因此使用仓库所有者作为可用的兜底值，
 * 避免单条异常数据导致整个插件商店崩溃。
 */
function normalizeAuthor(
  author: Partial<PluginAuthor> | null | undefined,
  repo: string,
): PluginAuthor {
  const owner = repo.split('/')[0]?.trim() || 'Unknown author'
  const fallback = {
    name: owner,
    url: owner === 'Unknown author' ? '' : `https://github.com/${owner}`,
    avatar: owner === 'Unknown author' ? '' : `https://github.com/${owner}.png?size=100`,
  }

  return {
    name: typeof author?.name === 'string' && author.name.trim() ? author.name : fallback.name,
    url: typeof author?.url === 'string' && author.url ? author.url : fallback.url,
    avatar: typeof author?.avatar === 'string' && author.avatar ? author.avatar : fallback.avatar,
  }
}

/** 提取索引页使用的精简数据 */
export function toPluginSummary(plugin: PluginFullInfo): PluginInfo {
  return {
    repo: plugin.repo,
    name: plugin.name,
    description: plugin.description,
    stars: plugin.stars,
    author: plugin.author,
    tags: plugin.tags,
    recommended: plugin.recommended,
    releases: plugin.releases.map((r) => ({
      targetZoteroVersion: r.targetZoteroVersion,
      tagName: r.tagName,
      releaseDate: r.releaseDate,
    })),
    lastUpdated: plugin.releases[0]?.releaseDate ?? '',
  }
}

function mergeReleasesByXpiVersion(releases: RawRelease[]): RawRelease[] {
  const groupByXpiVersion = new Map<string, RawRelease[]>()

  // 按xpiVersion分组
  for (const release of releases) {
    const key = release.xpiVersion
    if (!groupByXpiVersion.has(key)) {
      groupByXpiVersion.set(key, [])
    }
    groupByXpiVersion.get(key)!.push(release)
  }

  const result: RawRelease[] = []
  for (const [_xpiVersion, group] of groupByXpiVersion.entries()) {
    const merged = group[0]

    if (group.length > 1) {
      const versions = group
        .map((r) => Number.parseInt(r.targetZoteroVersion, 10))
        .filter((v) => !Number.isNaN(v))
        .sort((a, b) => a - b)

      if (versions.length > 0) {
        merged.targetZoteroVersion = versions
          // 爬虫仓库提前写到了 v11，但部分插件的 strict_max_version 写的过大
          // 导致网站侧出现了 Zotero 11 的信息，容易造成误导
          .filter((v) => v <= LATEST_ZOTERO_BETA_VERSION)
          .map(String)
          .join(',')
      }
    }

    result.push(merged)
  }

  return result
}
