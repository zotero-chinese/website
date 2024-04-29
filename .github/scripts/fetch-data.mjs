import fs from "fs-extra";
import path from "path";
import { exit } from "process";

const data_list = [
  {
    local_path: "src/plugins/data/plugins.json",
    remote_url:
      "https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/plugins.json",
  },
  {
    local_path: "src/plugins/data/update-time.json",
    remote_url:
      "https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/shields.json",
  },
  {
    local_path: "src/plugins/data/charts.json",
    remote_url:
      "https://raw.githubusercontent.com/zotero-chinese/zotero-plugins/gh-pages/dist/charts.json",
  },
  {
    local_path: "src/translators/data/dashboard.json",
    remote_url:
      "https://raw.githubusercontent.com/l0o0/translators_CN/master/data/dashboard.json",
  },
];

const tasks = data_list.map(async (d) => {
  const data = await (await fetch(d.remote_url)).json();
  fs.writeJSONSync(path.resolve(d.local_path), data);
  console.log(`Download ${d.local_path} success!`);
});

Promise.all(tasks)
  .then(() => {
    console.log("Done!");
  })
  .catch((e) => {
    console.error(e);
    exit(1);
  });
