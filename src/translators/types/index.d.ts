declare interface Translator {
  header: {
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
  };
  testCases: Array<any>;
  zhLabel: string;
  trends: Array<{
    author: string;
    date: string;
    message: string;
  }>;
}

declare interface Translators {
  [fileName: string]: Translator;
}
