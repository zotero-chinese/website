<script setup lang="ts">
import { ref, computed } from "vue";
import { refDebounced } from "@vueuse/core";
import StyleCard from "./StyleCard.vue";
import { styleTags } from "../types/tags";

// @ts-ignore
import { data as styles } from "../data/styles.data";

const format = ref("");
const searchText = ref("");
const debouncedSearchText = refDebounced(searchText, 1000);
const selectedTags = ref([]);
const showPreview = ref(false);

const filtered = computed(() => {
  let filtered = styles;
  // 搜索
  if (debouncedSearchText.value !== "") {
    const searchTextLower = debouncedSearchText.value.toLowerCase();
    filtered = filtered.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchTextLower) ||
        item.summary?.toLowerCase().includes(searchTextLower)
      );
    });
  }

  // 筛选格式
  if (format.value !== "") {
    filtered = filtered.filter((item) => {
      return item.citation_format === format.value;
    });
  }

  // 筛选标签
  if (selectedTags.value.length !== 0) {
    filtered = filtered.filter((item) => {
      return selectedTags.value.every((tag) => item.tags?.includes(tag));
    });
  }

  return filtered;
});

function clearSearch() {
  searchText.value = "";
}
</script>

<template>
  <div class="toolbar">
    <!-- Zotero 版本筛选 -->
    <el-select
      v-model="format"
      placeholder="Format"
      size="large"
      style="width: 300px"
    >
      <template #prefix>
        <el-icon>
          <Filter />
        </el-icon>
      </template>
      <el-option label="All" value=""></el-option>
      <el-option label="作者" value="author"></el-option>
      <el-option label="作者—年代" value="author-date"></el-option>
      <el-option label="数字编码" value="numeric"></el-option>
      <el-option label="脚注" value="note"></el-option>
      <el-option label="标签" value="label"></el-option>
    </el-select>

    <!-- 搜索 -->
    <el-input
      v-model="searchText"
      size="large"
      placeholder="搜索样式名称..."
      clearable
      @clear="clearSearch"
    >
      <template #prefix>
        <el-icon>
          <Search />
        </el-icon>
      </template>
    </el-input>

    <!-- 显示预览 -->
    <el-switch v-model="showPreview" />
  </div>

  <!-- 标签筛选 -->
  <el-checkbox-group v-model="selectedTags" size="large">
    <el-checkbox v-for="tag in styleTags" :key="tag" :value="tag" border>
      {{ tag }}
    </el-checkbox>
  </el-checkbox-group>

  <!-- 插件卡片列表 -->
  <div class="styles-list">
    <ul>
      <li v-for="style in filtered" :key="style.id">
        <a :href="style.dir">
          <StyleCard :style="style" :mode="showPreview ? 'full' : 'sample'" />
        </a>
      </li>
    </ul>
  </div>

  <!-- 空状态 -->
  <el-empty v-if="filtered.length == 0" description="无匹配项" />
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-around;
  padding-bottom: 20px;
}
.toolbar > * {
  margin: 0 8px;
}
.toolbar > :first-child {
  margin-left: 0;
}
.toolbar > :last-child {
  margin-right: 0;
}
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

.el-col {
  border-radius: 4px;
  min-height: 36px;
  padding-bottom: 20px;
}

.styles-list ul {
  display: block;
  list-style-type: disc;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: 40px;
  unicode-bidi: isolate;
}
</style>
