<script setup lang="ts">
import type { PluginInfo, ReleaseInfo } from '@data/plugins.data'
import { LATEST_ZOTERO_BETA_VERSION } from '@data/constant'
import { getPluginDocUrl } from '@data/pluginDocs'
import { usePluginDownloads } from '@theme/composables/usePluginDownloads'
import { usePluginLocale } from '@theme/composables/usePluginLocale'
import { useMediaQuery } from '@vueuse/core'
import { useData } from 'vitepress'
import { computed } from 'vue'

const props = defineProps<{
  selectedPlugin?: PluginInfo
  zoteroVersion?: string
}>()

const isShowing = defineModel<boolean>({ required: true })
const locale = usePluginLocale()
const { lang } = useData()
const displayName = computed(() =>
  lang.value.startsWith('zh')
    ? props.selectedPlugin?.nameZh || props.selectedPlugin?.name
    : props.selectedPlugin?.name,
)

function getTargetZoteroVersions(release: ReleaseInfo) {
  return locale.value.downloadForZotero.replace(
    '{version}',
    release.targetZoteroVersion
      .replaceAll(',', ', ')
      .replace(`${LATEST_ZOTERO_BETA_VERSION}`, `${LATEST_ZOTERO_BETA_VERSION}-beta`),
  )
}

const isNarrowScreen = useMediaQuery('(max-width: 500px)')
const drawerSize = computed(() => (isNarrowScreen.value ? '100%' : '50%'))
const repoRef = computed(() => props.selectedPlugin?.repo)
const { full, loading, failed, retry, buildXpiDownloadUrl } = usePluginDownloads(repoRef)
const releases = computed(() =>
  (full.value?.releases ?? [])
    .map((release) => ({
      release,
      matches: Boolean(
        props.zoteroVersion &&
        release.targetZoteroVersion
          .split(',')
          .some((version) => version.trim() === props.zoteroVersion),
      ),
    }))
    .sort((a, b) => Number(b.matches) - Number(a.matches)),
)
const hasMatchingRelease = computed(() => releases.value.some(({ matches }) => matches))
const docUrl = computed(() =>
  props.selectedPlugin ? getPluginDocUrl(props.selectedPlugin.repo) : undefined,
)
const authorReleasesUrl = computed(() =>
  props.selectedPlugin ? `https://github.com/${props.selectedPlugin.repo}/releases` : undefined,
)
</script>

<template>
  <el-drawer
    v-model="isShowing"
    direction="rtl"
    :size="drawerSize"
    modal-class="vp-doc"
    :lock-scroll="true"
    :title="displayName"
  >
    <div class="custom-block warning">
      <el-text>
        <el-icon><i-ep-info-filled /></el-icon>
        {{ locale.downloadTips1 }}
      </el-text>
      <el-text>
        <el-icon><i-ep-info-filled /></el-icon>
        {{ locale.downloadTips2 }}
      </el-text>
      <el-text>
        <el-icon><i-ep-info-filled /></el-icon>
        {{ locale.downloadTips3 }}
      </el-text>
      <br />
      <el-text type="warning">
        <el-icon><i-ep-warn-triangle-filled /></el-icon>
        {{ locale.downloadWarning }}
        <a href="/user-guide/plugins/about-plugin">{{ locale.compatibilityWarning }}</a>
      </el-text>
    </div>

    <div class="doc-entry">
      <el-link v-if="docUrl" type="primary" :href="docUrl" underline="never">
        <el-icon><i-ep-document /></el-icon>
        {{ locale.docs }}
      </el-link>
      <el-link
        type="primary"
        :href="authorReleasesUrl"
        target="_blank"
        rel="noopener"
        underline="never"
      >
        {{ locale.authorReleases }}
      </el-link>
    </div>

    <div v-if="loading" role="status" aria-busy="true">
      <p>{{ locale.downloadLoading }}</p>
      <el-skeleton :rows="8" animated aria-hidden="true" />
    </div>
    <el-empty v-else-if="failed" :description="locale.downloadLoadFailed" role="status">
      <div class="download-actions">
        <el-button @click="retry">{{ locale.retry }}</el-button>
        <el-button tag="a" :href="authorReleasesUrl" target="_blank" rel="noopener">
          {{ locale.authorReleases }}
        </el-button>
      </div>
    </el-empty>

    <template v-else>
      <p v-if="zoteroVersion && !hasMatchingRelease" role="status">
        {{ locale.noCompatibleDownload.replace('{version}', zoteroVersion) }}
      </p>
      <el-card
        v-for="{ release, matches } in releases"
        :key="release.xpiVersion"
        shadow="hover"
        class="card"
      >
        <template #header>
          <div class="card-header">
            <span>{{ getTargetZoteroVersions(release) }}</span>
            <el-tag v-if="matches && zoteroVersion" type="success" size="small">
              {{ locale.recommendedDownload.replace('{version}', zoteroVersion) }}
            </el-tag>
          </div>
        </template>

        <ul>
          <li>{{ locale.pluginVersion }}{{ release.xpiVersion }}</li>
          <li>{{ locale.releaseDate }}{{ new Date(release.releaseDate).toLocaleString(lang) }}</li>
          <li>
            {{ locale.range }}Zotero {{ release.minZoteroVersion }} — {{ release.maxZoteroVersion }}
          </li>
          <li>
            {{ locale.downloadCount }}
            <img
              :alt="locale.downloadCount"
              :src="`https://img.shields.io/github/downloads/${props.selectedPlugin?.repo}/${release.tagName}/total`"
              loading="lazy"
            />
          </li>
          <li>
            {{ locale.downloadLink }}
            <div class="download-actions">
              <el-button
                v-for="(url, source) in buildXpiDownloadUrl(release)"
                :key="source"
                tag="a"
                :href="url"
                text
                bg
              >
                {{ source === 'github' ? locale.originalDownload : source }}
              </el-button>
            </div>
          </li>
        </ul>
      </el-card>
    </template>
  </el-drawer>
</template>

<style scoped>
.card {
  line-height: 24px;
  font-size: var(--vp-custom-block-font-size);
}

.card-header,
.doc-entry,
.download-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.card-header {
  justify-content: space-between;
}

.card-header :deep(.el-tag) {
  margin: 0;
}

.card ul {
  margin: 0;
}

.card li {
  min-height: 24px;
  overflow-wrap: anywhere;
}

.card li img {
  vertical-align: sub;
  max-height: 20px;
  display: inline;
  margin: 0;
}

.doc-entry {
  margin: 0.5rem 0 1rem;
  gap: 16px;
  font-size: 0.9rem;
}

.download-actions {
  margin-top: 4px;
}

.download-actions :deep(.el-button) {
  margin-left: 0;
  max-width: 100%;
  min-height: 32px;
  height: auto;
  line-height: 1.5;
  white-space: normal;
}
</style>
