<script setup lang="ts">
import Giscus from '@giscus/vue'
import { useData } from 'vitepress'

// import "../styles/giscus.dark.css";
// import "../styles/giscus.light.css";

const { frontmatter, title, isDark } = useData()
</script>

<template>
  <div
    v-if="frontmatter.comments !== false"
    :key="title"
    class="comments-container"
  >
    <Giscus
      id="comments"
      repo="zotero-chinese/wiki"
      repo-id="R_kgDOJZD4iQ"
      category="文档评论区"
      category-id="DIC_kwDOJZD4ic4CbJJB"
      mapping="pathname"
      strict="1"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="top"
      :theme="isDark ? 'transparent_dark' : 'light'"
      lang="zh-CN"
      loading="lazy"
    />
  </div>
</template>

<style>
.comments-container {
  /* max-height: 640px; */
  /* overflow-y: scroll; */
  margin-top: 5rem;
}
</style>
