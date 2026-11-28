import type { PageData } from 'vitepress'
import type { ContributorInfo } from '../data/contributors.ts'
// 本提交已把 changelogOmitted 简化为 number，GitChangelogOmitted 类型不再需要
import type { GitCommit, GitContributor, GitPageData } from '../data/git-types.ts'
import { execFileSync } from 'node:child_process'
import { globSync } from 'node:fs'
import { contributorInfos } from '../data/contributors.ts'

/** 一个带 Git 历史的子仓库 */
interface GitSource {
  /** 子模块目录，相对于仓库根目录 */
  dir: string
  /** 仓库地址，用于拼接提交、issue 与比较链接 */
  repoUrl: string
}

const WIKI_SOURCE: GitSource = {
  dir: 'src/wiki',
  repoUrl: 'https://github.com/zotero-chinese/wiki',
}

const STYLES_SOURCE: GitSource = {
  dir: 'src/styles/detail',
  repoUrl: 'https://github.com/zotero-chinese/styles',
}

/** wiki 页面在 srcDir 下的路径前缀 */
const WIKI_PAGE_PREFIX = 'wiki/'
/** 每页最多列出的「最近提交」条数，wiki 与样式页共用，另加一条最早的提交 */
const MAX_CHANGELOG = 20
/**
 * 一次改动超过该数量样式文件的提交，视为仓库级统一调整。
 *
 * 这类提交不代表对某个具体样式的贡献，因此在统计样式页贡献者时剔除
 * （更新日志里仍会照常出现，见 `selectCommits()`）。
 */
const MASS_EDIT_THRESHOLD = 20
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
  dir?: string
  file?: string
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
 * 一次 `git log` 读出某个子仓库的全部提交（可选限定路径）。
 *
 * 相比逐文件 `git log --follow`（本站 wiki 98 个页面需要 3~4 秒），
 * 全量扫描并把重命名信息交给 `buildHistory()` 回溯只需约 0.2 秒；
 * 样式仓库 357 个 CSL 文件同理（约 130 秒 → 约 1 秒）。
 */
function readCommits(source: GitSource, pathspec: string | undefined): RawCommit[] {
  const args = [
    // 缺省 core.quotepath 会把非 ASCII 路径转义成 `"\345\220..."`，
    // 与文件系统里读到的路径对不上
    '-c',
    'core.quotepath=false',
    'log',
    '-z',
    '--name-status',
    '-M',
    '--date=unix',
    '--format=%x1e%H%x1f%ad%x1f%an%x1f%ae%x1f%s%x1f%b',
  ]
  if (pathspec) args.push('--', pathspec)

  const stdout = execFileSync('git', args, {
    cwd: source.dir,
    encoding: 'utf8',
    maxBuffer: 1 << 28,
    stdio: ['ignore', 'pipe', 'ignore'],
  })

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

/**
 * 建立「文件 → 提交列表」索引。
 *
 * 从新到旧遍历提交，把每个文件挂到它当前所属的路径上；
 * 遇到重命名就把归属还给旧路径，于是改名前的历史也计入该文件。
 */
function buildHistory(
  source: GitSource,
  files: string[],
  pathspec: string | undefined,
): Map<string, RawCommit[]> {
  const index = new Map<string, RawCommit[]>(files.map((file) => [file, []]))

  let commits: RawCommit[]
  try {
    commits = readCommits(source, pathspec)
  } catch (error) {
    console.warn(`[git] 读取 ${source.dir} 的提交记录失败，将跳过其中的 Git 信息：${error}`)
    return index
  }

  // 当前路径 → 索引里的键（两者相同，重命名回溯时改的是这张表）
  const owner = new Map(files.map((file) => [file, file]))

  for (const commit of commits) {
    for (const { path } of commit.changes) {
      const file = owner.get(path)
      if (file) index.get(file)!.push(commit)
    }

    // 重命名发生在此提交，往前追溯时该文件用的是旧路径
    for (const { path, renamedFrom } of commit.changes) {
      if (!renamedFrom) continue
      const file = owner.get(path)
      if (!file) continue
      owner.delete(path)
      owner.set(renamedFrom, file)
    }
  }

  return index
}

/** 把 `globSync` 得到的绝对路径转成相对子仓库根的路径 */
function relative(file: string, source: GitSource): string {
  return file.slice(source.dir.length + 1).replaceAll('\\', '/')
}

let wikiHistory: Map<string, RawCommit[]> | undefined

function getWikiHistory(): Map<string, RawCommit[]> {
  if (wikiHistory) return wikiHistory
  const files = globSync(`${WIKI_SOURCE.dir}/**/*.md`).map((file) => relative(file, WIKI_SOURCE))
  wikiHistory = buildHistory(WIKI_SOURCE, files, undefined)
  return wikiHistory
}

let stylesHistory: Map<string, RawCommit[]> | undefined

function getStylesHistory(): Map<string, RawCommit[]> {
  if (stylesHistory) return stylesHistory
  const files = globSync(`${STYLES_SOURCE.dir}/src/**/*.csl`).map((file) =>
    relative(file, STYLES_SOURCE),
  )
  stylesHistory = buildHistory(STYLES_SOURCE, files, '*.csl')
  return stylesHistory
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
    const alias = info.alias ?? []
    if (info.name === name || info.github === name) return true
    if (alias.includes(name)) return true
    if (
      githubFromEmail &&
      (info.name === githubFromEmail ||
        info.github === githubFromEmail ||
        alias.includes(githubFromEmail))
    ) {
      return true
    }
    if (email && info.emailAlias?.includes(email)) return true
    return false
  })
  if (exact) return exact

  // 宽松匹配：Git 提交里的署名与名单写法常有差异（如 `Zeping Lee` 与 `zepinglee`）
  const target = normalizeName(name)
  const loose = contributorInfos.find((info) => {
    return [info.name, info.github, ...(info.alias ?? [])].some(
      (candidate) => normalizeName(candidate) === target,
    )
  })
  if (loose) return loose

  if (!githubFromEmail) return undefined
  const targetGithub = normalizeName(githubFromEmail)
  return contributorInfos.find((info) => normalizeName(info.github) === targetGithub)
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
  const github = info?.github || noreply

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

/** 把一条原始提交转成页面组件可直接渲染的结构 */
function toGitCommit(commit: RawCommit, repoUrl: string): GitCommit {
  const coAuthors = commit.coAuthors.filter((author) => !isBot(author)).map(lookupContributor)
  return {
    hash: commit.hash,
    time: commit.time,
    message: formatMessage(commit.message, repoUrl),
    author: lookupContributor(commit.author),
    coAuthors: coAuthors.length ? coAuthors : undefined,
    commitUrl: `${repoUrl}/commit/${commit.hash}`,
  }
}

/**
 * 取出「最近 limit 条 + 最初一条」。
 *
 * 最初的提交（样式创建、文档新建）单独保留：只保留最近若干条时它最先被挤掉，
 * 而它恰好是读者最想确认的「这个文件从哪来」。
 */
function selectCommits(commits: RawCommit[], limit: number) {
  const recent = commits.slice(0, limit)
  const initial = commits.at(-1)
  if (!initial || recent.includes(initial)) {
    return { recent, initial: undefined, omitted: [] as RawCommit[] }
  }
  return { recent, initial, omitted: commits.slice(limit, -1) }
}

/** 被省略的历史变更数量，供更新日志里补一行说明 */
function describeOmitted(omitted: RawCommit[]): number | undefined {
  return omitted.length || undefined
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

  const { recent, initial, omitted } = selectCommits(commits, MAX_CHANGELOG)
  const changelog = recent.map((commit) => toGitCommit(commit, WIKI_SOURCE.repoUrl))
  if (initial) changelog.push(toGitCommit(initial, WIKI_SOURCE.repoUrl))

  return {
    contributors,
    changelog,
    // 列表末尾追加了最早一条提交，组件据此在其上方插入省略说明
    changelogInitial: initial?.hash,
    changelogOmitted: describeOmitted(omitted),
  }
}

/**
 * 样式详情页的更新日志取自 CSL 文件自身的提交记录。
 *
 * 与 wiki 页同一策略：只列最近的若干条 + 最早一条，中间省略的部分用一行
 * 说明交代清楚。样式仓库的历史里绝大多数是「一次改上百个样式」的批量调整
 * （本站实测占全部条目的 74.5%），只留最近若干条尤其必要。
 */
function resolveStyleChangelog(style: StyleMetadata): GitPageData | undefined {
  const { dir, file } = style
  if (!dir || !file) return undefined

  const commits = getStylesHistory().get(`src/${dir}/${file}`)
  if (!commits?.length) return undefined

  const { recent, initial, omitted } = selectCommits(commits, MAX_CHANGELOG)
  const changelog = recent.map((commit) => toGitCommit(commit, STYLES_SOURCE.repoUrl))
  if (initial) changelog.push(toGitCommit(initial, STYLES_SOURCE.repoUrl))

  return {
    changelog,
    // 列表末尾追加了最早一条提交，组件据此在其上方插入省略说明
    changelogInitial: initial?.hash,
    changelogOmitted: describeOmitted(omitted),
  }
}

/**
 * 样式详情页的贡献者 = metadata.json 里的署名 + 实际提交过该 CSL 文件的人。
 *
 * 两者互补：metadata 的 author/contributor 是「谁署了这个样式」，可能包含并未
 * 提交过代码的人；Git 提交人是「谁改过这个文件」，能补全 metadata 遗漏的参与者。
 *
 * 提交人一侧会剔除一次改动超过 `MASS_EDIT_THRESHOLD` 个样式文件的仓库级调整：
 * 这类提交（如统一改文件名、批量修正链接）并不代表对该样式的贡献，
 * 不过滤时 Northword 会出现在 193/357 个样式页上。
 */
function resolveStyleContributors(style: StyleMetadata): GitContributor[] {
  const merged = new Map<string, GitContributor>()

  /** 按去掉大小写与分隔符的名称去重，避免 `Zeping Lee` 与 `zepinglee` 各占一行 */
  const add = (contributor: GitContributor) => {
    const key = normalizeName(contributor.name)
    if (!merged.has(key)) merged.set(key, contributor)
  }

  // 先放署名，保证它们排在前面
  const names = [...(style.author ?? []), ...(style.contributor ?? [])]
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name))

  for (const name of names) {
    const info = findContributorInfo(name, undefined, undefined)
    const github = info?.github
    add({
      name: info?.name || name,
      avatar: info?.avatar || (github ? `https://github.com/${github}.png` : undefined),
      url: info?.links?.[0] || (github ? `https://github.com/${github}` : undefined),
    })
  }

  // 再按提交次数降序补上 Git 提交人
  const path = style.dir && style.file ? `src/${style.dir}/${style.file}` : undefined
  const commits = path ? getStylesHistory().get(path) : undefined
  const counts = new Map<string, { contributor: GitContributor; count: number }>()
  for (const commit of commits ?? []) {
    if (commit.changes.length > MASS_EDIT_THRESHOLD) continue
    for (const author of [commit.author, ...commit.coAuthors]) {
      if (isBot(author)) continue
      const contributor = lookupContributor(author)
      const key = normalizeName(contributor.name)
      const entry = counts.get(key)
      if (entry) entry.count++
      else counts.set(key, { contributor, count: 1 })
    }
  }

  for (const { contributor } of [...counts.values()].sort((a, b) => b.count - a.count)) {
    add(contributor)
  }

  return [...merged.values()]
}

/**
 * 把 Git 信息写入页面数据，供客户端 `useData().page.git` 直接读取。
 *
 * 只在两类页面生效：wiki 子模块的文档页，以及带 `styleData` 的 CSL 样式详情页。
 */
export function attachGitInfo(page: PageData): void {
  const style = page.frontmatter?.styleData as StyleMetadata | undefined
  if (style) {
    const git = resolveStyleChangelog(style) ?? {}
    const contributors = resolveStyleContributors(style)
    if (contributors.length) git.contributors = contributors
    if (git.changelog?.length || git.contributors?.length) page.git = git
    return
  }

  if (!page.filePath?.startsWith(WIKI_PAGE_PREFIX)) return

  const commits = getWikiHistory().get(page.filePath.slice(WIKI_PAGE_PREFIX.length))
  if (!commits?.length) return

  page.git = resolvePageGit(commits)
}
