<script setup lang="ts">
import type { PluginInfo } from '@data/plugins.data'
import type { PluginTag } from '@data/pluginTags'
import { getPluginTags } from '@data/pluginTags'
import { usePluginLocale } from '@theme/composables/usePluginLocale'
import { useClipboard, useTimeAgoIntl } from '@vueuse/core'
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

// 相对时间（如“3 天前”），基于 Intl.RelativeTimeFormat，随语言切换
const lastUpdatedText = useTimeAgoIntl(() => props.plugin.lastUpdated || Date.now(), {
  locale: lang.value.startsWith('en') ? 'en-US' : 'zh-CN',
})

function showDownload() {
  emits('showDownload', props.plugin)
}

function filterByAuthor() {
  emits('filterByAuthor', props.plugin.author.name)
}

function copyLink() {
  const base = `${window.location.origin}${window.location.pathname}`
  const link = `${base}#search=${encodeURI(props.plugin.name)}`
  const { copy, copied, isSupported } = useClipboard({ source: link })

  if (!isSupported) {
    ElMessage({
      message: locale.value.copyFailed,
      type: 'error',
    })
  }
  copy(link)
  if (copied) {
    ElMessage({
      message: locale.value.copySucessfully,
      type: 'success',
    })
  }
}
</script>

<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <b>
          <el-text tag="b" size="large">{{ props.plugin.name }}</el-text>
        </b>
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
          <el-link @click.prevent="filterByAuthor">
            {{ props.plugin.author.name }}
          </el-link>
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
        :content="new Date(props.plugin.lastUpdated).toLocaleString()"
        placement="bottom"
      >
        <el-text>
          <el-icon>
            <i-ep-clock />
          </el-icon>
          <span>{{ lastUpdatedText }}</span>
        </el-text>
      </el-tooltip>
    </el-space>

    <p class="desc">
      <el-text truncated line-clamp="5">
        {{ props.plugin.description }}
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
      </div>

      <div class="footer_right">
        <el-tooltip :content="locale.visitHomepage">
          <el-button
            tag="a"
            :href="`https://github.com/${props.plugin.repo}#readme`"
            target="_blank"
          >
            <el-icon><GitHubIcon /></el-icon>
            <!-- <el-icon><IEpDocument /></el-icon> -->
          </el-button>
        </el-tooltip>

        <el-tooltip :content="locale.copyShareLink">
          <el-button @click="copyLink">
            <el-icon><ShareIcon /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </template>
  </el-card>
</template>

<style scoped>
.desc {
  height: 100px;
}

.desc span {
  /* max-height: 100px; */
  white-space: normal;
}

:deep(.el-card__footer) {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
</style>
