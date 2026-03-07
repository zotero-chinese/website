export interface PluginLocaleData {
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
  zotero6: string
  zotero7: string
  zotero8: string

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

  // PluginAuthorCard
  publishedPlugins: string
  receivedStars: string
  authorHomepage: string

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

  // Notification
  upgradeToZotero7Title: string
  upgradeToZotero7Message: string
  upgradeToZotero7UpdateGuide: string
  upgradeToZotero8Title: string
  upgradeToZotero8Message: string
  upgradeToZotero8UpdateGuide: string

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
  // Toolbar
  zoteroVersion: '适配 Zotero 版本',
  sortBy: '排序',
  author: '作者',
  searchPlaceholder: '搜索插件...',

  // Sort options
  sortByStars: '星标量',
  sortByName: '插件名',
  sortByAuthor: '作者',
  sortByLastUpdated: '最后更新时间',

  // Zotero options
  zoteroAll: 'All',
  zotero6: 'Zotero 6',
  zotero7: 'Zotero 7',
  zotero8: 'Zotero 8',

  // Author options
  authorAll: '所有',

  // PluginCard
  viewAuthorPlugins: '查看该作者所有插件',
  pluginStars: '插件星标量',
  download: '下载',
  visitHomepage: '访问插件主页',
  copyShareLink: '复制分享链接',
  copySucessfully: '复制成功！',
  copyFailed: '您的浏览器不支持剪贴板接口，请手动复制。',

  // PluginAuthorCard
  publishedPlugins: '已发布插件',
  receivedStars: '收到星标',
  authorHomepage: '作者主页',

  // PluginDownloadModal
  downloadTips1: '本页面为每一个插件都提供了多个下载地址，请逐个尝试选择可用的地址。',
  downloadTips2: '火狐浏览器用户请通过在链接上右击，选择"另存为"来下载 XPI 包。',
  downloadTips3: '插件之间可能存在冲突，建议按需安装。',
  downloadWarning:
    'Zotero 6 与 Zotero 7 的插件可能互不兼容，请按自己的 Zotero 版本下载对应的插件版本。查看 Zotero 版本和安装插件步骤请参考：',
  pluginVersion: '插件版本：',
  releaseDate: '发布时间：',
  downloadCount: '下载量：',
  downloadLink: '下载链接:',
  downloadLinks: '下载链接',
  cantGetDownloadCount: '无法获取',
  downloadForZotero: '下载适配 Zotero {{ version }} 的插件',

  // Notification
  upgradeToZotero7Title: '推荐升级到 Zotero 7',
  upgradeToZotero7Message:
    'Zotero 7 现已正式发布，我们推荐所有同学更新到 Zotero 7。<br /><br />请查阅 <a href="/blog/posts/hello-zotero-7" class="el-link el-link--primary is-underline">Zotero 7 更新指南</a>。',
  upgradeToZotero8Title: '建议使用 Zotero 8',
  upgradeToZotero8Message:
    'Zotero 8 现已正式发布，我们推荐所有同学更新到 Zotero 8。<br /><br />请查阅 <a href="/blog/posts/zotero-8" class="el-link el-link--primary is-underline">Zotero 8 更新指南</a>。',
  upgradeToZotero7UpdateGuide: 'Zotero 7 更新指南',
  upgradeToZotero8UpdateGuide: 'Zotero 8 更新指南',

  // Footer
  zoteroGroup: 'Zotero 中文交流群',
  zoteroGroupNumbers:
    '913637964，617148016，893963769，666489129，145248977，317995116，962963257（加一个群即可）。独学而无友，则孤陋而寡闻。',
  feedback: '如果你对本页面有任何建议或反馈，请',
  fillForm: '填写表格',
  issueOnGithub: 'GitHub 仓库提 issue',
  noMatchingPlugins: '无匹配插件',
  compatibilityWarning:
    '关于 Zotero 插件 - 安装插件',
}

export const enLocale: PluginLocaleData = {
  // Toolbar
  zoteroVersion: 'Zotero Version',
  sortBy: 'Sort',
  author: 'Author',
  searchPlaceholder: 'Search plugins...',

  // Sort options
  sortByStars: 'Stars',
  sortByName: 'Plugin Name',
  sortByAuthor: 'Author',
  sortByLastUpdated: 'Last Updated',

  // Zotero options
  zoteroAll: 'All',
  zotero6: 'Zotero 6',
  zotero7: 'Zotero 7',
  zotero8: 'Zotero 8',

  // Author options
  authorAll: 'All',

  // PluginCard
  viewAuthorPlugins: 'View all plugins from this author',
  pluginStars: 'Plugin stars',
  download: 'Download',
  visitHomepage: 'Visit plugin homepage',
  copyShareLink: 'Copy share link',
  copySucessfully: 'Copied successfully!',
  copyFailed: 'Your browser does not support clipboard API. Please copy manually.',

  // PluginAuthorCard
  publishedPlugins: 'Published Plugins',
  receivedStars: 'Received Stars',
  authorHomepage: 'Author Homepage',

  // PluginDownloadModal
  downloadTips1: 'This page provides multiple download addresses for each plugin. Please try to select an available address.',
  downloadTips2: 'Firefox users can right-click the link and select "Save As" to download the XPI package.',
  downloadTips3: 'Plugins may conflict with each other. Install only what you need.',
  downloadWarning:
    'Plugins for Zotero 6 and Zotero 7 may be incompatible. Please download the version corresponding to your Zotero version. For information about checking your Zotero version and installing plugins, please refer to:',
  pluginVersion: 'Plugin Version: ',
  releaseDate: 'Release Date: ',
  downloadCount: 'Downloads: ',
  downloadLink: 'Download Links: ',
  downloadLinks: 'Download Links',
  cantGetDownloadCount: 'Unable to fetch',
  downloadForZotero: 'Download plugin for Zotero {{ version }}',

  // Notification
  upgradeToZotero7Title: 'Upgrade to Zotero 7 Recommended',
  upgradeToZotero7Message:
    'Zotero 7 has been officially released. We recommend all users update to Zotero 7.<br /><br />Please check the <a href="/blog/posts/hello-zotero-7" class="el-link el-link--primary is-underline">Zotero 7 Update Guide</a>.',
  upgradeToZotero8Title: 'Update to Zotero 8 Recommended',
  upgradeToZotero8Message:
    'Zotero 8 has been officially released. We recommend all users update to Zotero 8.<br /><br />Please check the <a href="/blog/posts/zotero-8" class="el-link el-link--primary is-underline">Zotero 8 Update Guide</a>.',
  upgradeToZotero7UpdateGuide: 'Zotero 7 Update Guide',
  upgradeToZotero8UpdateGuide: 'Zotero 8 Update Guide',

  // Footer
  zoteroGroup: 'Zotero Chinese Community Groups',
  zoteroGroupNumbers:
    '913637964, 617148016, 893963769, 666489129, 145248977, 317995116, 962963257 (joining one group is sufficient). Learning alone without friends leads to ignorance.',
  feedback: 'If you have any suggestions or feedback about this page, please',
  fillForm: 'fill out the form',
  issueOnGithub: 'open an issue on GitHub',
  noMatchingPlugins: 'No matching plugins',
  compatibilityWarning:
    'About Zotero Plugins - Install Plugins',
}

const defaultLocaleInfo: Record<string, PluginLocaleData> = {
  zh: zhLocale,
  en: enLocale,
}

const overrides: Record<string, Partial<PluginLocaleData>> = {}

export function getPluginLocale(lang: string): PluginLocaleData {
  const fallbackLang = lang.split('-')[0]
  const defaultLocale = defaultLocaleInfo[lang] || defaultLocaleInfo[fallbackLang] || defaultLocaleInfo.zh

  const overrideLocale = overrides[lang] ?? overrides[fallbackLang] ?? {}

  return { ...defaultLocale, ...overrideLocale }
}
