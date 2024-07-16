<template>
  <div class="toolbar">
    <slot />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-around;
  padding-bottom: 1rem;
}
.toolbar > * {
  margin: 0.5rem;
}
.toolbar > :deep(.el-select) {
  max-width: 12em;
}

@media only screen and (max-width: 800px) {
  .toolbar {
    flex-wrap: wrap;
  }
  .toolbar > :deep(.el-select) {
    max-width: 100%;
  }
}
</style>
