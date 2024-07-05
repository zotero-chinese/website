/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const local_path = path.resolve('src/translators/data/_data/dashboard.json')
const remote_path
  = 'https://github.com/l0o0/translators_CN/raw/master/data/dashboard.json'

declare const data: Translator[]
export { data }

export default {
  async load() {
    const raw = await getRaw()
    return Object.values(raw)
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
