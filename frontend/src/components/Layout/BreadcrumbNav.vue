<template>
  <div class="breadcrumb-nav">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">
        <el-icon><HomeFilled /></el-icon>
        首页
      </el-breadcrumb-item>
      
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbItems"
        :key="index"
        :to="item.path ? { path: item.path } : undefined"
      >
        {{ item.label }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()

// 面包屑label到路径的映射表
const breadcrumbPathMap: Record<string, string> = {
  // C1: 需求管理
  'Epic列表': '/function/c1-requirement/epic',
  'Feature列表': '/function/c1-requirement/feature',
  'SSTS列表': '/function/c1-requirement/ssts/list',
  'MR列表': '/function/c1-requirement/mr/list',
  
  // C3: 规划协调
  'PI Planning看板': '/function/c3/pi-planning-board',
  'PI Planning': '/function/c3/pi-planning-board',
  'Sprint管理': '/function/c3/sprint/list',
  '依赖矩阵': '/function/c3/dependency-matrix',
  
  // C0: 领域项目管理
  '项目列表': '/function/c0-domain-project/list',
  '版本管理': '/function/c0-domain-project/version/list',
}

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const breadcrumb = route.meta.breadcrumb as string[] | undefined
  
  if (!breadcrumb || breadcrumb.length === 0) {
    return []
  }

  return breadcrumb.map((label, index) => {
    // 最后一项是当前页面，不设置路径（不可点击）
    if (index === breadcrumb.length - 1) {
      return { label, path: undefined }
    }
    
    // 中间项从映射表中查找路径
    return {
      label,
      path: breadcrumbPathMap[label] || undefined
    }
  })
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.breadcrumb-nav {
  :deep(.el-breadcrumb) {
    font-size: 14px;
    
    .el-breadcrumb__item {
      .el-breadcrumb__inner {
        color: $text-color-secondary;
        font-weight: normal;
        
        &.is-link {
          color: $link-color;
          
          &:hover {
            color: $hover-color;
          }
        }
      }
      
      &:last-child {
        .el-breadcrumb__inner {
          color: $text-color-primary;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
