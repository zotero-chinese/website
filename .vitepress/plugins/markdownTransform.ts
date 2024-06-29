import type { Plugin } from 'vite'

export function MarkdownTransform(): Plugin {
  return {
    name: 'zotero-chinese-md-transform',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.match(/\.md\b/))
        return null

      // convert links to relative
      code = code.replaceAll(
        /https?:\/\/zotero-chinese\.com\/user-guide\//g,
        '/user-guide/',
      )

      // CSL 样式部分
      if (id.match(/styles\/detail\/.*\.md/)) {
        // 为详情页增加 md 前言
        code = `---
sidebar: false
comments: false
---
${code}`

        // CSL 详情页的头部块
        code = code.replace(
          '<!-- PLACEHOLDER FOR WEBSITE - BEFORE FILE -->',
          `<StyleDetailCard />`,
        )

        // CSL 详情页的折叠块
        code = code
          .replaceAll(
            '<!-- PLACEHOLDER FOR WEBSITE - BEFORE RESULT -->',
            '::: details\n\n',
          )
          .replaceAll(
            '<!-- PLACEHOLDER FOR WEBSITE - AFTER RESULT -->',
            ':::\n\n',
          )
      }

      return code
    },
  }
}

function _replaceAsync(
  str: string,
  match: RegExp,
  replacer: (substring: string, ...args: any[]) => Promise<string>,
) {
  const promises: Promise<string>[] = []
  str.replace(match, (...args) => {
    promises.push(replacer(...args))
    return ''
  })
  return Promise.all(promises).then(replacements =>
    str.replace(match, () => replacements.shift()!),
  )
}
