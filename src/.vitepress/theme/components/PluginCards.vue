<script setup lang="ts">
import { type Ref, computed, ref, toRef } from 'vue'
import { syncRef, useUrlSearchParams } from '@vueuse/core'

import MarketSearch from '@theme/components/MarketSearch.vue'
import MarketTagsFilter from '@theme/components/MarketTagsFilter.vue'
import MarketToolBar from '@theme/components/MarketToolBar.vue'
import { data as plugins } from '@data/plugins.data'
import type { PluginInfo, PluginTagType } from '@data/plugins.data'
import { tags as allTags } from '@data/pluginTags'

import PluginCard from './PluginCard.vue'
import PluginDownloadModal from './PluginDownloadModal.vue'

const isShowDownload = ref(false)
const selectedPlugin = ref(undefined) as Ref<PluginInfo | undefined>

const query = useUrlSearchParams('hash-params', { removeFalsyValues: true })
const sortBy = toRef(query, 'sort', 'stars') as Ref<string>
const zotero = toRef(query, 'zotero', 'zotero7') as Ref<string>
const searchText = toRef(query, 'search', '') as Ref<string>
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
    filtered = filtered.filter((plugin) => {
      return plugin.releases.some(
        release =>
          release.targetZoteroVersion
          === (zotero.value === 'zotero6' ? '6' : '7'),
      )
    })
  }
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
      return selectedTags.value.every(tag =>
        plugin.tags.includes(tag as PluginTagType),
      )
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

function showDownload(plugin: PluginInfo) {
  selectedPlugin.value = plugin
  isShowDownload.value = true
}

ElNotification({
  title: '现默认提供 Zotero 7 插件',
  dangerouslyUseHTMLString: true,
  message: 'Zotero 7 现已正式发布，我们推荐所有同学更新到 Zotero 7。<br />请查阅<a href="/blog/posts/hello-zotero-7">Zotero 7 更新指南</a>。<br />插件商店将于秋季学期开学后移除所有尚未支持 Zotero 7 的插件。',
  type: 'warning',
  duration: 10000,
  offset: 60,
})
</script>

<template>
  <MarketToolBar>
    <!-- Zotero 版本筛选 -->
    <el-select
      v-model="zotero"
      placeholder="适配 Zotero 版本"
      size="large"
    >
      <template #prefix>
        <el-icon>
          <i-ep-filter />
        </el-icon>
      </template>
      <el-option label="All" value="" />
      <el-option label="Zotero 6" value="zotero6" />
      <el-option label="Zotero 7" value="zotero7" />
    </el-select>

    <!-- 排序 -->
    <el-select
      v-model="sortBy"
      placeholder="排序"
      size="large"
    >
      <template #prefix>
        <el-icon>
          <i-ep-sort />
        </el-icon>
      </template>
      <el-option label="星标量" value="stars" />
      <el-option label="插件名" value="name" />
      <el-option label="作者" value="author" />
      <el-option label="最后更新时间" value="lastUpdated" disabled />
    </el-select>

    <!-- 搜索 -->
    <MarketSearch v-model="searchText" placeholder="搜索插件..." />
  </MarketToolBar>

  <!-- 标签筛选 -->
  <MarketTagsFilter v-model="selectedTags" :tags="allTags" />

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
      <PluginCard :plugin="plugin" @show-download="showDownload" />
    </el-col>
  </el-row>

  <!-- 空状态 -->
  <el-empty v-if="filteredPlugins.length === 0" description="无匹配插件" />

  <!-- 下载页面 -->
  <PluginDownloadModal
    v-if="isShowDownload"
    v-model="isShowDownload"
    :selected-plugin="selectedPlugin"
  />

  <div class="plugin-list-footer">
    <p>
      <el-text>
        Zotero 中文交流群
        913637964，617148016，893963769，666489129，145248977，317995116，962963257（加一个群即可）。独学而无友，则孤陋而寡闻。
      </el-text>
    </p>
    <p>
      <el-text>
        如果你对本页面有任何建议或反馈，请
        <el-link type="primary" href="https://www.kdocs.cn/wo/sl/v14cwJXX">
          填写表格
        </el-link>
        或前往
        <el-link
          type="primary"
          href="https://github.com/zotero-chinese/zotero-plugins"
        >
          GitHub 仓库提 issue
        </el-link>
        。
      </el-text>
    </p>

    <p>
      <el-link
        href="https://badges.toozhao.com/stats/01H9T10RA7708BEZZ78B6ZW9VV"
      >
        <img
          src="https://badges.toozhao.com/badges/01H9T10RA7708BEZZ78B6ZW9VV/green.svg"
          alt="Page Views Count"
        >
      </el-link>
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
