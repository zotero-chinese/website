<script setup>
import { ref } from 'vue'

const showBanner = ref(true)

function closeBanner() {
  showBanner.value = false
}
</script>

<template>
  <div v-if="showBanner" class="new-year-banner">
    <p>🎉 新年快乐！Zotero 中文社区祝全球学者万事如意，阖家幸福！🎊</p>
    <el-button type="danger" class="close-button" @click="closeBanner">
      <el-icon><i-ep-close-bold /></el-icon>
    </el-button>
  </div>
</template>

<style>
.new-year-banner {
  top: 0;
  left: 0;
  width: 100%;
  background-color: #f56c6c;
  color: white;
  text-align: center;
  padding: 15px 15px;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
  z-index: 1000;
  /* box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); */
}
.VPNav {
  position: relative !important;
}
.new-year-banner p {
  /* margin: 3px; */
  display: inline-block;
}

.new-year-banner .close-button {
  float: right;
}

@media (max-width: 768px) {
  .new-year-banner {
    display: flex;
    align-items: center;
    font-size: 14px;
    padding: 10px 8px;
  }
}
</style>
