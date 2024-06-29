<script setup lang="ts">
import { ref } from 'vue'

declare interface DownloadLink {
  label: string
  link: string
  download?: string | false
  useFetch?: boolean
}

const props = defineProps<{ downlinks: DownloadLink[] }>()

const loadingStates = ref<boolean[]>(Array(props.downlinks.length).fill(false))

function showMessageInfo() {
  ElMessage('正在下载，请稍后...')
}
function showMessageSuccess() {
  ElMessage({
    message: '下载成功。',
    type: 'success',
  })
}
function showMessageError() {
  ElMessage.error('下载失败，请尝试其他地址。')
}

function fetchAndDownload(url: string, index: number, fileName?: string) {
  if (!fileName)
    fileName = url.split('/').at(-1) || 'file'
  // eslint-disable-next-line no-console
  console.log(`downloading ${url} with name ${fileName}`)
  loadingStates.value[index] = true
  showMessageInfo()

  fetch(url, { mode: 'cors', referrerPolicy: 'no-referrer' })
    .then((res) => {
    // eslint-disable-next-line no-console
      console.log(res)
      return res.blob()
    })
    .then((blob) => {
      const href = URL.createObjectURL(blob)
      const _link = document.createElement('a')
      _link.href = href
      _link.download = fileName
      _link.target = '_blank'
      _link.click()
      URL.revokeObjectURL(href)
      showMessageSuccess()
    })
    .catch((e) => {
      console.error(e)
      showMessageError()
    })
    .finally(() => {
      loadingStates.value[index] = false
    })
}

function openInNewWindow(url: string, index: number) {
  loadingStates.value[index] = true
  window.open(url)
  loadingStates.value[index] = false
}
</script>

<template>
  <div class="buttons">
    <span v-for="(item, index) in downlinks" :key="index" class="button">
      <el-button
        v-if="item.useFetch"
        :loading="loadingStates[index]"
        plain
        bg
        @click="fetchAndDownload(item.link, index)"
      >
        {{ item.label }}
      </el-button>

      <el-button
        v-else
        :loading="loadingStates[index]"
        target="_blank"
        plain
        bg
        @click="openInNewWindow(item.link, index)"
      >
        {{ item.label }}
      </el-button>
    </span>
  </div>
</template>

<style scoped>
.buttons {
  display: flex;
  flex-wrap: wrap;
}
.button {
  flex-shrink: 0;
  padding: 6px;
}
</style>
