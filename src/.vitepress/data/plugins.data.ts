/* eslint-disable ts/no-use-before-define */
/* eslint-disable no-console */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const local_path = path.resolve('src/.vitepress/data/_data/plugins.json')
// eslint-disable-next-line unused-imports/no-unused-vars
const remote_path
  = 'https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/plugins.json'

const LATEST_ZOTERO_BETA_VERSION = 10

declare const data: PluginInfo[]
export { data }

function mergeReleasesByXpiVersion(releases: ReleaseInfo[]): ReleaseInfo[] {
  const groupByXpiVersion = new Map<string, ReleaseInfo[]>()

  // 按xpiVersion分组
  for (const release of releases) {
    const key = release.xpiVersion
    if (!groupByXpiVersion.has(key)) {
      groupByXpiVersion.set(key, [])
    }
    groupByXpiVersion.get(key)!.push(release)
  }

  const result: ReleaseInfo[] = []
  for (const [_xpiVersion, group] of groupByXpiVersion.entries()) {
    const merged = group[0]

    if (group.length > 1) {
      const versions = group
        .map(r => Number.parseInt(r.targetZoteroVersion, 10))
        .filter(v => !Number.isNaN(v))
        .sort((a, b) => a - b)

      if (versions.length > 0) {
        merged.targetZoteroVersion = versions
        // 爬虫仓库提前写到了 v11，但部分插件的 strict_max_version 写的过大
        // 导致网站侧出现了 Zotero 11 的信息，容易造成误导
          .filter(v => v <= LATEST_ZOTERO_BETA_VERSION)
          .map(String)
          .join(',')
      }
    }

    result.push(merged)
  }

  return result
}

export default {
  async load() {
    let data: PluginInfo[]
    if (existsSync(local_path)) {
      data = JSON.parse(readFileSync(local_path).toString())
    }
    else {
      console.log('Local plugins.json not found, will fetch from remote')
      // data = (await fetch(remote_path)).json() as Promise<PluginInfo[]>
      data = []
    }

    return data.map((p) => {
      // 移除一些对网站侧无用的数据以减小 chunks
      delete p.star

      p.tags = [
        ...(fav.includes(p.repo) ? ['favorite'] : []),
        ...(fav4zh.includes(p.repo) ? ['favorite_zh'] : []),
        ...(fav4en.includes(p.repo) ? ['favorite_en'] : []),
        ...(![...fav, ...fav4zh, ...fav4en].includes(p.repo) && p.recommended) ? ['favorite_en'] : [],
        ...p.tags || [],
      ] as PluginInfo['tags']

      p.releases = mergeReleasesByXpiVersion(p.releases)
        .map((r) => {
          delete r.name
          delete r.description
          return r
        })

      return p
    })
  },
}

const fav = [
  'windingwind/zotero-pdf-translate',
  'windingwind/zotero-better-notes',
  'northword/zotero-format-metadata',
]

const fav4zh = [
  'l0o0/jasminum',
]

const fav4en = [
  '',
]

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

export interface PluginInfo extends PluginInfoBase {
  /**
   * 插件名称
   */
  name: string
  releases: ReleaseInfo[]
  description: string
  /**
   * @deprecated Please use stars instead.
   */
  star?: number
  stars: number
  watchers: number
  author: {
    name: string
    url: string
    avatar: string
  }
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
  xpiDownloadUrl: {
    github: string
    gitee?: string
    ghProxy: string
    jsdeliver?: string
    kgithub: string
  }
  releaseDate: string
  downloadCount: number
  assetId: number
  minZoteroVersion: string
  maxZoteroVersion: string

  name?: string
  description?: string
}

/**
 * 插件标签
 */
export type PluginTagType
  // 推荐列表
  = | 'favorite'
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
