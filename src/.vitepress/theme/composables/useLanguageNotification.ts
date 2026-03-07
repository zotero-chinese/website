import { inBrowser, useData, useRouter } from 'vitepress'
import { computed, onMounted, ref } from 'vue'

export function useLanguageNotification() {
  const router = useRouter()
  const hasShownNotification = ref(false)

  const isBrowserChinese = computed(() => {
    const browserLang = navigator.language || navigator.languages?.[0] || ''
    return browserLang.toLowerCase().startsWith('zh')
  })

  const isCurrentChinese = computed(() => {
    const { lang } = useData()
    return lang.value.toLowerCase().startsWith('zh')
  })

  const targetUrl = computed(() => {
    const path = router.route.path
    if (isCurrentChinese.value)
      return `/en${path}`
    else
      return `${path.replace(/^\/en\//, '/')}`
  })

  onMounted(() => {
    if (!inBrowser || hasShownNotification.value)
      return

    if (isBrowserChinese.value === isCurrentChinese.value)
      return

    ElMessageBox.confirm(
      isBrowserChinese.value && !isCurrentChinese.value
        ? '检测到您的浏览器语言为中文。建议您切换到中文页面。'
        : 'Your browser language is detected as non-Chinese. It is recommended that you switch to the English page.',
      isBrowserChinese.value && !isCurrentChinese.value
        ? '切换语言'
        : 'Switch Language',
      {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'primary',
      },
    )
      .then(() => {
        hasShownNotification.value = true
        router.go(targetUrl.value)
      })
      .catch(() => {
        // eslint-disable-next-line no-console
        console.log('User calcel to switch language')
      })
  })
}
