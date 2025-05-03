<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import ContributingIcon from './icons/ContributingIcon.vue'
import CopyrightIcon from './icons/CopyrightIcon.vue'

const { page } = useData()

const filePath = computed(() => page.value.filePath)

const licenseConfig = computed(() => {
  const path = filePath.value
  const config = {
    link: '',
    text: '',
    name: '',
  }

  if (path.match('translators/')) {
    config.link = 'https://github.com/l0o0/translators_CN?tab=AGPL-3.0-1-ov-file#readme'
    config.name = 'AGPL-3.0'
  }
  else if (path.match('styles/')) {
    config.link = 'https://creativecommons.org/licenses/by-sa/3.0/deed.zh-hans'
    config.name = 'CC BY-SA 3.0'
  }
  else {
    config.link = 'https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans'
    config.name = 'CC BY-SA 4.0'
  }

  config.text = `使用 ${config.name} 许可协议进行共享`
  return config
})
</script>

<template>
  <div class="doc-before-footer">
    <!-- 版权信息 -->
    <div class="doc-before-footer-item">
      <el-icon><CopyrightIcon /></el-icon>
      <span>
        <a
          :href="licenseConfig.link"
          target="_blank"
        >
          {{ licenseConfig.text }}
        </a>
      </span>
    </div>

    <!-- 贡献指南链接 -->
    <div class="doc-before-footer-item">
      <el-icon><ContributingIcon /></el-icon>
      <span>
        若您有意共建中文社区，请阅读&nbsp;
        <a href="/contributing/">参与指南</a>
        <span v-if="filePath.match('wiki/')">
          &nbsp;或&nbsp;
          <a href="/contributing/wiki/">文档贡献指南</a>
        </span>
      </span>
    </div>
  </div>
</template>

<style>
.doc-before-footer {
  color: var(--vp-c-text-2);
  line-height: 32px;
  font-size: 14px;
  align-items: center;
}

.doc-before-footer-item {
  display: flex;
  align-items: center;
}

.doc-before-footer-item a {
  color: var(--vp-c-brand-1);
  transition: all 0.3s ease;
}

.doc-before-footer-item a:hover {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-decoration-color: rgb(114, 114, 114);
}

.dark .doc-before-footer-item a:hover {
  color: var(--vp-c-text-1);
}
</style>
