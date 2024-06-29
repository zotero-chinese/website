<script setup lang="ts">
import PageHeader from '@theme/components/PageHeader.vue'
// @ts-expect-error data 是 vitepress 的隐式导出
import { data as updateTime } from '@theme/../data/time.data'
import StylesList from '../components/StylesList.vue'
</script>

<template>
  <el-container>
    <el-header height="fit-content">
      <PageHeader
        title="中文 CSL 样式"
        :description="`更新时间：${updateTime}`"
        :actions="[
          {
            text: '🕯 请求新样式 / 报告 CSL 样式问题',
            link: 'https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl',
          },
          {
            text: '🏪 获取官方 CSL 样式',
            link: 'https://zotero.org/styles',
          },
        ]"
      />
    </el-header>
    <el-main>
      <ClientOnly>
        <StylesList />
      </ClientOnly>
    </el-main>
  </el-container>
</template>
