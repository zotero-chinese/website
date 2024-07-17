<script setup lang="ts">
const props = defineProps<{
  style: StyleFullResult
}>()
</script>

<template>
  <client-only>
    <el-popover trigger="hover" width="90%">
      <template #reference>
        <a :href="props.style.dir">{{ props.style.title }}</a>
      </template>
      <div class="csl-preview">
        <h3>引注</h3>
        <div v-html="props.style.citations" />
        <h3>参考文献表</h3>
        <div v-html="props.style.bibliography" />
      </div>
    </el-popover>
  </client-only>
</template>
