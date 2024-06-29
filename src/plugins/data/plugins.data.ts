/* eslint-disable no-console */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const local_path = path.resolve('src/plugins/data/plugins.json')
const remote_path
  = 'https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/plugins.json'

declare const data: PluginInfo[]
export { data }

export default {
  async load() {
    if (existsSync(local_path)) {
      return JSON.parse(readFileSync(local_path).toString())
    }
    else {
      console.log('Local plugins.json not found, will fetch from remote')
      return (await fetch(remote_path)).json()
    }
  },
}
