import type { Tag } from "@theme/components/TagsFilter.vue";

export const tags: Tag[] = [
  {
    label: "推荐",
    value: "favorite",
    description:
      "我们推荐的高质量插件！这些插件通常可以解决多数同学的痛点，且维护良好",
  },
  {
    label: "条目元数据",
    value: "metadata",
    description: "维护条目元数据，管理文献库条目等",
  },
  {
    label: "界面交互",
    value: "interface",
    description: "美化用户界面，优化交互操作",
  },
  {
    label: "附件管理",
    value: "attachment",
    description: "管理 PDF、DOCX 等附件",
  },
  {
    label: "笔记增强",
    value: "notes",
    description: "改善 Zotero 笔记功能使用体验",
  },
  {
    label: "阅读器增强",
    value: "reader",
    description: "增强阅读器使用体验",
  },
  {
    label: "效率增强",
    value: "productivity",
    description: "效率工具，生产力工具",
  },
  {
    label: "可视化文库",
    value: "visualization",
    description: "可视化文库",
  },
  {
    label: "第三方集成",
    value: "integration",
    description: "与第三方软件集成，如 LaTeX、Obsidian、Notion 等",
  },
  {
    label: "写作增强",
    value: "writing",
    description: "增强 Zotero 在 Word 等字处理软件的使用体验",
  },
  {
    label: "开发者工具",
    value: "developer",
    description: "开发者使用的插件，常规用户可以忽略",
  },
  {
    label: "其他",
    value: "others",
    description: "不在以上分类中的其他插件",
  },
];
