<template>
  <div class="toolbar">
    <!-- Zotero 版本筛选 -->
    <el-select
      v-model="zotero"
      placeholder="适配 Zotero 版本"
      size="large"
      style="width: 200px"
    >
      <template #prefix>
        <el-icon>
          <Filter />
        </el-icon>
      </template>
      <el-option label="All" value=""></el-option>
      <el-option label="Zotero 6" value="zotero6"></el-option>
      <el-option label="Zotero 7" value="zotero7"></el-option>
    </el-select>

    <!-- 排序 -->
    <el-select
      v-model="sortBy"
      placeholder="排序"
      size="large"
      style="width: 200px"
    >
      <template #prefix>
        <el-icon>
          <Sort />
        </el-icon>
      </template>
      <el-option label="星标量" value="stars"></el-option>
      <el-option label="插件名" value="name"></el-option>
      <el-option label="作者" value="author"></el-option>
      <el-option label="最后更新时间" value="lastUpdated" disabled></el-option>
    </el-select>

    <!-- 搜索 -->
    <el-input
      v-model="searchText"
      size="large"
      placeholder="搜索插件..."
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

  <!-- 标签筛选 -->
  <el-checkbox-group v-model="selectedTags" size="large">
    <!-- <el-checkbox value="all" border>All</el-checkbox> -->
    <el-checkbox v-for="(tag, key) in allTags" :key="key" :value="key" border>
      <el-tooltip
        class="box-item"
        effect="dark"
        :content="tag.description"
        placement="bottom"
      >
        {{ tag.label }}
      </el-tooltip>
    </el-checkbox>
  </el-checkbox-group>

  <!-- 插件卡片列表 -->
  <el-row :gutter="20">
    <el-col
      :xs="24"
      :sm="12"
      :md="8"
      :lg="6"
      :xl="4"
      v-for="plugin in filteredPlugins"
      :key="plugin.repo"
    >
      <PluginCard :plugin="plugin" @show-download="showDownload" />
    </el-col>
  </el-row>

  <!-- 空状态 -->
  <el-empty v-if="filteredPlugins.length == 0" description="无匹配插件" />

  <!-- 下载页面 -->
  <DownloadModal
    v-if="isShowDownload"
    :selectedPlugin="selectedPlugin"
    @close-download="closeDownload"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { refDebounced } from "@vueuse/core";

import { data as plugins } from "../data/plugins.data";
import { tags as allTags } from "../types/tags";

import PluginCard from "./PluginCard.vue";
import DownloadModal from "./DownloadModal.vue";

const isShowDownload = ref(false);
const selectedPlugin = ref(plugins[0]);
const searchText = ref("");
const debouncedSearchText = refDebounced(searchText, 1000);
const sortBy = ref("stars");
const zotero = ref("");
const selectedTags = ref([]);

const filteredPlugins = computed(() => {
  let filtered = plugins;

  // 筛选 Zotero 版本
  if (zotero.value !== "") {
    filtered = filtered.filter((plugin) => {
      return plugin.releases.some(
        (release) =>
          release.targetZoteroVersion ===
          (zotero.value == "zotero6" ? "6" : "7"),
      );
    });
  }

  // 筛选搜索词
  if (debouncedSearchText.value !== "") {
    const searchTextLower = debouncedSearchText.value.toLowerCase();
    filtered = filtered.filter((plugin) => {
      return (
        plugin.name.toLowerCase().includes(searchTextLower) ||
        plugin.description.toLowerCase().includes(searchTextLower)
      );
    });
  }

  // 筛选标签
  if (selectedTags.value.length !== 0) {
    filtered = filtered.filter((plugin) => {
      return selectedTags.value.every((tag) => plugin.tags.includes(tag));
    });
  }

  // 排序
  if (sortBy.value === "name") {
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === "stars") {
    filtered.slice().sort((a, b) => b.stars - a.stars);
  } else if (sortBy.value === "author") {
    return filtered
      .slice()
      .sort((a, b) => a.author.name.localeCompare(b.author.name));
  }
  return filtered;
});

function showDownload(plugin: PluginInfo) {
  selectedPlugin.value = plugin;
  isShowDownload.value = true;
}
function closeDownload() {
  isShowDownload.value = false;
  // selectedPlugin.value = null;
}
function clearSearch() {
  searchText.value = "";
}
</script>

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
