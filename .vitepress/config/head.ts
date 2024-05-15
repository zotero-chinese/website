import type { DefaultTheme, PageData, UserConfig } from "vitepress";

const ogDescription =
  "Zotero 中文社区，Zotero 中文维护小组，Zotero 插件，Zotero 中文 CSL 样式";
const ogImage = "/logo.png";
const ogTitle = "Zotero 中文社区";
const ogUrl = "https://zotero-chinese.com";

export const head: UserConfig["head"] = [
  ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.png" }],
  ["link", { rel: "alternate", type: "application/rss+xml", href: "/rss.rss" }],
  ["meta", { property: "og:type", content: "website" }],
  ["meta", { property: "og:title", content: ogTitle }],
  ["meta", { property: "og:image", content: ogImage }],
  ["meta", { property: "og:url", content: ogUrl }],
  ["meta", { property: "og:description", content: ogDescription }],
  ["meta", { name: "theme-color", content: "#646cff" }],
  // 谷歌分析
  [
    "script",
    {
      async: "",
      src: "https://www.googletagmanager.com/gtag/js?id=G-YHYFX0LRZK",
    },
  ],
  [
    "script",
    {},
    `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-YHYFX0LRZK');`,
  ],
];

export const transformPageData = (pageData: PageData) => {
  console.log(pageData);
  pageData.frontmatter.head ??= [];
  pageData.frontmatter.head.push([
    "meta",
    {
      name: "citation_title",
      content:
        pageData.frontmatter.layout === "home"
          ? `Zotero 中文社区`
          : `${pageData.title} | Zotero 中文社区`,
    },
  ]);
  pageData.frontmatter.head.push([
    "meta",
    {
      name: "og:type",
      content: pageData.frontmatter.layout === "doc" ? `document` : `website`,
    },
  ]);

  const canonicalUrl = `https://zotero-chinese.com/${pageData.relativePath}`
    .replace(/index\.md$/, "")
    .replace(/\.md$/, ".html");

  pageData.frontmatter.head.push([
    "link",
    { rel: "canonical", href: canonicalUrl },
  ]);
};
