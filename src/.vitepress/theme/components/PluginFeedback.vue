<script setup lang="ts">
/**
 * 插件文档页末尾的反馈提示。
 *
 * 由 markdownTransform 注入到带 `plugin:` frontmatter 的文档末尾
 * （渲染位置在评论区上方），引导用户前往插件仓库提交 Issue，
 * 避免反馈沉没在网站评论区（插件作者不一定能看到）。
 */
const props = defineProps<{
  /** 插件仓库，如 windingwind/zotero-better-notes */
  repo: string
}>()

const issuesUrl = `https://github.com/${props.repo}/issues/new`
</script>

<template>
  <div class="plugin-feedback">
    <div class="custom-block tip">
      <p class="custom-block-title">💬 反馈与建议</p>
      <p>
        发现 Bug 或有功能建议？本站评论区插件作者不一定能看到，请前往插件仓库提交 Issue：
      </p>
      <p>
        <el-button type="primary" tag="a" :href="issuesUrl" target="_blank" rel="noopener">
          前往 {{ props.repo }} 提交 Issue
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
