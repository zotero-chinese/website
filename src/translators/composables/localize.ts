const itemTypes = {
  note: "笔记",
  annotation: "注释",
  attachment: "附件",
  book: "图书",
  bookSection: "图书章节",
  journalArticle: "期刊文章",
  magazineArticle: "杂志文章",
  newspaperArticle: "报纸文章",
  thesis: "学位论文",
  letter: "信件",
  manuscript: "手稿",
  interview: "采访稿",
  film: "电影",
  artwork: "艺术品",
  webpage: "网页",
  report: "报告",
  bill: "法案",
  case: "司法案例",
  hearing: "听证会",
  patent: "专利",
  statute: "法律",
  email: "电子邮件",
  map: "地图",
  blogPost: "博客帖子",
  instantMessage: "即时消息",
  forumPost: "论坛帖子",
  audioRecording: "音频",
  presentation: "演示文档",
  videoRecording: "视频",
  tvBroadcast: "电视广播",
  radioBroadcast: "电台广播",
  podcast: "播客",
  computerProgram: "软件",
  conferencePaper: "会议论文",
  document: "文档",
  encyclopediaArticle: "百科条目",
  dictionaryEntry: "词条",
  preprint: "预印本",
  dataset: "数据集",
  standard: "标准",
};

const itemFields = {
  itemType: "条目类型",
  title: "标题",
  dateAdded: "添加日期",
  dateModified: "修改日期",
  source: "来源",
  notes: "笔记",
  tags: "标签",
  attachments: "附件",
  related: "相关",
  url: "网址",
  rights: "版权",
  series: "系列",
  volume: "卷次",
  issue: "期号",
  edition: "版本",
  place: "地点",
  publisher: "出版社",
  pages: "页码",
  ISBN: "ISBN",
  publicationTitle: "期刊",
  ISSN: "ISSN",
  date: "日期",
  section: "条文序号",
  callNumber: "索书号",
  archiveLocation: "存档位置",
  distributor: "分发者",
  extra: "其他",
  journalAbbreviation: "刊名简称",
  DOI: "DOI",
  accessDate: "访问时间",
  seriesTitle: "系列标题",
  seriesText: "系列描述",
  seriesNumber: "系列编号",
  institution: "机构组织",
  reportType: "报告类型",
  code: "法典",
  session: "会期",
  legislativeBody: "立法机构",
  history: "历史",
  reporter: "报告系统",
  court: "审判法院",
  numberOfVolumes: "总卷数",
  committee: "委员会",
  assignee: "受让人/所有权人",
  patentNumber: "专利号",
  priorityNumbers: "优先申请号",
  issueDate: "公告日期",
  references: "参考文献",
  legalStatus: "法律状态",
  codeNumber: "法典编号",
  artworkMedium: "艺术品媒介",
  number: "号码",
  artworkSize: "艺术品尺寸",
  libraryCatalog: "文库编目",
  videoRecordingFormat: "视频格式",
  interviewMedium: "采访媒体",
  letterType: "信件类型",
  manuscriptType: "手稿类型",
  mapType: "地图类型",
  scale: "比例",
  thesisType: "论文类型",
  websiteType: "网站类型",
  audioRecordingFormat: "音频格式",
  label: "标记",
  presentationType: "演稿类型",
  meetingName: "会议名称",
  studio: "工作室",
  runningTime: "时长",
  network: "网络",
  postType: "帖子类型",
  audioFileType: "音频文件类型",
  versionNumber: "版本",
  system: "系统",
  company: "公司",
  conferenceName: "会议名称",
  encyclopediaTitle: "百科标题",
  dictionaryTitle: "词典标题",
  language: "语言",
  programmingLanguage: "编程语言",
  university: "大学",
  abstractNote: "摘要",
  websiteTitle: "网站标题",
  reportNumber: "报告编号",
  billNumber: "法案编号",
  codeVolume: "法典卷次",
  codePages: "法典页码",
  dateDecided: "裁判时间",
  reporterVolume: "报告系统卷次",
  firstPage: "起始页",
  documentNumber: "文档编号",
  dateEnacted: "颁布日期",
  publicLawNumber: "文件号",
  country: "国家",
  applicationNumber: "申请号",
  forumTitle: "论坛/列表服务标题",
  episodeNumber: "集数",
  blogTitle: "博客标题",
  medium: "媒体",
  caseName: "案例名称",
  nameOfAct: "法律名称",
  subject: "主题",
  proceedingsTitle: "会议论文集标题",
  bookTitle: "书名",
  shortTitle: "短标题",
  docketNumber: "案号",
  numPages: "总页数",
  programTitle: "节目名称",
  issuingAuthority: "颁发机构",
  filingDate: "申请日期",
  genre: "流派",
  archive: "档案",
  attachmentPDF: "PDF附件",
  repository: "仓库",
  repositoryLocation: "仓库位置",
  archiveID: "存档ID",
  citationKey: "引用关键词",
  identifier: "识别符",
  type: "类型",
  format: "格式",
  status: "状态",
  authority: "主管机构",
  organization: "组织",
  feed: "订阅",
};

const creatorTypes = {
  author: "作者",
  contributor: "贡献者",
  editor: "编辑",
  translator: "译者",
  seriesEditor: "丛书编辑",
  interviewee: "采访对象",
  interviewer: "采访者",
  director: "导演",
  scriptwriter: "编剧",
  producer: "制片人",
  castMember: "演员阵容",
  sponsor: "发起人",
  counsel: "顾问",
  inventor: "发明人",
  attorneyAgent: "律师/代理人",
  recipient: "接收者",
  performer: "表演者",
  composer: "创作者",
  wordsBy: "作词",
  cartographer: "制图人",
  programmer: "程序员",
  artist: "艺术家",
  commenter: "评论人",
  presenter: "报告人",
  guest: "宾客",
  podcaster: "播客",
  reviewedAuthor: "审稿人",
  cosponsor: "共同发起人",
  bookAuthor: "图书作者",
};

const baseTypes = [
  { flag: 1, type: "导入转换器" },
  { flag: 2, type: "导出转换器" },
  { flag: 4, type: "网页转换器" },
  { flag: 8, type: "搜索转换器" },
];

function useTranslatorType(code: number) {
  return baseTypes
    .filter((item) => (code & item.flag) !== 0)
    .map((item) => item.type);
}

function useItemType(itemType: string) {
  return itemType == "multiple"
    ? "多个条目"
    : itemTypes[itemType as keyof typeof itemTypes];
}

function useItemField(field: string) {
  return itemFields[field as keyof typeof itemFields];
}

function useCreatorType(creatorType: string) {
  return creatorTypes[creatorType as keyof typeof creatorTypes];
}

const useSortedItemTypes = (a: string, b: string) => {
  if (a === useItemType("multiple")) {
    return 1;
  }
  if (b === useItemType("multiple")) {
    return -1;
  }
  return a.localeCompare(b, "zh");
};

export {
  useTranslatorType,
  useItemType,
  useItemField,
  useCreatorType,
  useSortedItemTypes,
};
