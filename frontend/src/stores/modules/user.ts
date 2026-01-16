import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const profile = ref<UserProfile | null>(null)
  const permissions = ref<string[]>([])
  const token = ref<string>('')

  // 方法
  async function login(username: string, password: string) {
    // TODO: 实现登录逻辑
    // 模拟登录
    token.value = 'mock-token-' + Date.now()
    profile.value = {
      id: '1',
      username: username,
      realName: '张三',
      avatar: '',
      email: 'zhangsan@example.com',
      role: 'developer',
      department: '软件开发部'
    }
    permissions.value = ['*']
    
    localStorage.setItem('token', token.value)
    localStorage.setItem('userProfile', JSON.stringify(profile.value))
    
    return { success: true }
  }

  async function logout() {
    token.value = ''
    profile.value = null
    permissions.value = []
    
    localStorage.removeItem('token')
    localStorage.removeItem('userProfile')
  }

  async function fetchUserInfo() {
    // TODO: 从服务器获取用户信息
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      profile.value = JSON.parse(savedProfile)
      permissions.value = ['*']
    }
  }

  function hasPermission(permission: string): boolean {
    if (permissions.value.includes('*')) {
      return true
    }
    return permissions.value.includes(permission)
  }

  return {
    profile,
    permissions,
    token,
    login,
    logout,
    fetchUserInfo,
    hasPermission
  }
})
