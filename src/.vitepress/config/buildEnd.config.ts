import type { SiteConfig } from 'vitepress'
import { copyFileSync, writeFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import path from 'node:path'
import { Feed } from 'feed'
import { createContentLoader } from 'vitepress'
import { getGitTimestamp } from '../utils/getGitTimestamp'
import { getDefaultTitle, getTextSummary } from '../utils/markdown'

const siteUrl = 'https://zotero-chinese.com'

export async function buildEnd(config: SiteConfig) {
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

  // 获取每一条路径的 Git 时间
  const updatedDates = await Promise.all(
    paths.map(async (path) => {
      return {
        router: path.replace('src', '').replace('index.md', '').replace('.md', ''),
        updated: new Date(await getGitTimestamp(path)),
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
