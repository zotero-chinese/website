import type { DefaultTheme } from "vitepress";
import { sidebar as wikiSideBar } from "../../src/wiki/.vitepress/config/sidebar";

export const sidebar: DefaultTheme.Sidebar = {
  ...wikiSideBar,
  "/": [
    { text: "关于", link: "/about" },
    { text: "贡献者名单", link: "/contributors" },
  ],
};
