<script setup lang="ts">
import { data as translators } from "../data/translators.data";

const props = defineProps(["translatorID"]);

const translator = translators.find(
  (v) => v.header.translatorID === props.translatorID,
);
</script>

<template>
  <h1>{{ translator?.zhLabel }} 的转换器</h1>
  <h2>元数据</h2>
  <el-descriptions :column="1">
    <el-descriptions-item
      v-for="(value, key, index) in translator?.header"
      :key="index"
      :label="key"
    >
      {{ value }}
    </el-descriptions-item>
  </el-descriptions>

  <h2>示例</h2>
  <details
    v-for="(testCase, index) in translator?.testCases"
    :key="index"
    class="details custom-block"
  >
    <summary style="word-break: break-all">
      {{
        testCase.type === "web"
          ? testCase.url
          : testCase.type +
            " -> " +
            (testCase.items === "multiple"
              ? "multiple"
              : testCase.items[0].itemType)
      }}
    </summary>

    <div v-if="testCase.type === 'import'">
      <strong>输入：</strong>
      <div v-html="testCase.input?.replaceAll('\n', '<br/>')" />
    </div>

    <template v-if="testCase.items !== 'multiple'">
      <template v-for="(item, index) in testCase.items" :key="index">
        <strong>条目 {{ index + 1 }}</strong>
        <el-descriptions :column="1">
          <el-descriptions-item
            v-for="(value, field, index) in item"
            :key="index"
            :label="String(field)"
          >
            {{ value }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </template>

    <template v-else>多个项目</template>
  </details>

  <h2>变更历史</h2>
  <div class="no-list">
    <el-timeline>
      <el-timeline-item
        v-for="(trend, index) in translator?.trends"
        :key="index"
        :timestamp="trend.date"
      >
        {{ trend.message }} by {{ trend.author }}
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<style>
.no-list ul {
  list-style: none;
}
</style>
