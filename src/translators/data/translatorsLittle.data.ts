/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const local_path = path.resolve('src/translators/data/_data/dashboard.json')
const remote_path
  = 'https://github.com/l0o0/translators_CN/raw/master/data/dashboard.json'

declare const data: { translators: TranslatorLittle[], allItemTypes: string[] }
export { data }

export default {
  async load() {
    const raw = await getRaw()
    const translators: Array<TranslatorLittle> = []
    const allItemTypes: Set<string> = new Set()
    Object.values(raw).forEach((item) => {
      const itemTypes: Set<string> = new Set()
      item.testCases.forEach((testCase) => {
        if (testCase.items === 'multiple') {
          itemTypes.add(testCase.items)
          allItemTypes.add(testCase.items)
        }
        else {
          testCase.items.forEach((item) => {
            itemTypes.add(item.itemType)
            allItemTypes.add(item.itemType)
          })
        }
      })
      translators.push({
        translatorID: item.header.translatorID,
        label: item.header.label,
        zhLabel: item.zhLabel,
        creator: item.header.creator.replace(/<[^\n\r@\u2028\u2029]*@.*>/g, ''),
        target: item.header.target,
        lastUpdated: item.header.lastUpdated,
        translatorType: item.header.translatorType,
        itemTypes: [...itemTypes],
      })
    })
    return {
      translators,
      allItemTypes: [...allItemTypes],
    }
  },
}

async function getRaw(): Promise<Translators> {
  if (existsSync(local_path)) {
    return JSON.parse(readFileSync(local_path).toString())
  }
  else {
    console.log(
      'Local translators dashboard.json not found, will fetch from remote',
    )
    return (await fetch(remote_path)).json() as unknown as Translators
  }
}
