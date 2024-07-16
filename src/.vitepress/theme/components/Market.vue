<script setup lang="ts">
import { useData } from 'vitepress'

import { defineAsyncComponent, ref } from 'vue'

// ts-ignore data 是 vitepress 的隐式导出
import { data as _pluginUpdateTime } from '../../data/update-time.data'
// ts-ignore data 是 vitepress 的隐式导出
import { data as _updateTime } from '../../data/time.data'
import MarketHero from './MarketHero.vue'
import HeartFilledIcon from './icons/HeartFilledIcon.vue'

// const loading = ref(true)

const PluginsList = defineAsyncComponent(() =>
  import('./PluginsList.vue'))
const PluginsChart = defineAsyncComponent(() =>
  import ('./PluginsChart.vue'))
const StylesList = defineAsyncComponent(() =>
  import('./StylesList.vue'))
const TranslatorList = defineAsyncComponent(() =>
  import('./TranslatorsList.vue'))

const { frontmatter } = useData()
const updateTime = frontmatter.type === 'plugin' ? _pluginUpdateTime.lastUpdate : _updateTime
</script>

<template>
  <div class="VPPage">
    <MarketHero
      :title="frontmatter.title"
      :description="`更新时间：${updateTime}`"
      :actions="frontmatter.actions"
    />

    <main class="MarketMain">
      <!-- <div v-if="loading">
        加载中...
      </div> -->
      <client-only>
        <PluginsList v-if="frontmatter.type === 'plugin'" />
        <PluginsChart v-if="frontmatter.type === 'charts'" />
        <StylesList v-if="frontmatter.type === 'csl'" />
        <TranslatorList v-if="frontmatter.type === 'translator'" />
      </client-only>
    </main>

    <Content />
  </div>
</template>

<style>
.MarketMain {
  padding: 0 2rem;
}
</style>
