<script setup lang="ts">
// @ts-expect-error data 是 vitepress 的隐式导出
import { data as _updateTime } from '@data/time.data'
// @ts-expect-error data 是 vitepress 的隐式导出
import { data as _pluginUpdateTime } from '@data/update-time.data'

import { useData } from 'vitepress'
import { computed, defineAsyncComponent } from 'vue'
import Loading from './Loading.vue'
import MarketHero from './MarketHero.vue'

const { frontmatter } = useData()
const updateTime = computed(() => frontmatter.value.type === 'plugin' ? _pluginUpdateTime.lastUpdate : _updateTime)
const description = computed(() => frontmatter.value.description ?? `更新时间：${updateTime.value}`)

const PluginCards = defineAsyncComponent(() =>
  import('./PluginCards.vue'))
const PluginCharts = defineAsyncComponent(() =>
  import ('./PluginCharts.vue'))
const StyleCards = defineAsyncComponent(() =>
  import('./StyleCards.vue'))
const TranslatorCards = defineAsyncComponent(() =>
  import('./TranslatorCards.vue'))
const BlogIndex = defineAsyncComponent(() =>
  import('./BlogIndex.vue'))

function getComponentByType(type: string) {
  switch (type) {
    case 'plugin':
      return PluginCards
    case 'charts':
      return PluginCharts
    case 'csl':
      return StyleCards
    case 'translator':
      return TranslatorCards
    case 'blog':
      return BlogIndex
    default:
      return null
  }
}
</script>

<template>
  <div class="VPPage Market">
    <MarketHero
      :title="frontmatter.title"
      :description="description"
      :actions="frontmatter.actions"
    />
    <main class="MarketMain">
      <ClientOnly>
        <Suspense timeout="0">
          <template #default>
            <component :is="getComponentByType(frontmatter.type)" :key="frontmatter.type" />
          </template>
          <template #fallback>
            <Loading />
          </template>
        </Suspense>
      </ClientOnly>
    </main>

    <Content />
  </div>
</template>

<style>
.MarketMain {
  padding: 0 2rem 2rem 2rem;
}
</style>
