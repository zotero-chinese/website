<script setup lang="ts"></script>

<template>
  <div class="doc-before-footer-cc-block mt-10 text-sm font-medium">
    使用
    <a
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
