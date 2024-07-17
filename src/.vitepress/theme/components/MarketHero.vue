<script setup lang="ts">
import { VPButton } from 'vitepress/theme'

const props = defineProps({
  title: String,
  description: String,
  actions: Array<{
    text: string
    link: string
    // theme?: { type: "brand" | "alt"; default: "alt" };
    target?: string
    rel?: string
  }>,
})
</script>

<template>
  <div class="MarketHero">
    <div class="vp-doc">
      <h1>{{ props.title }}</h1>
      <p>{{ props.description }}</p>
    </div>

    <div v-if="actions" class="actions">
      <div v-for="action in props.actions" :key="action.link" class="action">
        <VPButton
          tag="a"
          size="medium"
          theme="alt"
          :text="action.text"
          :href="action.link"
          :target="action.target"
          :rel="action.rel"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.MarketHero {
  height: fit-content;
  text-align: center;
  padding: 3rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.action {
  flex-shrink: 0;
  padding: 6px;
}
</style>
