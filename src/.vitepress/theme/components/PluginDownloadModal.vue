<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PluginInfo } from '@data/plugins.data'

const props = defineProps<{
  modelValue: boolean
  selectedPlugin?: PluginInfo
}>()

const emits = defineEmits(['update:modelValue'])

const isShowing = ref(true)

watch(isShowing, (v) => {
  emits('update:modelValue', v)
})
</script>

<template>
  <div class="modal">
    <el-drawer
      v-model="isShowing"
      direction="rtl"
      size="50%"
      :lock-scroll="false"
      :title="props.selectedPlugin?.name"
    >
      <div class="desc">
        <el-text>
          <el-icon>
            <i-ep-info-filled />
          </el-icon>
          本页面为每一个插件都提供了多个下载地址，请逐个尝试选择可用的地址。
        </el-text>
        <el-text>
          <el-icon>
            <i-ep-info-filled />
          </el-icon>
          火狐浏览器用户请通过在链接上右击，选择“另存为”来下载 XPI 包。
        </el-text>
        <el-text>
          <el-icon>
            <i-ep-info-filled />
          </el-icon>
          插件之间可能存在冲突，建议按需安装。
        </el-text>
        <br>
        <el-text type="warning">
          <el-icon>
            <i-ep-warn-triangle-filled />
          </el-icon>
          Zotero 6 与 Zotero 7 的插件可能互不兼容，请按自己的 Zotero
          版本下载对应的插件版本。查看 Zotero 版本和安装插件步骤请参考：
          <a href="/user-guide/plugins/about-plugin" type="danger">
            关于 Zotero 插件 - 安装插件
          </a>
          。
        </el-text>
      </div>

      <br>

      <div class="cards">
        <el-card
          v-for="release in props.selectedPlugin?.releases"
          :key="release.targetZoteroVersion"
          shadow="hover"
          class="card"
        >
          <template #header>
            <div class="card-header">
              <span>适配 Zotero {{ release.targetZoteroVersion }}</span>
            </div>
          </template>

          <p>插件版本：{{ release.xpiVersion }}</p>
          <p>发布时间：{{ new Date(release.releaseDate).toLocaleString() }}</p>
          <p>下载量：{{ release.downloadCount }}</p>
          <p>下载链接:</p>
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
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>
