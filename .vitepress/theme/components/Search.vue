<script setup lang="ts">
import { toRef, watch, type Ref } from "vue";
import { refDebounced, useUrlSearchParams } from "@vueuse/core";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  debounceTime: {
    type: Number,
    default: 500,
  },
  placeholder: {
    type: String,
    default: "搜索...",
  },
});

const emits = defineEmits(["update:modelValue"]);

const query = useUrlSearchParams("hash-params", { removeFalsyValues: true });
const searchText = toRef(query, "search", props.modelValue) as Ref<string>;
const debouncedSearchText = refDebounced(searchText, props.debounceTime);

watch(debouncedSearchText, (v) => {
  emits("update:modelValue", v);
});

function clearSearch() {
  searchText.value = "";
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
        <Search />
      </el-icon>
    </template>
  </el-input>
</template>
