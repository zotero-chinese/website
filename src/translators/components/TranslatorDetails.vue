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
  <el-descriptions :column="2" border>
    <el-descriptions-item label="ID" :span="2">
      {{ translator?.header.translatorID }}
    </el-descriptions-item>

    <el-descriptions-item label="标题" :span="2">
      {{ translator?.header.label }}，{{ translator?.zhLabel }}
    </el-descriptions-item>

    <el-descriptions-item label="作者">
      {{ translator?.header.creator }}
    </el-descriptions-item>

    <el-descriptions-item label="更新时间">
      {{ translator?.header.lastUpdated }}
    </el-descriptions-item>

    <el-descriptions-item label="类型">
      {{ translator?.header.translatorType }}
    </el-descriptions-item>

    <el-descriptions-item label="权重">
      {{ translator?.header.priority }}
    </el-descriptions-item>

    <el-descriptions-item label="目标">
      {{ translator?.header.target }}
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
      <div class="language-plain vp-adaptive-theme">
        <code>{{ testCase.input }}</code>
      </div>
    </div>

    <template v-if="testCase.items !== 'multiple'">
      <template v-for="(item, index) in testCase.items" :key="index">
        <strong>条目 {{ index + 1 }}</strong>
        <el-descriptions :column="1" border>
          <el-descriptions-item
            v-for="(value, field, index) in item"
            :key="index"
            :label="String(field)"
            label-align="right"
          >
            <div v-if="field === 'creators'">
              <ul>
                <li v-for="(creator, index) in value" :key="index">
                  {{ creator.creatorType }}：{{ creator.lastName
                  }}{{ creator.fieldMode === 0 ? "," : ""
                  }}{{ creator.firstName }}
                </li>
              </ul>
            </div>
            <div v-else>
              {{ value }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </template>

    <template v-else>多个条目</template>
  </details>

  <h2>变更历史</h2>
  <div class="no-list">
    <el-timeline>
      <el-timeline-item
        v-for="(trend, index) in translator?.trends"
        :key="index"
        :timestamp="trend.date"
      >
        {{ trend.message }}, by {{ trend.author }}
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<style scoped>
.no-list ul {
  list-style: none;
}
</style>
