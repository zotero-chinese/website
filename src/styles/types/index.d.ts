declare interface StyleInfo {
  style_class: string
  title: string
  id: string
  link_self?: string
  link_template?: string
  link_documentation?: string
  author?: {
    name?: string
    email?: string
  }[]
  contributor?: {
    name?: string
    email?: string
  }[]
  citation_format?: string
  field?: string
  summary?: string
  updated?: string
}

interface StyleTestResult {
  citations: string
  bibliography: string
}

interface StyleCustomFields {
  tags: StyleTagType[]
}

type StyleTagType =
  | '姓名大写'
  | '姓名小写'
  | '名缩写'
  | '省略3人以上'
  | '有标题'
  | '无标题'
  | '期刊全称'
  | '期刊缩写'
  | '无DOI'
  | '无URL'
  | '测试'

interface StyleFullResult
  extends StyleInfo,
  StyleTestResult,
  StyleCustomFields {}

interface Style extends NonNullable<StyleFullResult> {}
