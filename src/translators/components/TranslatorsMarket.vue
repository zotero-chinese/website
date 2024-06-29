<script setup lang="ts">
import PageHeader from '@theme/components/PageHeader.vue'
// @ts-expect-error data 是 vitepress 的隐式导出
import { data as updateTime } from '@theme/../data/time.data'
import TranslatorsList from './TranslatorsList.vue'
</script>

<template>
  <el-container>
    <el-header height="fit-content">
      <PageHeader
        title="Zotero 转换器（中文生态）"
        :description="`更新时间：${updateTime}`"
        :actions="[
          {
            text: '🕯 报告转换器问题',
            link: 'https://github.com/l0o0/translators_CN',
          },
        ]"
      />
    </el-header>
    <el-main>
      <TranslatorsList />
    </el-main>
  </el-container>
</template>
