# SEO 配置与维护指南

本站的 SEO 相关逻辑集中在 `src/.vitepress/config/transform.config.ts`，另有两处配套改动：

- `src/public/robots.txt`：爬虫协议与 sitemap 声明
- `.github/scripts/seo-push.ts`：向百度 / 必应主动推送 URL

## 一、站点验证（让搜索引擎确认你是站长）

完成验证后才能使用「主动推送」等加速工具。验证方式是向 `head` 注入一个 meta 标签，
本站已将其接到环境变量，你只需在 Netlify 或 GitHub Actions 中填入值即可，不必改代码。

| 平台   | 环境变量                   | 获取位置                                                                                                   |
| ------ | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 百度   | `BAIDU_SITE_VERIFICATION`  | [百度搜索资源平台](https://ziyuan.baidu.com/site) → 添加站点 → 完整验证 → HTML 标签验证，取 `content` 的值 |
| Google | `GOOGLE_SITE_VERIFICATION` | [Google Search Console](https://search.google.com/search-console) → 网址前缀 → HTML 标记                   |
| 必应   | `BING_SITE_VERIFICATION`   | [Bing Webmaster Tools](https://www.bing.com/webmasters) → 验证 → 元标记                                    |

> 百度推荐优先使用 **CNAME 验证**（在 `_redirects` 已验证的前提下），若 CNAME 与 HTML 标签冲突，
> 以平台要求为准。HTML 标签验证的 token 有效期通常为一个月，长期使用建议改用 CNAME 或文件验证。

## 二、主动推送（把收录周期从数周缩短到分钟级）

### 百度普通收录

1. 完成站点验证后，进入 [普通收录](https://ziyuan.baidu.com/linksubmit/index) → 「API 提交」，
   复制接口地址中的 `token` 参数。
2. 将该 token 配置为仓库 Secret `BAIDU_PUSH_TOKEN`（Settings → Secrets and variables → Actions）。
3. 之后每次 `main` 分支构建成功后，`seo-push` job 都会推送「新增 / 变更 / 到期重推」的 URL。

本地手动推送：

```bash
pnpm build                                    # 先生成 sitemap
BAIDU_PUSH_TOKEN=xxx pnpm seo:push            # 增量推送（新增 + 变更 + 到期重推）
BAIDU_PUSH_TOKEN=xxx pnpm seo:push --limit 10 # 只推优先级最高的 10 条
BAIDU_PUSH_TOKEN=xxx pnpm seo:push --all      # 忽略状态，按优先级全量推送
pnpm seo:push --dry-run                       # 只打印筛选结果，不发请求
```

#### 接口的坑

`site` 参数必须是**纯域名**，不能带协议。传 `https://zotero-chinese.com` 会返回
`{"error":400,"message":"site init fail"}`，看起来像是「站点没验证」，实际只是参数写法不对。
脚本已统一用 `new URL(siteUrl).host` 生成该参数。

另一个坑：提交条数 **超过当日剩余配额时，百度会整批拒绝**（`over quota`），不会部分接收。
所以脚本首批只发 `SEO_PROBE_SIZE`（默认 10）条，拿到响应里的 `remain` 再按剩余额度扩容；
首次运行时也不会因为「不知道今天还剩多少」而白白浪费一天。

#### 配额与推送顺序

百度普通收录的每日配额与站点权重挂钩，本站实测为 **10 条/天**（并非「验证后就有 100 条」）。
若每轮都全量推 571 条，结果是每天只有排在最前面的 10 条进队列、而且天天推同 10 条，
后面的页面永远轮不到。现在的策略是：

1. **增量筛选**：状态文件记录每个 URL 的 `lastmod` 与 `pushedAt`，只推三类——
   没推过的（新增）、`lastmod` 变了的（内容变更）、推过超过 `SEO_RETRY_DAYS`（默认 90）天的。
2. **优先级排序**：首页与 `/plugins/`、`/styles/`、`/translators/` 三个列表页最先，
   其次是教程目录与正文；`/styles/<样式名>/`（361 条）与 `/translators/<id>`（100 条）
   这类长尾页排在最后。顺序由 `seo-push.ts` 的 `URL_PRIORITY` 定义。
3. **余量回填**：当天新增/变更不足配额时，用剩余额度按优先级回填到期页面，不让额度作废。

稳态行为：每天用满配额（新变更优先，其次轮转重推），而不是「跑完一轮就退休」。

#### 状态文件与清除

状态默认写到 `.seo-push-state.json`（可用 `SEO_STATE_PATH` 覆盖，已加入 `.gitignore`）。
CI 中用 `actions/cache/restore` 与 `actions/cache/save` 持久化，`restore-keys` 滚动承接前一天的记录。

- 状态丢失只会**退化为全量推送**（浪费一点配额，但不会推错页面）；
- 已从 sitemap 中消失的 URL 会自动从状态中清理，文件不会无限膨胀；
- 想强制重推全部页面：删掉状态文件，或用 `pnpm seo:push --all`。

#### 已知限制

`/translators/<id>` 这类动态路由页面在 sitemap 中没有 `lastmod`，无法判断内容是否变化，
只能按 TTL 定期重试。同理，`/plugins/`、`/styles/` 的正文来自构建期拉取的数据，
而 `lastmod` 取自模板文件的提交时间——**数据变了但模板没动时不会触发重推**，
这类页面靠 90 天 TTL 兼底。

### 必应 IndexNow

1. 生成一个 8–128 位的 key（如 `openssl rand -hex 16`）。
2. 将 key 写入 `src/public/<key>.txt`，文件内容即 key 本身。
3. 配置仓库 Secret `INDEXNOW_KEY` 为该 key。

IndexNow 同时被 Bing、Yandex、Naver 等采用，一次推送多方生效。
IndexNow 没有配额限制（单次 1 万条），因此脚本对它**不做增量筛选**，每次发送完整 URL 列表，
行为更可预期。

## 三、当前已实现的优化项

| 项目          | 说明                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `robots.txt`  | 此前为 404；现已声明 sitemap，并区分百度 / 神马 / 搜狗                                                                                            |
| `sitemap.xml` | 按 URL 去重，排除仓库自述、行为准则等无索引价值的页面；每次构建回填 `<lastmod>`（来自 git 提交时间，覆盖三个子模块）                              |
| 主动推送      | 增量筛选（`lastmod` + `pushedAt`）、按页面价值排序、余量回填与 90 天 TTL 重推；状态文件由 `actions/cache` 持久化                                  |
| `canonical`   | 每页输出绝对地址，收敛 `github.io` 与 Netlify 预览站的重复内容                                                                                    |
| `<title>`     | 每页唯一。CSL 样式页此前 318 页标题全部为「Zotero 中文社区」，现按样式名生成                                                                      |
| `description` | 每页唯一。此前 524 页共用「Zotero 中文维护小组」，现按 frontmatter → 正文首段 → 落地页模板逐级生成                                                |
| `keywords`    | 修正 VitePress 配置中误用 `property` 的问题（应为 `name`）                                                                                        |
| Open Graph    | `og:url` / `og:image` 改为绝对地址，并补充 `og:site_name`、`og:locale` 与 Twitter 卡片                                                            |
| `hreflang`    | 中英文页面互相声明，并给出 `x-default`                                                                                                            |
| JSON-LD       | 首页输出 `WebSite`（含 `SearchAction`）与 `Organization`；内容页输出 `TechArticle` / `WebPage` 与 `BreadcrumbList`                                |
| 服务端渲染    | 插件商店、CSL 样式列表、转换器列表此前整页包在 `<ClientOnly>` 内，HTML 中只有标题；现改为服务端渲染（插件排行榜因 Highcharts 限制仍为客户端渲染） |
| 重复路由      | 修复转换器 ID 重复导致的 URL 覆盖，以及 `en/wiki/` 占位页与 `/user-guide/` 的路由冲突                                                             |

## 四、不改代码即可推进的事项

技术层已就绪后，排名提升主要取决于以下运营动作：

1. **提交 sitemap**：在百度搜索资源平台「普通收录 → sitemap」提交 `https://zotero-chinese.com/sitemap.xml`，
   必应和 Google 同理。
2. **外部链接**：搜索引擎对「zotero 中文」的判断高度依赖锚文本。论坛（V2EX、知乎、小木虫）、
   高校图书馆资源页、GitHub 仓库 README 中的链接都应使用「Zotero 中文社区」作为锚文本，
   而非「这里」或裸 URL。
3. **保持内容更新**：`lastmod` 由 git 提交时间生成（`buildEnd` 阶段回填 `sitemap.xml`，
   覆盖主仓库与 wiki / styles / blog 三个子模块），定期更新文档会让爬虫提高抓取频率。
4. **301 收敛**：确认 `zotero-zh.netlify.app`、`zotero-chinese.github.io` 等入口都 301 到主域
   （`_redirects` 已处理 Netlify，GitHub Pages 需确认其设置）。
