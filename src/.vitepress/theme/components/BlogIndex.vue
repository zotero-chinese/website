<script setup lang="ts">
import { data as posts } from '@data/blog.data'

function getDateTime(time: number) {
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<template>
  <div class="blog-list-warpper vp-doc">
    <ul v-if="posts.length !== 0" class="blog-list">
      <li v-for="post of posts" :key="post.url" class="blog-entry">
        <article>
          <time :datetime="getDateTime(post.date.time)">
            {{ post.date.string }}
          </time>
          <h2 class="title">
            <a :href="post.url">{{ post.title }}</a>
          </h2>
        </article>
      </li>
    </ul>

    <el-empty v-else description="暂无内容" />
  </div>
</template>

<style scoped>
.blog-list {
  list-style-type: none;
  padding: 0 20% 5em 20%;
}
@media only screen and (max-width: 800px) {
  .blog-list {
    padding: 0;
  }
}
.blog-entry {
  margin-top: 3em;
  border-bottom: 1px solid var(--vp-c-divider);
}
.blog-entry time {
  font-size: 14px;
}
.title {
  border: none;
  margin-top: 0;
  padding-top: 0;
  font-size: 22px;
}
.title a {
  font-weight: 600;
  text-decoration: none;
}
</style>
