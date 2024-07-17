/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const local_path = path.resolve('src/.vitepress/data/_data/dashboard.json')
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

export interface Translator {
  header: TranslatorHeader
  testCases: Array<testCase>
  zhLabel: string
  trends: Array<{
    author: string
    date: string
    message: string
  }>
}

export interface testCase {
  type: string
  url?: string
  input?: string
  items:
    | Array<{
      [key: string]: any
      itemType: string
      notes?: Array<string | { title?: string, note: string }>
      seeAlso?: Array<string>
    }>
    | 'multiple'
}

export interface TranslatorHeader {
  translatorID: string
  label: string
  creator: string
  target: string
  minVersion: string
  maxVersion: string
  priority: number
  inRepository: boolean
  translatorType: number
  browserSupport: string
  lastUpdated: string
}

export interface Translators {
  [fileName: string]: Translator
}

export interface TranslatorLittle
  extends Pick<
    TranslatorHeader,
    | 'translatorID'
    | 'label'
    | 'creator'
    | 'target'
    | 'translatorType'
    | 'lastUpdated'
  > {
  zhLabel: string
  itemTypes: Array<string>
}
