import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

export function MarkdownTransform(): Plugin {
  return {
    name: 'zotero-chinese-md-transform',
    enforce: 'pre',
    async transform(code, id) {
      // id 为文件磁盘绝对路径

      if (!/\.md\b/.test(id)) return null

      // convert links to relative
      code = code.replaceAll(/\]\(https?:\/\/zotero-chinese\.com\/user-guide\//g, '](/user-guide/')
      code = code.replaceAll(/\]\(https?:\/\/zotero-chinese\.com\/plugins\/?/g, '](/plugins/')
      code = code.replaceAll(/\]\(https?:\/\/zotero-chinese\.com\/styles\/?/g, '](/styles/')
      code = code.replaceAll(/\]\(https?:\/\/zotero-chinese\.com\//g, '](/')

      // CSL 样式部分
      if (/styles\/detail\/.*\.md/.test(id)) {
        // 读取同目录 metadata.json，注入 frontmatter，
        // 使详情页标题、元数据、下载链接等可在 SSR 阶段渲染（利于 SEO），
        // 客户端也无需再 fetch
        const metaPath = path.join(path.dirname(id), 'metadata.json')
        const styleData = existsSync(metaPath) ? readFileSync(metaPath, 'utf8').trim() : 'null'

        // 为详情页增加 md 前言
        code = [
          '---',
          'sidebar: false',
          'comments: false',
          'editLink: false',
          `styleData: ${styleData}`,
          '---',
          code,
        ].join('\n')

        // CSL 详情页的头部块
        code = code.replace(
          '<!-- PLACEHOLDER FOR WEBSITE - BEFORE FILE -->',
          [
            '<script setup>',
            'import StyleDetails from "@theme/components/StyleDetails.vue"',
            '</script>',
            '<StyleDetails />',
          ].join('\n'),
        )

        // CSL 详情页的折叠块
        code = code
          .replaceAll('<!-- PLACEHOLDER FOR WEBSITE - BEFORE RESULT -->', '::: details\n\n')
          .replaceAll('<!-- PLACEHOLDER FOR WEBSITE - AFTER RESULT -->', ':::\n\n')

        // escape: （张三，2008）<sup>[1](42)</sup>
        code = code.replaceAll(/\[(\d+)\]\(([\d-]*)\)/g, '\\[$1\\]\\($2\\)')
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
  return Promise.all(promises).then((replacements) =>
    str.replace(match, () => replacements.shift()!),
  )
}
