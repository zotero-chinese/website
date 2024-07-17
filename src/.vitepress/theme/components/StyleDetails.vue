<script setup lang="ts">
import { useData } from 'vitepress'
import { data as styles } from '@data/styles.data'

const { page } = useData()

const style = styles.find(
  s => s.dir === page.value.relativePath.split('/')[1],
)

const contributors = [
  ...(style?.author?.map(v => v.name) || ''),
  ...(style?.contributor?.map(v => v.name) || ''),
].join(', ')

const repoU = 'zotero-chinese'
const repoN = 'styles'
const rawLink = `https://github.com/${repoU}/${repoN}/blob/main/src/${style?.dir}/${style?.file}`
const downloadLinks = {
  // https://raw.githubusercontent.com/redleafnew/Chinese-STD-GB-T-7714-related-csl/main/src/accounting-research/accounting-research.csl
  github: `https://raw.githubusercontent.com/${repoU}/${repoN}/main/src/${style?.dir}/${style?.file}`,
  gitee: `https://gitee.com/redleafnew00/Chinese-STD-GB-T-7714-related-csl/raw/main/src/${style?.dir}/${style?.file}`,
  jsd: `https://cdn.jsdelivr.net/gh/${repoU}/${repoN}@main/src/${style?.dir}/${style?.file}`,
  ghproxy: `https://mirror.ghproxy.com/?q=${encodeURI(rawLink)}`,
  keleAli: `https://oss.wieke.cn/styles/src/${style?.dir}/${style?.file}`,
  keleAzure: `https://oss.wwang.de/styles/src/${style?.dir}/${style?.file}`,
}

const styleClass = style?.style_class === 'in-text' ? '行间引注' : '脚注'

const styleFormatMap: { [key: string]: string } = {
  'author': '著者',
  'author-date': '著者—出版年',
  'numeric': '顺序编码',
  'label': '标签',
  'note': '脚注',
}
const styleFormat
  = styleFormatMap[style?.citation_format || ''] || style?.citation_format
</script>

<template>
  <p><a href="../">返回列表</a></p>
  <template v-if="style">
    <h1 :id="style.title">
      {{ style.title }}
    </h1>

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
        <a :href="style.link_documentation" target="_blank">
          {{ style.link_documentation }}
        </a>
      </el-descriptions-item>

      <el-descriptions-item label="贡献者">
        {{ contributors }}
      </el-descriptions-item>

      <el-descriptions-item label="更新时间">
        {{ style.updated }}
      </el-descriptions-item>

      <el-descriptions-item label="格式">
        {{ styleClass }}, {{ styleFormat }}
      </el-descriptions-item>

      <el-descriptions-item label="标签">
        {{ style.tags.join(", ") }}
      </el-descriptions-item>
    </el-descriptions>

    <h2 id="link">
      下载样式
      <a class="header-anchor" href="#link" aria-label="Permalink to link" />
    </h2>
    <p>
      请确保 Zotero 正在运行，点击下面任意安装链接以安装样式，请参阅
      <a href="/user-guide/citation-styles">安装样式文件</a>
      了解详情。
    </p>
    <div class="custom-block tip">
      <p class="custom-block-title">
        本站为每一个样式文件都提供了多个下载地址，请选择自己可用的地址。
      </p>
      <ul>
        <li>
          <a :href="downloadLinks.github" target="_blank">从 GitHub 安装样式</a>
        </li>
        <li>
          <a :href="downloadLinks.gitee" target="_blank">从 Gitee 下载样式</a>
          （请右击->另存为）
        </li>
        <li>
          <a :href="downloadLinks.jsd" target="_blank">从 JsDeliver 下载样式</a>
          （此地址存在 24 h 延迟）
        </li>
        <li>
          <a :href="downloadLinks.ghproxy" target="_blank">
            从 GH Proxy 下载样式
          </a>
          （请右击->另存为）
        </li>
        <li>
          <a :href="downloadLinks.keleAli" target="_blank">
            从
            <code>oss.wieke.cn</code>
            下载样式
          </a>
          （此地址由网友可口可乐提供）
        </li>
        <li>
          <a :href="downloadLinks.keleAzure" target="_blank">
            从
            <code>oss.wwang.de</code>
            下载样式
          </a>
          （此地址由网友可口可乐提供）
        </li>
        <li><a :href="rawLink">查看源码</a></li>
      </ul>
    </div>
  </template>
  <template v-else>
    未找到此条目。
  </template>
</template>
