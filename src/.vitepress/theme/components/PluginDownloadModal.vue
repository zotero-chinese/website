<script setup lang="ts">
import type { PluginInfo } from '@data/plugins.data'
import { usePluginLocale } from '@theme/composables/usePluginLocale'
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  selectedPlugin?: PluginInfo
}>()

const emits = defineEmits(['update:modelValue'])

const locale = usePluginLocale()
const isShowing = ref(true)

watch(isShowing, (v) => {
  emits('update:modelValue', v)
})
</script>

<template>
  <el-drawer
    v-model="isShowing"
    direction="rtl"
    size="50%"
    modal-class="vp-doc"
    :lock-scroll="true"
    :title="props.selectedPlugin?.name"
  >
    <!-- <div
      class="custom-block info"
    >
      <p class="custom-block-title">
        插件信息
      </p>
      <p>插件名：</p>
    </div> -->

    <div class="custom-block warning">
      <el-text>
        <el-icon>
          <i-ep-info-filled />
        </el-icon>
        {{ locale.downloadTips1 }}
      </el-text>
      <el-text>
        <el-icon>
          <i-ep-info-filled />
        </el-icon>
        {{ locale.downloadTips2 }}
      </el-text>
      <el-text>
        <el-icon>
          <i-ep-info-filled />
        </el-icon>
        {{ locale.downloadTips3 }}
      </el-text>
      <br>
      <el-text type="warning">
        <el-icon>
          <i-ep-warn-triangle-filled />
        </el-icon>
        {{ locale.downloadWarning }}
        <a href="/user-guide/plugins/about-plugin" type="danger">
          {{ locale.compatibilityWarning }}
        </a>
        。
      </el-text>
    </div>

    <el-card
      v-for="release in props.selectedPlugin?.releases"
      :key="release.targetZoteroVersion"
      shadow="hover"
      class="card "
    >
      <template #header>
        <div class="card-header">
          <span>{{ locale.downloadForZotero.replace('\{\{ version \}\}', release.targetZoteroVersion) }}</span>
        </div>
      </template>

      <ul>
        <li>{{ locale.pluginVersion }}{{ release.xpiVersion }}</li>
        <li>{{ locale.releaseDate }}{{ new Date(release.releaseDate).toLocaleString() }}</li>
        <li>{{ locale.range }}Zotero {{ release.minZoteroVersion }} — {{ release.maxZoteroVersion }}</li>
        <li>
          {{ locale.downloadCount }}
          <img alt="GitHub Downloads (all assets, specific tag)" :src="`https://img.shields.io/github/downloads/${props.selectedPlugin?.repo!}/${release.tagName}/total`">

        <!-- {{ release.downloadCount === 0 ? locale.cantGetDownloadCount : release.downloadCount }} -->
        </li>
        <li>
          {{ locale.downloadLink }}
          <el-button
            v-for="(value, key) in release.xpiDownloadUrl"
            :key="key"
            tag="a"
            :href="value"
            text
            bg
          >
            {{ key }}
          </el-button>
        </li>
      </ul>
    </el-card>
  </el-drawer>
</template>

<style lang="css" scoped>
.card {
  line-height: 24px;
  font-size: var(--vp-custom-block-font-size);
}
.card ul {
  margin: 0;
}
.card li {
  height: 24px;
}
.card li img {
  vertical-align: sub;
  max-height: 20px;
  display: inline;
  margin: 0px 0px;
}
</style>
