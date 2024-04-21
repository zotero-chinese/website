---
title: 转换器详情
sidebar: false
aside: false
editLink: false
outline: false
prev:
  text: 返回转换器列表
  link: ./
next: false
---

<!-- markdownlint-disable -->

<script setup>
import { useData } from "vitepress";
const { params } = useData();
import TranslatorTimeline from "./components/TranslatorTimeline.vue"
</script>

# {{$params.metadata.label}} 的转换器

[返回转换器列表](./index.md)

## 元数据

```json-vue
{{$params.metadata}}
```

## 示例

<!-- @content -->

## 最近更新

<TranslatorTimeline :trends="params.trends" />

<style>
.vp-doc ul {
    list-style: none;
}
</style>
