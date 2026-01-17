<template>
  <PageContainer>
    <PageHeader :title="`测试用例详情 - ${testCase?.code || ''}`" :description="testCase?.title">
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
        <el-descriptions-item label="用例编号">{{ testCase?.code }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ testCase?.module }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ testCase?.type }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(testCase?.priority)">{{ testCase?.priority }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(testCase?.status)">{{ getStatusText(testCase?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ testCase?.author }}</el-descriptions-item>
        <el-descriptions-item label="最后执行时间" :span="2">
          {{ formatDate(testCase?.lastExecutionDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="前置条件" :span="2">
          {{ testCase?.preconditions }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3 style="margin-bottom: 16px;">测试步骤</h3>
      <el-table :data="testCase?.steps || []" border>
        <el-table-column prop="step" label="步骤" width="80" align="center" />
        <el-table-column prop="action" label="操作" />
        <el-table-column prop="expected" label="预期结果" />
      </el-table>

      <el-divider />

      <div style="margin-top: 24px;">
        <el-button type="success" @click="handleExecute('passed')">标记为通过</el-button>
        <el-button type="danger" @click="handleExecute('failed')">标记为失败</el-button>
        <el-button @click="handleExecute('blocked')">标记为阻塞</el-button>
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
const testCaseId = computed(() => route.params.id as string)
const testCase = computed(() => testingStore.currentTestCase)

const goBack = () => router.push('/function/c5/testcase/list')
const handleEdit = () => ElMessage.info('编辑功能待实现')

const handleExecute = async (result: 'passed' | 'failed' | 'blocked') => {
  try {
    await testingStore.executeTestCase(testCaseId.value, result)
    ElMessage.success(`测试用例已标记为${getStatusText(result)}`)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getPriorityType = (priority?: string) => {
  const map: Record<string, any> = { P0: 'danger', P1: 'warning', P2: 'primary', P3: 'info' }
  return map[priority || ''] || 'info'
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    'not-run': '未执行',
    'passed': '通过',
    'failed': '失败',
    'blocked': '阻塞'
  }
  return map[status || ''] || status || '-'
}

const getStatusType = (status?: string) => {
  const map: Record<string, any> = {
    'not-run': 'info',
    'passed': 'success',
    'failed': 'danger',
    'blocked': 'warning'
  }
  return map[status || ''] || 'info'
}

const formatDate = (date?: Date) => {
  return date ? new Date(date).toLocaleDateString('zh-CN') : '-'
}

onMounted(async () => {
  loading.value = true
  try {
    await testingStore.fetchTestCaseById(testCaseId.value)
  } finally {
    loading.value = false
  }
})
</script>
