<script setup lang="ts">
import type { PluginInfo } from '@data/plugins.data'
import type { PluginTag } from '@data/pluginTags'
import { tags as allTags } from '@data/pluginTags'
import { useClipboard } from '@vueuse/core'
import GitHubIcon from './icons/GitHubIcon.vue'
import ShareIcon from './icons/ShareIcon.vue'

const props = defineProps<{
  plugin: PluginInfo
}>()

const emits = defineEmits(['showDownload'])

function showDownload() {
  emits('showDownload', props.plugin)
}

function copyLink() {
  const base = `${window.location.origin}${window.location.pathname}`
  const link = `${base}#search=${encodeURI(props.plugin.name)}`
  const { copy, copied, isSupported } = useClipboard({ source: link })

  if (!isSupported) {
    ElMessage({
      message: '您的浏览器不支持剪贴板接口，请手动复制。',
      type: 'error',
    })
  }
  copy(link)
  if (copied) {
    ElMessage({
      message: '复制成功！',
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
        content="插件作者"
        placement="bottom"
      >
        <el-text>
          <el-icon>
            <i-ep-avatar />
          </el-icon>
          <el-link :href="props.plugin.author.url">
            {{ props.plugin.author.name }}
          </el-link>
        </el-text>
      </el-tooltip>

      <el-tooltip
        class="box-item"
        effect="dark"
        content="插件星标量"
        placement="bottom"
      >
        <el-text>
          <el-icon>
            <i-ep-star-filled />
          </el-icon>
          <span>{{ props.plugin.stars }}</span>
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
        :type="tag === 'favorite' ? 'success' : 'info'"
      >
        <el-tooltip
          class="box-item"
          effect="dark"
          :content="allTags.find((t: PluginTag) => t.value === tag)?.description"
          placement="bottom"
        >
          {{ allTags.find((t: PluginTag) => t.value === tag)?.label }}
        </el-tooltip>
      </el-tag>
    </div>

    <template #footer>
      <div class="footer_left">
        <el-button type="primary" @click="showDownload">
          下载
        </el-button>
      </div>

      <div class="footer_right">
        <el-tooltip content="访问插件主页">
          <el-button
            tag="a"
            :href="`https://github.com/${props.plugin.repo}#readme`"
            target="_blank"
          >
            <el-icon><GitHubIcon /></el-icon>
            <!-- <el-icon><IEpDocument /></el-icon> -->
          </el-button>
        </el-tooltip>

        <el-tooltip content="复制链接以分享">
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
