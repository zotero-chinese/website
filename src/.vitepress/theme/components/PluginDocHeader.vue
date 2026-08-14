<script setup lang="ts">
/**
 * 插件文档页头部信息栏。
 *
 * 由 markdownTransform 注入到带 `plugin:` frontmatter 的文档一级标题之后，
 * 展示官方下载地址、中文镜像（插件商店，deep-link 直达对应插件抽屉）与提交反馈入口。
 *
 * 文案仅面向中文文档（zh wiki），无需 i18n。
 */
import { computed } from 'vue'
import { usePluginDownloads } from '@theme/composables/usePluginDownloads'
// @ts-expect-error data 是 vitepress 的隐式导出
import { data as plugins } from '@data/plugins.data'
import type { PluginInfo } from '@data/plugins.data'
import GitHubIcon from './icons/GitHubIcon.vue'

const props = defineProps<{
  /** 插件仓库，如 windingwind/zotero-better-notes */
  repo: string
}>()

const repoRef = computed(() => props.repo)
const { full, failed } = usePluginDownloads(repoRef)

// 插件名优先取商店数据（构建期可得，SSR 即可渲染），其次取按需加载的完整数据
const storePlugin = computed(() =>
  (plugins as PluginInfo[]).find((p) => p.repo.toLowerCase() === props.repo.toLowerCase()),
)
const pluginName = computed(() => storePlugin.value?.name ?? full.value?.name ?? props.repo)
const githubReleaseUrl = computed(() => `https://github.com/${props.repo}/releases/latest`)
const issuesUrl = computed(() => `https://github.com/${props.repo}/issues/new`)
/** 中文镜像：插件商店，打开后自动弹出该插件的下载抽屉 */
const storeUrl = computed(() => `/plugins/#plugin=${encodeURIComponent(props.repo)}`)
</script>

<template>
  <div class="plugin-doc-header">
    <div class="info">
      <span class="name">{{ pluginName }}</span>
      <span v-if="full" class="meta">
        <el-icon>
          <i-ep-star-filled />
        </el-icon>
        <span>{{ full.stars }}</span>
        <el-divider direction="vertical" />
        <el-link
          :href="full.author.url"
          target="_blank"
          rel="noopener"
          class="author"
          :underline="false"
        >
          {{ full.author.name }}
        </el-link>
      </span>
    </div>
    <div class="actions">
      <el-button tag="a" :href="githubReleaseUrl" target="_blank" rel="noopener">
        <el-icon><GitHubIcon /></el-icon>
        <span>官方下载（GitHub Release）</span>
      </el-button>
      <el-button v-if="!failed" tag="a" :href="storeUrl">
        <el-icon><i-ep-shop /></el-icon>
        <span>中文镜像（插件商店）</span>
      </el-button>
      <el-button type="danger" tag="a" :href="issuesUrl" target="_blank" rel="noopener">
        <el-icon><i-ep-chat-dot-round /></el-icon>
        <span>提交反馈</span>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.plugin-doc-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 1rem 0 1.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
}

.info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.actions :deep(.el-button) {
  margin-left: 0;
}

.actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

@media (max-width: 640px) {
  .actions {
    width: 100%;
  }
}
</style>
