<script setup lang="ts">
import { inBrowser, useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { watchEffect } from 'vue'

import Banner from './components/Banner.vue'
import DocFooter from './components/DocFooter.vue'
import Giscus from './components/Giscus.vue'

import { useLanguageNotification } from './composables/useLanguageNotification'

useLanguageNotification()

// https://vitepress.dev/guide/extending-default-theme#layout-slots
const { Layout } = DefaultTheme

const { lang } = useData()
// https://vitepress.dev/zh/guide/i18n#separate-directory-for-each-locale
watchEffect(() => {
  if (inBrowser) {
    document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2030 00:00:00 UTC; path=/`
  }
})
</script>

<template>
  <Layout>
    <template #layout-top>
      <Banner />
    </template>

    <template #doc-footer-before>
      <DocFooter />
    </template>

    <template #doc-after>
      <Giscus />
    </template>

    <template #home-features-after>
      <!-- <HomeSponsors /> -->
    </template>

    <template #aside-ads-before>
      <!-- <AsideSponsors /> -->
    </template>
  </Layout>
</template>
