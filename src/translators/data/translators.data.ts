import { existsSync, readFileSync } from "fs";
import path from "path";
import { listify } from "radash";

const local_path = path.resolve("src/translators/data/dashboard.json"),
  remote_path =
    "https://github.com/l0o0/translators_CN/raw/master/data/dashboard.json";

declare const data: Translators;
export { data };

export default {
  async load() {
    const raw = await getRaw();
    return listify(raw, (k, v) => ({ ...v, fileName: k })).map((item) => {
      return { ...item.header, zhLabel: item.zhLabel };
    });
  },
};

async function getRaw(): Promise<Translators> {
  if (existsSync(local_path)) {
    return JSON.parse(readFileSync(local_path).toString());
  } else {
    console.log(
      "Local translators dashboard.json not found, will fetch from remote",
    );
    return (await fetch(remote_path)).json();
  }
}
