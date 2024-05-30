import path from "path";
import { writeFileSync } from "fs";
import { Feed } from "feed";
import { createContentLoader, type SiteConfig } from "vitepress";

const siteUrl = "https://zotero-chinese.com";

export const buildEnd = async (config: SiteConfig) => {
  const feed = new Feed({
    title: "Zotero 中文社区",
    description: "非官方 Zotero 中文维护小组",
    id: siteUrl,
    link: siteUrl,
    language: "zh",
    image: "https://zotero-chinese/logo.png",
    favicon: "https://vitejs.dev/logo.svg",
    copyright: "Copyright © 2018-present Zotero 中文社区及贡献者",
  });

  const posts = await createContentLoader("**/*.md", {
    excerpt: true,
    render: true,
  }).load();

  posts.sort(
    (a, b) =>
      +new Date(b.frontmatter.date as string) -
      +new Date(a.frontmatter.date as string),
  );

  for (const { url, excerpt, frontmatter, html } of posts) {
    feed.addItem({
      title: frontmatter.title,
      id: `${siteUrl}${url}`,
      link: `${siteUrl}${url}`,
      description: excerpt,
      content: html,
      author: [
        {
          name: frontmatter.author?.name,
        },
      ],
      date: frontmatter.date,
    });
  }

  writeFileSync(path.join(config.outDir, "blog.rss"), feed.rss2());
};
