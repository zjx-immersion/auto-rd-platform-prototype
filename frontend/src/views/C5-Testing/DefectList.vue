<template>
  <PageContainer>
    <PageHeader title="缺陷管理" description="跟踪和管理所有缺陷">
      <template #actions>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建缺陷
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="4">
        <el-card>
          <el-statistic title="总缺陷数" :value="statistics.total" />
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <el-statistic title="未解决" :value="statistics.open" />
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <el-statistic title="处理中" :value="statistics.inProgress" />
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <el-statistic title="已解决" :value="statistics.resolved" />
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <el-statistic title="严重缺陷" :value="statistics.critical + statistics.high" />
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card>
          <el-statistic title="解决率" :value="statistics.resolveRate" suffix="%" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选 -->
    <el-card style="margin-bottom: 16px;">
      <el-form :inline="true">
        <el-form-item label="严重程度">
          <el-select v-model="filters.severity" placeholder="全部" clearable>
            <el-option label="致命" value="critical" />
            <el-option label="严重" value="high" />
            <el-option label="一般" value="medium" />
            <el-option label="轻微" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="待处理" value="open" />
            <el-option label="处理中" value="in-progress" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已关闭" value="closed" />
            <el-option label="重新打开" value="reopened" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filters.priority" placeholder="全部" clearable>
            <el-option label="P0" value="P0" />
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
            <el-option label="P3" value="P3" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 缺陷表格 -->
    <el-card>
      <el-table :data="filteredDefects" v-loading="loading">
        <el-table-column prop="code" label="编号" width="120" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeverityType(row.severity)">{{ getSeverityText(row.severity) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="foundInVersion" label="发现版本" width="120" />
        <el-table-column label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link @click="handleView(row.id)">查看</el-button>
            <el-button link v-if="row.status === 'open'" type="primary" @click="handleStart(row.id)">开始处理</el-button>
            <el-button link v-if="row.status === 'in-progress'" type="success" @click="handleResolve(row.id)">标记解决</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useTestingStore } from '@/stores/modules/testing'
import { ElMessage } from 'element-plus'

const router = useRouter()
const testingStore = useTestingStore()

const loading = ref(false)
const filters = ref({
  severity: '',
  status: '',
  priority: ''
})

const defects = computed(() => testingStore.defects)
const statistics = computed(() => testingStore.defectStatistics)

const filteredDefects = computed(() => {
  let result = defects.value
  if (filters.value.severity) {
    result = result.filter(d => d.severity === filters.value.severity)
  }
  if (filters.value.status) {
    result = result.filter(d => d.status === filters.value.status)
  }
  if (filters.value.priority) {
    result = result.filter(d => d.priority === filters.value.priority)
  }
  return result
})

const handleCreate = () => router.push('/function/c5/defect/create')
const handleView = (id: string) => router.push(`/function/c5/defect/${id}`)

const handleStart = async (id: string) => {
  try {
    await testingStore.updateDefectStatus(id, 'in-progress')
    ElMessage.success('已开始处理缺陷')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleResolve = async (id: string) => {
  try {
    await testingStore.updateDefectStatus(id, 'resolved')
    ElMessage.success('缺陷已标记为解决')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getSeverityText = (severity: string) => {
  const map: Record<string, string> = {
    critical: '致命',
    high: '严重',
    medium: '一般',
    low: '轻微'
  }
  return map[severity] || severity
}

const getSeverityType = (severity: string) => {
  const map: Record<string, any> = {
    critical: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'info'
  }
  return map[severity] || 'info'
}

const getPriorityType = (priority: string) => {
  const map: Record<string, any> = { P0: 'danger', P1: 'warning', P2: 'primary', P3: 'info' }
  return map[priority] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    open: '待处理',
    'in-progress': '处理中',
    resolved: '已解决',
    closed: '已关闭',
    reopened: '重新打开'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    open: 'danger',
    'in-progress': 'primary',
    resolved: 'success',
    closed: 'info',
    reopened: 'warning'
  }
  return map[status] || 'info'
}

const formatDate = (date: Date) => new Date(date).toLocaleDateString('zh-CN')

onMounted(async () => {
  loading.value = true
  try {
    await testingStore.fetchDefects()
  } finally {
    loading.value = false
  }
})
</script>
