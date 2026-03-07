import type { PluginLocaleData } from '@data/plugin-locale'
import type { ComputedRef } from 'vue'
import { getPluginLocale } from '@data/plugin-locale'
import { useData } from 'vitepress'
import { computed } from 'vue'

export function usePluginLocale(): ComputedRef<PluginLocaleData> {
  const { lang } = useData()

  return computed(() => {
    return getPluginLocale(lang.value)
  })
}
