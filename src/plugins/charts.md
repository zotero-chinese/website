---
title: 插件排行榜
layout: page
sidebar: false
---

<!-- markdownlint-disable -->

<script setup>
import { defineClientComponent } from 'vitepress'
const PluginsChart = defineClientComponent(() => {
    return import ("./components/PluginsChart.vue")
})
</script>

<ClientOnly>
    <PluginsChart />
</ClientOnly>
