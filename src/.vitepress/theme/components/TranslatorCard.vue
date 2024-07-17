<script setup lang="ts">
import type { TranslatorLittle } from '@data/translatorsLittle.data'
import {
  useItemType,
  useSortedItemTypes,
  useTranslatorType,
} from '../composables/localize'

const props = defineProps<{ translator: TranslatorLittle }>()

const sortedItemTypes = props.translator.itemTypes
  .map(v => useItemType(v))
  .sort(useSortedItemTypes)

const translatorTypes = useTranslatorType(props.translator.translatorType)
</script>

<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <b>
          <el-text tag="b" size="large">{{ props.translator.zhLabel }}</el-text>
        </b>
      </div>
    </template>

    <el-space direction="vertical" alignment="normal" fill>
      <el-text class="hanging-indent" style="overflow-wrap: break-word">
        <el-icon>
          <User />
        </el-icon>
        <span>{{ props.translator.creator }}</span>
      </el-text>

      <el-text class="hanging-indent" style="word-break: break-all">
        <el-icon>
          <Link />
        </el-icon>
        <span>{{ props.translator.target }}</span>
      </el-text>

      <el-text>
        <el-icon>
          <Refresh />
        </el-icon>
        <span>{{ props.translator.lastUpdated }}</span>
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
  display: inline-flex;
  flex-wrap: wrap;
}
</style>
