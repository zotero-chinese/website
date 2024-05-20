const baseTypes = [
  { flag: 1, type: "导入转换器" },
  { flag: 2, type: "导出转换器" },
  { flag: 4, type: "网页转换器" },
  { flag: 8, type: "搜索转换器" },
];

export function useTranslatorType(code: number) {
  return baseTypes
    .filter((item) => (code & item.flag) !== 0)
    .map((item) => item.type);
}
