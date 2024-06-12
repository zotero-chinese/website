declare interface Translator {
  header: TranslatorHeader;
  testCases: Array<testCase>;
  zhLabel: string;
  trends: Array<{
    author: string;
    date: string;
    message: string;
  }>;
}

declare interface testCase {
  type: string;
  url?: string;
  input?: string;
  items: Array<{
    [key: string]: any;
    itemType: string;
    notes?: Array<string | { title?: string; note: string }>
    seeAlso?: Array<string>;
  }> | "multiple";
}

declare interface TranslatorHeader {
  translatorID: string;
  label: string;
  creator: string;
  target: string;
  minVersion: string;
  maxVersion: string;
  priority: number;
  inRepository: boolean;
  translatorType: 1 | 4 | 8 | 12;
  browserSupport: string;
  lastUpdated: string;
}

declare interface Translators {
  [fileName: string]: Translator;
}

declare interface TranslatorLittle
  extends Pick<
    TranslatorHeader,
    "translatorID" | "label" | "creator" | "target" | "lastUpdated"
  > {
  zhLabel: string;
  translatorType: Array<"导入转换器" | "导出转换器" | "网页转换器" | "搜索转换器">;
  itemTypes: Array<string>;
}
