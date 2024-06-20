import path, { join } from "path";
import { writeFileSync, copyFileSync } from "fs";
import { Feed } from "feed";
import { createContentLoader, type SiteConfig } from "vitepress";
import { getGitTimestamp } from ".vitepress/utils/getGitTimestamp";
import { getDefaultTitle, getTextSummary } from ".vitepress/utils/markdown";
import FastGlob from "fast-glob";

const siteUrl = "https://zotero-chinese.com";

export const buildEnd = async (config: SiteConfig) => {
  const feed = new Feed({
    title: "Zotero 中文社区",
    description: "非官方 Zotero 中文维护小组",
    id: siteUrl,
    link: siteUrl,
    language: "zh",
    image: "https://zotero-chinese/logo.png",
    favicon: "https://zotero-chinese.com/logo.png",
    copyright: "Copyright © 2018-present Zotero 中文社区及贡献者",
  });

  const paths = await FastGlob.glob("src/wiki/**/*.md", {
    ignore: ["README.md", "node_modules"],
  });

  // 获取每一条路径的 Git 时间
  const updatedDates = await Promise.all(
    paths.map(async (path) => {
      return {
        router: path
          .replace("src", "")
          .replace("index.md", "")
          .replace(".md", ""),
        updated: await getGitTimestamp(path),
      };
    }),
  );

  // 渲染 md
  const posts = await createContentLoader("wiki/**/*.md", {
    includeSrc: true,
    excerpt: true,
    // render: true,
  }).load();

  // 匹配时间
  posts.map((post) => {
    post.frontmatter.updated = updatedDates.find(
      (v) => v.router === post.url,
    )?.updated;
    return post;
  });

  posts.sort(
    (a, b) =>
      +new Date(b.frontmatter.updated) - +new Date(a.frontmatter.updated),
  );

  for (const { url, excerpt, frontmatter, html, src } of posts) {
    feed.addItem({
      title: frontmatter.title || getDefaultTitle(src!),
      id: `${siteUrl}${url}`,
      link: `${siteUrl}${url.replace("wiki/", "")}`,
      description: excerpt || getTextSummary(src!),
      // content: html,
      author: [
        {
          name: "Zotero 中文社区",
        },
      ],
      date: new Date(frontmatter.updated || frontmatter.date) || new Date(),
    });
  }

  writeFileSync(path.join(config.outDir, "feed.rss"), feed.rss2());
  copyFileSync(
    path.join(config.outDir, "feed.rss"),
    path.join(config.outDir, "rss.rss"),
  );
  console.log("🎉 RSS generated");
};
