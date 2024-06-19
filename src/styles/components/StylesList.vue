<script setup lang="ts">
import { ref, computed, toRef, type Ref } from "vue";
import { syncRef, useUrlSearchParams } from "@vueuse/core";

import Search from "@theme/components/Search.vue";
import TagsFilter from "@theme/components/TagsFilter.vue";
import StyleListItem from "./StyleListItem.vue";

import { data as styles } from "../data/styles.data";

const allTags = [...new Set(styles.flatMap((style) => style.tags))].map((v) => {
  return {
    label: v,
    value: v,
  };
});

const query = useUrlSearchParams("hash-params", { removeFalsyValues: true });
const format = toRef(query, "format", "") as Ref<string>;
const searchText = toRef(query, "search", "") as Ref<string>;
const showPreview = ref(false);
const _selectedTags = toRef(query, "tags", []) as Ref<string | string[]>;
const selectedTags = ref([]) as Ref<string[]>;
// 将 urlSearchParams.tags 由 string | string[] 转为 string[]
syncRef(_selectedTags, selectedTags, {
  transform: {
    ltr: (left) => [left].flat(),
  },
});

const filtered = computed(() => {
  let filtered = styles;
  // 搜索
  if (searchText.value !== "") {
    const searchTextLower = searchText.value.toLowerCase();
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
      return selectedTags.value.every((tag) => item.tags?.includes(tag as Tag));
    });
  }

  return filtered.sort((a, b) => {
    // title 中包含 GB 的始终最前，否则按预览顺序排序
    if (a.title.match("GB")) return -1;
    if (b.title.match("GB")) return 1;
    return a.title.localeCompare(b.title);
  });
});
</script>

<template>
  <div class="toolbar">
    <!-- Zotero 版本筛选 -->
    <el-select
      v-model="format"
      placeholder="引文格式"
      size="large"
      style="width: 300px"
    >
      <template #prefix>
        <el-icon>
          <Filter />
        </el-icon>
      </template>
      <el-option label="所有" value=""></el-option>
      <el-option label="著者" value="author"></el-option>
      <el-option label="著者—出版年" value="author-date"></el-option>
      <el-option label="顺序编码" value="numeric"></el-option>
      <el-option label="脚注" value="note"></el-option>
      <el-option label="标签" value="label"></el-option>
    </el-select>

    <!-- 搜索 -->
    <Search v-model="searchText" placeholder="搜索样式名称..." />

    <!-- 显示预览 -->
    <!-- <el-switch v-model="showPreview" /> -->
  </div>

  <!-- 标签筛选 -->
  <TagsFilter v-model="selectedTags" :tags="allTags" />

  <!-- 插件卡片列表 -->
  <div class="styles-list">
    <ul>
      <li v-for="style in filtered" :key="style.id">
        <a :href="style.dir">
          <StyleListItem
            :style="style"
            :mode="showPreview ? 'full' : 'sample'"
          />
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
