<template>
  <PageContainer>
    <PageHeader :title="`Sprint回顾 - ${sprint?.name || ''}`" description="总结Sprint完成情况，制定改进措施">
      <template #actions>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </template>
    </PageHeader>

    <el-row :gutter="16" v-loading="loading">
      <!-- 左侧完成情况 -->
      <el-col :span="16">
        <!-- Sprint统计 -->
        <el-card style="margin-bottom: 16px;">
          <template #header>
            <span style="font-weight: 500;">Sprint统计</span>
          </template>

          <el-row :gutter="16">
            <el-col :span="8">
              <el-statistic title="计划故事点" :value="sprint?.plannedStoryPoints || 0" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="完成故事点" :value="sprint?.completedStoryPoints || 0" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="完成率" :value="completionRate" suffix="%" />
            </el-col>
          </el-row>

          <el-divider />

          <el-row :gutter="16">
            <el-col :span="12">
              <div style="text-align: center;">
                <div style="font-size: 12px; color: #909399; margin-bottom: 8px;">任务完成情况</div>
                <el-progress
                  type="circle"
                  :percentage="taskCompletionRate"
                  :width="120"
                  :stroke-width="10"
                />
              </div>
            </el-col>
            <el-col :span="12">
              <div style="text-align: center;">
                <div style="font-size: 12px; color: #909399; margin-bottom: 8px;">团队速率</div>
                <el-statistic :value="teamVelocity" suffix="SP/Sprint" />
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 完成的任务 -->
        <el-card style="margin-bottom: 16px;">
          <template #header>
            <span style="font-weight: 500;">已完成的任务 ({{ completedTasks.length }})</span>
          </template>

          <el-table :data="completedTasks">
            <el-table-column prop="code" label="任务编号" width="120" />
            <el-table-column prop="title" label="任务标题" min-width="200" />
            <el-table-column label="故事点" width="100">
              <template #default="{ row }">
                {{ row.storyPoints || 0 }}SP
              </template>
            </el-table-column>
            <el-table-column label="负责人" width="120">
              <template #default="{ row }">
                {{ row.assignee }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 未完成的任务 -->
        <el-card v-if="incompleteTasks.length > 0" style="margin-bottom: 16px;">
          <template #header>
            <span style="font-weight: 500;">未完成的任务 ({{ incompleteTasks.length }})</span>
          </template>

          <el-table :data="incompleteTasks">
            <el-table-column prop="code" label="任务编号" width="120" />
            <el-table-column prop="title" label="任务标题" min-width="200" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="原因" min-width="150">
              <template #default="{ row }">
                {{ row.blockReason || '进度延误' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 回顾内容 -->
        <el-card>
          <template #header>
            <span style="font-weight: 500;">回顾总结</span>
          </template>

          <el-form label-width="100px">
            <el-form-item label="做得好的">
              <el-input
                v-model="reviewData.goodPoints"
                type="textarea"
                :rows="4"
                placeholder="团队在本Sprint中做得好的方面..."
              />
            </el-form-item>
            <el-form-item label="待改进">
              <el-input
                v-model="reviewData.improvementPoints"
                type="textarea"
                :rows="4"
                placeholder="团队需要改进的方面..."
              />
            </el-form-item>
            <el-form-item label="行动计划">
              <el-input
                v-model="reviewData.actionPlans"
                type="textarea"
                :rows="4"
                placeholder="下一个Sprint的改进措施..."
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存回顾</el-button>
              <el-button @click="handleExport">导出报告</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧图表 -->
      <el-col :span="8">
        <!-- 速率趋势 -->
        <el-card style="margin-bottom: 16px;">
          <template #header>
            <span style="font-weight: 500;">速率趋势</span>
          </template>
          <div style="text-align: center; padding: 20px 0;">
            <el-empty description="图表功能待实现" />
          </div>
        </el-card>

        <!-- 问题分类 -->
        <el-card style="margin-bottom: 16px;">
          <template #header>
            <span style="font-weight: 500;">问题分类</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="技术问题">{{ issues.technical }}</el-descriptions-item>
            <el-descriptions-item label="流程问题">{{ issues.process }}</el-descriptions-item>
            <el-descriptions-item label="协作问题">{{ issues.collaboration }}</el-descriptions-item>
            <el-descriptions-item label="资源问题">{{ issues.resource }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 团队反馈 -->
        <el-card>
          <template #header>
            <span style="font-weight: 500;">团队反馈</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="feedback in teamFeedback"
              :key="feedback.id"
              :timestamp="feedback.author"
            >
              {{ feedback.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useSprintStore } from '@/stores/modules/sprint'
import { useTaskStore } from '@/stores/modules/task'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const sprintStore = useSprintStore()
const taskStore = useTaskStore()

const loading = ref(false)
const sprintId = computed(() => route.params.id as string)
const sprint = computed(() => sprintStore.currentSprint)
const tasks = computed(() => taskStore.tasksBySprint(sprintId.value))

const completedTasks = computed(() => tasks.value.filter(t => t.status === 'done'))
const incompleteTasks = computed(() => tasks.value.filter(t => t.status !== 'done'))

const completionRate = computed(() => {
  const planned = sprint.value?.plannedStoryPoints || 0
  const completed = sprint.value?.completedStoryPoints || 0
  return planned > 0 ? Math.round((completed / planned) * 100) : 0
})

const taskCompletionRate = computed(() => {
  const total = tasks.value.length
  const completed = completedTasks.value.length
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const teamVelocity = computed(() => sprint.value?.completedStoryPoints || 0)

const reviewData = ref({
  goodPoints: '',
  improvementPoints: '',
  actionPlans: ''
})

const issues = ref({
  technical: 2,
  process: 1,
  collaboration: 3,
  resource: 1
})

const teamFeedback = ref([
  { id: '1', author: 'Zhang San', content: '本Sprint任务划分合理，协作顺畅' },
  { id: '2', author: 'Li Si', content: '代码评审流程需要优化，耗时较长' },
  { id: '3', author: 'Wang Wu', content: '测试环境不够稳定，影响进度' }
])

const goBack = () => router.push('/function/c4/sprint/list')

const handleSave = () => {
  ElMessage.success('Sprint回顾已保存')
}

const handleExport = () => {
  ElMessage.info('报告导出功能待实现')
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'todo': '待开始',
    'in-progress': '进行中',
    'review': '评审中',
    'testing': '测试中',
    'done': '已完成'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    'todo': 'info',
    'in-progress': 'primary',
    'review': 'warning',
    'testing': 'warning',
    'done': 'success'
  }
  return map[status] || 'info'
}

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
