import fs from 'fs-extra'

// const local_path = path.resolve("src/styles/data/styles.json");

declare const data: StyleFullResult[]
export { data }

export default {
  watch: ['../../styles/detail/**/metadata.json'],
  load(watchedFiles: string[]) {
    // watchFiles 是一个所匹配文件的绝对路径的数组。

    return watchedFiles
      .map((file) => {
        return fs.readJsonSync(file) as StyleFullResult
      })
      .sort((a, b) => {
        const _a = a.title.match('GB')
        const _b = b.title.match('GB')
        // title 中包含 GB 的始终最前且逆序（如此可按标题长度递增）
        // 否则顺序
        if (_a && !_b)
          return -1
        if (!_a && _b)
          return 1
        if (_a && _b)
          return b.title.localeCompare(a.title, 'zh', { numeric: true })
        return a.title.localeCompare(b.title, 'zh', { numeric: true })
      })
  },
}
