/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const local_path = path.resolve('src/.vitepress/data/_data/update-time.json')

export default {
  async load(): Promise<{ lastUpdate?: string }> {
    if (existsSync(local_path)) {
      return JSON.parse(readFileSync(local_path).toString())
    } else {
      console.log('Local update-time.json not found; run fetch-data to show the data update time')
      return {}
    }
  },
}
