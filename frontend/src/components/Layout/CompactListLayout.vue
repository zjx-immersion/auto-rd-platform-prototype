<template>
  <div class="compact-list-layout">
    <!-- 紧凑型工具栏 -->
    <div class="compact-toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">{{ title }}</h2>
        <el-divider direction="vertical" />
        
        <!-- 左侧工具槽 -->
        <slot name="toolbar-left">
          <el-input
            :model-value="searchKeyword"
            @update:model-value="$emit('update:search-keyword', $event)"
            placeholder="搜索..."
            clearable
            style="width: 220px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </slot>
      </div>
      
      <div class="toolbar-right">
        <!-- 右侧工具槽 -->
        <slot name="toolbar-right">
          <el-button type="primary" :icon="Plus" @click="$emit('create')">
            新建
          </el-button>
        </slot>
      </div>
    </div>
    
    <!-- 数据表格区域 -->
    <div class="table-wrapper">
      <slot name="table"></slot>
    </div>
    
    <!-- 分页栏 -->
    <div v-if="showPagination" class="pagination-bar">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('size-change', $event)"
        @current-change="$emit('page-change', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Plus } from '@element-plus/icons-vue'

withDefaults(defineProps<{
  title: string
  searchKeyword?: string
  showPagination?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
  pageSizes?: number[]
}>(), {
  searchKeyword: '',
  showPagination: true,
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: () => [20, 50, 100]
})

defineEmits<{
  (e: 'update:search-keyword', value: string): void
  (e: 'create'): void
  (e: 'size-change', size: number): void
  (e: 'page-change', page: number): void
}>()
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.compact-list-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background: #f5f5f5;
}

.compact-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;

    .page-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: $text-color-primary;
      white-space: nowrap;
    }

    .el-divider {
      height: 24px;
      margin: 0 4px;
    }
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
  }
}

.table-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 4px;
  margin-top: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
</style>
