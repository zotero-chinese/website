import { existsSync, readFileSync } from "fs";
import path from "path";

const local_path = path.resolve("src/plugins/source/backend/dist/shields.json"),
  remote_path =
    "https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/shields.json";

export default {
  async load() {
    if (existsSync(local_path)) {
      console.log("Local shields.json found");
      return JSON.parse(readFileSync(local_path).toString());
    } else {
      console.log("Local shields.json not found, will fetch from remote");
      return (await fetch(remote_path)).json();
    }
  },
};
