<script setup lang="ts">
import type { GitCommit } from '@data/git-types'
import { computed, ref } from 'vue'
import GitContributors from './GitContributors.vue'

const props = defineProps<{
  commits: GitCommit[]
}>()

const HASH_LETTERS = 7

const expanded = ref(false)

// 固定使用 zh-CN：本站只有中文页面，且格式化结果需在服务端与客户端一致，
// 否则 SSR 产物与客户端渲染不一致会触发 hydration 警告
const dateFormatter = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'short' })
const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const latest = computed(() => {
  const time = props.commits[0]?.time
  return time ? timeFormatter.format(time) : ''
})

const rows = computed(() =>
  props.commits.map((commit) => ({
    ...commit,
    shortHash: commit.hash.slice(0, HASH_LETTERS),
    date: dateFormatter.format(commit.time),
    iso: new Date(commit.time).toISOString(),
  })),
)
</script>

<template>
  <h2 id="doc-changelog" tabindex="-1">
    更新日志
    <a href="#doc-changelog" class="header-anchor" aria-label="Permalink to 'doc-changelog'" />
  </h2>

  <div class="git-changelog" :class="{ expanded }">
    <button
      type="button"
      class="git-changelog-header"
      :aria-expanded="expanded"
      aria-controls="git-changelog-list"
      @click="expanded = !expanded"
    >
      <span class="git-changelog-latest">
        <span class="git-changelog-icon" />
        最近更新：{{ latest }}
      </span>
      <span class="git-changelog-toggle">
        查看全部更新日志
        <span class="git-changelog-chevron" />
      </span>
    </button>

    <div class="git-changelog-body">
      <div id="git-changelog-list" class="git-changelog-list">
        <template v-for="commit in rows" :key="commit.hash">
          <span class="git-changelog-commit-icon" />
          <div class="git-changelog-item">
            <a
              v-if="commit.commitUrl"
              :href="commit.commitUrl"
              class="git-changelog-hash"
              target="_blank"
              rel="noreferrer"
            >
              <code>{{ commit.shortHash }}</code>
            </a>
            <code v-else class="git-changelog-hash">{{ commit.shortHash }}</code>
            <span class="git-changelog-divider">-</span>
            <span class="git-changelog-message" v-html="commit.message" />
            <GitContributors
              :contributors="[commit.author, ...(commit.coAuthors ?? [])]"
              mode="inline"
            />
            <span class="git-changelog-date">
              于
              <time :datetime="commit.iso">{{ commit.date }}</time>
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.git-changelog {
  margin-block: 1rem;
  border-radius: 8px;
  background-color: var(--vp-custom-block-details-bg);
  font-size: var(--vp-custom-block-font-size);
}

.git-changelog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  border: none;
  background: transparent;
  color: var(--vp-custom-block-details-text);
  font: inherit;
  font-weight: 700;
  text-align: start;
  cursor: pointer;
}

.git-changelog-header:hover {
  color: var(--vp-c-brand-1);
}

/* 用 grid 行高过渡代替 JS 测量高度，展开动画不必额外组件 */
.git-changelog-body {
  display: grid;
  grid-template-rows: 0fr;
  /* 收起的列表同时移出可见区与 Tab 焦点顺序 */
  visibility: hidden;
  transition:
    grid-template-rows 0.25s ease-in-out,
    visibility 0.25s;
}

.git-changelog.expanded .git-changelog-body {
  grid-template-rows: 1fr;
  visibility: visible;
}

.git-changelog-list {
  display: grid;
  grid-template-columns: 30px auto;
  gap: 0.375rem;
  overflow: hidden;
  min-height: 0;
  padding-inline: 1rem;
}

.git-changelog.expanded .git-changelog-list {
  padding-block-end: 0.5rem;
}

.git-changelog-icon,
.git-changelog-commit-icon {
  display: inline-block;
  flex-shrink: 0;
  background-color: currentcolor;
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
}

.git-changelog-icon {
  width: 1.75em;
  height: 1.25em;
  margin-inline-end: 0.5rem;
  vertical-align: middle;
  transform: translateY(-1px);
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' d='M2.71 10.96a6.5 6.5 0 1 0-.69-3.53M2 8l1.5-1.5M2 8L.5 6.5m8 2v-4m0 4h3'/%3E%3C/svg%3E");
}

.git-changelog-chevron {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-inline-start: 0.25rem;
  vertical-align: middle;
  background-color: currentcolor;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m4 6 4 4 4-4'/%3E%3C/svg%3E");
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  transition: transform 0.25s ease-in-out;
}

.expanded .git-changelog-chevron {
  transform: rotate(180deg);
}

.git-changelog-commit-icon {
  width: 1.75rem;
  height: 1.25rem;
  align-self: center;
  opacity: 0.3;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0m3-9v6m0 6v6'/%3E%3C/svg%3E");
}

.git-changelog-item {
  display: flex;
  /* 不整体换行：否则长提交信息会作为一个整体掉到下一行，
     而是让它在中间列内部自行折行 */
  flex-wrap: nowrap;
  align-items: baseline;
  gap: 0.25rem;
  min-width: 0;
}

.git-changelog-hash,
.git-changelog-divider,
.git-changelog-author {
  flex: none;
}

.git-changelog-hash {
  text-decoration: none !important;
  color: var(--vp-c-brand-1);
}

.git-changelog-hash::after {
  display: none !important;
}

.git-changelog-message {
  flex: 1 1 auto;
  min-width: 0;
  margin-inline-end: 0.5rem;
  /* 连续长串（链接、无空格标识符）也能断开，不会撑出容器 */
  overflow-wrap: anywhere;
  word-break: break-word;
}

.git-changelog-message :deep(a) {
  text-decoration: underline;
}

/* 行内头像由子组件渲染，不能被压缩，否则会被长提交信息挤掉 */
.git-changelog-item :deep(.git-contributors) {
  flex: none;
}

.git-changelog-date {
  flex: none;
  margin-inline-start: auto;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  white-space: nowrap;
}

@media (max-width: 419px) {
  .git-changelog-toggle {
    display: none;
  }

  .git-changelog-date {
    margin-inline-start: 0;
  }
}
</style>
