export interface PluginLocaleData {
  dataUpdatedAt: string
  releaseUpdatedAt: string
  resultCount: string
  requestListingPrompt: string
  requestListing: string
  clearFilters: string
  searchHelp: string
  searchAllVersions: string
  recommendedDownload: string
  noCompatibleDownload: string
  downloadLoadFailed: string
  retry: string
  authorReleases: string
  originalDownload: string
  downloadLoading: string

  // Toolbar
  zoteroVersion: string
  sortBy: string
  author: string
  searchPlaceholder: string

  // Sort options
  sortByStars: string
  sortByName: string
  sortByAuthor: string
  sortByLastUpdated: string

  // Zotero options
  zoteroAll: string

  // Author options
  authorAll: string

  // PluginCard
  viewAuthorPlugins: string
  pluginStars: string
  download: string
  visitHomepage: string
  copyShareLink: string
  copySucessfully: string
  copyFailed: string
  /** 文档（插件介绍页入口） */
  docs: string

  // PluginAuthorCard
  publishedPlugins: string
  receivedStars: string
  authorHomepage: string
  clearAuthorFilter: string

  // PluginDownloadModal
  downloadTips1: string
  downloadTips2: string
  downloadTips3: string
  downloadWarning: string
  pluginVersion: string
  releaseDate: string
  downloadCount: string
  downloadLink: string
  downloadLinks: string
  cantGetDownloadCount: string
  downloadForZotero: string
  range: string

  // Footer
  zoteroGroup: string
  zoteroGroupNumbers: string
  feedback: string
  fillForm: string
  issueOnGithub: string
  noMatchingPlugins: string
  compatibilityWarning: string
}

export const zhLocale: PluginLocaleData = {
  dataUpdatedAt: '插件数据更新于',
  releaseUpdatedAt: '插件更新于',
  resultCount: '找到 {count} 个插件',
  requestListingPrompt: '没找到想要的插件？',
  requestListing: '提交收录请求',
  clearFilters: '清空筛选',
  searchHelp: '试试插件中文名、英文名、作者，或清空筛选条件。',
  searchAllVersions: '查看其他 Zotero 版本中的 {count} 个结果',
  recommendedDownload: '适配已选 Zotero {version}',
  noCompatibleDownload: '暂无声明适配 Zotero {version} 的下载，请查看其他版本或作者发布页。',
  downloadLoadFailed: '插件数据加载失败',
  retry: '重试',
  authorReleases: '作者发布页',
  originalDownload: '作者发布源',
  downloadLoading: '正在加载下载信息…',

  // Toolbar
  zoteroVersion: '适配 Zotero 版本',
  sortBy: '排序',
  author: '作者',
  searchPlaceholder: '搜索名称、作者或关键词…',

  // Sort options
  sortByStars: '星标量',
  sortByName: '插件名',
  sortByAuthor: '作者',
  sortByLastUpdated: '最后更新时间',

  // Zotero options
  zoteroAll: '全部 Zotero 版本',

  // Author options
  authorAll: '所有',

  // PluginCard
  viewAuthorPlugins: '查看该作者所有插件',
  pluginStars: '插件星标量',
  download: '下载',
  visitHomepage: '访问插件主页',
  copyShareLink: '复制分享链接',
  copySucessfully: '复制成功！',
  copyFailed: '复制失败，请检查浏览器剪贴板权限后重试。',
  docs: '文档',

  // PluginAuthorCard
  publishedPlugins: '已发布插件',
  receivedStars: '收到星标',
  authorHomepage: '作者主页',
  clearAuthorFilter: '清除作者筛选',

  // PluginDownloadModal
  downloadTips1: '本页面为每一个插件都提供了多个下载地址，请逐个尝试选择可用的地址。',
  downloadTips2: '火狐浏览器用户请通过在链接上右击，选择"另存为"来下载 XPI 包。',
  downloadTips3: '插件之间可能存在冲突，建议按需安装。',
  downloadWarning:
    '针对不同 Zotero 版本的插件可能互不兼容，请按自己的 Zotero 版本下载对应的插件版本。查看 Zotero 版本和安装插件步骤请参考：',
  pluginVersion: '插件版本：',
  releaseDate: '更新时间：',
  downloadCount: '下载量：',
  downloadLink: '下载链接:',
  downloadLinks: '下载链接',
  cantGetDownloadCount: '无法获取',
  downloadForZotero: '下载适配 Zotero {version} 的插件',
  range: '兼容性声明：',

  // Footer
  zoteroGroup: 'Zotero 中文交流群',
  zoteroGroupNumbers:
    '913637964，617148016，893963769，666489129，145248977，317995116，962963257（加一个群即可）。独学而无友，则孤陋而寡闻。',
  feedback: '如果你对本页面有任何建议或反馈，请',
  fillForm: '填写表格',
  issueOnGithub: 'GitHub 仓库提 issue',
  noMatchingPlugins: '无匹配插件',
  compatibilityWarning: '关于 Zotero 插件 - 安装插件',
}

export const enLocale: PluginLocaleData = {
  dataUpdatedAt: 'Plugin data updated',
  releaseUpdatedAt: 'Plugin updated',
  resultCount: 'Plugins found: {count}',
  requestListingPrompt: 'Missing a plugin?',
  requestListing: 'Request a listing',
  clearFilters: 'Clear filters',
  searchHelp: 'Try a plugin name, author, or clear your filters.',
  searchAllVersions: 'Show {count} results across Zotero versions',
  recommendedDownload: 'For selected Zotero {version}',
  noCompatibleDownload:
    'No download declares compatibility with Zotero {version}. Check other versions or the author’s releases.',
  downloadLoadFailed: 'Could not load plugin downloads',
  retry: 'Retry',
  authorReleases: 'Author’s releases',
  originalDownload: 'Original download',
  downloadLoading: 'Loading download options…',

  // Toolbar
  zoteroVersion: 'Zotero Version',
  sortBy: 'Sort',
  author: 'Author',
  searchPlaceholder: 'Search names, authors or keywords…',

  // Sort options
  sortByStars: 'Stars',
  sortByName: 'Plugin Name',
  sortByAuthor: 'Author',
  sortByLastUpdated: 'Last Updated',

  // Zotero options
  zoteroAll: 'All',

  // Author options
  authorAll: 'All',

  // PluginCard
  viewAuthorPlugins: 'View all plugins from this author',
  pluginStars: 'Plugin stars',
  download: 'Download',
  visitHomepage: 'Visit plugin homepage',
  copyShareLink: 'Copy share link',
  copySucessfully: 'Copied successfully!',
  copyFailed: 'Copy failed. Check your browser clipboard permissions and try again.',
  docs: 'Docs',

  // PluginAuthorCard
  publishedPlugins: 'Published Plugins',
  receivedStars: 'Received Stars',
  authorHomepage: 'Author Homepage',
  clearAuthorFilter: 'Clear author filter',

  // PluginDownloadModal
  downloadTips1:
    'This page provides multiple download addresses for each plugin. Please try to select an available address.',
  downloadTips2:
    'Firefox users can right-click the link and select "Save As" to download the XPI package.',
  downloadTips3: 'Plugins may conflict with each other. Install only what you need.',
  downloadWarning:
    'Plugins for different Zotero versions may be incompatible. Please download the version corresponding to your Zotero version. For information about checking your Zotero version and installing plugins, please refer to:',
  pluginVersion: 'Plugin Version: ',
  releaseDate: 'Updated: ',
  downloadCount: 'Downloads: ',
  downloadLink: 'Download Links: ',
  downloadLinks: 'Download Links',
  cantGetDownloadCount: 'Unable to fetch',
  downloadForZotero: 'Download plugin for Zotero {version}',
  range: 'Declared compatibility: ',

  // Footer
  zoteroGroup: 'Zotero Chinese Community Groups',
  zoteroGroupNumbers:
    '913637964, 617148016, 893963769, 666489129, 145248977, 317995116, 962963257 (joining one group is sufficient). Learning alone without friends leads to ignorance.',
  feedback: 'If you have any suggestions or feedback about this page, please',
  fillForm: 'fill out the form',
  issueOnGithub: 'open an issue on GitHub',
  noMatchingPlugins: 'No matching plugins',
  compatibilityWarning: 'About Zotero Plugins - Install Plugins',
}

const defaultLocaleInfo: Record<string, PluginLocaleData> = {
  zh: zhLocale,
  en: enLocale,
}

export function getPluginLocale(lang: string): PluginLocaleData {
  const fallbackLang = lang.split('-')[0]
  return defaultLocaleInfo[lang] || defaultLocaleInfo[fallbackLang] || defaultLocaleInfo.zh
}
