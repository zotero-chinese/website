<script setup lang="ts">
const searchText = defineModel<string>({ default: '' })
withDefaults(defineProps<{ placeholder?: string }>(), { placeholder: '搜索...' })
</script>

<template>
  <el-input
    v-model="searchText"
    size="large"
    :placeholder="placeholder"
    :aria-label="placeholder"
    clearable
  >
    <template #prefix>
      <el-icon>
        <i-ep-search />
      </el-icon>
    </template>
  </el-input>
</template>
