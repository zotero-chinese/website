<script setup lang="ts">
const props = defineProps<{
  style: Style;
}>();
const style = props.style;
</script>

<template>
  <client-only>
    <el-popover trigger="hover" width="90%">
      <template #reference>
        <a :href="style.dir">{{ style.title }}</a>
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
