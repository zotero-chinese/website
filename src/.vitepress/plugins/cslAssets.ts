import { createReadStream, existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Connect, Plugin } from 'vite'

/**
 * 开发环境下提供 CSL 样式文件的访问。
 *
 * 生产构建时，CSL 文件会在 `buildEnd` 阶段被复制到站点输出目录
 * （见 `../config/buildEnd.config.ts`），而开发服务器不会执行该步骤，
 * 故在此直接以中间件形式从样式仓库（`src/styles/detail/src`）读取文件。
 */
export function CslAssets(): Plugin {
  const cslSourceDir = resolve('src/styles/detail/src')

  const serveCsl: Connect.NextHandleFunction = (req, res, next) => {
    const pathname = req.url?.split('?')[0] ?? ''
    const match = pathname.match(/^\/styles\/(.+)\.csl$/)
    if (!match) {
      next()
      return
    }

    // 请求路径为 URL 编码，需解码后与磁盘路径匹配
    let dir: string
    try {
      dir = decodeURIComponent(match[1])
    } catch {
      next()
      return
    }

    const file = resolve(cslSourceDir, `${dir}.csl`)
    if (!file.startsWith(cslSourceDir) || !existsSync(file) || !statSync(file).isFile()) {
      next()
      return
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    createReadStream(file).pipe(res)
  }

  return {
    name: 'zotero-chinese:csl-assets',
    configureServer(server) {
      server.middlewares.use(serveCsl)
    },
  }
}
