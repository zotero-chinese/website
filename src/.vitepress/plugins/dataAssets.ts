import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { readRawPlugins, transformPlugins } from '../data/pluginData'

const stylesRoot = path.resolve('src/styles/detail/src')
const stylesOut = path.resolve('src/public/styles-data')
const pluginsOut = path.resolve('src/public/plugin-data')

/** FNV-1a 64 位哈希，与 `styles.data.ts` 中的实现保持一致 */
function styleKey(input: string): string {
  let h = 0xcbf29ce484222325n
  for (let i = 0; i < input.length; i++) {
    h ^= BigInt(input.charCodeAt(i))
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn
  }
  return h.toString(16)
}

/** 为每个 CSL 样式生成一份完整数据（含 citations/bibliography），供详情页与悬浮预览按需 fetch */
function generateStyles() {
  rmSync(stylesOut, { recursive: true, force: true })
  mkdirSync(stylesOut, { recursive: true })

  const dirs = readdirSync(stylesRoot, { withFileTypes: true }).filter((d) => d.isDirectory())
  for (const dir of dirs) {
    const metaPath = path.join(stylesRoot, dir.name, 'metadata.json')
    if (!existsSync(metaPath)) continue
    writeFileSync(path.join(stylesOut, `${styleKey(dir.name)}.json`), readFileSync(metaPath))
  }
  console.log(`🎨 Generated ${dirs.length} style data files`)
}

/** 为每个插件生成一份完整数据（含全部版本与下载信息），供下载弹窗按需 fetch */
function generatePlugins() {
  rmSync(pluginsOut, { recursive: true, force: true })
  mkdirSync(pluginsOut, { recursive: true })

  const plugins = transformPlugins(readRawPlugins())
  for (const plugin of plugins) {
    const file = path.join(pluginsOut, `${plugin.repo}.json`)
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, JSON.stringify(plugin))
  }
  console.log(`🎨 Generated ${plugins.length} plugin data files`)
}

export function DataAssets(): Plugin {
  return {
    name: 'zotero-chinese-data-assets',
    buildStart() {
      generateStyles()
      generatePlugins()
    },
  }
}
