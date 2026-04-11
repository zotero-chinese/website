// @ts-check
import path from 'node:path'
import process from 'node:process'
import fs from 'fs-extra'
import { ofetch } from 'ofetch'

const data_list = [
  {
    local_path: 'src/.vitepress/data/_data/plugins.json',
    remote_url:
      // 'https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/plugins.json',
      'https://github.com/syt2/zotero-addons-scraper/releases/latest/download/addon_infos.json',
  },
  // {
  //   local_path: 'src/.vitepress/data/_data/update-time.json',
  //   remote_url:
  //     'https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/shields.json',
  // },
  {
    local_path: 'src/.vitepress/data/_data/charts.json',
    remote_url:
      'https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/charts.json',
  },
  {
    local_path: 'src/.vitepress/data/_data/dashboard.json',
    remote_url:
      'https://raw.githubusercontent.com/l0o0/translators_CN/master/data/dashboard.json',
  },
]

for (const d of data_list) {
  const data = await ofetch(d.remote_url, {
    parseResponse: JSON.parse,
    retry: 3,
    retryDelay: 500, // ms
    retryStatusCodes: [404, 500], // response status codes to retry
  })
  fs.outputJSONSync(path.resolve(d.local_path), data)
  console.log(`Download ${d.local_path} success!`)
}

// Contributors images
const contributors_list = [
  // {
  //   local_path: 'src/.vitepress/data/_data/contributors_zotero-chinese_wiki.svg',
  //   remote_url:
  //       'https://github.com/zotero-chinese/.github/raw/main/.github-contributors/zotero-chinese_wiki.svg',
  // },
  // {
  //   local_path: 'src/.vitepress/data/_data/contributors_zotero-chinese_zotero-plugins.svg',
  //   remote_url:
  //       'https://github.com/zotero-chinese/.github/raw/main/.github-contributors/zotero-chinese_zotero-plugins.svg',
  // },
  // {
  //   local_path: 'src/.vitepress/data/_data/contributors_zotero-chinese_styles.svg',
  //   remote_url:
  //       'https://github.com/zotero-chinese/.github/raw/main/.github-contributors/zotero-chinese_styles.svg',
  // },
  // {
  //   local_path: 'src/.vitepress/data/_data/contributors_l0o0_translators_CN.svg',
  //   remote_url:
  //       'https://github.com/zotero-chinese/.github/raw/main/.github-contributors/l0o0_translators_CN.svg',
  // },
]

for (const d of contributors_list) {
  const data = (await ofetch(d.remote_url), {
    parseResponse: txt => txt,
    retry: 3,
    retryDelay: 500, // ms
    retryStatusCodes: [404, 500], // response status codes to retry
  })
  fs.outputJSONSync(path.resolve(d.local_path), data)
  console.log(`Download ${d.local_path} success!`)
}

async function getLatestRelease() {
  const url = `https://api.github.com/repos/syt2/zotero-addons-scraper/releases/latest`

  const response = await fetch(url, {
    headers: {
      Authorization: `bader ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  return {
    tagName: data.tag_name, // 例如: "v1.2.3"
    name: data.name, // Release 标题
    publishedAt: data.published_at, // ISO 8601 格式时间
    createdAt: data.created_at,
    htmlUrl: data.html_url,
    body: data.body, // Release 说明
    isDraft: data.draft,
    isPrerelease: data.prerelease,
  }
}

await getLatestRelease()
  .then((release) => {
    console.log('插件信息最新更新时间:', release.publishedAt)
    fs.outputJSONSync(path.resolve('src/.vitepress/data/_data/update-time.json'), release)
  })

console.log('Done!')
