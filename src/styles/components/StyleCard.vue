<script setup lang="ts">
const props = defineProps<{
  style: Style;
  mode?: "sample" | "full";
}>();
const style = props.style;
const mode = props.mode ?? "sample";
</script>

<template>
  <template v-if="mode === 'sample'">
    <client-only>
      <el-popover trigger="hover" width="90%">
        <template #reference>
          {{ style.title }}
        </template>
        <div class="csl-preview">
          <h3>引注</h3>
          <div v-html="style.citations"></div>
          <h3>参考文献表</h3>
          <div v-html="style.bibliography"></div>
        </div>
      </el-popover>
    </client-only>
  </template>
  <template v-else>
    <h2>{{ style.title }}</h2>
    <div class="csl-preview">
      <h3>引注</h3>
      <div v-html="style.citations" class="csl-preview-citations"></div>
      <h3>参考文献表</h3>
      <div v-html="style.bibliography" class="csl-preview-bibliography"></div>
    </div>
  </template>
</template>

<style>
.csl-preview {
  font-family: Georgia, Times, "Times New Roman", serif;
}

.csl-preview h3 {
  font-weight: bold;
}

/* second-field-align 首行缩进适配 */
.csl-bib-body.second-field-align-flush .csl-entry {
  display: flex;
}

.csl-bib-body.second-field-align-flush .csl-entry .csl-left-margin {
  float: left;
  margin-right: 0.5em;
}

.csl-bib-body.second-field-align-flush.maxoffset-4 .csl-entry .csl-left-margin {
  width: 2.5em;
}

/* hangingindent 悬挂缩进适配 */
.csl-bib-body.hangingindent-true .csl-entry {
  text-indent: -2em;
  padding-left: 2em;
}
</style>
