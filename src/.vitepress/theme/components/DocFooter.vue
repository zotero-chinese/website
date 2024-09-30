<script setup lang="ts">
import { useData } from 'vitepress'
import { ref } from 'vue'
// import LicenseIcon from './icons/LicenseIcon.vue'
// import CommunityIcon from './icons/CommunityIcon.vue'
import ContributingIcon from './icons/ContributingIcon.vue'
import CopyrightIcon from './icons/CopyrightIcon.vue'

const filePath = ref(useData().page.value.filePath)
</script>

<template>
  <div :key="filePath" class="doc-before-footer">
    <!-- License -->
    <div class="doc-before-footer-item">
      <el-icon><CopyrightIcon /></el-icon>
      <span>
        使用
        <a
          v-if="filePath.match('translators/')"
          target="_blank"
          href="https://github.com/l0o0/translators_CN?tab=AGPL-3.0-1-ov-file#readme"
        >
          AGPL-3.0
        </a>
        <a
          v-else-if="filePath.match('styles/')"
          target="_blank"
          href="https://creativecommons.org/licenses/by-sa/3.0/deed.zh-hans"
        >
          CC BY-SA 3.0
        </a>
        <a
          v-else
          target="_blank"
          href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans"
        >
          CC BY-SA 4.0
        </a>
        许可协议进行共享

      </span>
    </div>

    <!-- 贡献指南链接 -->
    <div class="doc-before-footer-item">
      <el-icon><ContributingIcon /></el-icon><span>
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
  /* color: var(--vp-c-text-2); */
  color: var(--vp-c-brand-1);
  transition: all 0.3s ease;
}

.doc-before-footer-item a:hover {
  /* color: var(--vp-c-text-1); */
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-decoration-color: rgb(114, 114, 114);
}

.dark .doc-before-footer-item a:hover {
  color: var(--vp-c-text-1);
}
</style>
