<script setup lang="ts">
/**
 * 插件文档页末尾的反馈提示。
 *
 * 由 markdownTransform 注入到 user-guide/plugins/ 目录下的所有文档末尾
 * （渲染位置在评论区上方）；插件仓库取自文档 frontmatter 的 `plugin` 字段，
 * 未标注时组件整体隐藏。
 *
 * 引导用户前往插件仓库提交 Issue，避免反馈沉没在网站评论区
 * （插件作者不一定能看到）。
 */
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

const repo = computed<string | undefined>(() => {
  const r = frontmatter.value.plugin
  return typeof r === 'string' && r ? r : undefined
})
const issuesUrl = computed(() => (repo.value ? `https://github.com/${repo.value}/issues/new` : ''))
</script>

<template>
  <div v-if="repo" class="plugin-feedback">
    <div class="custom-block tip">
      <p class="custom-block-title">💬 反馈与建议</p>
      <p>发现 Bug 或有功能建议？本站评论区插件作者不一定能看到，请前往插件仓库提交 Issue：</p>
      <p>
        <el-button tag="a" :href="issuesUrl" target="_blank" rel="noopener">
          前往 {{ repo }} 提交 Issue
        </el-button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.plugin-feedback {
  margin-top: 2rem;
}
</style>
