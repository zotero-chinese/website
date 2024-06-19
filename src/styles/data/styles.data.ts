import fs from "fs-extra";

// const local_path = path.resolve("src/styles/data/styles.json");

declare const data: Style[];
export { data };

export default {
  watch: ["../detail/src/**/metadata.json"],
  load(watchedFiles: string[]) {
    // watchFiles 是一个所匹配文件的绝对路径的数组。

    return watchedFiles
      .map((file) => {
        return fs.readJsonSync(file) as Style;
      })
      .sort((a, b) => {
        // title 中包含 GB 的始终最前，否则按预览顺序排序
        if (a.title.match("GB")) return -1;
        if (b.title.match("GB")) return 1;
        return a.title.localeCompare(b.title);
      });
  },
};
