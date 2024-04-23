<script setup lang="ts">
const props = defineProps({
  title: String,
  description: String,
  actions: Array<{
    text: String;
    link: String;
  }>,
});
</script>

<template>
  <div class="page-header">
    <div class="vp-doc">
      <h1>{{ props.title }}</h1>
      <p>{{ props.description }}</p>
    </div>
    <div class="actions-group">
      <el-button
        v-for="action in props.actions"
        type="primary"
        plain
        tag="a"
        :href="action.link"
      >
        <span v-html="action.text"></span>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  height: fit-content;
  text-align: center;
  padding: 3rem;
}
</style>
