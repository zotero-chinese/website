import type { SiteConfig } from 'vitepress'
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import path from 'node:path'
import { Feed } from 'feed'
import { cacheAllGitTimestamps, createContentLoader, getGitTimestamp } from 'vitepress'
import { getDefaultTitle, getTextSummary } from '../utils/markdown'

const siteUrl = 'https://zotero-chinese.com'

/**
 * 将 CSL 样式文件一并打包到站点输出目录，提供从本站下载样式的途径。
 *
 * 输出路径与源码保持一致，例如：
 * `src/styles/detail/src/上海交通大学/上海交通大学.csl`
 * → `<outDir>/styles/上海交通大学/上海交通大学.csl`
 * → https://zotero-chinese.com/styles/上海交通大学/上海交通大学.csl
 */
async function copyCslFiles(outDir: string) {
  const cslSourceDir = 'src/styles/detail/src'
  const cslFiles = await Array.fromAsync(glob(`${cslSourceDir}/**/*.csl`))
  for (const file of cslFiles) {
    const dest = path.join(outDir, 'styles', path.relative(cslSourceDir, file))
    mkdirSync(path.dirname(dest), { recursive: true })
    copyFileSync(file, dest)
  }
  console.log(`🎉 Copied ${cslFiles.length} CSL files to ${path.join(outDir, 'styles')}`)
}

export async function buildEnd(config: SiteConfig) {
  await copyCslFiles(config.outDir)

  const feed = new Feed({
    title: 'Zotero 中文社区',
    description: 'Zotero 中文维护小组',
    id: siteUrl,
    link: siteUrl,
    language: 'zh',
    image: 'https://zotero-chinese/logo.png',
    favicon: 'https://zotero-chinese.com/logo.png',
    copyright: 'Copyright © 2018-present Zotero 中文社区及贡献者',
  })

  const paths = await Array.fromAsync(
    glob('src/wiki/**/*.md', {
      ignore: ['README.md', '**/node_modules', 'src/wiki/README.md', 'src/wiki/index.md'],
    }),
  )

  // console.log(paths)

  // 在 wiki 子模块内用单次 git 遍历预填充时间戳缓存
  await cacheAllGitTimestamps(path.resolve('src/wiki'), [':(glob)**/*.md'])

  // 获取每一条路径的 Git 时间
  const updatedDates = await Promise.all(
    paths.map(async (filePath) => {
      return {
        router: filePath.replace('src', '').replace('index.md', '').replace('.md', ''),
        updated: new Date(await getGitTimestamp(path.resolve(filePath).replaceAll('\\', '/'))),
      }
    }),
  )

  // 渲染 md
  const posts = await createContentLoader('wiki/**/*.md', {
    includeSrc: true,
    excerpt: true,
    // render: true,
  }).load()

  // 匹配时间
  posts.map((post) => {
    post.frontmatter.updated = updatedDates.find((v) => v.router === post.url)?.updated
    return post
  })

  posts.sort((a, b) => b.frontmatter.updated - a.frontmatter.updated)

  for (const { url, excerpt, frontmatter, src } of posts) {
    feed.addItem({
      title: frontmatter.title || getDefaultTitle(src!),
      id: `${siteUrl}${url}`,
      link: `${siteUrl}${url.replace('wiki/', '')}`,
      description: excerpt || getTextSummary(src!),
      // content: html,
      author: [
        {
          name: 'Zotero 中文社区',
        },
      ],
      date: frontmatter.updated || new Date(),
    })
  }

  writeFileSync(path.join(config.outDir, 'feed.xml'), feed.rss2())
  // 旧站点兼容性
  copyFileSync(path.join(config.outDir, 'feed.xml'), path.join(config.outDir, 'rss.rss'))
  console.log('🎉 RSS generated')
}
