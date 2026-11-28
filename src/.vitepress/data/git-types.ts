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
  /**
   * 更新日志末尾那条「最早的提交」的 hash。
   *
   * 样式详情页只列最近若干条，另把创建该文件的那次提交单独放在末尾；
   * 组件据此在它上方插入省略说明。缺失时更新日志是连续的。
   */
  changelogInitial?: string
  /** 因超出条数上限而未展示的历史变更数量，组件据此补一行说明 */
  changelogOmitted?: number
}
