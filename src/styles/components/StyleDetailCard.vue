<script setup lang="ts">
// @ts-ignore
import { data as styles } from "../data/styles.data";

import { useData } from "vitepress";
const { page } = useData();

const style = styles.find(
  (s) => s.dir === page.value.relativePath.split("/")[1],
);

const contributors = "";

const repoU = "redleafnew";
const repoN = "Chinese-STD-GB-T-7714-related-csl";
const rawLink = `https://github.com/${repoU}/${repoN}/blob/main/src/${style?.dir}/${style?.file}`;
const githubLink = `https://github.com/${repoU}/${repoN}/raw/main/src/${style?.dir}/${style?.file}`;
const downloadLinks = {
  github: githubLink,
  gitee: githubLink.replace("github.com", "gitee.com"),
  jsd: `https://cdn.jsdelivr.net/gh/${repoU}/${repoN}@main/src/${style?.dir}/${style?.file}`,
  ghproxy: "#",
};
</script>

<template>
  <p><a href="../">返回列表</a></p>
  <template v-if="style">
    <h1 :id="style.title">{{ style.title }}</h1>

    <h2 id="info">
      元数据
      <a class="header-anchor" href="#info" aria-label="Permalink to info" />
    </h2>

    <el-descriptions :column="2" border>
      <el-descriptions-item label="ID" :span="2">
        {{ style.id }}
      </el-descriptions-item>

      <el-descriptions-item label="标题" :span="2">
        {{ style.title }}
      </el-descriptions-item>

      <el-descriptions-item label="简介" :span="2">
        {{ style.summary }}
      </el-descriptions-item>

      <el-descriptions-item label="规范" :span="2">
        {{ style.link_documentation }}
      </el-descriptions-item>

      <el-descriptions-item label="贡献者">
        {{ contributors }}
      </el-descriptions-item>

      <el-descriptions-item label="更新时间">
        {{ style.updated }}
      </el-descriptions-item>

      <el-descriptions-item label="格式">
        {{ style.style_class }}， {{ style.citation_format }}
      </el-descriptions-item>

      <el-descriptions-item label="标签">
        {{ style.tags.join(", ") }}
      </el-descriptions-item>
    </el-descriptions>

    <h2 id="link">
      下载样式
      <a class="header-anchor" href="#link" aria-label="Permalink to link" />
    </h2>
    <ul>
      <li><a :href="downloadLinks.github">从 GitHub 安装样式</a></li>
      <li><a :href="downloadLinks.gitee">从 Gitee 安装样式</a></li>
      <li><a :href="downloadLinks.jsd">从 JsDeliver 安装样式</a></li>
      <li><a :href="downloadLinks.ghproxy">从 GH Proxy 安装样式</a></li>
      <!-- <li v-for="(v, k) in downloadLinks" :key="k">
        <a :href="v">{{ k }}</a>
      </li> -->
      <li><a :href="rawLink">查看源码</a></li>
    </ul>
  </template>
  <template v-else>未找到此条目。</template>
</template>
