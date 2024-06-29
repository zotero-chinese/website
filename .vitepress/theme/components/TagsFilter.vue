<script setup lang="ts">
import { ref, watch } from 'vue'

export interface Tag {
  label: string
  value: string
  description?: string
}

const props = defineProps({
  modelValue: {
    type: Array<string>,
    default: [],
  },
  tags: {
    type: Array<Tag>,
    default: [],
  },
})

const emits = defineEmits(['update:modelValue'])

const selectedTags = ref(props.modelValue)

watch(selectedTags, (v) => {
  emits('update:modelValue', v)
})
</script>

<template>
  <el-checkbox-group v-model="selectedTags" size="large">
    <!-- <el-checkbox value="all" border>All</el-checkbox> -->
    <el-checkbox
      v-for="tag in props.tags"
      :key="tag.value"
      :value="tag.value"
      border
    >
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
  padding-bottom: 20px;
  flex-wrap: wrap;
}

.el-checkbox {
  margin: 0px 10px 10px 0px;
}

.el-checkbox > :deep(.el-checkbox__input) {
  display: none !important;
}

.el-checkbox-button {
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  /* box-shadow: none!important; */
}
.el-checkbox-button__inner {
  border: unset !important;
  border-left-color: unset !important;
}
</style>
