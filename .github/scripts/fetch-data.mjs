// @ts-check
import path from 'node:path'
import fs from 'fs-extra'
import { ofetch } from 'ofetch'

const data_list = [
  {
    local_path: 'src/.vitepress/data/_data/plugins.json',
    remote_url:
      'https://api.github.com/repos/zotero-chinese/zotero-plugins/contents/dist/plugins.json?ref=gh-pages',
  },
  {
    local_path: 'src/.vitepress/data/_data/update-time.json',
    remote_url:
      'https://api.github.com/repos/zotero-chinese/zotero-plugins/contents/dist/shields.json?ref=gh-pages',
  },
  {
    local_path: 'src/.vitepress/data/_data/charts.json',
    remote_url:
      'https://api.github.com/repos/zotero-chinese/zotero-plugins/contents/dist/charts.json?ref=gh-pages',
  },
  {
    local_path: 'src/.vitepress/data/_data/dashboard.json',
    remote_url:
      'https://api.github.com/repos/l0o0/translators_CN/contents/data/dashboard.json?ref=master',
  },
]

for (const d of data_list) {
  const headers = new Headers()
  if (new URL(d.remote_url).origin === 'https://api.github.com') {
    headers.set('Accept', 'application/vnd.github.raw+json')
    if (process.env.GITHUB_TOKEN) {
      headers.set('Authorization', `Bearer ${process.env.GITHUB_TOKEN}`)
    }
  }
  const data = await ofetch(d.remote_url, {
    headers,
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
  const data =
    (await ofetch(d.remote_url),
    {
      parseResponse: (txt) => txt,
      retry: 3,
      retryDelay: 500, // ms
      retryStatusCodes: [404, 500], // response status codes to retry
    })
  fs.outputJSONSync(path.resolve(d.local_path), data)
  console.log(`Download ${d.local_path} success!`)
}

console.log('Done!')
