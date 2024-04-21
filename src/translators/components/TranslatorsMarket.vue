<script setup>
import { data as translators } from "../data/translators.data";
import TranslatorsList from "../components/TranslatorsList.vue";
const updateTime = new Date().toLocaleString("zh-CN");
</script>

<template>
  <el-container>
    <el-header>
      <div class="vp-doc">
        <h2>Zotero 转换器（中文生态）</h2>
      </div>
      <el-text>更新时间：{{ updateTime }}</el-text>
      <div class="button-group">
        <el-button
          type="primary"
          plain
          tag="a"
          href="https://github.com/l0o0/translators_CN"
        >
          🕯 报告转换器问题
        </el-button>
      </div>
    </el-header>
    <el-main>
      <TranslatorsList :translators="translators" />
    </el-main>
  </el-container>
</template>

<style scoped>
.el-header {
  height: max-content;
  display: flex;
  align-content: center;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 30px;
}
.button-group {
  padding-top: 20px;
  padding-bottom: 30px;
}
.el-footer {
  text-align: center;
  padding-bottom: 40px;
  height: 100%;
}
p {
  vertical-align: middle;
}
h2 {
  border-top: none;
}
</style>
