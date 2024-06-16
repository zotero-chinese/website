<script setup lang="ts">
import { ref, type Ref } from "vue";

declare interface DownloadLink {
  label: string;
  link: string;
  download?: string | false;
  useFetch?: boolean;
}

const props = defineProps<{ downlinks: DownloadLink[] }>();

const buttons = ref<Ref<HTMLButtonElement>[]>([]);
const loadingStates = ref<boolean[]>(Array(props.downlinks.length).fill(false));

const showMessageInfo = () => {
  ElMessage("正在下载，请稍后...");
};
const showMessageSuccess = () => {
  ElMessage({
    message: "下载成功。",
    type: "success",
  });
};
const showMessageError = () => {
  ElMessage.error("下载失败，请尝试其他地址。");
};

function fetchAndDownload(url: string, index: number, fileName?: string) {
  if (!fileName) fileName = url.split("/").at(-1) || "file";
  console.log(`downloading ${url} with name ${fileName}`);
  loadingStates.value[index] = true;
  showMessageInfo();

  fetch(url, { mode: "cors", referrerPolicy: "no-referrer" })
    .then((res) => {
      console.log(res);
      return res.blob();
    })
    .then((blob) => {
      const href = URL.createObjectURL(blob);
      const _link = document.createElement("a");
      _link.href = href;
      _link.download = fileName;
      _link.target = "_blank";
      _link.click();
      URL.revokeObjectURL(href);
      showMessageSuccess();
    })
    .catch((e) => {
      console.error(e);
      showMessageError();
    })
    .finally(() => {
      loadingStates.value[index] = false;
    });
}

function openInNewWindow(url: string, index: number) {
  loadingStates.value[index] = true;
  window.open(url);
  loadingStates.value[index] = false;
}
</script>

<template>
  <div class="buttons">
    <span v-for="(item, index) in downlinks" :key="index" class="button">
      <el-button
        v-if="item.useFetch"
        @click="fetchAndDownload(item.link, index)"
        :loading="loadingStates[index]"
        plain
        bg
      >
        {{ item.label }}
      </el-button>

      <el-button
        v-else="!item.useFetch"
        @click="openInNewWindow(item.link, index)"
        :loading="loadingStates[index]"
        target="_blank"
        plain
        bg
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
