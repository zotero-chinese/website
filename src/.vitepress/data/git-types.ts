/** 页面上展示的一个贡献者 */
export interface GitContributor {
  /** 展示名称 */
  name: string
  /** 头像地址，缺失时由组件用首字母兜底 */
  avatar?: string
  /** 主页地址 */
  url?: string
}

/** 一条提交记录 */
export interface GitCommit {
  hash: string
  /** Unix 时间戳（毫秒） */
  time: number
  /** 已转义的提交信息，其中的 issue 编号已替换为链接 */
  message: string
  author: GitContributor
  coAuthors?: GitContributor[]
  commitUrl?: string
}

/** 构建期写入 `page.git` 的数据，由 plugins/git.ts 生成 */
export interface GitPageData {
  contributors?: GitContributor[]
  changelog?: GitCommit[]
}
