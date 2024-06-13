<script setup lang="ts">
import {
  useTranslatorType,
  useCreatorType,
  useItemField,
  useItemType,
} from "../composables/localize";
import { useData } from "vitepress";

const translator = useData().params.value.translator;
</script>

<template>
  <h1>{{ translator?.zhLabel }}的转换器</h1>

  <h2>元数据</h2>
  <el-descriptions :column="2" border>
    <el-descriptions-item label="ID" :span="2" label-class-name="fieldLabel">
      {{ translator?.header.translatorID }}
    </el-descriptions-item>

    <el-descriptions-item label="标题" :span="2" label-class-name="fieldLabel">
      {{ translator?.header.label }}，{{ translator?.zhLabel }}
    </el-descriptions-item>

    <el-descriptions-item label="作者" label-class-name="fieldLabel">
      {{ translator?.header.creator }}
    </el-descriptions-item>

    <el-descriptions-item label="更新时间" label-class-name="fieldLabel">
      {{ translator?.header.lastUpdated }}
    </el-descriptions-item>

    <el-descriptions-item
      label="类型"
      class="tags-container"
      label-class-name="fieldLabel"
    >
      <el-tag
        v-for="(type, index) in useTranslatorType(
          translator?.header.translatorType,
        )"
        :key="index"
        type="info"
        round
      >
        {{ type }}
      </el-tag>
    </el-descriptions-item>

    <el-descriptions-item label="优先级" label-class-name="fieldLabel">
      {{ translator?.header.priority }}
    </el-descriptions-item>

    <el-descriptions-item label="目标网址" label-class-name="fieldLabel">
      {{ translator?.header.target }}
    </el-descriptions-item>
  </el-descriptions>

  <h2>示例</h2>
  <details
    v-for="(testCase, caseIndex) in translator?.testCases"
    :key="caseIndex"
    class="details custom-block"
  >
    <summary style="word-break: break-all">
      <template v-if="testCase.type === 'web'">
        {{ testCase.url }}
      </template>
      <template v-else>
        {{ testCase.type }} ->
        {{
          testCase.items === "multiple"
            ? "multiple"
            : testCase.items[0].itemType
        }}
      </template>
    </summary>

    <div v-if="testCase.type === 'import'">
      <strong>输入：</strong>
      <div class="language-plain vp-adaptive-theme">
        <code>{{ testCase.input }}</code>
      </div>
    </div>

    <template v-if="testCase.items !== 'multiple'">
      <template v-for="(item, itemIndex) in testCase.items" :key="itemIndex">
        <a :href="testCase.url">
          <strong>条目 {{ itemIndex + 1 }}</strong>
        </a>
        <el-descriptions :column="1" border>
          <template
            v-for="(value, field, fieldIndex) in item"
            :key="fieldIndex"
          >
            <template v-if="field === 'creators'">
              <el-descriptions-item
                v-for="(creator, creatorIndex) in value"
                :key="creatorIndex"
                :label="useCreatorType(creator.creatorType)"
                label-align="right"
                label-class-name="fieldLabel"
              >
                <div>
                  {{ creator.lastName }}
                  {{ creator.fieldMode !== 1 ? ", " : "" }}
                  {{ creator.firstName }}
                </div>
              </el-descriptions-item>
            </template>
            <template v-else>
              <el-descriptions-item
                :label="useItemField(String(field))"
                label-align="right"
                label-class-name="fieldLabel"
              >
                <div v-if="field == 'itemType'">
                  {{ useItemType(value) }}
                </div>
                <div
                  v-else-if="field == 'extra'"
                  style="white-space: pre-wrap; word-break: break-all"
                >
                  {{ value }}
                </div>
                <div v-else-if="field == 'url'" style="word-break: break-all">
                  <a :href="value">{{ value }}</a>
                </div>
                <div v-else-if="field == 'attachments'" class="tags-container">
                  <el-card
                    v-for="(attachment, attachmentIndex) in value"
                    :key="attachmentIndex"
                    body-style="padding:5px;display:flex;align-items:center;"
                    shadow="never"
                  >
                    <template v-if="attachment.mimeType == 'application/pdf'">
                      <img
                        src="..\..\wiki\assets\icons\item-type\attachment-pdf.svg"
                        class="attachment-icon"
                      />
                    </template>
                    <template v-else>
                      <img
                        src="..\..\wiki\assets\icons\item-type\attachment-snapshot.svg"
                        class="attachment-icon"
                      />
                    </template>
                    {{ attachment.title }}
                  </el-card>
                </div>
                <div v-else-if="field === 'tags'" class="tags-container">
                  <el-tag
                    v-for="(tag, tagIndex) in value"
                    :key="tagIndex"
                    type="info"
                    round
                  >
                    {{ tag.tag }}
                  </el-tag>
                </div>
                <div v-else-if="field == 'notes'" class="tags-container">
                  <el-card
                    v-for="(note, noteIndex) in value"
                    :key="noteIndex"
                    body-style="padding:5px;display:flex;align-items:center;"
                    shadow="never"
                  >
                    <img
                      src="..\..\wiki\assets\icons\item-type\note.svg"
                      class="attachment-icon"
                    />
                    {{ note }}
                  </el-card>
                </div>
                <div v-else>
                  <div
                    v-if="typeof value === 'string'"
                    v-html="value.replaceAll('\n', '<br/ >')"
                  ></div>
                  <div v-else>{{ value }}</div>
                </div>
              </el-descriptions-item>
            </template>
          </template>
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
        {{ trend.message }}, by
        <a :href="`https://github.com/${trend.author}`">{{ trend.author }}</a>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<style scoped>
.no-list ul {
  list-style: none;
}

.tags-container {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.attachment-icon {
  width: 1.2rem;
  margin-right: 0.5rem;
  flex-wrap: wrap;
}

:deep(.fieldLabel) {
  white-space: nowrap;
}
</style>
