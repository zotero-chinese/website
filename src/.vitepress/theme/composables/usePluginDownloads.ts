/**
 * 插件下载数据（按需加载）。
 *
 * 完整插件数据（含全部版本与各镜像下载地址）由构建期脚本
 * 按仓库生成到 `public/plugin-data/<repo>.json`，此处按需 fetch。
 *
 * 供下载抽屉（PluginDownloadModal）与插件文档头部（PluginDocHeader）共用。
 */
import { ref, watch, type Ref } from 'vue'
import type { PluginFullInfo, ReleaseInfo } from '@data/plugins.data'

export function usePluginDownloads(repo: Ref<string | undefined>) {
  // 完整插件数据（含全部版本与下载信息）
  const full = ref<PluginFullInfo | null>(null)
  const loading = ref(false)
  const failed = ref(false)
  const loadedRepo = ref('')

  if (!import.meta.env.SSR) {
    watch(
      repo,
      async (r) => {
        if (!r) {
          full.value = null
          return
        }
        // 已有当前插件的数据时直接复用，否则重新拉取
        if (full.value && loadedRepo.value === r) return
        full.value = null
        loading.value = true
        failed.value = false
        try {
          const response = await fetch(`${import.meta.env.BASE_URL}plugin-data/${r}.json`)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          full.value = (await response.json()) as PluginFullInfo
          loadedRepo.value = r
        } catch {
          failed.value = true
        } finally {
          loading.value = false
        }
      },
      // 组件可能由 v-if 创建（创建时 repo 已就绪），需立即执行首次加载
      { immediate: true },
    )
  }

  /**
   * 各镜像下载地址。
   *
   * 优先使用数据中的原始地址（`github` 键的值可能是 Gitee 直链等，不能按固定格式推导）；
   * 仅当数据缺失时，才用 repo/tag/文件名兜底推导 GitHub 系列链接。
   */
  function buildXpiDownloadUrl(release: ReleaseInfo): Record<string, string> {
    const currentRepo = repo.value
    if (!currentRepo) return {}
    if (release.xpiDownloadUrl && Object.keys(release.xpiDownloadUrl).length > 0) {
      return release.xpiDownloadUrl
    }
    if (!release.xpiFileName) return {}
    const github = `https://github.com/${currentRepo}/releases/download/${release.tagName}/${release.xpiFileName}`
    return {
      github,
      ghProxy: `https://gh-proxy.org//${github}`,
      kgithub: `https://kkgithub.com/${currentRepo}/releases/download/${release.tagName}/${release.xpiFileName}`,
    }
  }

  return { full, loading, failed, buildXpiDownloadUrl }
}
