<script lang="ts" setup>
// Modify from https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/components/VPSocialLinks.vue

import type { DefaultTheme } from 'vitepress/theme'
import { useData } from 'vitepress'
import { VPSocialLink } from 'vitepress/theme'
import { computed } from 'vue'

const props = defineProps<{
  links: DefaultTheme.SocialLink[]
}>()

const { page } = useData()
const githubLink = computed(() => {
  const path = page.value.filePath
  if (path.match('wiki/'))
    return 'https://github.com/zotero-chinese/wiki'
  else if (path.match('plugins/'))
    return 'https://github.com/zotero-chinese/zotero-plugins'
  else if (path.match('styles/'))
    return 'https://github.com/zotero-chinese/styles'
  else if (path.match('translators/'))
    return 'https://github.com/l0o0/translators_CN'

  return 'https://github.com/zotero-chinese/website'
})

const links = computed((): DefaultTheme.SocialLink[] => [
  ...props.links.filter(link => link.icon !== 'github'),
])
</script>

<template>
  <div class="VPSocialLinks">
    <VPSocialLink
      :key="page.filePath"
      icon="github"
      :link="githubLink"
      aria-label="GitHub"
    />
    <VPSocialLink
      v-for="{ link, icon, ariaLabel } in links"
      :key="link"
      :icon
      :link
      :aria-label
    />
  </div>
</template>

<style scoped>
.VPSocialLinks {
  display: flex;
  justify-content: center;
}
</style>
