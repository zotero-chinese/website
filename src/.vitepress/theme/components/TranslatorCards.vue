<script setup lang="ts">
import { type Ref, computed, ref, toRef } from 'vue'
import { syncRef, useUrlSearchParams } from '@vueuse/core'

import MarketSearch from '@theme/components/MarketSearch.vue'
import MarketTagsFilter from '@theme/components/MarketTagsFilter.vue'
import MarketToolBar from '@theme/components/MarketToolBar.vue'

import { data } from '@data/translatorsLittle.data'

import { useItemType, useSortedItemTypes } from '../composables/localize'
import TranslatorCard from './TranslatorCard.vue'

const translatorTypes = data.allItemTypes
  .map((v) => {
    return {
      label: useItemType(v),
      value: v,
    }
  })
  .sort((a, b) => {
    return useSortedItemTypes(a.label, b.label)
  })

const query = useUrlSearchParams('hash-params', { removeFalsyValues: true })
const searchText = toRef(query, 'search', '') as Ref<string>
const _selectedTags = toRef(query, 'tags', []) as Ref<string | string[]>
const selectedTags = ref([]) as Ref<string[]>
// 将 urlSearchParams.tags 由 string | string[] 转为 string[]
syncRef(_selectedTags, selectedTags, {
  transform: {
    ltr: left => [left].flat(),
  },
})

const translators = data.translators
const filtered = computed(() => {
  let filtered = translators

  if (searchText.value !== '') {
    const searchTextLower = searchText.value.toLowerCase()
    filtered = filtered.filter((item) => {
      return (
        item.label.toLowerCase().includes(searchTextLower)
        || item.zhLabel.toLowerCase().includes(searchTextLower)
        || (item.target !== '' && new RegExp(item.target).test(searchText.value))
      )
    })
  }

  if (selectedTags.value.length !== 0) {
    filtered = filtered.filter(translator =>
      selectedTags.value.every(tag => translator.itemTypes.includes(tag)),
    )
  }
  return filtered
})
</script>

<template>
  <MarketToolBar>
    <!-- 搜索 -->
    <MarketSearch v-model="searchText" placeholder="搜索转换器名称或匹配网址..." />
  </MarketToolBar>

  <!-- 标签筛选 -->
  <MarketTagsFilter v-model="selectedTags" :tags="translatorTypes" />

  <!-- 插件卡片列表 -->
  <el-row>
    <el-col
      v-for="translator in filtered"
      :key="translator.translatorID"
      :xs="24"
      :sm="12"
      :md="8"
      :lg="6"
      :xl="4"
    >
      <a :href="translator.translatorID">
        <TranslatorCard :translator="translator" />
      </a>
    </el-col>
  </el-row>

  <!-- 空状态 -->
  <el-empty v-if="filtered.length === 0" description="无匹配项" />
</template>
