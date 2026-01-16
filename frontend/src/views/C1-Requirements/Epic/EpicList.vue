<template>
  <page-container>
    <!-- 页面头部 -->
    <page-header title="Epic列表" description="管理和查看所有Epic需求">
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          创建Epic
        </el-button>
      </template>
    </page-header>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索Epic名称、ID"
          :prefix-icon="Search"
          clearable
          style="width: 300px"
          @input="handleSearch"
        />
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
      <div class="toolbar-right">
        <el-button :icon="Filter">筛选</el-button>
        <el-button :icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="content-area">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="ID" width="120" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ row.priority.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click.stop="handleView(row)">
              查看
            </el-button>
            <el-button type="text" size="small" @click.stop="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="text" size="small" @click.stop="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </div>
  </page-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh, Filter, Download } from '@element-plus/icons-vue'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'
import type { Epic } from '@/types/entities'

const router = useRouter()

const loading = ref(false)
const searchKeyword = ref('')
const tableData = ref<Epic[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 模拟数据
function loadData() {
  loading.value = true
  
  setTimeout(() => {
    // 生成模拟数据
    const mockData: Epic[] = Array.from({ length: 20 }, (_, i) => ({
      id: `EPIC-${1000 + i}`,
      title: `Epic ${i + 1} - 自动驾驶功能需求`,
      description: `这是第 ${i + 1} 个Epic的描述`,
      status: ['todo', 'inprogress', 'done'][i % 3] as any,
      priority: ['p0', 'p1', 'p2', 'p3'][i % 4] as any,
      projectId: 'PROJECT-001',
      owner: '张三',
      features: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user1',
      updatedBy: 'user1'
    }))
    
    tableData.value = mockData
    pagination.total = mockData.length
    loading.value = false
  }, 500)
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleCreate() {
  router.push('/function/c1/epic/create')
}

function handleRowClick(row: Epic) {
  router.push(`/function/c1/epic/detail/${row.id}`)
}

function handleView(row: Epic) {
  router.push(`/function/c1/epic/detail/${row.id}`)
}

function handleEdit(row: Epic) {
  ElMessage.info(`编辑 ${row.title}`)
}

function handleDelete(row: Epic) {
  ElMessage.warning(`删除 ${row.title}`)
}

function getStatusType(status: string) {
  const map: Record<string, any> = {
    todo: '',
    inprogress: 'primary',
    done: 'success'
  }
  return map[status] || ''
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    todo: '待处理',
    inprogress: '进行中',
    done: '已完成'
  }
  return map[status] || status
}

function getPriorityType(priority: string) {
  const map: Record<string, any> = {
    p0: 'danger',
    p1: 'warning',
    p2: 'info',
    p3: 'success'
  }
  return map[priority] || ''
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid $border-color-light;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
}

.content-area {
  flex: 1;
  padding: 16px 24px;
  overflow: auto;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

:deep(.el-table) {
  .el-table__row {
    cursor: pointer;
    
    &:hover {
      background: $background-color-base;
    }
  }
}
</style>
