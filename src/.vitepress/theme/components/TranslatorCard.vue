<script setup lang="ts">
import type { TranslatorLittle } from '@data/translator.little.data'
import {
  useItemType,
  useSortedItemTypes,
  useTranslatorType,
} from '../composables/localize'

const props = defineProps<{ translator: TranslatorLittle }>()
const translator = props.translator

const sortedItemTypes = translator.itemTypes
  .map(v => useItemType(v))
  .sort(useSortedItemTypes)

const translatorTypes = useTranslatorType(translator.translatorType)
</script>

<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <b>
          <el-text tag="b" size="large">{{ translator.zhLabel }}</el-text>
        </b>
      </div>
    </template>

    <el-space direction="vertical" alignment="normal" fill>
      <el-text class="hanging-indent" style="overflow-wrap: break-word">
        <el-icon>
          <User />
        </el-icon>
        {{ translator.creator }}
      </el-text>

      <el-text class="hanging-indent" style="word-break: break-all">
        <el-icon>
          <Link />
        </el-icon>
        {{ translator.target }}
      </el-text>

      <el-text>
        <el-icon>
          <Refresh />
        </el-icon>
        {{ translator.lastUpdated }}
      </el-text>

      <el-text>
        <el-icon>
          <Aim />
        </el-icon>
        <span class="tags-container">
          <el-tag
            v-for="(type, index) in translatorTypes"
            :key="index"
            type="info"
          >
            {{ type }}
          </el-tag>
        </span>
      </el-text>
    </el-space>
    <template #footer>
      <span class="tags-container">
        <template v-for="(type, index) in sortedItemTypes" :key="index">
          <el-tag
            :type="type === useItemType('multiple') ? 'success' : 'primary'"
          >
            {{ type }}
          </el-tag>
        </template>
      </span>
    </template>
  </el-card>
</template>

<style scoped>
.hanging-indent {
  text-indent: -1.15rem;
  padding-left: 1.15rem;
}

.tags-container {
  margin-left: 0.5ch;
  display: inline-flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
