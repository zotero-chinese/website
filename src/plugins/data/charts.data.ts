import { existsSync, readFileSync } from "fs";
import path from "path";

const local_path = path.resolve("src/plugins/data/charts.json"),
  remote_path =
    "https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/charts.json";

export default {
  async load() {
    if (existsSync(local_path)) {
      return JSON.parse(readFileSync(local_path).toString());
    } else {
      console.log("Local charts.json not found, will fetch from remote");
      return (await fetch(remote_path)).json();
    }
  },
};
