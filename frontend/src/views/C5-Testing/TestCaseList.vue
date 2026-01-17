<template>
  <PageContainer>
    <PageHeader title="测试用例管理" description="管理和执行所有测试用例">
      <template #actions>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建测试用例
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总用例数" :value="statistics.total" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="通过" :value="statistics.passed" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="失败" :value="statistics.failed" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="通过率" :value="statistics.passRate" suffix="%" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选 -->
    <el-card style="margin-bottom: 16px;">
      <el-form :inline="true">
        <el-form-item label="模块">
          <el-input v-model="filters.module" placeholder="输入模块名" clearable />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filters.priority" placeholder="全部" clearable>
            <el-option label="P0" value="P0" />
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
            <el-option label="P3" value="P3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="未执行" value="not-run" />
            <el-option label="通过" value="passed" />
            <el-option label="失败" value="failed" />
            <el-option label="阻塞" value="blocked" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 测试用例表格 -->
    <el-card>
      <el-table :data="filteredTestCases" v-loading="loading">
        <el-table-column prop="code" label="编号" width="120" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后执行" width="120">
          <template #default="{ row }">
            {{ formatDate(row.lastExecutionDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link @click="handleView(row.id)">查看</el-button>
            <el-button link type="success" @click="handleExecute(row.id, 'passed')">通过</el-button>
            <el-button link type="danger" @click="handleExecute(row.id, 'failed')">失败</el-button>
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
  module: '',
  priority: '',
  status: ''
})

const testCases = computed(() => testingStore.testCases)
const statistics = computed(() => testingStore.testCaseStatistics)

const filteredTestCases = computed(() => {
  let result = testCases.value
  if (filters.value.module) {
    result = result.filter(tc => tc.module?.includes(filters.value.module))
  }
  if (filters.value.priority) {
    result = result.filter(tc => tc.priority === filters.value.priority)
  }
  if (filters.value.status) {
    result = result.filter(tc => tc.status === filters.value.status)
  }
  return result
})

const handleCreate = () => router.push('/function/c5/testcase/create')
const handleView = (id: string) => router.push(`/function/c5/testcase/${id}`)

const handleExecute = async (id: string, result: 'passed' | 'failed') => {
  try {
    await testingStore.executeTestCase(id, result)
    ElMessage.success(`测试用例已标记为${result === 'passed' ? '通过' : '失败'}`)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getPriorityType = (priority: string) => {
  const map: Record<string, any> = { P0: 'danger', P1: 'warning', P2: 'primary', P3: 'info' }
  return map[priority] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'not-run': '未执行',
    'passed': '通过',
    'failed': '失败',
    'blocked': '阻塞'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    'not-run': 'info',
    'passed': 'success',
    'failed': 'danger',
    'blocked': 'warning'
  }
  return map[status] || 'info'
}

const formatDate = (date?: Date) => {
  return date ? new Date(date).toLocaleDateString('zh-CN') : '-'
}

onMounted(async () => {
  loading.value = true
  try {
    await testingStore.fetchTestCases()
  } finally {
    loading.value = false
  }
})
</script>
