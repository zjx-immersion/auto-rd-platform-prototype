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

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const breadcrumb = route.meta.breadcrumb as string[] | undefined
  
  if (!breadcrumb || breadcrumb.length === 0) {
    return []
  }

  return breadcrumb.map((label, index) => ({
    label,
    path: index < breadcrumb.length - 1 ? undefined : route.path
  }))
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
