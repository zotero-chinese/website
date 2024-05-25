import { readFileSync } from "fs";
import path from "path";

const local_path = path.resolve("src/styles/data/styles.json");

declare const data: Style[];
export { data };

export default {
  async load() {
    return JSON.parse(readFileSync(local_path).toString());
  },
};
