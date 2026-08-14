import { copyFileSync, mkdirSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { Plugin } from 'vite'

/**
 * 将 CSL 样式文件复制到 Vite 的 `publicDir`（`src/public/styles`），
 * 之后完全交由 Vite 原生机制提供访问，dev 与构建行为一致：
 *
 * - 开发：public 目录由 Vite 开发服务器直接 serve
 * - 构建：public 目录由 Vite 在构建时原样复制到输出目录
 *
 * 产物路径与源码保持一致，例如：
 * `src/styles/detail/src/上海交通大学/上海交通大学.csl`
 * → `/styles/上海交通大学/上海交通大学.csl`
 * → https://zotero-chinese.com/styles/上海交通大学/上海交通大学.csl
 *
 * 注：`src/public/styles` 为构建产物，已加入 `.gitignore`。
 */
export function CslAssets(): Plugin {
  const cslSourceDir = 'src/styles/detail/src'

  async function copyToPublicDir(publicDir: string) {
    const cslFiles = await Array.fromAsync(glob(`${cslSourceDir}/**/*.csl`))
    for (const file of cslFiles) {
      // glob 在 Windows 上可能返回反斜杠路径，需规范化为正斜杠
      const relative = file.split(/[\\/]/).join('/').replace(`${cslSourceDir}/`, '')
      const dest = resolve(publicDir, 'styles', relative)
      mkdirSync(dirname(dest), { recursive: true })
      copyFileSync(file, dest)
    }
  }

  return {
    name: 'zotero-chinese:csl-assets',
    async configResolved(config) {
      await copyToPublicDir(config.publicDir)
    },
  }
}
