<script setup lang="ts">
const props = defineProps<{
  style: StyleFullResult
}>()
</script>

<template>
  <a :href="props.style.dir">
    <h2>{{ props.style.title }}</h2>
  </a>
  <div class="csl-preview">
    <h3>引注</h3>
    <div class="csl-preview-citations" v-html="props.style.citations" />
    <h3>参考文献表</h3>
    <div class="csl-preview-bibliography" v-html="props.style.bibliography" />
  </div>
</template>
