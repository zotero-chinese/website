import { createContentLoader } from 'vitepress'

interface Post {
  title: string
  url: string
  date: {
    time: number
    string: string
  }
}

declare const data: Post[]
export { data }

export default createContentLoader('blog/blog-repo/posts/!(_template|index).md', {
  // excerpt: true,
  transform(raw): Post[] {
    return raw
      .filter(({ frontmatter }) => !frontmatter.draft)
      .map(({ url, frontmatter }) => ({
        title: frontmatter.title,
        url: url.replace('/blog-repo', ''),
        date: formatDate(frontmatter.date),
      }))
      .sort((a, b) => b.date.time - a.date.time)
  },
})

function formatDate(raw: string): Post['date'] {
  const date = new Date(`${raw} UTC+8`)
  return {
    time: +date,
    string: date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
}
