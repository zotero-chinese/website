import type { UserConfig } from "vitepress";
import { markdown as _markdown } from "../../src/wiki/.vitepress/config/markdown";

import { footnote } from "@mdit/plugin-footnote";

export const markdown: UserConfig["markdown"] = {
  ..._markdown,
  config: (md) => {
    md.use(footnote);
  },
};
