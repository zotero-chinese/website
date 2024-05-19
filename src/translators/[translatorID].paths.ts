import { listify } from "radash";
// import { data as translators } from "./data/translators.data";
import fs from "fs-extra";

export default {
  async paths() {
    const translators = fs.readJsonSync(
      "src/translators/data/dashboard.json",
    ) as Translators;

    return listify(translators, (k, v) => ({ ...v, fileName: k })).map(
      (translator) => {
        return {
          params: {
            translatorID: translator.header.translatorID,
            label: translator.zhLabel,
          },
        };
      },
    );
  },
};
