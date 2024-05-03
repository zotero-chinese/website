<script setup lang="ts">
import { data as translators } from "../data/translators.data";
import TranslatorsList from "./TranslatorsList.vue";
const updateTime = new Date().toLocaleString("zh-CN");
import PageHeader from "@theme/components/PageHeader.vue";
</script>

<template>
  <el-container>
    <el-header height="fit-content">
      <PageHeader
        title="Zotero 转换器（中文生态）"
        :description="'更新时间：' + updateTime"
        :actions="[
          {
            text: '🕯 报告转换器问题',
            link: 'https://github.com/l0o0/translators_CN',
          },
        ]"
      />
    </el-header>
    <el-main>
      <TranslatorsList :translators="translators" />
    </el-main>
  </el-container>
</template>
