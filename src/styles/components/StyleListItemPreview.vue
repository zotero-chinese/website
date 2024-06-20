<script setup lang="ts">
const props = defineProps<{
  style: Style;
}>();
const style = props.style;
</script>

<template>
  <a :href="style.dir">
    <h2>{{ style.title }}</h2>
  </a>
  <div class="csl-preview">
    <h3>引注</h3>
    <div v-html="style.citations" class="csl-preview-citations"></div>
    <h3>参考文献表</h3>
    <div v-html="style.bibliography" class="csl-preview-bibliography"></div>
  </div>
</template>
