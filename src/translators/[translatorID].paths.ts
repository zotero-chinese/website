import { listify } from "radash";
// import { data as translators } from "./data/translators.data";
import fs from "fs-extra";

export default {
  async paths() {
    //   const translators = await (await fetch('https://my-cms.com/blog-posts')).json()
    const translators = fs.readJsonSync(
      "src/translators/data/dashboard.json",
    ) as Translators;

    return listify(translators, (k, v) => ({ ...v, fileName: k })).map(
      (translator) => {
        return {
          params: {
            translatorID: translator.header.translatorID,
            metadata: {
              label: translator.zhLabel,
              creators: translator.header.creator,
              target: translator.header.target,
              type: translator.header.translatorType,
              lastUpdated: translator.header.lastUpdated,
            },
            trends: translator.trends.map((t) => ({
              timestamp: t.date,
              content: `${t.message} by ${t.author}`,
            })),
          },
          content: paraseTestCases(translator.testCases), // 原始 Markdown 或 HTML
        };
      },
    );
  },
};

function paraseTestCases(testCases: Translator["testCases"]) {
  let content = "";

  testCases.forEach((testCase) => {
    content += `::: details \`${testCase.url}\`

\`\`\`json
${JSON.stringify(testCase, null, 2)}
\`\`\`
:::
 `;
  });

  return content;
}
