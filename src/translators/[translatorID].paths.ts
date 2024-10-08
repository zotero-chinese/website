import type { Translators } from '@data/translators.data'
import fs from 'fs-extra'
import { listify } from 'radash'

export default {
  async paths() {
    const translators = fs.readJsonSync(
      'src/.vitepress/data/_data/dashboard.json',
    ) as Translators

    return listify(translators, (k, v) => ({ ...v, fileName: k })).map(
      (translator) => {
        for (const testCase of translator.testCases) {
          if (testCase.items !== 'multiple') {
            for (const item of testCase.items) {
              item.notes = item.notes?.map((note, index) => {
                return typeof note == 'object' && note.title
                  ? note.title
                  : `笔记 ${index + 1}`
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
      },
    )
  },
}
