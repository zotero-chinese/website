<script setup lang="ts">
import { useData } from 'vitepress'
import { defineAsyncComponent, ref } from 'vue'

// ts-ignore data 是 vitepress 的隐式导出
import { data as _pluginUpdateTime } from '../../data/update-time.data'
// ts-ignore data 是 vitepress 的隐式导出
import { data as _updateTime } from '../../data/time.data'
import MarketHero from './MarketHero.vue'
import HeartFilledIcon from './icons/HeartFilledIcon.vue'

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

function getComponentByType(type) {
  switch (type) {
    case 'plugin':
      return PluginsList
    case 'charts':
      return PluginsChart
    case 'csl':
      return StylesList
    case 'translator':
      return TranslatorList
    default:
      return null
  }
}
</script>

<template>
  <div class="VPPage">
    <MarketHero
      :title="frontmatter.title"
      :description="`更新时间：${updateTime}`"
      :actions="frontmatter.actions"
    />

    <main class="MarketMain">
      <ClientOnly>
        <Suspense timeout="0">
          <template #default>
            <component :is="getComponentByType(frontmatter.type)" :key="frontmatter.type" />
          </template>
          <template #fallback>
            Loading...
          </template>
        </Suspense>
      </ClientOnly>
    </main>

    <Content />
  </div>
</template>

<style>
.MarketMain {
  padding: 0 2rem;
}
</style>
