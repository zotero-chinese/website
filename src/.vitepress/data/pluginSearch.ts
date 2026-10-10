import type { PluginInfo } from './pluginData'
import type { PluginDoc } from './pluginDocs.data'

/** Search source metadata and existing Chinese documentation without a second alias catalog. */
export function searchPlugins(
  plugins: PluginInfo[],
  query: string,
  docs: PluginDoc[],
): PluginInfo[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return plugins

  return plugins.filter((plugin) => {
    const text = [
      plugin.name,
      plugin.nameZh,
      plugin.description,
      plugin.summaryZh,
      plugin.repo,
      plugin.author.name,
      ...(plugin.keywords ?? []),
      ...docs.filter((doc) => doc.repo === plugin.repo.toLowerCase()).map((doc) => doc.title),
    ]
      .join(' ')
      .toLocaleLowerCase()
    return words.every((word) => text.includes(word))
  })
}
