<script setup lang="ts">
/**
 * 插件文档页头部信息栏。
 *
 * 由 markdownTransform 注入到 user-guide/plugins/ 目录下的所有文档一级标题之后；
 * 插件仓库取自文档 frontmatter 的 `plugin` 字段，未标注时组件整体隐藏
 * （about-plugin、translate/* 等无标注文档不受影响）。
 *
 * 展示插件名称、Stars、作者、兼容性（适配 Zotero 版本）与最近更新时间，
 * 以及「官网 / 下载 / 反馈」三个操作入口；下载跳转插件商店抽屉
 * （deep-link，抽屉内提供全部下载渠道）。
 * 文案仅面向中文文档（zh wiki），无需 i18n。
 */
import { computed } from 'vue'
import { useData } from 'vitepress'
import { usePluginDownloads } from '@theme/composables/usePluginDownloads'
import { data as plugins } from '@data/plugins.data'
import type { PluginInfo } from '@data/plugins.data'
import GitHubIcon from './icons/GitHubIcon.vue'

const { frontmatter } = useData()

/** 插件仓库：文档 frontmatter 的 `plugin` 字段，如 windingwind/zotero-better-notes */
const repo = computed<string | undefined>(() => {
  const r = frontmatter.value.plugin
  return typeof r === 'string' && r ? r : undefined
})
const repoRef = computed(() => repo.value)
const { full, failed } = usePluginDownloads(repoRef)

// 元数据优先取商店数据（构建期可得，SSR 即可渲染），其次取按需加载的完整数据
const storePlugin = computed(() =>
  (plugins as PluginInfo[]).find((p) => p.repo.toLowerCase() === repo.value?.toLowerCase()),
)
const pluginName = computed(() => storePlugin.value?.name ?? full.value?.name ?? repo.value ?? '')
const stars = computed(() => storePlugin.value?.stars ?? full.value?.stars)
const author = computed(() => storePlugin.value?.author ?? full.value?.author)
/** 适配的 Zotero 版本（如 "7,8" → "7、8"） */
const compatibility = computed(() => {
  const raw =
    storePlugin.value?.releases[0]?.targetZoteroVersion ??
    full.value?.releases[0]?.targetZoteroVersion
  return raw ? raw.replaceAll(',', '、') : undefined
})
/** 最近更新时间（ISO 8601） */
const lastUpdated = computed(
  () => storePlugin.value?.lastUpdated ?? full.value?.releases[0]?.releaseDate,
)
const updatedAt = computed(() =>
  lastUpdated.value ? new Date(lastUpdated.value).toLocaleDateString('zh-CN') : undefined,
)

const homepageUrl = computed(() => (repo.value ? `https://github.com/${repo.value}` : ''))
const issuesUrl = computed(() => (repo.value ? `https://github.com/${repo.value}/issues/new` : ''))
/** 下载：跳转插件商店并自动弹出该插件的下载抽屉 */
const storeUrl = computed(() =>
  repo.value ? `/plugins/#plugin=${encodeURIComponent(repo.value)}` : '',
)
</script>

<template>
  <div v-if="repo" class="plugin-doc-header">
    <div class="info">
      <span class="name">{{ pluginName }}</span>
      <span class="meta">
        <template v-if="stars !== undefined">
          <el-icon>
            <i-ep-star-filled />
          </el-icon>
          <span>{{ stars }}</span>
        </template>
        <template v-if="author">
          <el-divider direction="vertical" />
          <el-link
            :href="author.url"
            target="_blank"
            rel="noopener"
            class="author"
            :underline="false"
          >
            {{ author.name }}
          </el-link>
        </template>
        <template v-if="compatibility">
          <el-divider direction="vertical" />
          <span>兼容性：Zotero {{ compatibility }}</span>
        </template>
        <template v-if="updatedAt">
          <el-divider direction="vertical" />
          <span>更新于 {{ updatedAt }}</span>
        </template>
      </span>
    </div>
    <div class="actions">
      <el-button tag="a" :href="homepageUrl" target="_blank" rel="noopener">
        <el-icon><GitHubIcon /></el-icon>
        <span>官网</span>
      </el-button>
      <el-button v-if="!failed" tag="a" :href="storeUrl">
        <el-icon><i-ep-download /></el-icon>
        <span>下载</span>
      </el-button>
      <el-button tag="a" :href="issuesUrl" target="_blank" rel="noopener">
        <el-icon><i-ep-chat-dot-round /></el-icon>
        <span>反馈</span>
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
  flex-wrap: wrap;
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
  flex-wrap: wrap;
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
