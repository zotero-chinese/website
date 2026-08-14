<script setup lang="ts">
import type { StyleSummary } from '@data/styles.data'
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  style: StyleSummary
}>()

interface StylePreview {
  citations: string
  bibliography: string
}

const preview = ref<StylePreview | null>(null)
const loading = ref(false)
const failed = ref(false)

const root = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  // 仅在卡片进入视口时才加载预览数据，避免“始终显示预览”模式下一次性发起大量请求
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          observer?.disconnect()
          void loadPreview()
        }
      }
    },
    { rootMargin: '200px' },
  )
  if (root.value) observer.observe(root.value)
})

onUnmounted(() => {
  observer?.disconnect()
})

async function loadPreview() {
  if (preview.value || loading.value || failed.value) return
  loading.value = true
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}styles-data/${props.style.key}.json`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    preview.value = (await response.json()) as StylePreview
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div ref="root">
    <a :href="`/styles/${props.style.dir}`">
      <h2>{{ props.style.title }}</h2>
    </a>
    <div v-if="preview" class="csl-preview">
      <h3>引注</h3>
      <div class="csl-preview-citations" v-html="preview.citations" />
      <h3>参考文献表</h3>
      <div class="csl-preview-bibliography" v-html="preview.bibliography" />
    </div>
    <el-skeleton v-else-if="loading" :rows="3" animated />
    <el-empty v-else-if="failed" description="预览加载失败" />
  </div>
</template>
