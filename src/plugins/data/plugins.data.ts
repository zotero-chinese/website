import { existsSync, readFileSync } from "fs";
import path from "path";
import type { PluginInfo } from "../types/plugin-info";

const local_path = path.resolve("src/plugins/backend/dist/plugins.json"),
  remote_path =
    "https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/plugins.json";

declare const data: PluginInfo[];
export { data };

export default {
  async load() {
    if (existsSync(local_path)) {
      console.log("Local plugins.json found");
      return JSON.parse(readFileSync(local_path).toString());
    } else {
      console.log("Local plugins.json not found, will fetch from remote");
      return (await fetch(remote_path)).json();
    }
  },
};
