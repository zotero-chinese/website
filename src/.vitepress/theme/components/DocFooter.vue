<script setup lang="ts">
import { ref } from "vue";
import { useData } from "vitepress";
const filePath = ref(useData().page.value.filePath);
</script>

<template>
  <!-- License -->
  <div class="doc-before-footer-cc-block mt-10 text-sm font-medium">
    使用
    <a
      v-if="filePath.match('translators/')"
      class="footer-cc-link"
      target="_blank"
      href="https://github.com/l0o0/translators_CN?tab=AGPL-3.0-1-ov-file#readme"
    >
      AGPL-3.0
    </a>
    <a
      v-else-if="filePath.match('styles/')"
      class="footer-cc-link"
      target="_blank"
      href="https://creativecommons.org/licenses/by-sa/3.0/deed.zh-hans"
    >
      CC BY-SA 3.0
    </a>
    <a
      v-else
      class="footer-cc-link"
      target="_blank"
      href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans"
    >
      CC BY-SA 4.0
    </a>
    许可协议进行共享
  </div>
</template>

<style>
.doc-before-footer-cc-block {
  color: var(--vp-c-text-2);
  border-top: 1px solid var(--vp-c-divider-light);
  padding-top: 24px;
}

/* 正文结尾的 CC 协议链接基本样式 */
.footer-cc-link {
  color: var(--vp-c-text-2);
  transition: all 0.3s ease;
  text-decoration: underline;
  text-decoration-color: rgb(114, 114, 114);
}

/* 正文结尾的 CC 协议链接鼠标 hover 样式 */
.footer-cc-link:hover {
  color: var(--vp-c-text-1);
}

/* 正文结尾的 CC 协议链接暗色模式下鼠标 hover 样式 */
.dark .footer-cc-link:hover {
  color: var(--vp-c-text-1);
}
</style>
