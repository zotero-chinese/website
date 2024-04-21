<script setup>
const props = defineProps(["trends"]);
</script>

<template>
  <el-timeline>
    <el-timeline-item
      v-for="(trend, index) in props.trends"
      :key="index"
      :timestamp="trend.timestamp"
    >
      {{ trend.content }}
    </el-timeline-item>
  </el-timeline>
</template>
