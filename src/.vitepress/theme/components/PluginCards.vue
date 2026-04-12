<script setup lang="ts">
import type { PluginInfo } from '@data/plugins.data'
import type { Ref } from 'vue'

import { data as plugins } from '@data/plugins.data'
import { getPluginTags } from '@data/pluginTags'
import MarketSearch from '@theme/components/MarketSearch.vue'
import MarketTagsFilter from '@theme/components/MarketTagsFilter.vue'
import MarketToolBar from '@theme/components/MarketToolBar.vue'
import { usePluginLocale } from '@theme/composables/usePluginLocale'
import { syncRef, useUrlSearchParams } from '@vueuse/core'
import { useData } from 'vitepress'

import { computed, ref, toRef, watch } from 'vue'
import PluginAuthorCard from './PluginAuthorCard.vue'
import PluginCard from './PluginCard.vue'
import PluginDownloadModal from './PluginDownloadModal.vue'

const isShowDownload = ref(false)
const selectedPlugin = ref(undefined) as Ref<PluginInfo | undefined>

const locale = usePluginLocale()
const { lang } = useData()

const allTags = computed(() => getPluginTags(lang.value))

const query = useUrlSearchParams('hash-params', { removeFalsyValues: true })
const sortBy = toRef(query, 'sort', 'stars') as Ref<string>
const zotero = toRef(query, 'zotero', 'zotero9') as Ref<string>
const searchText = toRef(query, 'search', '') as Ref<string>
const selectedAuthor = toRef(query, 'author', '') as Ref<string>

const _selectedTags = toRef(query, 'tags', []) as Ref<string | string[]>
const selectedTags = ref([]) as Ref<string[]>
// 将 urlSearchParams.tags 由 string | string[] 转为 string[]
syncRef(_selectedTags, selectedTags, {
  transform: {
    ltr: left => [left].flat(),
  },
})

const filteredPlugins = computed(() => {
  let filtered = plugins

  // 筛选 Zotero 版本
  if (zotero.value !== '') {
    const selectedVersion = +zotero.value.replace('zotero', '')
    filtered = filtered.filter(p =>
      p.releases.some(r =>
        r.targetZoteroVersion.split(',').some(v => +v.trim() === selectedVersion),
      ),
    )
  }

  // 筛选关键词
  if (searchText.value !== '') {
    const searchTextLower = searchText.value.toLowerCase()
    filtered = filtered.filter((plugin) => {
      return (
        plugin.name.toLowerCase().includes(searchTextLower)
        || plugin.description.toLowerCase().includes(searchTextLower)
      )
    })
  }

  // 筛选标签
  if (selectedTags.value.length !== 0) {
    filtered = filtered.filter((plugin) => {
      const langSuffix = lang.value.startsWith('en') ? '_en' : '_zh'
      return selectedTags.value.every(tag =>
        plugin.tags?.some(t =>
          t === tag
          || t === `${tag}${langSuffix}`,
        ),
      )
    })
  }

  // 筛选作者
  if (selectedAuthor.value !== '') {
    filtered = filtered.filter((plugin) => {
      return plugin.author.name === selectedAuthor.value
    })
  }

  // 排序
  if (sortBy.value === 'name') {
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name))
  }
  else if (sortBy.value === 'stars') {
    return filtered.slice().sort((a, b) => b.stars - a.stars)
  }
  else if (sortBy.value === 'author') {
    return filtered
      .slice()
      .sort((a, b) => a.author.name.localeCompare(b.author.name))
  }
  return filtered
})

const authors = computed(() => {
  return [...new Set(plugins.map(plugin => plugin.author.name))].sort()
})

function showDownload(plugin: PluginInfo) {
  selectedPlugin.value = plugin
  isShowDownload.value = true
}

function setAuthorFilter(author: string) {
  selectedAuthor.value = author
}

function clearAuthorFilter() {
  selectedAuthor.value = ''
}

watch(zotero, (zotero) => {
  if (zotero === 'zotero6') {
    ElNotification({
      title: locale.value.upgradeToZotero7Title,
      dangerouslyUseHTMLString: true,
      message: locale.value.upgradeToZotero7Message,
      type: 'warning',
      duration: 10000,
      offset: 60,
    })
  }

  if (zotero === 'zotero7') {
    ElNotification({
      title: locale.value.upgradeToZotero8Title,
      dangerouslyUseHTMLString: true,
      message: locale.value.upgradeToZotero8Message,
      type: 'warning',
      duration: 10000,
      offset: 60,
    })
  }
})
</script>

<template>
  <MarketToolBar>
    <!-- Zotero 版本筛选 -->
    <el-select
      v-model="zotero"
      :placeholder="locale.zoteroVersion"
      size="large"
    >
      <template #prefix>
        <el-icon>
          <i-ep-filter />
        </el-icon>
      </template>
      <el-option :label="locale.zoteroAll" value="" />
      <el-option label="Zotero 6" value="zotero6" />
      <el-option label="Zotero 7" value="zotero7" />
      <el-option label="Zotero 8" value="zotero8" />
      <el-option label="Zotero 9" value="zotero9" />
      <el-option label="Zotero 10" value="zotero10" />
    </el-select>

    <!-- 排序 -->
    <el-select
      v-model="sortBy"
      :placeholder="locale.sortBy"
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
      <el-option :label="locale.sortByLastUpdated" value="lastUpdated" disabled />
    </el-select>

    <!-- 作者筛选 -->
    <el-select
      v-model="selectedAuthor"
      :placeholder="locale.author"
      size="large"
      clearable
    >
      <template #prefix>
        <el-icon>
          <i-ep-user />
        </el-icon>
      </template>
      <el-option key="all" :label="locale.authorAll" value="" />
      <el-option
        v-for="author in authors"
        :key="author"
        :label="author"
        :value="author"
      />
    </el-select>

    <!-- 搜索 -->
    <MarketSearch v-model="searchText" :placeholder="locale.searchPlaceholder" />
  </MarketToolBar>

  <!-- 标签筛选 -->
  <MarketTagsFilter v-model="selectedTags" :tags="allTags" />

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
        @show-download="showDownload"
        @filter-by-author="setAuthorFilter"
      />
    </el-col>
  </el-row>

  <!-- 空状态 -->
  <el-empty v-if="filteredPlugins.length === 0" :description="locale.noMatchingPlugins" />

  <!-- 下载页面 -->
  <PluginDownloadModal
    v-if="isShowDownload"
    v-model="isShowDownload"
    :selected-plugin="selectedPlugin"
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
        <el-link
          type="primary"
          href="https://github.com/zotero-chinese/zotero-plugins"
        >
          {{ locale.issueOnGithub }}
        </el-link>
        。
      </el-text>
    </p>
  </div>
</template>

<style scoped>
.plugin-list-footer {
  text-align: center;
  padding-top: 2rem;
  height: 100%;
}
</style>
