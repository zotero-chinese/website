<script setup lang="ts">
import type { Announcement } from '../composables/announcements'
import { data as posts } from '@data/blog.data'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { announcements } from '../composables/announcements'
import { useBannerDismiss } from '../composables/useBannerDismiss'

interface BannerItem {
  id: string
  type: 'blog' | 'announcement'
  data: any
}

const { showBanner } = useBannerDismiss('banner-dismissed', false)
const currentIndex = ref(0)
const autoScrollInterval = ref<NodeJS.Timeout | null>(null)

// 检查公告是否在有效期内
function isAnnouncementValid(announcement: Announcement): boolean {
  const now = new Date()
  if (announcement.startDate) {
    const startDate = new Date(announcement.startDate)
    if (now < startDate)
      return false
  }
  if (announcement.endDate) {
    const endDate = new Date(announcement.endDate)
    // 设置到当天末尾
    endDate.setHours(23, 59, 59, 999)
    if (now > endDate)
      return false
  }
  return true
}

// 获取有效的公告
const validAnnouncements = computed(() => {
  return announcements.filter(isAnnouncementValid)
})

// 组合所有项目（博客 + 公告）
const bannerItems = computed<BannerItem[]>(() => {
  const items: BannerItem[] = []

  // 添加最近的博客文章
  const now = Date.now()
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000
  const recentPosts = posts.filter(post => post.date.time > oneMonthAgo)

  if (recentPosts.length > 0) {
    recentPosts.forEach((post, index) => {
      items.push({
        id: `blog-${index}`,
        type: 'blog',
        data: post,
      })
    })
  }

  // 添加有效的公告
  validAnnouncements.value.forEach((announcement, index) => {
    items.push({
      id: `announcement-${index}`,
      type: 'announcement',
      data: announcement,
    })
  })

  return items
})

// 当前显示的项目
const currentItem = computed(() => {
  if (bannerItems.value.length === 0)
    return null
  return bannerItems.value[currentIndex.value % bannerItems.value.length]
})

// 是否需要翻页
const hasMultipleItems = computed(() => bannerItems.value.length > 1)

// 下一页
function nextPage() {
  if (bannerItems.value.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % bannerItems.value.length
  }
}

// 上一页
function prevPage() {
  if (bannerItems.value.length > 0) {
    currentIndex.value = (currentIndex.value - 1 + bannerItems.value.length) % bannerItems.value.length
  }
}

// 关闭横幅
function dismissBanner() {
  showBanner.value = false
  localStorage.setItem('banner-dismissed', 'true')
  stopAutoScroll()
}

// 启动自动滚动
function startAutoScroll() {
  if (hasMultipleItems.value && !autoScrollInterval.value) {
    autoScrollInterval.value = setInterval(() => {
      nextPage()
    }, 10000)
  }
}

// 停止自动滚动
function stopAutoScroll() {
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
    autoScrollInterval.value = null
  }
}

// 重置自动滚动计时器（用户交互后）
function resetAutoScroll() {
  stopAutoScroll()
  startAutoScroll()
}

onMounted(() => {
  if (bannerItems.value.length > 0) {
    showBanner.value = true
    startAutoScroll()
  }
  // 设置初始CSS变量
  document.documentElement.style.setProperty('--vp-layout-top-height', showBanner.value ? '50px' : '0px')
})

watch(showBanner, (newVal) => {
  document.documentElement.style.setProperty('--vp-layout-top-height', newVal ? '50px' : '0px')
})

onBeforeUnmount(() => {
  stopAutoScroll()
  document.documentElement.style.setProperty('--vp-layout-top-height', '0px')
})
</script>

<template>
  <div v-if="showBanner && currentItem" class="banner" :class="[`banner-${currentItem.type}`]">
    <div class="banner-content">
      <!-- 博客内容 -->
      <template v-if="currentItem.type === 'blog'">
        <span>📢 博客有新更新：</span>
        <a :href="currentItem.data.url" class="banner-link">{{ currentItem.data.title }}</a>
      </template>

      <!-- 公告内容 -->
      <template v-else-if="currentItem.type === 'announcement'">
        <span>{{ currentItem.data.text }}</span>
      </template>
    </div>

    <!-- 翻页控制（多个项目时显示） -->
    <div v-if="hasMultipleItems" class="banner-pagination">
      <button class="btn pagination-btn prev-btn" title="上一条" @click="() => { prevPage(); resetAutoScroll() }">
        ‹
      </button>
      <span class="pagination-indicator">{{ currentIndex + 1 }}/{{ bannerItems.length }}</span>
      <button class="btn pagination-btn next-btn" title="下一条" @click="() => { nextPage(); resetAutoScroll() }">
        ›
      </button>
    </div>

    <button class="btn close-btn" @click="dismissBanner">
      ✕
    </button>
  </div>
</template>

<style scoped>
.banner {
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  color: white;
  text-align: center;
  padding: 12px 15px;
  font-weight: bold;
  z-index: 1000;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease-in-out;
}

.banner.banner-blog {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.banner.banner-announcement {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  font-size: 16px;
  letter-spacing: 0.5px;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
  min-height: 20px;
}

.banner-link {
  color: white;
  text-decoration: underline;
  font-weight: bold;
}

.banner-link:hover {
  opacity: 0.8;
}

.banner-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
  margin-right: 20px;
  white-space: nowrap;
}

.btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.pagination-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.8);
}

.pagination-btn:active {
  background: rgba(255, 255, 255, 0.4);
}

.pagination-indicator {
  font-size: 12px;
  opacity: 0.9;
  min-width: 40px;
}

.close-btn:hover {
  background: rgba(255, 59, 48, 0.8);
  border-color: rgba(255, 59, 48, 1);
}

@media (max-width: 768px) {
  .banner {
    font-size: 12px;
    padding: 10px 8px;
    flex-wrap: nowrap;
    justify-content: space-between;
  }

  .banner-content {
    gap: 6px;
    flex: 1;
  }

  .banner-pagination {
    display: none;
  }

  .close-btn {
    margin-left: auto;
  }

  .banner.banner-announcement {
    font-size: 14px;
  }

  .pagination-btn {
    min-width: 28px;
    height: 28px;
    font-size: 16px;
  }

  .pagination-indicator {
    font-size: 11px;
    min-width: 36px;
  }
}
</style>
