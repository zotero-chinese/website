---
title: 转换器详情
# layout: page
sidebar: false
aside: false
editLink: false
outline: false
prev:
  text: 返回转换器列表
  link: ./
next: false
comments: false
---

<!-- markdownlint-disable -->

<script setup>
import { useData } from "vitepress";
import TranslatorDetails from "./components/TranslatorDetails.vue";

const { params } = useData();
</script>

[返回转换器列表](./index.md)

<TranslatorDetails :translatorID="params.translatorID"/>
