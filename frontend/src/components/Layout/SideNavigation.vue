<template>
  <div class="side-navigation">
    <!-- 流程驱动模式 -->
    <div v-if="appStore.navigationMode === 'process'" class="nav-content">
      <process-nav />
    </div>

    <!-- 固有功能模式 -->
    <div v-else-if="appStore.navigationMode === 'function'" class="nav-content">
      <function-nav />
    </div>

    <!-- 工作台模式 -->
    <div v-else-if="appStore.navigationMode === 'workspace'" class="nav-content">
      <workspace-nav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/modules/app'
import ProcessNav from './nav-modes/ProcessNav.vue'
import FunctionNav from './nav-modes/FunctionNav.vue'
import WorkspaceNav from './nav-modes/WorkspaceNav.vue'

const appStore = useAppStore()
</script>

<style scoped lang="scss">
.side-navigation {
  height: 100%;
  overflow-y: auto;
}

.nav-content {
  padding: 16px 0;
}
</style>
