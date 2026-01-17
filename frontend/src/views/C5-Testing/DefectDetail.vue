<template>
  <PageContainer>
    <PageHeader :title="`缺陷详情 - ${defect?.code || ''}`" :description="defect?.title">
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

    <el-card v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="缺陷编号">{{ defect?.code }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ defect?.type }}</el-descriptions-item>
        <el-descriptions-item label="严重程度">
          <el-tag :type="getSeverityType(defect?.severity)">{{ getSeverityText(defect?.severity) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(defect?.priority)">{{ defect?.priority }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(defect?.status)">{{ getStatusText(defect?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="报告人">{{ defect?.reporter }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ defect?.assignee }}</el-descriptions-item>
        <el-descriptions-item label="发现版本">{{ defect?.foundInVersion }}</el-descriptions-item>
        <el-descriptions-item label="修复版本">{{ defect?.fixedInVersion || '未修复' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(defect?.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(defect?.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ defect?.description }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <div style="margin-top: 24px;">
        <el-button v-if="defect?.status === 'open'" type="primary" @click="handleStart">开始处理</el-button>
        <el-button v-if="defect?.status === 'in-progress'" type="success" @click="handleResolve">标记为已解决</el-button>
        <el-button v-if="defect?.status === 'resolved'" @click="handleClose">关闭缺陷</el-button>
        <el-button v-if="defect?.status === 'closed'" type="warning" @click="handleReopen">重新打开</el-button>
      </div>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Edit } from '@element-plus/icons-vue'
import { useTestingStore } from '@/stores/modules/testing'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const testingStore = useTestingStore()

const loading = ref(false)
const defectId = computed(() => route.params.id as string)
const defect = computed(() => testingStore.currentDefect)

const goBack = () => router.push('/function/c5/defect/list')
const handleEdit = () => ElMessage.info('编辑功能待实现')

const handleStart = async () => {
  try {
    await testingStore.updateDefectStatus(defectId.value, 'in-progress')
    ElMessage.success('已开始处理缺陷')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleResolve = async () => {
  try {
    await testingStore.updateDefectStatus(defectId.value, 'resolved')
    ElMessage.success('缺陷已标记为解决')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleClose = async () => {
  try {
    await testingStore.updateDefectStatus(defectId.value, 'closed')
    ElMessage.success('缺陷已关闭')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleReopen = async () => {
  try {
    await testingStore.updateDefectStatus(defectId.value, 'reopened')
    ElMessage.success('缺陷已重新打开')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getSeverityText = (severity?: string) => {
  const map: Record<string, string> = {
    critical: '致命',
    high: '严重',
    medium: '一般',
    low: '轻微'
  }
  return map[severity || ''] || severity || '-'
}

const getSeverityType = (severity?: string) => {
  const map: Record<string, any> = {
    critical: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'info'
  }
  return map[severity || ''] || 'info'
}

const getPriorityType = (priority?: string) => {
  const map: Record<string, any> = { P0: 'danger', P1: 'warning', P2: 'primary', P3: 'info' }
  return map[priority || ''] || 'info'
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    open: '待处理',
    'in-progress': '处理中',
    resolved: '已解决',
    closed: '已关闭',
    reopened: '重新打开'
  }
  return map[status || ''] || status || '-'
}

const getStatusType = (status?: string) => {
  const map: Record<string, any> = {
    open: 'danger',
    'in-progress': 'primary',
    resolved: 'success',
    closed: 'info',
    reopened: 'warning'
  }
  return map[status || ''] || 'info'
}

const formatDate = (date?: Date) => {
  return date ? new Date(date).toLocaleDateString('zh-CN') : '-'
}

onMounted(async () => {
  loading.value = true
  try {
    await testingStore.fetchDefectById(defectId.value)
  } finally {
    loading.value = false
  }
})
</script>
