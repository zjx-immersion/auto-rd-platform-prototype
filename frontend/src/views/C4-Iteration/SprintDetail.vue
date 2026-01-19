<template>
  <PageContainer>
    <!-- 页面操作栏 -->
    <div class="action-bar">
      <div class="action-bar-left">
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">{{ sprint?.name || 'Sprint详情' }}</span>
        <el-tag :type="getStatusTagType(sprint?.status)" size="large" style="margin-left: 12px;">
          {{ getStatusText(sprint?.status) }}
        </el-tag>
      </div>
      <div class="action-bar-right">
        <el-button @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button v-if="sprint?.status === 'planning'" type="primary" @click="handleStart">
          <el-icon><VideoPlay /></el-icon>
          启动Sprint
        </el-button>
        <el-button v-if="sprint?.status === 'active'" type="success" @click="handleComplete">
          <el-icon><CircleCheck /></el-icon>
          完成Sprint
        </el-button>
      </div>
    </div>

    <!-- 基本信息卡片 -->
    <el-card style="margin-bottom: 16px;">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="Sprint编码">
          <el-text tag="b">{{ sprint?.code }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="所属PI">
          {{ getPIName(sprint?.piId) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(sprint?.status)">{{ getStatusText(sprint?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始日期">
          {{ formatDate(sprint?.startDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="结束日期">
          {{ formatDate(sprint?.endDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="工作日">
          {{ sprint?.workingDays || 0 }} 天
        </el-descriptions-item>
        <el-descriptions-item label="Sprint目标" :span="3">
          <el-text>{{ sprint?.goals || '暂无' }}</el-text>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 容量和进度 -->
    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="容量（SP）" :value="sprint?.capacity || 0">
            <template #prefix>
              <el-icon color="#409EFF"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="规划（SP）" :value="sprint?.plannedStoryPoints || 0">
            <template #prefix>
              <el-icon color="#E6A23C"><Calendar /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="完成（SP）" :value="sprint?.completedStoryPoints || 0">
            <template #prefix>
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 完成率 -->
    <el-card style="margin-bottom: 16px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="flex: 1;">
          <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
            <span style="font-weight: 500; color: #606266;">完成进度</span>
            <span style="font-size: 18px; font-weight: 600; color: #409EFF;">{{ completionRate }}%</span>
          </div>
          <el-progress 
            :percentage="completionRate" 
            :status="completionRate === 100 ? 'success' : undefined"
            :stroke-width="20"
          />
        </div>
        <el-divider direction="vertical" style="height: 60px; margin: 0 24px;" />
        <div style="flex: 1;">
          <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
            <span style="font-weight: 500; color: #606266;">负载率</span>
            <span style="font-size: 18px; font-weight: 600;" :style="{ color: loadRateColor }">{{ loadRate }}%</span>
          </div>
          <el-progress 
            :percentage="loadRate" 
            :status="loadRate > 100 ? 'exception' : undefined"
            :stroke-width="20"
          />
        </div>
      </div>
    </el-card>

    <!-- Tab页签 -->
    <el-card>
      <el-tabs v-model="activeTab">
        <!-- 任务列表 -->
        <el-tab-pane label="任务列表" name="tasks">
          <div class="tab-header">
            <el-text type="info">共 {{ sprintTasks.length }} 个任务</el-text>
            <el-button type="primary" size="small" @click="handleAddTask">
              <el-icon><Plus /></el-icon>
              添加任务
            </el-button>
          </div>

          <el-table 
            :data="sprintTasks" 
            stripe
            style="margin-top: 12px;"
            @row-click="handleTaskRowClick"
          >
            <el-table-column prop="code" label="编码" width="120">
              <template #default="{ row }">
                <el-text tag="b">{{ row.code }}</el-text>
              </template>
            </el-table-column>
            
            <el-table-column prop="title" label="标题" min-width="250" show-overflow-tooltip />
            
            <el-table-column label="负责人" width="100">
              <template #default="{ row }">
                {{ getUserName(row.assignee) }}
              </template>
            </el-table-column>
            
            <el-table-column label="预估/实际" width="120" align="center">
              <template #default="{ row }">
                <el-text size="small">{{ row.estimateHours }}h / {{ row.actualHours }}h</el-text>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getTaskStatusType(row.status)" size="small">{{ getTaskStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="优先级" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getPriorityType(row.priority)" size="small">{{ row.priority }}</el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click.stop="handleViewTask(row.id)">查看</el-button>
                <el-button link @click.stop="handleEditTask(row.id)">编辑</el-button>
                <el-button link type="danger" @click.stop="handleRemoveTask(row.id)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 任务统计 -->
          <el-row :gutter="16" style="margin-top: 16px;">
            <el-col :span="6">
              <el-statistic title="总任务" :value="taskStatistics.total" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="已完成" :value="taskStatistics.done">
                <template #prefix>
                  <el-icon color="#67C23A"><CircleCheck /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="6">
              <el-statistic title="进行中" :value="taskStatistics.inProgress">
                <template #prefix>
                  <el-icon color="#E6A23C"><Loading /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="6">
              <el-statistic title="待开始" :value="taskStatistics.todo">
                <template #prefix>
                  <el-icon color="#909399"><Document /></el-icon>
                </template>
              </el-statistic>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- 工作量统计 -->
        <el-tab-pane label="工作量统计" name="effort">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="总预估工时">
              {{ totalEstimateHours }} 小时
            </el-descriptions-item>
            <el-descriptions-item label="总实际工时">
              {{ totalActualHours }} 小时
            </el-descriptions-item>
            <el-descriptions-item label="剩余工时">
              {{ totalRemainingHours }} 小时
            </el-descriptions-item>
            <el-descriptions-item label="工时偏差">
              <el-text :type="effortVarianceType">{{ effortVariance > 0 ? '+' : '' }}{{ effortVariance }} 小时</el-text>
            </el-descriptions-item>
          </el-descriptions>

          <el-card style="margin-top: 16px;">
            <div style="font-weight: 500; margin-bottom: 12px;">工时分布</div>
            <el-progress 
              :percentage="effortCompletionRate" 
              :status="effortCompletionRate === 100 ? 'success' : undefined"
              :stroke-width="16"
              style="margin-bottom: 8px;"
            >
              <span>{{ totalActualHours }}h / {{ totalEstimateHours }}h</span>
            </el-progress>
          </el-card>
        </el-tab-pane>

        <!-- Sprint活动 -->
        <el-tab-pane label="Sprint活动" name="activities">
          <el-empty description="Sprint活动记录功能开发中..." />
        </el-tab-pane>

        <!-- 燃尽图 -->
        <el-tab-pane label="燃尽图" name="burndown">
          <el-empty description="燃尽图功能开发中..." />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Edit, VideoPlay, CircleCheck, TrendCharts, Calendar,
  Plus, Loading, Document
} from '@element-plus/icons-vue'
import PageContainer from '@/components/Common/PageContainer.vue'
import { useSprintStore } from '@/stores/modules/sprint'
import { useTaskStore } from '@/stores/modules/task'
import { usePIStore } from '@/stores/modules/pi'
import { useUserStore } from '@/stores/modules/user'
import dayjs from 'dayjs'

// ============================================================================
// Setup
// ============================================================================

const route = useRoute()
const router = useRouter()
const sprintStore = useSprintStore()
const taskStore = useTaskStore()
const piStore = usePIStore()
const userStore = useUserStore()

// ============================================================================
// State
// ============================================================================

const sprintId = route.params.id as string
const activeTab = ref('tasks')

// ============================================================================
// Computed
// ============================================================================

/** 当前Sprint */
const sprint = computed(() => {
  return sprintStore.sprints.find(s => s.id === sprintId)
})

/** Sprint的任务列表 */
const sprintTasks = computed(() => {
  return taskStore.tasks.filter(t => t.sprintId === sprintId)
})

/** PI列表 */
const pis = computed(() => piStore.pis)

/** 用户列表 */
const users = computed(() => userStore.users)

/** 完成率 */
const completionRate = computed(() => {
  const capacity = sprint.value?.capacity || 0
  const completed = sprint.value?.completedStoryPoints || 0
  const planned = sprint.value?.plannedStoryPoints || 0
  if (planned === 0) return 0
  return Math.round((completed / planned) * 100)
})

/** 负载率 */
const loadRate = computed(() => {
  const capacity = sprint.value?.capacity || 0
  const planned = sprint.value?.plannedStoryPoints || 0
  if (capacity === 0) return 0
  return Math.round((planned / capacity) * 100)
})

/** 负载率颜色 */
const loadRateColor = computed(() => {
  if (loadRate.value > 100) return '#F56C6C'
  if (loadRate.value > 90) return '#E6A23C'
  return '#67C23A'
})

/** 任务统计 */
const taskStatistics = computed(() => {
  const tasks = sprintTasks.value
  return {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'TODO').length
  }
})

/** 总预估工时 */
const totalEstimateHours = computed(() => {
  return sprintTasks.value.reduce((sum, t) => sum + (t.estimateHours || 0), 0)
})

/** 总实际工时 */
const totalActualHours = computed(() => {
  return sprintTasks.value.reduce((sum, t) => sum + (t.actualHours || 0), 0)
})

/** 总剩余工时 */
const totalRemainingHours = computed(() => {
  return sprintTasks.value.reduce((sum, t) => sum + (t.remainingHours || 0), 0)
})

/** 工时偏差 */
const effortVariance = computed(() => {
  return totalActualHours.value - totalEstimateHours.value
})

/** 工时偏差类型 */
const effortVarianceType = computed(() => {
  if (effortVariance.value > 0) return 'danger'
  if (effortVariance.value < 0) return 'success'
  return 'info'
})

/** 工时完成率 */
const effortCompletionRate = computed(() => {
  if (totalEstimateHours.value === 0) return 0
  return Math.round((totalActualHours.value / totalEstimateHours.value) * 100)
})

// ============================================================================
// Methods
// ============================================================================

/** 获取PI名称 */
function getPIName(piId?: string) {
  if (!piId) return '-'
  const pi = pis.value.find(p => p.id === piId)
  return pi?.name || '-'
}

/** 获取用户名称 */
function getUserName(userId: string) {
  const user = users.value.find(u => u.id === userId)
  return user?.name || '-'
}

/** 获取状态标签类型 */
function getStatusTagType(status?: string): 'success' | 'warning' | 'info' | '' {
  const map: Record<string, 'success' | 'warning' | 'info' | ''> = {
    'planning': 'info',
    'active': 'warning',
    'completed': 'success',
    'cancelled': ''
  }
  return status ? map[status] || 'info' : 'info'
}

/** 获取状态文本 */
function getStatusText(status?: string): string {
  const map: Record<string, string> = {
    'planning': '规划中',
    'active': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return status ? map[status] || status : '-'
}

/** 获取任务状态类型 */
function getTaskStatusType(status: string): 'success' | 'warning' | 'info' | 'danger' | '' {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger' | ''> = {
    'TODO': 'info',
    'in-progress': 'warning',
    'review': '',
    'testing': 'warning',
    'done': 'success'
  }
  return map[status] || 'info'
}

/** 获取任务状态文本 */
function getTaskStatusText(status: string): string {
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

/** 格式化日期 */
function formatDate(date?: string | Date) {
  if (!date) return '-'
  return dayjs(date).format('YYYY/MM/DD')
}

/** 编辑Sprint */
function handleEdit() {
  ElMessage.info('编辑Sprint功能开发中...')
}

/** 启动Sprint */
async function handleStart() {
  try {
    await ElMessageBox.confirm('确定要启动这个Sprint吗？', '确认启动', {
      confirmButtonText: '启动',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await sprintStore.updateSprint(sprintId, { status: 'active' })
    ElMessage.success('Sprint已启动')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('启动失败')
    }
  }
}

/** 完成Sprint */
async function handleComplete() {
  try {
    await ElMessageBox.confirm('确定要完成这个Sprint吗？', '确认完成', {
      confirmButtonText: '完成',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await sprintStore.updateSprint(sprintId, { status: 'completed' })
    ElMessage.success('Sprint已完成')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('完成失败')
    }
  }
}

/** 添加任务 */
function handleAddTask() {
  ElMessage.info('添加任务功能开发中...')
}

/** 任务行点击 */
function handleTaskRowClick(row: any) {
  handleViewTask(row.id)
}

/** 查看任务 */
function handleViewTask(taskId: string) {
  router.push(`/function/c4/task/${taskId}`)
}

/** 编辑任务 */
function handleEditTask(taskId: string) {
  ElMessage.info('编辑任务功能开发中...')
}

/** 从Sprint移除任务 */
async function handleRemoveTask(taskId: string) {
  try {
    await ElMessageBox.confirm('确定要从此Sprint移除这个任务吗？', '确认移除', {
      confirmButtonText: '移除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await taskStore.updateTask(taskId, { sprintId: '' })
    ElMessage.success('任务已移除')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  if (!sprint.value) {
    ElMessage.error('Sprint不存在')
    router.back()
  }
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
  gap: 12px;
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

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
</style>
