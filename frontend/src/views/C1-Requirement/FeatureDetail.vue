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
            <el-descriptions-item label="所属Epic">{{ getEpicTitle(feature?.epicId) }}</el-descriptions-item>
            <el-descriptions-item label="产品线">{{ feature?.productLine || '-' }}</el-descriptions-item>
            <el-descriptions-item label="产品">{{ feature?.product || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(feature?.status)">{{ getStatusText(feature?.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="故事点">{{ feature?.storyPoints }}</el-descriptions-item>
            <el-descriptions-item label="复杂度">{{ feature?.complexity }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ getUserName(feature?.owner) }}</el-descriptions-item>
            <el-descriptions-item label="目标PI">{{ feature?.targetPI || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <el-tag v-for="tag in feature?.tags" :key="tag" size="small" style="margin-right: 8px">
                {{ tag }}
              </el-tag>
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
        <template #label>SSTS <el-badge :value="sstsList.length" /></template>
        <el-card shadow="never">
          <el-button type="primary" size="small" @click="handleAddSSTS" style="margin-bottom: 16px">
            添加SSTS
          </el-button>
          <el-table :data="sstsList" stripe>
            <el-table-column prop="code" label="编码" width="140" />
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.type === 'functional' ? 'primary' : 'success'" size="small">
                  {{ row.type === 'functional' ? '功能' : '技术' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ row.priority }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small">查看</el-button>
                <el-button type="danger" link size="small">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
const handleEdit = () => console.log('Edit feature')
const handleEditPRD = () => console.log('Edit PRD')
const handleAddSSTS = () => console.log('Add SSTS')

const getEpicTitle = (epicId: string | undefined) => {
  if (!epicId) return '-'
  return epics.value.find(e => e.id === epicId)?.title || epicId
}
const getUserName = (userId: string | undefined) => userId || '-'
const getStatusText = (status: string | undefined) => {
  const map: Record<string, string> = { backlog: '待开始', 'in-progress': '进行中', done: '已完成' }
  return map[status || ''] || status || '-'
}
const getStatusType = (status: string | undefined) => {
  const map: Record<string, any> = { backlog: 'info', 'in-progress': 'primary', done: 'success' }
  return map[status || ''] || 'info'
}

onMounted(async () => {
  loading.value = true
  try {
    // 这里应该调用featureStore.fetchFeatureById
    await Promise.all([
      sstsStore.fetchSSTSByFeatureId(featureId.value),
      epicStore.fetchEpics(),
    ])
  } finally {
    loading.value = false
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
}
</style>
