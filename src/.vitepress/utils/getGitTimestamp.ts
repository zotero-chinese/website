import { execFile } from 'node:child_process'
import { basename, dirname } from 'node:path'
import fs from 'fs-extra'

const cache = new Map<string, number>()

export function getGitTimestamp(file: string) {
  const cached = cache.get(file)
  if (cached) return cached

  return new Promise<number>((resolve, reject) => {
    const cwd = dirname(file)
    if (!fs.existsSync(cwd)) return resolve(0)
    const fileName = basename(file)
    execFile('git', ['log', '-1', '--pretty="%ai"', fileName], { cwd }, (error, stdout) => {
      if (error) return reject(error)
      const timestamp = +new Date(stdout)
      cache.set(file, timestamp)
      resolve(timestamp)
    })
  })
}
