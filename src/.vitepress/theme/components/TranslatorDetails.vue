<script setup lang="ts">
// TODO: 解决此文件类型检查错误

import { useData } from 'vitepress'
import type { Ref } from 'vue'
import { toRef } from 'vue'
import type { Translator } from '@data/translatorsLittle.data'
import {
  useCreatorType,
  useItemField,
  useItemType,
  useTranslatorType,
} from '../composables/localize'

const translator = toRef(useData().params.value?.translator) as Ref<Translator | undefined>
const translatorTypes = useTranslatorType(translator.value?.header.translatorType ?? 0)
</script>

<template>
  <h1>{{ translator?.zhLabel }}的转换器</h1>

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

    <el-descriptions-item
      label="类型"
    >
      <el-tag
        v-for="(type, index) in translatorTypes"
        :key="index"
        type="info"
        round
      >
        {{ type }}
      </el-tag>
    </el-descriptions-item>

    <el-descriptions-item label="优先级">
      {{ translator?.header.priority }}
    </el-descriptions-item>

    <el-descriptions-item label="目标网址">
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
            : testCase.items[0]?.itemType ?? "空"
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
              >
                <div v-if="field === 'itemType'">
                  {{ useItemType(value) }}
                </div>

                <div
                  v-else-if="field === 'extra'"
                  style="white-space: pre-wrap; word-break: break-all"
                >
                  {{ value }}
                </div>

                <div v-else-if="field === 'url'" style="word-break: break-all">
                  <a :href="value">{{ value }}</a>
                </div>

                <div v-else-if="field === 'attachments'">
                  <el-tag
                    v-for="(attachment, attachmentIndex) in value"
                    :key="attachmentIndex"
                    type="info"
                    effect="plain"
                    size="large"
                  >
                    <template v-if="attachment.mimeType === 'application/pdf'">
                      <el-icon>
                        <img
                          src="@wiki/assets/icons/item-type/attachment-pdf.svg"
                        >
                      </el-icon>
                    </template>
                    <template v-else>
                      <el-icon>
                        <img
                          src="@wiki/assets/icons/item-type/attachment-snapshot.svg"
                        >
                      </el-icon>
                    </template>
                    {{ attachment.title }}
                  </el-tag>
                </div>

                <div v-else-if="field === 'tags'">
                  <el-tag
                    v-for="(tag, tagIndex) in value"
                    :key="tagIndex"
                    type="info"
                    round
                  >
                    {{ tag.tag }}
                  </el-tag>
                </div>

                <div v-else-if="field === 'notes'">
                  <el-tag
                    v-for="(note, noteIndex) in value"
                    :key="noteIndex"
                    type="info"
                    effect="plain"
                    size="large"
                  >
                    <img
                      src="@wiki/assets/icons/item-type/note.svg"
                    >
                    {{ note }}
                  </el-tag>
                </div>

                <div v-else>
                  <div
                    v-if="typeof value === 'string'"
                    v-html="value.replaceAll('\n', '<br/ >')"
                  />
                  <div v-else>
                    {{ value }}
                  </div>
                </div>
              </el-descriptions-item>
            </template>
          </template>
        </el-descriptions>
      </template>
    </template>

    <template v-else>
      多个条目
    </template>
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
