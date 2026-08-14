import { readRawPlugins, toPluginSummary, transformPlugins } from './pluginData'
import type { PluginInfo } from './pluginData'

declare const data: PluginInfo[]
export { data }

export type {
  PluginFullInfo,
  PluginInfo,
  PluginInfoBase,
  PluginTagType,
  ReleaseInfo,
  ReleaseInfoBase,
  ReleaseInfoSlim,
} from './pluginData'

export default {
  async load() {
    // 索引页仅加载精简字段，完整数据（全部版本与下载镜像）
    // 由 dataAssets 插件生成到 public/plugin-data/<repo>.json，按需 fetch
    return transformPlugins(readRawPlugins()).map(toPluginSummary)
  },
}
