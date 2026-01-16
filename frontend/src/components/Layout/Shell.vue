<template>
  <div class="app-shell">
    <!-- 顶部导航栏 -->
    <top-navigation class="app-header" />

    <!-- 主体区域 -->
    <div class="app-body">
      <!-- 左侧导航 -->
      <side-navigation 
        :class="['app-sidebar', { 'collapsed': appStore.sidebarCollapsed }]" 
      />

      <!-- 主内容区 -->
      <main class="app-main">
        <!-- 面包屑 -->
        <breadcrumb-nav v-if="showBreadcrumb" class="app-breadcrumb" />
        
        <!-- 页面内容 -->
        <div class="app-content">
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="route.path" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </main>
    </div>

    <!-- 全局Loading -->
    <el-loading 
      v-if="appStore.loading" 
      fullscreen 
      text="加载中..."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import TopNavigation from './TopNavigation.vue'
import SideNavigation from './SideNavigation.vue'
import BreadcrumbNav from './BreadcrumbNav.vue'

const appStore = useAppStore()
const route = useRoute()

// 是否显示面包屑
const showBreadcrumb = computed(() => {
  return route.meta.breadcrumb && route.meta.breadcrumb.length > 0
})

// 缓存的视图
const cachedViews = computed(() => {
  // TODO: 实现基于路由配置的视图缓存
  return []
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.app-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: $background-color-base;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: $header-height;
  background: #fff;
  border-bottom: 1px solid $border-color-light;
  box-shadow: $box-shadow-light;
}

.app-body {
  display: flex;
  margin-top: $header-height;
  height: calc(100vh - #{$header-height});
  overflow: hidden;
}

.app-sidebar {
  width: $sidebar-width;
  height: 100%;
  background: #fff;
  border-right: 1px solid $border-color-light;
  transition: width 0.3s;
  overflow-x: hidden;
  overflow-y: auto;
  flex-shrink: 0;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.app-breadcrumb {
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid $border-color-light;
}

.app-content {
  flex: 1;
  overflow: auto;
  background: $background-color-base;
}

// 响应式设计
@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    left: -#{$sidebar-width};
    top: $header-height;
    z-index: 999;
    box-shadow: $box-shadow-heavy;

    &.mobile-open {
      left: 0;
    }
  }
}
</style>
