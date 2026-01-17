<template>
  <div class="function-nav">
    <el-menu
      :default-active="activeMenu"
      :default-openeds="defaultOpeneds"
      :collapse="appStore.sidebarCollapsed"
      @select="handleSelect"
    >
      <!-- 我的收藏 -->
      <el-sub-menu index="favorites" v-if="!appStore.sidebarCollapsed">
        <template #title>
          <el-icon><Star /></el-icon>
          <span>我的收藏</span>
        </template>
        <el-menu-item v-if="favorites.length === 0" index="favorites-empty" disabled>
          <span class="empty-hint">暂无收藏</span>
        </el-menu-item>
        <el-menu-item
          v-for="item in favorites"
          :key="item.path"
          :index="item.path"
        >
          {{ item.label }}
        </el-menu-item>
      </el-sub-menu>

      <!-- 最近使用 -->
      <el-sub-menu index="recent" v-if="!appStore.sidebarCollapsed">
        <template #title>
          <el-icon><Clock /></el-icon>
          <span>最近使用</span>
        </template>
        <el-menu-item v-if="recentItems.length === 0" index="recent-empty" disabled>
          <span class="empty-hint">暂无记录</span>
        </el-menu-item>
        <el-menu-item
          v-for="item in recentItems"
          :key="item.path"
          :index="item.path"
        >
          {{ item.title }}
        </el-menu-item>
      </el-sub-menu>

      <el-divider v-if="!appStore.sidebarCollapsed" />

      <!-- C0: 领域项目管理 -->
      <el-sub-menu index="c0">
        <template #title>
          <el-icon><FolderOpened /></el-icon>
          <span>C0: 领域项目管理</span>
        </template>
        <el-menu-item index="/function/c0-project/list">项目列表</el-menu-item>
        <el-menu-item index="/function/c0-project/version/list">版本管理</el-menu-item>
        <el-menu-item index="/function/c0-project/version/feature-allocation">Feature分配</el-menu-item>
      </el-sub-menu>

      <!-- C1: 需求管理 -->
      <el-sub-menu index="c1">
        <template #title>
          <el-icon><Document /></el-icon>
          <span>C1: 需求管理</span>
        </template>
        <el-sub-menu index="c1-epic">
          <template #title>Epic管理</template>
          <el-menu-item index="/function/c1-requirement/epic">Epic列表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="c1-feature">
          <template #title>Feature管理</template>
          <el-menu-item index="/function/c1-requirement/feature">Feature列表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="c1-ssts">
          <template #title>SSTS管理</template>
          <el-menu-item index="/function/c1-requirement/ssts/list">SSTS列表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="c1-mr">
          <template #title>MR管理</template>
          <el-menu-item index="/function/c1-requirement/mr/list">MR列表</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/function/c1-requirement/pool">需求池</el-menu-item>
      </el-sub-menu>

      <!-- C2: 资产管理 -->
      <el-sub-menu index="c2">
        <template #title>
          <el-icon><Box /></el-icon>
          <span>C2: 资产管理</span>
        </template>
        <el-menu-item index="/function/c2/productline/list">产品线管理</el-menu-item>
        <el-menu-item index="/function/c2/product/list">产品管理</el-menu-item>
        <el-menu-item index="/function/c2/asset/search">资产搜索</el-menu-item>
        <el-menu-item index="/function/c2/asset/list">资产库</el-menu-item>
      </el-sub-menu>

      <!-- C3: 规划协调 -->
      <el-sub-menu index="c3">
        <template #title>
          <el-icon><Calendar /></el-icon>
          <span>C3: 规划协调</span>
        </template>
        <el-menu-item index="/function/c3/pi-planning-board">PI Planning看板</el-menu-item>
        <el-menu-item index="/function/c3/dependency">依赖管理</el-menu-item>
        <el-menu-item index="/function/c3/risk">风险管理</el-menu-item>
      </el-sub-menu>

      <!-- C4: 迭代执行 -->
      <el-sub-menu index="c4">
        <template #title>
          <el-icon><Refresh /></el-icon>
          <span>C4: 迭代执行</span>
        </template>
        <el-menu-item index="/function/c4/sprint/list">Sprint列表</el-menu-item>
        <el-menu-item index="/function/c4/task/list">任务列表</el-menu-item>
      </el-sub-menu>

      <!-- C5: 测试管理 -->
      <el-sub-menu index="c5">
        <template #title>
          <el-icon><CircleCheck /></el-icon>
          <span>C5: 测试管理</span>
        </template>
        <el-menu-item index="/function/c5/testplan/list">测试计划</el-menu-item>
        <el-menu-item index="/function/c5/testcase/list">测试用例</el-menu-item>
        <el-menu-item index="/function/c5/defect/list">缺陷管理</el-menu-item>
      </el-sub-menu>

      <!-- C6: DevOps -->
      <el-sub-menu index="c6">
        <template #title>
          <el-icon><Promotion /></el-icon>
          <span>C6: DevOps</span>
        </template>
        <el-menu-item index="/function/c6/pipeline">流水线</el-menu-item>
        <el-menu-item index="/function/c6/build/list">构建管理</el-menu-item>
        <el-menu-item index="/function/c6/deploy/list">部署管理</el-menu-item>
      </el-sub-menu>

      <!-- C7: 分析治理 -->
      <el-sub-menu index="c7">
        <template #title>
          <el-icon><DataAnalysis /></el-icon>
          <span>C7: 分析治理</span>
        </template>
        <el-menu-item index="/function/c7/metrics/requirement">需求度量</el-menu-item>
        <el-menu-item index="/function/c7/metrics/quality">质量度量</el-menu-item>
        <el-menu-item index="/function/c7/metrics/delivery">交付度量</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Star, Clock, FolderOpened, Document, Box, Calendar,
  Refresh, CircleCheck, Promotion, DataAnalysis
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'
import { useNavigationStore } from '@/stores/modules/navigation'

const appStore = useAppStore()
const navigationStore = useNavigationStore()
const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

// 默认展开的菜单
const defaultOpeneds = ref(['c1', 'c4'])

// 收藏列表
const favorites = computed(() => {
  return navigationStore.favorites.map(path => ({
    path,
    label: '收藏项' // TODO: 从路由配置中获取实际标题
  }))
})

// 最近使用
const recentItems = computed(() => {
  return navigationStore.recentVisited.slice(0, 5)
})

function handleSelect(index: string) {
  if (index.startsWith('/')) {
    router.push(index)
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.function-nav {
  :deep(.el-menu) {
    border-right: none;
  }

  .empty-hint {
    font-size: 12px;
    color: $text-color-secondary;
  }
}
</style>
