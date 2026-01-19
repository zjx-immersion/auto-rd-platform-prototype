<template>
  <div class="top-navigation">
    <div class="nav-left">
      <!-- Logo -->
      <div class="logo">
        <el-icon><Operation /></el-icon>
        <span class="logo-text">整车软件研发平台</span>
      </div>

      <!-- 侧边栏折叠按钮 -->
      <el-button 
        text 
        :icon="appStore.sidebarCollapsed ? Expand : Fold"
        @click="appStore.toggleSidebar()"
      />

      <!-- 模式切换器 -->
      <div class="mode-switcher">
        <el-segmented 
          v-model="currentMode" 
          :options="modeOptions"
          @change="handleModeChange"
        />
      </div>
    </div>

    <div class="nav-center">
      <!-- 全局搜索 -->
      <div class="global-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索功能、需求、任务... (Ctrl+K)"
          prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #suffix>
            <span class="search-hint">Ctrl+K</span>
          </template>
        </el-input>
      </div>
    </div>

    <div class="nav-right">
      <!-- 快捷创建 -->
      <el-dropdown trigger="click">
        <el-button type="primary" :icon="Plus">
          创建
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleCreate('epic')">
              <el-icon><Document /></el-icon>
              创建Epic
            </el-dropdown-item>
            <el-dropdown-item @click="handleCreate('feature')">
              <el-icon><List /></el-icon>
              创建Feature
            </el-dropdown-item>
            <el-dropdown-item @click="handleCreate('task')">
              <el-icon><Files /></el-icon>
              创建Task
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleCreate('project')">
              <el-icon><FolderOpened /></el-icon>
              创建项目
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 通知中心 -->
      <el-badge :value="notificationCount" :hidden="notificationCount === 0">
        <el-button text :icon="Bell" @click="showNotifications" />
      </el-badge>

      <!-- 帮助 -->
      <el-button text :icon="QuestionFilled" @click="showHelp" />

      <!-- 用户中心 -->
      <el-dropdown trigger="click" @command="handleUserCommand">
        <div class="user-avatar">
          <el-avatar :size="32">
            {{ userStore.profile?.realName?.charAt(0) || 'U' }}
          </el-avatar>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              <div class="user-info">
                <div class="user-name">{{ userStore.profile?.realName }}</div>
                <div class="user-role">{{ userStore.profile?.role }}</div>
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Operation, Expand, Fold, Plus, Bell, QuestionFilled,
  User, Setting, SwitchButton, Search, Document, List, Files, FolderOpened
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'
import { useUserStore } from '@/stores/modules/user'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 通知数量
const notificationCount = ref(5)

// 当前模式
const currentMode = computed({
  get: () => appStore.navigationMode,
  set: (value: NavigationMode) => appStore.setNavigationMode(value)
})

// 模式选项
const modeOptions = [
  { label: '流程驱动', value: 'process' },
  { label: '固有功能', value: 'function' },
  { label: '工作台', value: 'workspace' }
]

// 模式切换
function handleModeChange(value: NavigationMode) {
  appStore.setNavigationMode(value)
  
  // 根据模式跳转到默认页面
  switch (value) {
    case 'process':
      router.push('/process/my')
      break
    case 'function':
      router.push('/function/c1/epic/list')
      break
    case 'workspace':
      router.push('/workspace/my')
      break
  }
}

// 搜索
function handleSearch() {
  if (!searchKeyword.value.trim()) return
  
  router.push({
    path: '/search',
    query: { q: searchKeyword.value }
  })
}

// 创建
function handleCreate(type: string) {
  const routes: Record<string, string> = {
    epic: '/function/c1/epic/create',
    feature: '/function/c1/feature/create',
    task: '/function/c4/task/create',
    project: '/function/c0/project/create'
  }
  
  if (routes[type]) {
    router.push(routes[type])
  }
}

// 显示通知
function showNotifications() {
  router.push('/notifications')
}

// 显示帮助
function showHelp() {
  window.open('/help', '_blank')
}

// 用户命令
function handleUserCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      ElMessage.success('已退出登录')
      break
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.top-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
}

.nav-left,
.nav-center,
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-left {
  flex-shrink: 0;
}

.nav-center {
  flex: 1;
  max-width: 600px;
}

.nav-right {
  flex-shrink: 0;
}

// Logo
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 16px;
  border-right: 1px solid $border-color-light;
  cursor: pointer;

  .el-icon {
    font-size: 24px;
    color: $primary-color;
  }

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: $text-color-primary;
    white-space: nowrap;
  }
}

// 模式切换器
.mode-switcher {
  :deep(.el-segmented) {
    --el-segmented-bg-color: #{$background-color-base};
  }
}

// 全局搜索
.global-search {
  width: 100%;

  .el-input {
    :deep(.el-input__wrapper) {
      background: $background-color-base;
      border-radius: 20px;
    }
  }

  .search-hint {
    padding: 2px 6px;
    background: $background-color-base;
    border: 1px solid $border-color-base;
    border-radius: 2px;
    font-size: 12px;
    color: $text-color-secondary;
  }
}

// 用户头像
.user-avatar {
  cursor: pointer;
  
  .el-avatar {
    background: $primary-color;
  }
}

.user-info {
  padding: 8px 0;
  
  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: $text-color-primary;
  }
  
  .user-role {
    margin-top: 4px;
    font-size: 12px;
    color: $text-color-secondary;
  }
}
</style>
