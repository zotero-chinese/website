import { existsSync, readFileSync } from "fs";
import path from "path";

const local_path = path.resolve("src/translators/data/dashboard.json"),
  remote_path =
    "https://github.com/l0o0/translators_CN/raw/master/data/dashboard.json";

declare const data: TranslatorLittle[];
export { data };

export default {
  async load() {
    const raw = await getRaw();
    return Object.values(raw).map((item) => {
      return {
        translatorID: item.header.translatorID,
        label: item.header.label,
        zhLabel: item.zhLabel,
        creator: item.header.creator,
        target: item.header.target,
        lastUpdated: item.header.lastUpdated,
        translatorType: item.header.translatorType,
        itemTypes: (() => {
          const itemTypes: Array<string> = [];
          item.testCases.forEach((testCase) => {
            if (typeof testCase.items == "string") {
              itemTypes.push(testCase.items);
            } else {
              itemTypes.push(...testCase.items.map((item) => item.itemType));
            }
          });
          return Array.from(new Set(itemTypes));
        })(),
      };
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
    return (await fetch(remote_path)).json() as unknown as Translators;
  }
}
