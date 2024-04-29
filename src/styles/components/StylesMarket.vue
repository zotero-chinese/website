<script setup>
// import { data as styles } from "../data/styles.data";
// import StylesList from "../components/StylesList.vue";
const updateTime = new Date().toLocaleString("zh-CN");
import PageHeader from "@theme/components/PageHeader.vue";
</script>

<template>
  <el-container>
    <el-header height="fit-content">
      <PageHeader
        title="中文 CSL 样式"
        :description="'更新时间：' + updateTime"
        :actions="[
          {
            text: '🕯 获取样式 / 报告 CSL 样式问题',
            link: 'https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl',
          },
        ]"
      />
    </el-header>
    <el-main>
      <!-- <StylesList :styles="styles" /> -->
      <el-empty description="此页面尚未实现" />
    </el-main>
  </el-container>
</template>
