<template>
  <div class="compact-detail-layout">
    <!-- 紧凑型头部 -->
    <div class="compact-header">
      <div class="header-left">
        <el-button link :icon="ArrowLeft" @click="$emit('back')">返回</el-button>
        <el-divider direction="vertical" />
        <h2 class="page-title">{{ title }}</h2>
        <slot name="header-extra"></slot>
      </div>
      <div class="header-right">
        <slot name="header-actions">
          <el-button :icon="Edit" @click="$emit('edit')">编辑</el-button>
          <el-button :icon="Delete" @click="$emit('delete')">删除</el-button>
        </slot>
      </div>
    </div>
    
    <!-- 内容区 -->
    <div class="detail-content">
      <div class="tabs-container">
        <slot></slot>
      </div>
      
      <div v-if="showSidePanel" class="side-panel">
        <slot name="side-panel"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Edit, Delete } from '@element-plus/icons-vue'

withDefaults(defineProps<{
  title: string
  showSidePanel?: boolean
}>(), {
  showSidePanel: true
})

defineEmits<{
  (e: 'back'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.compact-detail-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background: #f5f5f5;
}

.compact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  min-height: 48px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: $text-color-primary;
    }

    .el-divider {
      height: 24px;
      margin: 0 4px;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }
}

.detail-content {
  flex: 1;
  display: flex;
  gap: 12px;
  overflow: hidden;

  .tabs-container {
    flex: 1;
    background: #fff;
    border-radius: 4px;
    padding: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    overflow: auto;
  }

  .side-panel {
    width: 280px;
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    overflow: auto;
  }
}

@media (max-width: 1440px) {
  .detail-content .side-panel {
    width: 240px;
  }
}

@media (max-width: 1024px) {
  .detail-content {
    flex-direction: column;
    
    .side-panel {
      width: 100%;
      height: auto;
      max-height: 300px;
    }
  }
}
</style>
