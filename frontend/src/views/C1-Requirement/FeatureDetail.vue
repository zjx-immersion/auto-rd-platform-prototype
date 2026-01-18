<template>
  <div class="feature-detail-container" v-loading="loading">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <div class="title-section">
          <h2>{{ feature?.title }}</h2>
          <el-tag :type="getStatusType(feature?.status)" size="large">
            {{ getStatusText(feature?.status) }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-button :icon="Edit" @click="handleEdit">编辑</el-button>
        <el-button type="primary" @click="handleAddSSTS">添加SSTS</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="info">
        <el-card shadow="never">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Feature编码">{{ feature?.code }}</el-descriptions-item>
            <el-descriptions-item label="所属Epic">
              <el-button 
                v-if="feature?.epicId" 
                type="primary" 
                link 
                @click="handleViewEpic(feature.epicId)"
              >
                {{ getEpicTitle(feature?.epicId) }}
              </el-button>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="产品线">{{ feature?.productLine || '-' }}</el-descriptions-item>
            <el-descriptions-item label="产品">{{ feature?.product || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(feature?.status)">{{ getStatusText(feature?.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityType(feature?.priority)" size="small">
                {{ feature?.priority || '-' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="故事点">{{ feature?.storyPoints || 0 }}</el-descriptions-item>
            <el-descriptions-item label="复杂度">
              <el-tag :type="getComplexityType(feature?.complexity)" size="small">
                {{ getComplexityText(feature?.complexity) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="负责人">{{ getUserName(feature?.owner) }}</el-descriptions-item>
            <el-descriptions-item label="目标PI">{{ feature?.targetPI || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="SSTS数量">
              <el-tag size="small">{{ feature?.sstsIds?.length || 0 }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(feature?.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(feature?.updatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <el-tag v-for="tag in feature?.tags" :key="tag" size="small" style="margin-right: 8px">
                {{ tag }}
              </el-tag>
              <span v-if="!feature?.tags || feature.tags.length === 0">-</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-tab-pane>

      <el-tab-pane name="prd">
        <template #label>PRD <el-badge :value="feature?.prd.status" type="success" /></template>
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between">
              <span>产品需求文档 (PRD)</span>
              <el-button size="small" type="primary" @click="handleEditPRD">编辑PRD</el-button>
            </div>
          </template>
          <div v-if="feature?.prd.content" class="prd-content" v-html="feature.prd.content"></div>
          <el-empty v-else description="暂无PRD内容" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane name="ssts">
        <template #label>
          SSTS <el-badge :value="sstsList.length" class="tab-badge" />
        </template>
        <el-card shadow="never">
          <div class="ssts-header">
            <h3>SSTS列表</h3>
            <el-button type="primary" size="small" @click="handleAddSSTS">
              添加SSTS
            </el-button>
          </div>

          <el-table :data="sstsList" stripe style="width: 100%">
            <el-table-column prop="code" label="编码" width="140" />
            <el-table-column prop="name" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column label="类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.type === 'functional' ? 'primary' : 'success'" size="small">
                  {{ row.type === 'functional' ? '功能' : '技术' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="getPriorityType(row.priority)">
                  {{ row.priority }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="复杂度" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="getComplexityType(row.complexity)">
                  {{ getComplexityText(row.complexity) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="MR数量" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ row.mrIds?.length || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleViewSSTS(row)">
                  查看
                </el-button>
                <el-button type="danger" link size="small" @click="handleRemoveSSTS(row)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="sstsList.length === 0" description="暂无SSTS" />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit } from '@element-plus/icons-vue'
import { useFeatureStore } from '@/stores/modules/feature'
import { useSSTSStore } from '@/stores/modules/ssts'
import { useEpicStore } from '@/stores/modules/epic'

const route = useRoute()
const router = useRouter()
const featureStore = useFeatureStore()
const sstsStore = useSSTSStore()
const epicStore = useEpicStore()

const featureId = computed(() => route.params.id as string)
const feature = computed(() => featureStore.currentFeature)
const sstsList = computed(() => sstsStore.sstsByFeature(featureId.value))
const epics = computed(() => epicStore.epics)

const loading = ref(false)
const activeTab = ref('info')

const goBack = () => router.back()
const handleEdit = () => {
  ElMessage.info('编辑功能待实现')
}
const handleEditPRD = () => {
  router.push(`/function/c1-requirement/feature/${featureId.value}/prd`)
}
const handleAddSSTS = () => {
  ElMessage.info('添加SSTS功能待实现')
}
const handleViewSSTS = (ssts: any) => {
  router.push(`/function/c1-requirement/ssts/${ssts.id}`)
}
const handleRemoveSSTS = async (ssts: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要从此Feature中移除SSTS "${ssts.name}" 吗？`,
      '移除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    // 这里应该调用解除关联的API
    ElMessage.success('移除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

const getEpicTitle = (epicId: string | undefined) => {
  if (!epicId) return '-'
  return epics.value.find(e => e.id === epicId)?.title || epicId
}
const getUserName = (userId: string | undefined) => userId || '-'
const handleViewEpic = (epicId: string) => {
  router.push(`/function/c1-requirement/epic/${epicId}`)
}
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
const getStatusText = (status: string | undefined) => {
  const map: Record<string, string> = { backlog: '待开始', 'in-progress': '进行中', done: '已完成' }
  return map[status || ''] || status || '-'
}
const getStatusType = (status: string | undefined) => {
  const map: Record<string, any> = { 
    backlog: 'info', 
    draft: 'info',
    'in-progress': 'primary', 
    done: 'success',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status || ''] || 'info'
}

const getPriorityType = (priority: string | undefined) => {
  if (!priority) return 'info'
  const typeMap: Record<string, any> = {
    P0: 'danger',
    P1: 'warning',
    P2: '',
    P3: 'info',
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }
  return typeMap[priority] || 'info'
}

const getComplexityType = (complexity: string | undefined) => {
  if (!complexity) return 'info'
  const typeMap: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
  }
  return typeMap[complexity] || 'info'
}

const getComplexityText = (complexity: string | undefined) => {
  if (!complexity) return '-'
  const textMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
  }
  return textMap[complexity] || complexity
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      featureStore.fetchFeatureById(featureId.value),
      sstsStore.fetchSSTSByFeatureId(featureId.value),
      epicStore.fetchEpics(),
    ])

    // 根据URL参数切换tab
    const tab = route.query.tab as string
    if (tab) {
      activeTab.value = tab
    }
  } finally {
    loading.value = false
  }
})

// 监听路由变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    loading.value = true
    try {
      await Promise.all([
        featureStore.fetchFeatureById(newId as string),
        sstsStore.fetchSSTSByFeatureId(newId as string),
      ])
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped lang="scss">
.feature-detail-container {
  padding: 20px;
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      .title-section {
        display: flex;
        align-items: center;
        gap: 12px;
        h2 { margin: 0; font-size: 24px; font-weight: 600; }
      }
    }
    .header-right {
      display: flex;
      gap: 12px;
    }
  }
  .prd-content {
    line-height: 1.8;
    white-space: pre-wrap;
  }
  .ssts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  .tab-badge {
    margin-left: 8px;
  }
}
</style>
