<script setup lang="ts">
import type { PluginFullInfo, PluginInfo, ReleaseInfo } from '@data/plugins.data'
import { LATEST_ZOTERO_BETA_VERSION } from '@data/constant'
import { usePluginLocale } from '@theme/composables/usePluginLocale'
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  selectedPlugin?: PluginInfo
}>()

const emits = defineEmits(['update:modelValue'])

const locale = usePluginLocale()

function getTargetZoteroVersions(release: ReleaseInfo) {
  return locale.value.downloadForZotero.replace(
    '{{ version }}',
    release.targetZoteroVersion
      .replaceAll(',', ', ')
      .replace(`${LATEST_ZOTERO_BETA_VERSION}`, `${LATEST_ZOTERO_BETA_VERSION}-beta`),
  )
}

/**
 * 各镜像下载地址。
 *
 * 优先使用数据中的原始地址（`github` 键的值可能是 Gitee 直链等，不能按固定格式推导）；
 * 仅当数据缺失时，才用 repo/tag/文件名兜底推导 GitHub 系列链接。
 */
function buildXpiDownloadUrl(release: ReleaseInfo): Record<string, string> {
  if (release.xpiDownloadUrl && Object.keys(release.xpiDownloadUrl).length > 0) {
    return release.xpiDownloadUrl
  }
  const repo = props.selectedPlugin!.repo
  if (!release.xpiFileName) return {}
  const github = `https://github.com/${repo}/releases/download/${release.tagName}/${release.xpiFileName}`
  return {
    github,
    ghProxy: `https://gh-proxy.org//${github}`,
    kgithub: `https://kkgithub.com/${repo}/releases/download/${release.tagName}/${release.xpiFileName}`,
  }
}

const isShowing = ref(true)

watch(isShowing, (v) => {
  emits('update:modelValue', v)
})

// 完整插件数据（含全部版本与下载信息），打开弹窗时按需加载
const full = ref<PluginFullInfo | null>(null)
const loading = ref(false)
const failed = ref(false)
const loadedRepo = ref('')

watch(
  () => [props.modelValue, props.selectedPlugin?.repo] as const,
  async ([show, repo]) => {
    if (!show || !repo || repo === loadedRepo.value) return
    full.value = null
    loading.value = true
    failed.value = false
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}plugin-data/${repo}.json`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      full.value = (await response.json()) as PluginFullInfo
      loadedRepo.value = repo
    } catch {
      failed.value = true
    } finally {
      loading.value = false
    }
  },
)
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
      <br />
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

    <el-skeleton v-if="loading" :rows="8" animated />
    <el-empty v-else-if="failed" description="插件数据加载失败，请稍后重试" />

    <template v-else>
      <el-card
        v-for="release in full?.releases"
        :key="release.targetZoteroVersion"
        shadow="hover"
        class="card"
      >
        <template #header>
          <div class="card-header">
            <span>{{ getTargetZoteroVersions(release) }}</span>
          </div>
        </template>

        <ul>
          <li>{{ locale.pluginVersion }}{{ release.xpiVersion }}</li>
          <li>{{ locale.releaseDate }}{{ new Date(release.releaseDate).toLocaleString() }}</li>
          <li>
            {{ locale.range }}Zotero {{ release.minZoteroVersion }} — {{ release.maxZoteroVersion }}
          </li>
          <li>
            {{ locale.downloadCount }}
            <img
              alt="GitHub Downloads (all assets, specific tag)"
              :src="`https://img.shields.io/github/downloads/${props.selectedPlugin?.repo!}/${release.tagName}/total`"
            />
          </li>
          <li>
            {{ locale.downloadLink }}
            <el-button
              v-for="(value, key) in buildXpiDownloadUrl(release)"
              :key="key"
              tag="a"
              :href="value"
              text
              bg
            >
              {{ key === 'github' ? 'Official Channel' : `${key}` }}
            </el-button>
          </li>
        </ul>
      </el-card>
    </template>
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
