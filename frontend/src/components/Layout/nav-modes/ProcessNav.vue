<template>
  <div class="process-nav">
    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.sidebarCollapsed"
      @select="handleSelect"
    >
      <!-- 我的流程 -->
      <el-menu-item index="/process/my">
        <el-icon><User /></el-icon>
        <template #title>我的流程</template>
      </el-menu-item>

      <el-divider />

      <!-- P1: 战略规划流程 -->
      <el-menu-item index="/process/p1-strategic">
        <el-icon><TrendCharts /></el-icon>
        <template #title>P1: 战略规划流程</template>
      </el-menu-item>

      <!-- P2: 特性设计流程 -->
      <el-menu-item index="/process/p2-feature">
        <el-icon><List /></el-icon>
        <template #title>P2: 特性设计流程</template>
      </el-menu-item>

      <!-- P3: 方案设计流程 -->
      <el-menu-item index="/process/p3-solution">
        <el-icon><Document /></el-icon>
        <template #title>P3: 方案设计流程</template>
      </el-menu-item>

      <!-- P4: 团队迭代流程 -->
      <el-menu-item index="/process/p4-iteration">
        <el-icon><Refresh /></el-icon>
        <template #title>P4: 团队迭代流程</template>
      </el-menu-item>

      <!-- P5: 测试验证流程 -->
      <el-menu-item index="/process/p5-testing">
        <el-icon><CircleCheck /></el-icon>
        <template #title>P5: 测试验证流程</template>
      </el-menu-item>

      <!-- P6: 发布交付流程 -->
      <el-menu-item index="/process/p6-release">
        <el-icon><Upload /></el-icon>
        <template #title>P6: 发布交付流程</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  User, TrendCharts, List, Document, Refresh, CircleCheck, Upload 
} from '@element-plus/icons-vue'
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
.process-nav {
  :deep(.el-menu) {
    border-right: none;
  }
}
</style>
