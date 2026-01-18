<template>
  <PageContainer>
    <PageHeader 
      :title="`Sprint看板 - ${sprint?.name || ''}`" 
      description="拖拽任务卡片更新状态，实时跟踪Sprint进度"
    >
      <template #actions>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </template>
    </PageHeader>

    <!-- Sprint信息 -->
    <el-card style="margin-bottom: 16px;" v-if="sprint">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-statistic title="Sprint目标" :value="sprint.goal || '未设置'" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="计划故事点" :value="sprint.plannedStoryPoints || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已完成故事点" :value="sprint.completedStoryPoints || 0" />
        </el-col>
        <el-col :span="6">
          <el-progress 
            :percentage="completionRate" 
            :status="completionRate >= 80 ? 'success' : undefined"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- 看板 -->
    <el-row :gutter="16" v-loading="loading">
      <el-col :span="4" v-for="column in kanbanColumns" :key="column.status">
        <el-card :body-style="{ padding: '12px', minHeight: '600px', backgroundColor: '#f5f5f5' }">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">{{ column.label }}</span>
              <el-tag size="small">{{ getTaskCountByStatus(column.status) }}</el-tag>
            </div>
          </template>
          
          <div class="task-list">
            <div 
              v-for="task in getTasksByStatus(column.status)" 
              :key="task.id"
              class="task-card"
              draggable="true"
              @dragstart="handleDragStart(task)"
              @dragover.prevent
              @drop="handleDrop(column.status)"
            >
              <el-card shadow="hover" :body-style="{ padding: '12px' }">
                <div style="margin-bottom: 8px;">
                  <el-tag size="small" :type="getPriorityType(task.priority)">
                    {{ task.priority }}
                  </el-tag>
                  <el-tag size="small" style="margin-left: 4px;">
                    {{ task.storyPoints || 0 }}SP
                  </el-tag>
                </div>
                <div style="font-weight: 500; margin-bottom: 8px;">{{ task.title }}</div>
                <div style="font-size: 12px; color: #909399; margin-bottom: 8px;">
                  {{ task.code }}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <el-avatar :size="24">{{ getAssigneeName(task.assignee) }}</el-avatar>
                  <el-icon v-if="task.blocked" color="red"><Warning /></el-icon>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Warning } from '@element-plus/icons-vue'
import { useSprintStore } from '@/stores/modules/sprint'
import { useTaskStore } from '@/stores/modules/task'
import type { Task } from '@/types'

const route = useRoute()
const router = useRouter()
const sprintStore = useSprintStore()
const taskStore = useTaskStore()

const loading = ref(false)
const draggedTask = ref<Task | null>(null)

const sprintId = computed(() => route.params.sprintId as string)
const sprint = computed(() => sprintStore.currentSprint)
const tasks = computed(() => {
  if (!sprintId.value) return []
  const taskBySprint = taskStore.tasksBySprint
  if (!taskBySprint) return []
  return taskBySprint(sprintId.value) || []
})

const completionRate = computed(() => {
  if (!sprint.value) return 0
  const planned = sprint.value.plannedStoryPoints || 0
  const completed = sprint.value.completedStoryPoints || 0
  return planned > 0 ? Math.round((completed / planned) * 100) : 0
})

const kanbanColumns = [
  { status: 'todo', label: '待开始' },
  { status: 'in-progress', label: '进行中' },
  { status: 'review', label: '代码评审' },
  { status: 'testing', label: '测试中' },
  { status: 'done', label: '已完成' }
]

const getTasksByStatus = (status: string) => {
  return tasks.value.filter(t => t.status === status)
}

const getTaskCountByStatus = (status: string) => {
  return getTasksByStatus(status).length
}

const getPriorityType = (priority: string) => {
  const map: Record<string, any> = {
    P0: 'danger',
    P1: 'warning',
    P2: 'primary',
    P3: 'info'
  }
  return map[priority] || 'info'
}

const getAssigneeName = (assigneeId: string) => {
  // 简化：取ID的首字母
  return assigneeId?.substring(0, 2).toUpperCase() || 'UN'
}

const handleDragStart = (task: Task) => {
  draggedTask.value = task
}

const handleDrop = async (newStatus: string) => {
  if (draggedTask.value && draggedTask.value.status !== newStatus) {
    await taskStore.updateTaskStatus(draggedTask.value.id, newStatus)
    draggedTask.value = null
  }
}

const goBack = () => router.push('/function/c4/sprint/list')

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      sprintStore.fetchSprintById(sprintId.value),
      taskStore.fetchTasks({ sprintId: sprintId.value })
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card {
  cursor: move;
  transition: transform 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
}
</style>
