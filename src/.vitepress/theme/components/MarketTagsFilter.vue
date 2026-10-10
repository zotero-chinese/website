<script setup lang="ts">
export interface Tag {
  label: string
  value: string
  description?: string
}

const selectedTags = defineModel<string[]>({ default: () => [] })
defineProps<{ tags: Tag[] }>()
</script>

<template>
  <el-checkbox-group v-model="selectedTags" size="large">
    <el-checkbox v-for="tag in tags" :key="tag.value" :value="tag.value" border>
      <el-tooltip
        v-if="tag.description"
        class="box-item"
        effect="dark"
        :content="tag.description"
        placement="bottom"
      >
        {{ tag.label }}
      </el-tooltip>
      <div v-else>
        {{ tag.label }}
      </div>
    </el-checkbox>
  </el-checkbox-group>
</template>

<style scoped>
.el-checkbox-group {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0 0 0;
  flex-wrap: wrap;
}

.el-checkbox {
  margin: 0px 0.5rem 1rem 0.5rem;
}
</style>
