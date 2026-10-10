<script setup lang="ts">
import type { PluginInfo } from '@data/plugins.data'

import { LATEST_ZOTERO_BETA_VERSION, LATEST_ZOTERO_STABLE_VERSION } from '@data/constant'
import { data as plugins } from '@data/plugins.data'
import { data as pluginDocs } from '@data/pluginDocs.data'
import { searchPlugins } from '@data/pluginSearch'
import { getPluginTags } from '@data/pluginTags'
import MarketSearch from '@theme/components/MarketSearch.vue'
import MarketTagsFilter from '@theme/components/MarketTagsFilter.vue'
import MarketToolBar from '@theme/components/MarketToolBar.vue'
import { usePluginLocale } from '@theme/composables/usePluginLocale'
import { useUrlSearchParams } from '@vueuse/core'

import { useData } from 'vitepress'
import { computed, ref, watch } from 'vue'
import PluginAuthorCard from './PluginAuthorCard.vue'
import PluginCard from './PluginCard.vue'
import PluginDownloadModal from './PluginDownloadModal.vue'

const isShowDownload = ref(false)
const selectedPlugin = ref<PluginInfo>()

const locale = usePluginLocale()
const { lang } = useData()

const allTags = computed(() => getPluginTags(lang.value))

const query = useUrlSearchParams('hash-params', { removeFalsyValues: false })

// URL parameters may be repeated; a single-value control uses the first value.
function stringParam(key: string, fallback = '') {
  return computed({
    get: () => {
      const value = query[key]
      return (Array.isArray(value) ? value[0] : value) ?? fallback
    },
    set: (value: string) => {
      query[key] = value
    },
  })
}

const sortBy = stringParam('sort', 'stars')
const zotero = stringParam('zotero', String(LATEST_ZOTERO_STABLE_VERSION))
const allSupportedZotero = Array.from({ length: LATEST_ZOTERO_BETA_VERSION - 5 }, (_, i) =>
  String(i + 6),
)
const searchText = stringParam('search')
const selectedAuthor = stringParam('author')
const pluginParam = stringParam('plugin')
const selectedTags = computed({
  get: () => [query.tags ?? []].flat().filter(Boolean),
  set: (tags: string[]) => {
    if (tags.length) query.tags = tags
    else delete query.tags
  },
})

const matchingPlugins = computed(() => {
  const langSuffix = lang.value.startsWith('en') ? '_en' : '_zh'
  return searchPlugins(plugins, searchText.value, pluginDocs).filter(
    (plugin) =>
      (!selectedAuthor.value || plugin.author.name === selectedAuthor.value) &&
      selectedTags.value.every((tag) =>
        plugin.tags.some((t) => t === tag || t === `${tag}${langSuffix}`),
      ),
  )
})

const filteredPlugins = computed(() => {
  const filtered = matchingPlugins.value.filter(
    (plugin) =>
      !zotero.value ||
      plugin.releases.some((release) =>
        release.targetZoteroVersion.split(',').some((v) => v.trim() === zotero.value),
      ),
  )

  // 排序
  if (sortBy.value === 'name') {
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'stars') {
    return filtered.sort((a, b) => b.stars - a.stars)
  } else if (sortBy.value === 'author') {
    return filtered.sort((a, b) => a.author.name.localeCompare(b.author.name))
  } else if (sortBy.value === 'lastUpdated') {
    return filtered.sort((a, b) => {
      const aLatest = a.lastUpdated ? +new Date(a.lastUpdated) : 0
      const bLatest = b.lastUpdated ? +new Date(b.lastUpdated) : 0
      return bLatest - aLatest
    })
  }
  return filtered
})

const authors = computed(() => {
  return [...new Set(plugins.map((plugin) => plugin.author.name))].sort()
})

function showDownload(plugin: PluginInfo) {
  selectedPlugin.value = plugin
  isShowDownload.value = true
}

// 打开 `#plugin=<repo>` 链接时自动弹出对应插件的下载抽屉；
// 从全量数据中查找（不受筛选条件影响），打开后移除参数，避免刷新页面重复弹出
watch(
  pluginParam,
  (repo) => {
    if (!repo) return
    const plugin = plugins.find((p) => p.repo.toLowerCase() === repo.toLowerCase())
    if (plugin) showDownload(plugin)
    delete query.plugin
  },
  { immediate: true },
)

function setAuthorFilter(author: string) {
  selectedAuthor.value = author
}

function clearAuthorFilter() {
  selectedAuthor.value = ''
}

const hasFilters = computed(
  () =>
    !!searchText.value || !!selectedAuthor.value || selectedTags.value.length > 0 || !!zotero.value,
)

function clearFilters() {
  delete query.search
  delete query.author
  delete query.tags
  zotero.value = ''
}
</script>

<template>
  <MarketToolBar class="plugin-toolbar">
    <!-- Zotero 版本筛选 -->
    <el-select
      v-model="zotero"
      :placeholder="locale.zoteroVersion"
      :aria-label="locale.zoteroVersion"
      :empty-values="[null, undefined]"
      size="large"
    >
      <template #prefix>
        <el-icon>
          <i-ep-filter />
        </el-icon>
      </template>
      <el-option :label="locale.zoteroAll" value="" />
      <el-option
        v-for="v in allSupportedZotero"
        :key="v"
        :label="`Zotero ${v}${+v === LATEST_ZOTERO_BETA_VERSION ? ' Beta' : ''}`"
        :value="v"
      />
    </el-select>

    <!-- 排序 -->
    <el-select
      v-model="sortBy"
      :placeholder="locale.sortBy"
      :aria-label="locale.sortBy"
      size="large"
    >
      <template #prefix>
        <el-icon>
          <i-ep-sort />
        </el-icon>
      </template>
      <el-option :label="locale.sortByStars" value="stars" />
      <el-option :label="locale.sortByName" value="name" />
      <el-option :label="locale.sortByAuthor" value="author" />
      <el-option :label="locale.sortByLastUpdated" value="lastUpdated" />
    </el-select>

    <!-- 作者筛选 -->
    <el-select
      v-model="selectedAuthor"
      :placeholder="locale.author"
      :aria-label="locale.author"
      value-on-clear=""
      size="large"
      filterable
      clearable
    >
      <template #prefix>
        <el-icon>
          <i-ep-user />
        </el-icon>
      </template>
      <el-option key="all" :label="locale.authorAll" value="" />
      <el-option v-for="author in authors" :key="author" :label="author" :value="author" />
    </el-select>

    <!-- 搜索 -->
    <MarketSearch
      v-model="searchText"
      class="plugin-search"
      :placeholder="locale.searchPlaceholder"
    />
  </MarketToolBar>

  <!-- 标签筛选 -->
  <MarketTagsFilter v-model="selectedTags" :tags="allTags" />

  <div class="plugin-results">
    <div class="plugin-result-count">
      <el-text role="status" aria-live="polite">{{
        locale.resultCount.replace('{count}', String(filteredPlugins.length))
      }}</el-text>
      <el-button v-if="hasFilters" text type="primary" @click="clearFilters">{{
        locale.clearFilters
      }}</el-button>
    </div>
    <span class="plugin-listing-request">
      <el-text type="info">{{ locale.requestListingPrompt }}</el-text>
      <el-link
        type="primary"
        href="https://github.com/zotero-chinese/zotero-plugins/issues/new"
        target="_blank"
        rel="noopener noreferrer"
        >{{ locale.requestListing }}</el-link
      >
    </span>
  </div>

  <!-- 作者信息卡片 -->
  <PluginAuthorCard
    v-if="selectedAuthor"
    :author-name="selectedAuthor"
    :plugins="filteredPlugins"
    @clear="clearAuthorFilter"
  />

  <!-- 插件卡片列表 -->
  <el-row>
    <el-col
      v-for="plugin in filteredPlugins"
      :key="plugin.repo"
      :xs="24"
      :sm="12"
      :md="8"
      :lg="6"
      :xl="4"
    >
      <PluginCard
        :plugin="plugin"
        :show-last-updated="sortBy === 'lastUpdated'"
        @show-download="showDownload"
        @filter-by-author="setAuthorFilter"
      />
    </el-col>
  </el-row>

  <!-- 空状态 -->
  <el-empty v-if="filteredPlugins.length === 0" :description="locale.noMatchingPlugins">
    <p>
      <el-text type="info">{{ locale.searchHelp }}</el-text>
    </p>
    <el-button v-if="zotero && matchingPlugins.length" type="primary" @click="zotero = ''">
      {{ locale.searchAllVersions.replace('{count}', String(matchingPlugins.length)) }}
    </el-button>
  </el-empty>

  <!-- 下载页面 -->
  <PluginDownloadModal
    v-if="isShowDownload && selectedPlugin"
    v-model="isShowDownload"
    :selected-plugin="selectedPlugin"
    :zotero-version="zotero"
  />

  <div class="plugin-list-footer">
    <p>
      <el-text>
        {{ locale.zoteroGroup }}
        {{ locale.zoteroGroupNumbers }}
      </el-text>
    </p>
    <p>
      <el-text>
        {{ locale.feedback }}
        <el-link type="primary" href="https://www.kdocs.cn/wo/sl/v14cwJXX">
          {{ locale.fillForm }}
        </el-link>
        /
        <el-link type="primary" href="https://github.com/zotero-chinese/zotero-plugins/issues">
          {{ locale.issueOnGithub }}
        </el-link>
        。
      </el-text>
    </p>
  </div>
</template>

<style scoped>
.plugin-toolbar .plugin-search {
  max-width: 28rem;
}

.plugin-results,
.plugin-result-count,
.plugin-listing-request {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plugin-results {
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 0.5rem;
}

@media (max-width: 800px) {
  .plugin-toolbar .plugin-search {
    max-width: none;
  }
}

.plugin-list-footer {
  text-align: center;
  padding-top: 2rem;
  height: 100%;
}
</style>
