<script setup lang="ts">
import { tags as allTags } from '@data/pluginTags'
import type { PluginTag } from '@data/pluginTags'
import type { PluginInfo } from '@data/plugins.data'

const props = defineProps<{
  plugin: PluginInfo
}>()

const emits = defineEmits(['showDownload'])

function showDownload() {
  emits('showDownload', props.plugin)
}
</script>

<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <b>
          <el-link :href="`https://github.com/${props.plugin.repo}`" target="_blank">
            <el-text tag="b" size="large">{{ props.plugin.name }}</el-text>
          </el-link>
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
            <Avatar />
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
            <StarFilled />
          </el-icon>
          {{ props.plugin.stars }}
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
      <el-button type="primary" @click="showDownload">
        下载
      </el-button>
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

.el-tag {
  margin: 5px 5px 0px 0px;
}
</style>
