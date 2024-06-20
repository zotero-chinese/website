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
        const _a = a.title.match("GB"),
          _b = b.title.match("GB");
        // title 中包含 GB 的始终最前且逆序（如此可按标题长度递增）
        // 否则顺序
        if (_a && !_b) return -1;
        if (!_a && _b) return 1;
        if (_a && _b)
          return b.title.localeCompare(a.title, "zh", { numeric: true });
        return a.title.localeCompare(b.title, "zh", { numeric: true });
      });
  },
};
