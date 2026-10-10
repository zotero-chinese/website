<script setup lang="ts">
import type { PluginInfo } from '@data/plugins.data'
import type { PluginTag } from '@data/pluginTags'
import { getPluginDocUrl } from '@data/pluginDocs'
import { getPluginTags } from '@data/pluginTags'
import { usePluginLocale } from '@theme/composables/usePluginLocale'
import { useTimeAgoIntl } from '@vueuse/core'
import { useData } from 'vitepress'
import { computed } from 'vue'
import DownloadIcon from './icons/DownloadIcon.vue'
import GitHubIcon from './icons/GitHubIcon.vue'
import ShareIcon from './icons/ShareIcon.vue'

const props = defineProps<{
  plugin: PluginInfo
  /** 是否显示最后更新时间（仅在按更新时间排序时） */
  showLastUpdated?: boolean
}>()

const emits = defineEmits(['showDownload', 'filterByAuthor'])

const locale = usePluginLocale()
const { lang } = useData()
const allTags = computed(() => getPluginTags(lang.value))
const displayName = computed(() =>
  lang.value.startsWith('zh') ? props.plugin.nameZh || props.plugin.name : props.plugin.name,
)
const description = computed(() =>
  lang.value.startsWith('zh')
    ? props.plugin.summaryZh || props.plugin.description
    : props.plugin.description,
)
// 相对时间（如“3 天前”），基于 Intl.RelativeTimeFormat，随语言切换
const lastUpdatedText = useTimeAgoIntl(() => props.plugin.lastUpdated || Date.now(), {
  get locale() {
    return lang.value
  },
})
const releaseLabel = computed(() =>
  props.plugin.lastUpdated
    ? `${locale.value.releaseUpdatedAt} ${new Date(props.plugin.lastUpdated).toLocaleString(lang.value)}`
    : undefined,
)

function showDownload() {
  emits('showDownload', props.plugin)
}

function filterByAuthor() {
  emits('filterByAuthor', props.plugin.author.name)
}

async function copyLink() {
  const base = `${window.location.origin}${window.location.pathname}`
  const link = `${base}#plugin=${encodeURIComponent(props.plugin.repo)}`

  try {
    await navigator.clipboard.writeText(link)
    ElMessage.success(locale.value.copySucessfully)
  } catch {
    ElMessage.error(locale.value.copyFailed)
  }
}

// 插件介绍文档入口（有对应文档时显示，zh/en 列表通用，文档为中文）
const docUrl = computed(() => getPluginDocUrl(props.plugin.repo))
</script>

<template>
  <el-card class="plugin-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <b>
          <el-text tag="b" size="large">{{ displayName }}</el-text>
        </b>
        <el-text
          v-if="displayName !== props.plugin.name"
          class="original-name"
          size="small"
          type="info"
        >
          {{ props.plugin.name }}
        </el-text>
      </div>
    </template>

    <el-space>
      <el-tooltip
        class="box-item"
        effect="dark"
        :content="locale.viewAuthorPlugins"
        placement="bottom"
      >
        <el-text>
          <el-icon>
            <i-ep-avatar />
          </el-icon>
          <el-button
            link
            :aria-label="locale.viewAuthorPlugins + ' · ' + props.plugin.author.name"
            @click="filterByAuthor"
          >
            {{ props.plugin.author.name }}
          </el-button>
        </el-text>
      </el-tooltip>

      <el-tooltip class="box-item" effect="dark" :content="locale.pluginStars" placement="bottom">
        <el-text>
          <el-icon>
            <i-ep-star-filled />
          </el-icon>
          <span>{{ props.plugin.stars }}</span>
        </el-text>
      </el-tooltip>

      <el-tooltip
        v-if="props.showLastUpdated && props.plugin.lastUpdated"
        class="box-item"
        effect="dark"
        :content="releaseLabel"
        placement="bottom"
      >
        <el-text>
          <el-icon>
            <i-ep-clock />
          </el-icon>
          <time :datetime="props.plugin.lastUpdated">{{ lastUpdatedText }}</time>
        </el-text>
      </el-tooltip>
    </el-space>

    <p class="desc">
      <el-text line-clamp="5">
        {{ description }}
      </el-text>
    </p>
    <div class="tags">
      <el-tag
        v-for="tag in props.plugin.tags"
        :key="tag"
        :type="tag.startsWith('favorite') ? 'success' : 'info'"
      >
        <el-tooltip
          class="box-item"
          effect="dark"
          :content="
            allTags.find((t: PluginTag) => t.value === tag.replace(/_zh|_en/, ''))?.description
          "
          placement="bottom"
        >
          {{ allTags.find((t: PluginTag) => t.value === tag.replace(/_zh|_en/, ''))?.label }}
        </el-tooltip>
      </el-tag>
    </div>

    <template #footer>
      <div class="footer_left">
        <el-button
          type="primary"
          :icon="DownloadIcon"
          :auto-insert-space="true"
          @click="showDownload"
        >
          {{ locale.download }}
        </el-button>

        <el-button v-if="docUrl" tag="a" :href="docUrl" :aria-label="locale.docs">
          <el-icon><i-ep-document /></el-icon>
          <span class="docs-label">{{ locale.docs }}</span>
        </el-button>
      </div>

      <div class="footer_right">
        <el-tooltip :content="locale.visitHomepage">
          <el-button
            tag="a"
            :href="`https://github.com/${props.plugin.repo}#readme`"
            target="_blank"
            rel="noopener"
            :aria-label="locale.visitHomepage"
          >
            <el-icon><GitHubIcon /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip :content="locale.copyShareLink">
          <el-button :aria-label="locale.copyShareLink" @click="copyLink">
            <el-icon><ShareIcon /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </template>
  </el-card>
</template>

<style scoped>
.plugin-card {
  container-type: inline-size;
}

.original-name {
  display: block;
}

.desc {
  height: 100px;
}

.desc span {
  line-height: 20px;
  white-space: normal;
  overflow-wrap: anywhere;
}

:deep(.el-card__footer) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
}

.footer_left,
.footer_right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
}

.footer_left .el-button {
  margin-left: 0;
  padding-inline: 8px;
}

.footer_right .el-button {
  margin-left: 0;
  width: 32px;
  padding: 0;
}

.docs-label {
  margin-left: 4px;
}

@container (max-width: 280px) {
  .footer_left .el-button {
    padding-inline: 6px;
  }

  .footer_left :deep(.el-icon) {
    display: none;
  }

  .docs-label,
  .footer_left :deep(.el-icon + span) {
    margin-left: 0;
  }
}
</style>
