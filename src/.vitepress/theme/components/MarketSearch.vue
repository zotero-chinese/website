<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  debounceTime: {
    type: Number,
    default: 500,
  },
  placeholder: {
    type: String,
    default: '搜索...',
  },
})

const emits = defineEmits(['update:modelValue'])

const searchText = ref(props.modelValue)
const debouncedSearchText = refDebounced(searchText, props.debounceTime)

watch(debouncedSearchText, (v) => {
  emits('update:modelValue', v)
})

function clearSearch() {
  searchText.value = ''
}
</script>

<template>
  <el-input
    v-model="searchText"
    size="large"
    :placeholder="props.placeholder"
    clearable
    @clear="clearSearch"
  >
    <template #prefix>
      <el-icon>
        <i-ep-search />
      </el-icon>
    </template>
  </el-input>
</template>
