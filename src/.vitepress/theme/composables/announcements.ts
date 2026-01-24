// 贺词和公告文本列表
export interface Announcement {
  text: string
  startDate?: string // ISO 8601 格式: '2026-01-01'
  endDate?: string // ISO 8601 格式: '2026-01-31'
}

export const announcements: Announcement[] = [
  {
    text: '🎉 新年快乐！Zotero 中文社区祝全球学者万事如意，阖家幸福！🎊',
    startDate: '2026-02-13',
    endDate: '2026-02-21',
  },
  // 在这里添加更多公告或贺词
  // {
  //   text: '📢 公告内容...',
  //   startDate: '2026-02-01',
  //   endDate: '2026-02-28',
  // },
]
