<script setup lang="ts">
import { ref, computed } from "vue";
import TranslatorCard from "./TranslatorCard.vue";
import { data as raw } from "../data/translators.data";

const translators: TranslatorResolved[] = raw.map((item) => {
  return { ...item.header, zhLabel: item.zhLabel };
});

const searchText = ref("");
const filtered = computed(() => {
  let filtered = translators;

  if (searchText.value) {
    const searchTextLower = searchText.value.toLowerCase();
    filtered = filtered.filter((item) => {
      return (
        item.label.toLowerCase().includes(searchTextLower) ||
        item.zhLabel.toLowerCase().includes(searchTextLower) ||
        (item.target !== "" && new RegExp(item.target).test(searchText.value))
      );
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
    <!-- 搜索 -->
    <el-input
      v-model="searchText"
      size="large"
      placeholder="搜索转换器名称或匹配网址..."
      clearable
      @clear="clearSearch"
    >
      <template #prefix>
        <el-icon>
          <Search />
        </el-icon>
      </template>
    </el-input>
  </div>

  <!-- 插件卡片列表 -->
  <el-row :gutter="20">
    <el-col
      :xs="24"
      :sm="12"
      :md="8"
      :lg="6"
      :xl="4"
      v-for="translator in filtered"
      :key="translator.translatorID"
    >
      <a :href="translator.translatorID">
        <TranslatorCard :translator="translator" />
      </a>
    </el-col>
  </el-row>

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
</style>
