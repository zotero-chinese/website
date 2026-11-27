import type { Translators } from '@data/translatorsLittle.data'
import fs from 'fs-extra'

export default {
  async paths() {
    const translators = fs.readJsonSync('src/.vitepress/data/_data/dashboard.json') as Translators

    // translators 数据中存在同一 translatorID 对应多个文件的情况
    // （例如同一站点的两个抓取实现），若全部展开会生成重复路由，
    // 导致 sitemap 出现重复 URL 且后写入的页面覆盖先前页面。
    // 这里按 translatorID 去重，保留首个出现的实现。
    const seen = new Set<string>()

    return Object.entries(translators)
      .map(([fileName, v]) => ({ ...v, fileName }))
      .filter((translator) => {
        const id = translator.header.translatorID
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      .map((translator) => {
        for (const testCase of translator.testCases) {
          if (testCase.items !== 'multiple') {
            for (const item of testCase.items) {
              item.notes = item.notes?.map((note, index) => {
                return typeof note == 'object' && note.title ? note.title : `笔记 ${index + 1}`
              })
              delete item.seeAlso
            }
          }
        }
        return {
          params: {
            translatorID: translator.header.translatorID,
            translator,
          },
        }
      })
  },
}
