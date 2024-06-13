<script setup lang="ts">
import {
  useSortedItemTypes,
  useItemType,
  useTranslatorType,
} from "../composables/localize";

defineProps<{ translator: TranslatorLittle }>();
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
            v-for="(type, index) in useTranslatorType(
              translator.translatorType,
            )"
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
        <template
          v-for="(type, index) in useSortedItemTypes(
            translator.itemTypes.map((type) => useItemType(type)),
          )"
          :key="index"
        >
          <el-tag v-if="type === useItemType('multiple')" type="success">
            {{ type }}
          </el-tag>
          <el-tag v-else type="primary">
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
