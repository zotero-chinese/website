<script setup lang="ts">
const props = defineProps<{
  style: StyleFullResult
}>()
const style = props.style
</script>

<template>
  <a :href="style.dir">
    <h2>{{ style.title }}</h2>
  </a>
  <div class="csl-preview">
    <h3>引注</h3>
    <div class="csl-preview-citations" v-html="style.citations" />
    <h3>参考文献表</h3>
    <div class="csl-preview-bibliography" v-html="style.bibliography" />
  </div>
</template>
