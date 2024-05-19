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
  items: Array<{ [key: string]: any; itemType: string }> | "multiple";
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
}
