import fs from 'fs-extra'

// const local_path = path.resolve("src/styles/data/styles.json");

declare const data: StyleFullResult[]
export { data }

function getSortKeys(title: string): string[] {
  const keys: string[] = []

  // 先按照样式类型排序
  let style_type = 'c'
  if (title.match(/(法学引注手册|中国高等学校自然科学学报编排规范|综合性期刊文献引证技术规范)/)) {
    // 综合性样式在最前
    style_type = 'a'
  }
  else if (title.match(/GB/)) {
    // 国标
    style_type = 'b'
  }
  else if (title.match(/^导出/)) {
    style_type = 'z'
  }
  keys.push(style_type)

  // 国标按时间逆序
  const year = title.match(/GB[-/\s]T[-\s]7714[-—](\d\d\d\d)/)
  keys.push(year ? (9999 - Number.parseInt(year[1])).toString() : '9999')

  // 可按标题长度递增
  keys.push(title.replace(/[，（]/, ' ').replace('）', ''))

  return keys
}

export default {
  watch: ['../../styles/detail/**/metadata.json'],
  load(watchedFiles: string[]) {
    // watchFiles 是一个所匹配文件的绝对路径的数组。

    return watchedFiles
      .map((file) => {
        return fs.readJsonSync(file) as StyleFullResult
      })
      .sort((a, b) => {
        const a_keys = getSortKeys(a.title)
        const b_keys = getSortKeys(b.title)
        for (let i = 0; i < a_keys.length; i++) {
          if (a_keys[i] !== b_keys[i]) {
            return a_keys[i].localeCompare(b_keys[i], 'zh', { numeric: true })
          }
        }
        return 0
      })
  },
}
