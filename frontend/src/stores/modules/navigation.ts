import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  // 状态
  const currentPath = ref<string>('/')
  const breadcrumb = ref<BreadcrumbItem[]>([])
  const history = ref<string[]>([])
  const favorites = ref<string[]>([])
  const recentVisited = ref<Array<{ path: string; title: string; timestamp: number }>>([])

  // 计算属性
  const canGoBack = computed(() => history.value.length > 1)

  // 方法
  function setCurrentPath(path: string) {
    currentPath.value = path
    addToHistory(path)
  }

  function setBreadcrumb(items: BreadcrumbItem[]) {
    breadcrumb.value = items
  }

  function addToHistory(path: string) {
    if (history.value[history.value.length - 1] !== path) {
      history.value.push(path)
      
      // 限制历史记录数量
      if (history.value.length > 50) {
        history.value.shift()
      }
    }
  }

  function addToRecent(path: string, title: string) {
    // 移除重复项
    const index = recentVisited.value.findIndex(item => item.path === path)
    if (index !== -1) {
      recentVisited.value.splice(index, 1)
    }

    // 添加到开头
    recentVisited.value.unshift({
      path,
      title,
      timestamp: Date.now()
    })

    // 限制最近访问数量
    if (recentVisited.value.length > 10) {
      recentVisited.value.pop()
    }

    // 保存到本地存储
    localStorage.setItem('recentVisited', JSON.stringify(recentVisited.value))
  }

  function toggleFavorite(path: string) {
    const index = favorites.value.indexOf(path)
    if (index === -1) {
      favorites.value.push(path)
    } else {
      favorites.value.splice(index, 1)
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  function isFavorite(path: string): boolean {
    return favorites.value.includes(path)
  }

  function loadFromStorage() {
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      favorites.value = JSON.parse(savedFavorites)
    }

    const savedRecent = localStorage.getItem('recentVisited')
    if (savedRecent) {
      recentVisited.value = JSON.parse(savedRecent)
    }
  }

  function goBack() {
    if (canGoBack.value) {
      history.value.pop()
      return history.value[history.value.length - 1]
    }
    return null
  }

  // 初始化时加载
  loadFromStorage()

  return {
    currentPath,
    breadcrumb,
    history,
    favorites,
    recentVisited,
    canGoBack,
    setCurrentPath,
    setBreadcrumb,
    addToHistory,
    addToRecent,
    toggleFavorite,
    isFavorite,
    goBack
  }
})
