<script setup lang="ts">
import { ref, computed, toRef, type Ref } from "vue";
import { syncRef, useUrlSearchParams } from "@vueuse/core";

import Search from "@theme/components/Search.vue";
import TagsFilter from "@theme/components/TagsFilter.vue";
import StyleListItem from "./StyleListItem.vue";
import StyleListItemPreview from "./StyleListItemPreview.vue";

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

  return filtered;
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
    <el-switch
      v-model="showPreview"
      size="large"
      inline-prompt
      active-text="始终显示预览"
      inactive-text="仅在悬浮时显示预览"
    />
  </div>

  <!-- 标签筛选 -->
  <TagsFilter v-model="selectedTags" :tags="allTags" />

  <!-- 插件卡片列表 -->
  <div class="styles-list vp-doc">
    <ul v-if="!showPreview">
      <li v-for="style in filtered" :key="style.id">
        <StyleListItem :style="style" />
      </li>
    </ul>
    <div v-else>
      <StyleListItemPreview
        v-for="style in filtered"
        :key="style.id"
        :style="style"
      />
    </div>
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

.styles-list {
  padding: 0 10rem;
}
</style>
