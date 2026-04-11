import type { Tag } from '@theme/components/MarketTagsFilter.vue'
import type { PluginTagType } from './plugins.data'

export interface PluginTag extends Tag {
  value: PluginTagType
}

export const tags: PluginTag[] = [
  {
    label: '推荐',
    value: 'favorite',
    description:
      '我们推荐的高质量插件！这些插件通常可以解决多数同学的痛点，且维护良好',
  },
  {
    label: 'AI 功能',
    value: 'ai',
    description: 'AI 驱动的功能（总结、对话、翻译等）',
  },
  {
    label: '条目元数据',
    value: 'metadata',
    description: '元数据检索、引用计数、影响因子、格式化',
  },
  {
    label: '阅读器增强',
    value: 'reader',
    description: 'PDF 阅读体验、批注、高亮',
  },
  {
    label: '笔记增强',
    value: 'notes',
    description: '笔记记录、markdown 导出、知识管理',
  },
  {
    label: '附件管理',
    value: 'attachment',
    description: '文件管理、附件组织、OCR',
  },
  {
    label: '界面交互',
    value: 'interface',
    description: 'UI 增强、主题、列自定义',
  },
  {
    label: '第三方集成',
    value: 'integration',
    description: '第三方服务集成（Notion、Obsidian、Word 等）',
  },
  {
    label: '工具',
    value: 'utility',
    description: 'Zotero 系统工具（自动化、去重、插件管理）',
  },
  // {
  //   label: '效率增强',
  //   value: 'productivity',
  //   description: '效率工具，生产力工具',
  // },
  // {
  //   label: '可视化文库',
  //   value: 'visualization',
  //   description: '可视化文库',
  // },
  // {
  //   label: '第三方集成',
  //   value: 'integration',
  //   description: '与第三方软件集成，如 LaTeX、Obsidian、Notion 等',
  // },
  // {
  //   label: '写作增强',
  //   value: 'writing',
  //   description: '增强 Zotero 在 Word 等字处理软件的使用体验',
  // },
  // {
  //   label: '开发者工具',
  //   value: 'developer',
  //   description: '开发者使用的插件，常规用户可以忽略',
  // },
  // {
  //   label: '其他',
  //   value: 'others',
  //   description: '不在以上分类中的其他插件',
  // },
]

export const tagsEn: PluginTag[] = [
  {
    label: 'Favorite',
    value: 'favorite',
    description:
      '我们推荐的高质量插件！这些插件通常可以解决多数同学的痛点，且维护良好',
  },
  {
    label: 'AI Integration',
    value: 'ai',
    description: 'AI-powered features (summarization, chat, translation via LLM)',
  },
  {
    label: 'Metadata',
    value: 'metadata',
    description: 'Metadata retrieval, citation counts, impact factor, formatting',
  },
  {
    label: 'Reader',
    value: 'reader',
    description: 'PDF reading experience, annotation, highlighting',
  },
  {
    label: 'Notes',
    value: 'notes',
    description: 'Note-taking, markdown export, knowledge management',
  },
  {
    label: 'Attachment',
    value: 'attachment',
    description: 'File management, attachment organization, OCR',
  },
  {
    label: 'Interface',
    value: 'interface',
    description: 'UI enhancements, themes, column customization',
  },
  {
    label: 'Integration',
    value: 'integration',
    description: 'Integration with external services (Notion, Obsidian, Word, etc.)',
  },
  {
    label: 'Utility',
    value: 'utility',
    description: 'Zotero system tools (automation, deduplication, plugin management)',
  },
]

export function getPluginTags(lang: string): PluginTag[] {
  const fallbackLang = lang.split('-')[0]

  if (fallbackLang === 'en') {
    return tagsEn
  }

  return tags
}
