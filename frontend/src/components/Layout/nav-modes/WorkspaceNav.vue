<template>
  <div class="workspace-nav">
    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.sidebarCollapsed"
      @select="handleSelect"
    >
      <!-- 我的工作台 -->
      <el-menu-item index="/workspace/my">
        <el-icon><User /></el-icon>
        <template #title>我的工作台</template>
      </el-menu-item>

      <!-- 团队工作台 -->
      <el-menu-item index="/workspace/team">
        <el-icon><UserFilled /></el-icon>
        <template #title>团队工作台</template>
      </el-menu-item>

      <!-- 项目工作台 -->
      <el-menu-item index="/workspace/project">
        <el-icon><FolderOpened /></el-icon>
        <template #title>项目工作台</template>
      </el-menu-item>

      <!-- 管理工作台 -->
      <el-menu-item index="/workspace/management">
        <el-icon><DataAnalysis /></el-icon>
        <template #title>管理工作台</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, UserFilled, FolderOpened, DataAnalysis } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

function handleSelect(index: string) {
  router.push(index)
}
</script>

<style scoped lang="scss">
.workspace-nav {
  :deep(.el-menu) {
    border-right: none;
  }
}
</style>
