<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Giscus from "@giscus/vue";
// import "../styles/giscus.dark.css";
// import "../styles/giscus.light.css";
</script>

<template>
  <div class="comments-container">
    <Giscus
      id="comments"
      repo="zotero-chinese/wiki"
      repoId="R_kgDOJZD4iQ"
      category="文档评论区"
      categoryId="DIC_kwDOJZD4ic4CbJJB"
      mapping="pathname"
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="preferred_color_scheme"
      lang="zh-CN"
      loading="lazy"
    />
  </div>
</template>

<style>
#comments::part(iframe) {
  /* max-width: 640px; */
  /* margin: auto; */
  /* display: flex; */
}

.comments-container {
  /* max-height: 640px; */
  /* overflow-y: scroll; */
  margin-top: 5rem;
}
</style>
