import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const theme = ref<'light' | 'dark'>('light')
  const locale = ref<string>('zh-CN')
  const sidebarCollapsed = ref(false)
  const navigationMode = ref<NavigationMode>('function')
  const loading = ref(false)

  // 方法
  function init() {
    // 从本地存储加载配置
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      theme.value = savedTheme as 'light' | 'dark'
    }

    const savedMode = localStorage.getItem('navigationMode')
    if (savedMode) {
      navigationMode.value = savedMode as NavigationMode
    }

    const savedCollapsed = localStorage.getItem('sidebarCollapsed')
    if (savedCollapsed) {
      sidebarCollapsed.value = savedCollapsed === 'true'
    }
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function setNavigationMode(mode: NavigationMode) {
    navigationMode.value = mode
    localStorage.setItem('navigationMode', mode)
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  return {
    theme,
    locale,
    sidebarCollapsed,
    navigationMode,
    loading,
    init,
    setTheme,
    setNavigationMode,
    toggleSidebar,
    setLoading
  }
})
