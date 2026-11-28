import type { PageData } from 'vitepress'
import type { ContributorInfo } from '../data/contributors'
import type { GitCommit, GitContributor, GitPageData } from '../data/git-types'
import { execFileSync } from 'node:child_process'
import { globSync } from 'node:fs'
import { contributorInfos } from '../data/contributors'

/**
 * 兼容旧版 wiki 名单的字段名。
 *
 * CI 的 `git submodule update --remote` 可能拉到尚未包含字段重命名的 wiki 提交，
 * 此时名单里只有 `username` / `mapBy*Aliases`，读取 `github` / `alias` 会得到空值，
 * 头像与主页就全部退化为首字母占位。这里统一读出新旧两种写法，
 * wiki 侧字段重命名合并后可删去。
 */
interface LegacyContributorFields {
  username?: string
  mapByNameAliases?: string[]
  mapByEmailAliases?: string[]
}

/** 读 GitHub 用户名，兼容旧字段 `username` */
function readGithub(info: ContributorInfo | undefined): string | undefined {
  if (!info) return undefined
  return info.github || (info as unknown as LegacyContributorFields).username
}

/** 读名称别名，兼容旧字段 `mapByNameAliases` */
function readAlias(info: ContributorInfo): string[] | undefined {
  return info.alias ?? (info as unknown as LegacyContributorFields).mapByNameAliases
}

/** 读邮箱别名，兼容旧字段 `mapByEmailAliases` */
function readEmailAlias(info: ContributorInfo): string[] | undefined {
  return info.emailAlias ?? (info as unknown as LegacyContributorFields).mapByEmailAliases
}

/** wiki 子模块目录，相对于仓库根目录 */
const WIKI_DIR = 'src/wiki'
/** wiki 页面在 srcDir 下的路径前缀 */
const WIKI_PAGE_PREFIX = 'wiki/'
/** wiki 仓库地址，用于拼接提交与 issue 链接 */
const WIKI_REPO_URL = 'https://github.com/zotero-chinese/wiki'
/** 单页最多保留的更新日志条数 */
const MAX_CHANGELOG = 100

interface RawAuthor {
  name: string
  email: string
}

interface RawCommit {
  hash: string
  /** Unix 时间戳（毫秒） */
  time: number
  message: string
  author: RawAuthor
  coAuthors: RawAuthor[]
  /** 该提交改动的文件，`renamedFrom` 为重命名前的路径 */
  changes: { path: string; renamedFrom?: string }[]
}

/** CSL 样式详情页注入的 frontmatter，见 plugins/markdownTransform.ts */
interface StyleMetadata {
  author?: { name?: string }[]
  contributor?: { name?: string }[]
}

/**
 * 提交信息中的多人协作标记。
 *
 * @see https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors
 */
const RE_CO_AUTHOR = /^ *Co-authored-by: ?([^<]*)<([^>]*)> */gim
const RE_ISSUE = /#(\d+)/g
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * 把提交信息转成可直接渲染的 HTML。
 *
 * 提交信息来自他人仓库，先整体转义再插入链接，避免注入。
 */
function formatMessage(message: string, repoUrl: string): string {
  return message
    .replace(/[&<>"']/g, (ch) => ESCAPES[ch])
    .replace(RE_ISSUE, (matched, issue: string) => {
      return `<a href="${repoUrl}/issues/${issue}" target="_blank" rel="noreferrer">${matched}</a>`
    })
}

function parseCoAuthors(body: string): RawAuthor[] {
  return Array.from(body.matchAll(RE_CO_AUTHOR), ([, name, email]) => ({
    name: name.trim(),
    email: email.trim(),
  }))
}

/**
 * 一次 `git log` 读出全部提交。
 *
 * 相比逐文件 `git log --follow`（本站 98 个页面需要 3~4 秒），
 * 全量扫描并把重命名信息交给 `buildIndex()` 回溯只需约 0.2 秒，结果一致。
 */
function readCommits(): RawCommit[] {
  const stdout = execFileSync(
    'git',
    [
      'log',
      '-z',
      '--name-status',
      '-M',
      '--date=unix',
      '--format=%x1e%H%x1f%ad%x1f%an%x1f%ae%x1f%s%x1f%b',
    ],
    {
      cwd: WIKI_DIR,
      encoding: 'utf8',
      maxBuffer: 1 << 28,
      stdio: ['ignore', 'pipe', 'ignore'],
    },
  )

  const commits: RawCommit[] = []

  // `\x1e` 分隔提交，`\0` 分隔字段与文件状态，避免提交信息中出现换行或空格时解析错位
  for (const block of stdout.split('\x1e')) {
    if (!block) continue

    const tokens = block.split('\0')
    const [hash, time, author = '', email = '', message = '', body = ''] = tokens[0].split('\x1f')
    if (!hash) continue

    const changes: RawCommit['changes'] = []
    for (let i = 1; i < tokens.length; i++) {
      // 首个状态前会带一个换行
      const status = tokens[i].replace(/^\n+/, '').trim()
      if (!status) continue

      if (status.startsWith('R') || status.startsWith('C')) {
        const from = tokens[++i]
        const to = tokens[++i]
        if (to) changes.push({ path: to, renamedFrom: status.startsWith('R') ? from : undefined })
      } else {
        const path = tokens[++i]
        if (path) changes.push({ path })
      }
    }

    commits.push({
      hash,
      time: Number.parseInt(time, 10) * 1000,
      message,
      author: { name: author, email },
      coAuthors: parseCoAuthors(body),
      changes,
    })
  }

  return commits
}

let indexCache: Map<string, RawCommit[]> | undefined

/**
 * 建立「页面 → 提交列表」索引。
 *
 * 从新到旧遍历提交，把每个文件挂到它当前所属的页面上；
 * 遇到重命名就把归属还给旧路径，于是改名前的历史也计入该页。
 */
function buildIndex(): Map<string, RawCommit[]> {
  if (indexCache) return indexCache

  indexCache = new Map()

  let commits: RawCommit[]
  try {
    commits = readCommits()
  } catch (error) {
    console.warn(`[git] 读取 ${WIKI_DIR} 的提交记录失败，将跳过页面 Git 信息：${error}`)
    return indexCache
  }

  const pages = globSync(`${WIKI_DIR}/**/*.md`).map((file) =>
    file.slice(WIKI_DIR.length + 1).replaceAll('\\', '/'),
  )

  // 当前路径 → 页面源路径
  const owner = new Map(pages.map((page) => [page, page]))
  for (const page of pages) indexCache.set(page, [])

  for (const commit of commits) {
    for (const { path } of commit.changes) {
      const page = owner.get(path)
      if (page) indexCache.get(page)!.push(commit)
    }

    // 重命名发生在此提交，往前追溯时该文件用的是旧路径
    for (const { path, renamedFrom } of commit.changes) {
      if (!renamedFrom) continue
      const page = owner.get(path)
      if (!page) continue
      owner.delete(path)
      owner.set(renamedFrom, page)
    }
  }

  return indexCache
}

function isBot({ name, email }: RawAuthor): boolean {
  return /\[bot\]/i.test(name) || /\[bot\]/i.test(email)
}

/** 从 GitHub noreply 邮箱中取出用户名 */
function noreplyUsername(email: string): string | undefined {
  const suffix = '@users.noreply.github.com'
  if (!email.endsWith(suffix)) return undefined
  return email.slice(0, -suffix.length).split('+')[1]
}

function findContributorInfo(
  name: string,
  githubFromEmail: string | undefined,
  email: string | undefined,
): ContributorInfo | undefined {
  const exact = contributorInfos.find((info) => {
    const github = readGithub(info)
    const alias = readAlias(info) ?? []
    if (info.name === name || github === name) return true
    if (alias.includes(name)) return true
    if (
      githubFromEmail &&
      (info.name === githubFromEmail ||
        github === githubFromEmail ||
        alias.includes(githubFromEmail))
    ) {
      return true
    }
    if (email && readEmailAlias(info)?.includes(email)) return true
    return false
  })
  if (exact) return exact

  // 宽松匹配：Git 提交里的署名与名单写法常有差异（如 `Zeping Lee` 与 `zepinglee`）
  const target = normalizeName(name)
  const loose = contributorInfos.find((info) => {
    return [info.name, readGithub(info), ...(readAlias(info) ?? [])].some(
      (candidate) => normalizeName(candidate) === target,
    )
  })
  if (loose) return loose

  if (!githubFromEmail) return undefined
  const targetGithub = normalizeName(githubFromEmail)
  return contributorInfos.find((info) => normalizeName(readGithub(info)) === targetGithub)
}

/**
 * 去掉大小写、空格与常见分隔符，用于宽松比较姓名。
 *
 * 传入值可能缺失（子模块数据版本与预期不一致时），此时返回空串。
 */
function normalizeName(name: string | undefined): string {
  return (name ?? '').toLowerCase().replace(/[\s._-]+/g, '')
}

/** 把 Git 提交中的身份映射为页面上的贡献者 */
function resolveContributor(author: RawAuthor): GitContributor {
  const noreply = noreplyUsername(author.email)
  const info = findContributorInfo(author.name, noreply, author.email)
  const github = readGithub(info) || noreply

  return {
    name: info?.name || noreply || author.name,
    avatar: info?.avatar || (github ? `https://github.com/${github}.png` : undefined),
    url: info?.links?.[0] || (github ? `https://github.com/${github}` : undefined),
  }
}
const contributorCache = new Map<string, GitContributor>()

function lookupContributor(author: RawAuthor): GitContributor {
  const key = `${author.name}\0${author.email}`
  let contributor = contributorCache.get(key)
  if (!contributor) {
    contributor = resolveContributor(author)
    contributorCache.set(key, contributor)
  }
  return contributor
}

function resolvePageGit(commits: RawCommit[]): GitPageData {
  const counts = new Map<string, number>()
  const people = new Map<string, GitContributor>()

  for (const commit of commits) {
    for (const author of [commit.author, ...commit.coAuthors]) {
      if (isBot(author)) continue
      const contributor = lookupContributor(author)
      if (!people.has(contributor.name)) people.set(contributor.name, contributor)
      counts.set(contributor.name, (counts.get(contributor.name) ?? 0) + 1)
    }
  }

  const contributors = [...people.values()].sort(
    (a, b) => (counts.get(b.name) ?? 0) - (counts.get(a.name) ?? 0),
  )

  const changelog = commits.slice(0, MAX_CHANGELOG).map<GitCommit>((commit) => {
    const coAuthors = commit.coAuthors.filter((author) => !isBot(author)).map(lookupContributor)
    return {
      hash: commit.hash,
      time: commit.time,
      message: formatMessage(commit.message, WIKI_REPO_URL),
      author: lookupContributor(commit.author),
      coAuthors: coAuthors.length ? coAuthors : undefined,
      commitUrl: `${WIKI_REPO_URL}/commit/${commit.hash}`,
    }
  })

  return { contributors, changelog }
}

/** 样式详情页的贡献者来自 metadata.json 中的 author 与 contributor，没有提交记录 */
function resolveStyleContributors(style: StyleMetadata): GitContributor[] {
  const names = [...(style.author ?? []), ...(style.contributor ?? [])]
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name))

  const contributors = new Map<string, GitContributor>()
  for (const name of names) {
    const info = findContributorInfo(name, undefined, undefined)
    const github = readGithub(info)
    const contributor: GitContributor = {
      name: info?.name || name,
      avatar: info?.avatar || (github ? `https://github.com/${github}.png` : undefined),
      url: info?.links?.[0] || (github ? `https://github.com/${github}` : undefined),
    }
    if (!contributors.has(contributor.name)) contributors.set(contributor.name, contributor)
  }

  return [...contributors.values()]
}

/**
 * 把 Git 信息写入页面数据，供客户端 `useData().page.git` 直接读取。
 *
 * 只在两类页面生效：wiki 子模块的文档页，以及带 `styleData` 的 CSL 样式详情页。
 */
export function attachGitInfo(page: PageData): void {
  const style = page.frontmatter?.styleData as StyleMetadata | undefined
  if (style) {
    const contributors = resolveStyleContributors(style)
    if (contributors.length) page.git = { contributors }
    return
  }

  if (!page.filePath?.startsWith(WIKI_PAGE_PREFIX)) return

  const commits = buildIndex().get(page.filePath.slice(WIKI_PAGE_PREFIX.length))
  if (!commits?.length) return

  page.git = resolvePageGit(commits)
}
