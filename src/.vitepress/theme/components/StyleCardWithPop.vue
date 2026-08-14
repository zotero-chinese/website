<script setup lang="ts">
import type { StyleSummary } from '@data/styles.data'
import { ref } from 'vue'

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
  <client-only>
    <el-popover trigger="hover" width="90%" @show="loadPreview">
      <template #reference>
        <a :href="`/styles/${props.style.dir}`">{{ props.style.title }}</a>
      </template>
      <div v-if="preview" class="csl-preview">
        <h3>引注</h3>
        <div v-html="preview.citations" />
        <h3>参考文献表</h3>
        <div v-html="preview.bibliography" />
      </div>
      <el-skeleton v-else-if="loading" :rows="3" animated />
      <el-empty v-else description="预览加载失败" />
    </el-popover>
  </client-only>
</template>
