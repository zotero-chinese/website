<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import GitChangelog from './GitChangelog.vue'
import GitContributors from './GitContributors.vue'

const { page } = useData()

const git = computed(() => page.value.git)

// 样式详情页没有提交记录，贡献者已由构建期从 metadata.json 解析后注入 page.git
const hasContributors = computed(() => Boolean(git.value?.contributors?.length))
const changelog = computed(() => git.value?.changelog ?? [])
</script>

<template>
  <div v-if="hasContributors || changelog.length" class="git-info vp-doc">
    <template v-if="hasContributors">
      <h2 id="git-contributors" tabindex="-1">
        贡献者
        <a
          href="#git-contributors"
          class="header-anchor"
          aria-label="Permalink to 'git-contributors'"
        />
      </h2>
      <GitContributors :contributors="git!.contributors!" />
    </template>

    <GitChangelog v-if="changelog.length" :commits="changelog" />
  </div>
</template>

<style scoped>
.git-info {
  margin-top: 2rem;
}
</style>
