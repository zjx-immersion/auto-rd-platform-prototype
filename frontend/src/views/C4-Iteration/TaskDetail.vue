<template>
  <PageContainer>
    <PageHeader :title="`任务详情 - ${task?.code || ''}`" :description="task?.title">
      <template #actions>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </template>
    </PageHeader>

    <el-row :gutter="16" v-loading="loading">
      <!-- 左侧主要内容 -->
      <el-col :span="16">
        <!-- 基本信息 -->
        <el-card style="margin-bottom: 16px;">
          <template #header>
            <span style="font-weight: 500;">基本信息</span>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务编号">{{ task?.code }}</el-descriptions-item>
            <el-descriptions-item label="所属Sprint">
              <el-link @click="goToSprint">{{ getSprintName(task?.sprintId) }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="关联MR">
              <el-link @click="goToMR">{{ getMRCode(task?.mrId) }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="负责人">
              <el-avatar :size="24" style="margin-right: 8px;">{{ getAssigneeName(task?.assignee) }}</el-avatar>
              {{ task?.assignee }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(task?.status)">{{ getStatusText(task?.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityType(task?.priority)">{{ task?.priority }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="故事点">{{ task?.storyPoints || 0 }}SP</el-descriptions-item>
            <el-descriptions-item label="估算工时">{{ task?.estimateHours || 0 }}h</el-descriptions-item>
            <el-descriptions-item label="实际工时">{{ task?.actualHours || 0 }}h</el-descriptions-item>
            <el-descriptions-item label="剩余工时">
              {{ (task?.estimateHours || 0) - (task?.actualHours || 0) }}h
            </el-descriptions-item>
            <el-descriptions-item label="开始日期">{{ formatDate(task?.startDate) }}</el-descriptions-item>
            <el-descriptions-item label="截止日期">{{ formatDate(task?.dueDate) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{ formatDate(task?.createdAt) }}</el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <div style="margin-top: 16px;">
            <h4 style="margin-bottom: 12px;">任务描述</h4>
            <div style="line-height: 1.6;">{{ task?.description }}</div>
          </div>

          <div v-if="task?.blocked" style="margin-top: 16px;">
            <el-alert type="warning" :closable="false">
              <template #title>
                <el-icon><Warning /></el-icon> 任务已阻塞
              </template>
              <div>阻塞原因：{{ task?.blockReason || '无' }}</div>
            </el-alert>
          </div>
        </el-card>

        <!-- 评论区 -->
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 500;">评论 ({{ comments.length }})</span>
              <el-button size="small" @click="handleAddComment">添加评论</el-button>
            </div>
          </template>

          <el-empty v-if="comments.length === 0" description="暂无评论" />
          
          <el-timeline v-else>
            <el-timeline-item
              v-for="comment in comments"
              :key="comment.id"
              :timestamp="formatDate(comment.createdAt)"
            >
              <el-card>
                <div style="display: flex; justify-content: space-between;">
                  <div style="display: flex; align-items: center;">
                    <el-avatar :size="32" style="margin-right: 8px;">{{ comment.author }}</el-avatar>
                    <span style="font-weight: 500;">{{ comment.author }}</span>
                  </div>
                  <el-button link size="small">删除</el-button>
                </div>
                <div style="margin-top: 12px; line-height: 1.6;">{{ comment.content }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>

          <el-divider />

          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="添加评论..."
            style="margin-top: 12px;"
          />
          <div style="margin-top: 12px; text-align: right;">
            <el-button @click="newComment = ''">取消</el-button>
            <el-button type="primary" @click="submitComment">提交</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧操作和附件 -->
      <el-col :span="8">
        <!-- 状态操作 -->
        <el-card style="margin-bottom: 16px;">
          <template #header>
            <span style="font-weight: 500;">操作</span>
          </template>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <el-button v-if="task?.status === 'todo'" type="primary" @click="handleStart" block>
              开始任务
            </el-button>
            <el-button v-if="task?.status === 'in-progress'" type="success" @click="handleComplete" block>
              完成任务
            </el-button>
            <el-button v-if="task?.blocked" type="warning" @click="handleUnblock" block>
              解除阻塞
            </el-button>
            <el-button v-else @click="handleBlock" block>
              标记阻塞
            </el-button>
            <el-button @click="handleLogTime" block>
              <el-icon><Timer /></el-icon>
              记录工时
            </el-button>
          </div>
        </el-card>

        <!-- 附件 -->
        <el-card style="margin-bottom: 16px;">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 500;">附件 ({{ attachments.length }})</span>
              <el-button size="small" @click="handleUpload">
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
            </div>
          </template>

          <el-empty v-if="attachments.length === 0" description="暂无附件" />

          <div v-else>
            <div
              v-for="attachment in attachments"
              :key="attachment.id"
              style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;"
            >
              <div style="display: flex; align-items: center;">
                <el-icon style="margin-right: 8px;"><Document /></el-icon>
                <span>{{ attachment.name }}</span>
              </div>
              <div>
                <el-button link size="small">下载</el-button>
                <el-button link size="small" type="danger">删除</el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 关联项 -->
        <el-card>
          <template #header>
            <span style="font-weight: 500;">关联项</span>
          </template>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="所属MR">
              <el-link @click="goToMR">{{ getMRCode(task?.mrId) }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="所属SSTS">
              <el-link @click="goToSSTS">{{ getSSTSCode() }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="所属Feature">
              <el-link @click="goToFeature">{{ getFeatureCode() }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="相关任务">
              <span>{{ relatedTasks.length }} 个</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Edit, Warning, Timer, Upload, Document } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/modules/task'
import { useSprintStore } from '@/stores/modules/sprint'
import { useSSTSStore } from '@/stores/modules/ssts'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const sprintStore = useSprintStore()
const sstsStore = useSSTSStore()

const loading = ref(false)
const taskId = computed(() => route.params.id as string)
const task = computed(() => taskStore.currentTask)

// 评论数据（模拟）
const comments = ref([
  { id: '1', author: 'Zhang San', content: '这个任务的实现方案已经确定了', createdAt: new Date() },
  { id: '2', author: 'Li Si', content: '需要注意边界条件的处理', createdAt: new Date() }
])
const newComment = ref('')

// 附件数据（模拟）
const attachments = ref([
  { id: '1', name: '设计文档.pdf', size: '2.5MB', createdAt: new Date() },
  { id: '2', name: '技术方案.docx', size: '1.2MB', createdAt: new Date() }
])

// 相关任务（模拟）
const relatedTasks = ref([])

const goBack = () => router.back()
const handleEdit = () => ElMessage.info('编辑功能待实现')

const handleStart = async () => {
  try {
    await taskStore.updateTaskStatus(taskId.value, 'in-progress')
    ElMessage.success('任务已开始')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleComplete = async () => {
  try {
    await taskStore.updateTaskStatus(taskId.value, 'done')
    ElMessage.success('任务已完成')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleBlock = async () => {
  try {
    const reason = '等待依赖任务完成'
    await taskStore.blockTask(taskId.value, reason)
    ElMessage.success('已标记为阻塞')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleUnblock = async () => {
  try {
    await taskStore.unblockTask(taskId.value)
    ElMessage.success('已解除阻塞')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleLogTime = () => ElMessage.info('工时记录功能待实现')
const handleAddComment = () => ElMessage.info('使用下方输入框添加评论')
const handleUpload = () => ElMessage.info('附件上传功能待实现')

const submitComment = () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  comments.value.push({
    id: Date.now().toString(),
    author: 'Current User',
    content: newComment.value,
    createdAt: new Date()
  })
  newComment.value = ''
  ElMessage.success('评论已添加')
}

const getSprintName = (sprintId?: string) => {
  if (!sprintId) return '-'
  const sprint = sprintStore.sprints.find(s => s.id === sprintId)
  return sprint?.name || sprintId
}

const getMRCode = (mrId?: string) => {
  if (!mrId) return '-'
  const mr = sstsStore.mrs.find(m => m.id === mrId)
  return mr?.code || mrId
}

const getSSTSCode = () => {
  const mr = sstsStore.mrs.find(m => m.id === task.value?.mrId)
  if (!mr) return '-'
  const ssts = sstsStore.sstsList.find(s => s.id === mr.sstsId)
  return ssts?.code || '-'
}

const getFeatureCode = () => {
  const mr = sstsStore.mrs.find(m => m.id === task.value?.mrId)
  if (!mr) return '-'
  const ssts = sstsStore.sstsList.find(s => s.id === mr.sstsId)
  return ssts ? `Feature-${ssts.featureId?.substring(0, 8)}` : '-'
}

const getAssigneeName = (assignee?: string) => {
  return assignee?.substring(0, 2).toUpperCase() || 'UN'
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    'todo': '待开始',
    'in-progress': '进行中',
    'review': '评审中',
    'testing': '测试中',
    'done': '已完成'
  }
  return map[status || ''] || status || '-'
}

const getStatusType = (status?: string) => {
  const map: Record<string, any> = {
    'todo': 'info',
    'in-progress': 'primary',
    'review': 'warning',
    'testing': 'warning',
    'done': 'success'
  }
  return map[status || ''] || 'info'
}

const getPriorityType = (priority?: string) => {
  const map: Record<string, any> = {
    'P0': 'danger',
    'P1': 'warning',
    'P2': 'primary',
    'P3': 'info'
  }
  return map[priority || ''] || 'info'
}

const formatDate = (date?: Date) => {
  return date ? new Date(date).toLocaleDateString('zh-CN') : '-'
}

const goToSprint = () => {
  if (task.value?.sprintId) {
    router.push(`/function/c4/sprint/${task.value.sprintId}`)
  }
}

const goToMR = () => {
  if (task.value?.mrId) {
    router.push(`/function/c1-requirement/mr/${task.value.mrId}`)
  }
}

const goToSSTS = () => {
  const mr = sstsStore.mrs.find(m => m.id === task.value?.mrId)
  if (mr?.sstsId) {
    router.push(`/function/c1-requirement/ssts/${mr.sstsId}`)
  }
}

const goToFeature = () => {
  const mr = sstsStore.mrs.find(m => m.id === task.value?.mrId)
  if (mr) {
    const ssts = sstsStore.sstsList.find(s => s.id === mr.sstsId)
    if (ssts?.featureId) {
      router.push(`/function/c1-requirement/feature/${ssts.featureId}`)
    }
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      taskStore.fetchTaskById(taskId.value),
      sprintStore.fetchSprints(),
      sstsStore.fetchSSTS(),
      sstsStore.fetchMRs()
    ])
  } finally {
    loading.value = false
  }
})
</script>
