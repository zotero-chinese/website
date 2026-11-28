<script setup lang="ts">
import type { GitContributor } from '@data/git-types'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  contributors: GitContributor[]
  /** 页面内平铺展示，或作为提交行的行内小头像 */
  mode?: 'grid' | 'inline'
}>()

/** 头像加载失败时回退到首字母 */
const failed = ref(new Set<string>())
watch(
  () => props.contributors,
  () => (failed.value = new Set()),
)

const items = computed(() => {
  const seen = new Set<string>()
  return props.contributors
    .filter((contributor) => {
      // 同一人可能既是作者又是 co-author，按名称去重避免重复头像
      if (seen.has(contributor.name)) return false
      seen.add(contributor.name)
      return true
    })
    .map((contributor) => ({
      ...contributor,
      initial: (contributor.name || '?').slice(0, 1).toUpperCase(),
      showAvatar: Boolean(contributor.avatar) && !failed.value.has(contributor.name),
    }))
})

function markFailed(name: string) {
  failed.value = new Set(failed.value).add(name)
}
</script>

<template>
  <div class="git-contributors" :class="mode ?? 'grid'">
    <component
      :is="contributor.url ? 'a' : 'span'"
      v-for="contributor in items"
      :key="contributor.name"
      class="git-contributor"
      :href="contributor.url"
      :target="contributor.url ? '_blank' : undefined"
      :rel="contributor.url ? 'noreferrer' : undefined"
      :title="contributor.name"
    >
      <span class="git-avatar">
        <img
          v-if="contributor.showAvatar"
          :src="contributor.avatar"
          :alt="`${contributor.name} 的头像`"
          loading="lazy"
          @error="markFailed(contributor.name)"
        />
        <span v-else class="git-avatar-fallback">{{ contributor.initial }}</span>
      </span>
      <span v-if="(mode ?? 'grid') === 'grid'" class="git-contributor-name">
        {{ contributor.name }}
      </span>
    </component>
  </div>
</template>

<style scoped>
.git-contributors.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin: 1rem 0;
}

.git-contributors.inline {
  display: inline-flex;
  vertical-align: middle;
  margin-inline-start: 0.25rem;
}

.git-contributor {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none !important;
  color: inherit;
}

.git-contributor:hover .git-contributor-name {
  color: var(--vp-c-brand-1);
}

.git-contributor::after {
  display: none !important;
}

.git-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
}

.git-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  /* 抵消 .vp-doc img 的上下外边距，否则会撑高行 */
  margin: 0;
}

.git-avatar-fallback {
  user-select: none;
}

.inline .git-avatar {
  width: 1.15rem;
  height: 1.15rem;
  border: 2px solid var(--vp-c-bg);
  font-size: 0.5rem;
}

.inline .git-contributor + .git-contributor {
  margin-inline-start: -0.5rem;
}
</style>
