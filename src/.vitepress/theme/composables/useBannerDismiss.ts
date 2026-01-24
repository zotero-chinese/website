import { onMounted, ref } from 'vue'

export function useBannerDismiss(storageKey: string, initialState = true) {
  const showBanner = ref(initialState)

  onMounted(() => {
    const dismissed = localStorage.getItem(storageKey)
    if (dismissed) {
      showBanner.value = false
    }
  })

  return {
    showBanner,
  }
}
