<template>
  <PageContainer>
    <!-- 页面操作栏 -->
    <div class="action-bar">
      <div class="action-bar-left">
        <span class="page-title">任务列表</span>
        <el-tag size="large" style="margin-left: 16px;">{{ filteredTasks.length }} 个任务</el-tag>
      </div>
      <div class="action-bar-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建任务
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总任务数" :value="taskStatistics.total">
            <template #prefix>
              <el-icon color="#409EFF"><Document /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="进行中" :value="taskStatistics.inProgress">
            <template #prefix>
              <el-icon color="#E6A23C"><Loading /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="已完成" :value="taskStatistics.done">
            <template #prefix>
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="阻塞" :value="taskStatistics.blocked">
            <template #prefix>
              <el-icon color="#F56C6C"><WarningFilled /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 完成率 -->
    <el-card style="margin-bottom: 16px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-weight: 500; font-size: 14px; color: #606266;">整体完成率</span>
        <div style="flex: 1; margin: 0 24px;">
          <el-progress 
            :percentage="taskStatistics.completionRate" 
            :status="taskStatistics.completionRate === 100 ? 'success' : undefined"
            :stroke-width="16"
          />
        </div>
        <span style="font-size: 18px; font-weight: 600; color: #409EFF;">{{ taskStatistics.completionRate }}%</span>
      </div>
    </el-card>

    <!-- 筛选条件 -->
    <el-card style="margin-bottom: 16px;">
      <el-form :inline="true" :model="filters">
        <el-form-item label="Sprint">
          <el-select v-model="filters.sprintId" placeholder="全部Sprint" clearable style="width: 200px;">
            <el-option v-for="sprint in sprints" :key="sprint.id" :label="sprint.name" :value="sprint.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 150px;">
            <el-option label="待开始" value="TODO" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="评审" value="review" />
            <el-option label="测试中" value="testing" />
            <el-option label="已完成" value="done" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filters.priority" placeholder="全部优先级" clearable style="width: 120px;">
            <el-option label="P0" value="P0" />
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
            <el-option label="P3" value="P3" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="filters.assignee" placeholder="全部" clearable style="width: 150px;">
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="阻塞状态">
          <el-select v-model="filters.blocked" placeholder="全部" clearable style="width: 120px;">
            <el-option label="阻塞中" :value="true" />
            <el-option label="正常" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input 
            v-model="filters.keyword" 
            placeholder="搜索任务编码或标题" 
            clearable 
            style="width: 240px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card>
      <el-table 
        :data="paginatedTasks" 
        v-loading="taskStore.loading"
        stripe
        @row-click="handleRowClick"
        style="cursor: pointer;"
      >
        <el-table-column prop="code" label="编码" width="120" fixed="left">
          <template #default="{ row }">
            <el-text tag="b">{{ row.code }}</el-text>
          </template>
        </el-table-column>
        
        <el-table-column prop="title" label="标题" width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div>
              <el-text>{{ row.title }}</el-text>
              <el-tag v-if="row.blocked" type="danger" size="small" style="margin-left: 8px;">阻塞</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="Sprint" width="150">
          <template #default="{ row }">
            {{ getSprintName(row.sprintId) }}
          </template>
        </el-table-column>
        
        <el-table-column label="负责人" width="100">
          <template #default="{ row }">
            {{ getUserName(row.assignee) }}
          </template>
        </el-table-column>
        
        <el-table-column label="预估/实际/剩余" width="160" align="center">
          <template #default="{ row }">
            <el-text size="small">{{ row.estimateHours }}h / {{ row.actualHours }}h / {{ row.remainingHours }}h</el-text>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="优先级" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small" effect="plain">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="110">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="handleView(row.id)">查看</el-button>
            <el-button link @click.stop="handleEdit(row.id)">编辑</el-button>
            <el-button link type="danger" @click.stop="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
        <el-text type="info">共 {{ filteredTasks.length }} 条</el-text>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredTasks.length"
          layout="sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Upload, Download, Search, Document, 
  Loading, CircleCheck, WarningFilled 
} from '@element-plus/icons-vue'
import PageContainer from '@/components/Common/PageContainer.vue'
import { useTaskStore } from '@/stores/modules/task'
import { useSprintStore } from '@/stores/modules/sprint'
import { useUserStore } from '@/stores/modules/user'
import dayjs from 'dayjs'

// ============================================================================
// Setup
// ============================================================================

const router = useRouter()
const taskStore = useTaskStore()
const sprintStore = useSprintStore()
const userStore = useUserStore()

// ============================================================================
// State
// ============================================================================

/** 筛选条件 */
const filters = ref({
  sprintId: '',
  status: '',
  priority: '',
  assignee: '',
  blocked: undefined as boolean | undefined,
  keyword: ''
})

/** 分页 */
const pagination = ref({
  currentPage: 1,
  pageSize: 20
})

// ============================================================================
// Computed
// ============================================================================

/** 任务列表 */
const tasks = computed(() => taskStore.tasks)

/** Sprint列表 */
const sprints = computed(() => sprintStore.sprints)

/** 用户列表 */
const users = computed(() => userStore.users)

/** 统计数据 */
const taskStatistics = computed(() => taskStore.taskStatistics)

/** 筛选后的任务列表 */
const filteredTasks = computed(() => {
  let result = tasks.value

  // Sprint筛选
  if (filters.value.sprintId) {
    result = result.filter(t => t.sprintId === filters.value.sprintId)
  }

  // 状态筛选
  if (filters.value.status) {
    result = result.filter(t => t.status === filters.value.status)
  }

  // 优先级筛选
  if (filters.value.priority) {
    result = result.filter(t => t.priority === filters.value.priority)
  }

  // 负责人筛选
  if (filters.value.assignee) {
    result = result.filter(t => t.assignee === filters.value.assignee)
  }

  // 阻塞状态筛选
  if (filters.value.blocked !== undefined) {
    result = result.filter(t => t.blocked === filters.value.blocked)
  }

  // 关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(t =>
      t.code.toLowerCase().includes(keyword) ||
      t.title.toLowerCase().includes(keyword)
    )
  }

  return result
})

/** 分页后的任务列表 */
const paginatedTasks = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredTasks.value.slice(start, end)
})

// ============================================================================
// Methods
// ============================================================================

/** 获取Sprint名称 */
function getSprintName(sprintId: string) {
  const sprint = sprints.value.find(s => s.id === sprintId)
  return sprint?.name || '-'
}

/** 获取用户名称 */
function getUserName(userId: string) {
  const user = users.value.find(u => u.id === userId)
  return user?.name || '-'
}

/** 获取状态类型 */
function getStatusType(status: string): 'success' | 'warning' | 'info' | 'danger' | '' {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger' | ''> = {
    'TODO': 'info',
    'in-progress': 'warning',
    'review': '',
    'testing': 'warning',
    'done': 'success'
  }
  return map[status] || 'info'
}

/** 获取状态文本 */
function getStatusText(status: string): string {
  const map: Record<string, string> = {
    'TODO': '待开始',
    'in-progress': '进行中',
    'review': '评审',
    'testing': '测试中',
    'done': '已完成'
  }
  return map[status] || status
}

/** 获取优先级类型 */
function getPriorityType(priority: string): 'danger' | 'warning' | 'info' | '' {
  const map: Record<string, 'danger' | 'warning' | 'info' | ''> = {
    'P0': 'danger',
    'P1': 'warning',
    'P2': 'info',
    'P3': ''
  }
  return map[priority] || 'info'
}

/** 获取类型标签类型 */
function getTypeTagType(type: string): 'success' | 'warning' | 'info' | '' {
  const map: Record<string, 'success' | 'warning' | 'info' | ''> = {
    'feature': 'success',
    'bug': 'danger',
    'tech': 'warning',
    'refactor': 'info'
  }
  return map[type] as any || 'info'
}

/** 获取类型文本 */
function getTypeText(type: string): string {
  const map: Record<string, string> = {
    'feature': '功能',
    'bug': '缺陷',
    'tech': '技术',
    'refactor': '重构'
  }
  return map[type] || type
}

/** 格式化日期 */
function formatDate(date: string | Date) {
  return dayjs(date).format('YYYY/MM/DD')
}

/** 搜索 */
function handleSearch() {
  pagination.value.currentPage = 1
}

/** 重置 */
function handleReset() {
  filters.value = {
    sprintId: '',
    status: '',
    priority: '',
    assignee: '',
    blocked: undefined,
    keyword: ''
  }
  pagination.value.currentPage = 1
}

/** 创建任务 */
function handleCreate() {
  ElMessage.info('创建任务功能开发中...')
}

/** 导入 */
function handleImport() {
  ElMessage.info('导入功能开发中...')
}

/** 导出 */
function handleExport() {
  ElMessage.info('导出功能开发中...')
}

/** 行点击 */
function handleRowClick(row: any) {
  handleView(row.id)
}

/** 查看任务 */
function handleView(id: string) {
  router.push(`/function/c4/task/${id}`)
}

/** 编辑任务 */
function handleEdit(id: string) {
  ElMessage.info('编辑任务功能开发中...')
}

/** 删除任务 */
async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await taskStore.deleteTask(id)
    ElMessage.success('删除成功')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  // 数据已在初始化时加载
})
</script>

<style scoped>
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.action-bar-left {
  display: flex;
  align-items: center;
}

.action-bar-right {
  display: flex;
  gap: 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
</style>
