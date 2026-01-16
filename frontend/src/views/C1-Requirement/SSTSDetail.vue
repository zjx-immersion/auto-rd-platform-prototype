<template>
  <div class="ssts-detail-container">
    <PageContainer v-loading="loading">
      <div class="page-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
          <div class="title-section">
            <h2>{{ ssts?.title }}</h2>
            <el-tag :type="getStatusType(ssts?.status)" size="large">
              {{ getStatusText(ssts?.status) }}
            </el-tag>
          </div>
        </div>
        <div class="header-right">
          <el-button :icon="Edit" @click="handleEdit">编辑</el-button>
          <el-button type="primary" @click="handleDecompose">拆解MR</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="SSTS编码">{{ ssts?.code }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ ssts?.title }}</el-descriptions-item>
            <el-descriptions-item label="关联Feature">{{ getFeatureName(ssts?.featureId) }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ getTypeText(ssts?.type) }}</el-descriptions-item>
            <el-descriptions-item label="优先级">{{ ssts?.priority }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ getStatusText(ssts?.status) }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ getUserName(ssts?.owner) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ ssts?.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ ssts?.description }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane name="mrs">
          <template #label>
            <span>MR列表 <el-badge :value="mrList.length" class="item" /></span>
          </template>
          <div class="tab-header">
            <el-button type="primary" :icon="Plus" @click="handleAddMR">添加MR</el-button>
          </div>
          <el-table :data="mrList" stripe>
            <el-table-column prop="code" label="MR编码" width="150" />
            <el-table-column prop="title" label="标题" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="复杂度" width="100">
              <template #default="{ row }">
                <el-tag>{{ row.complexity }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="工作量" width="100">
              <template #default="{ row }">
                {{ row.storyPoints }}SP
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewMR(row)">查看</el-button>
                <el-button link type="danger" size="small" @click="removeMR(row)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="追溯矩阵" name="trace">
          <div class="trace-tree">
            <el-tree :data="traceData" :props="{ label: 'name', children: 'children' }" default-expand-all />
          </div>
        </el-tab-pane>
      </el-tabs>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, Plus } from '@element-plus/icons-vue'
import { useSSTSStore } from '@/stores/modules/ssts'
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const route = useRoute()
const sstsStore = useSSTSStore()
const featureStore = useFeatureStore()
const userStore = useUserStore()

const loading = ref(false)
const activeTab = ref('basic')
const sstsId = route.params.id as string

const ssts = computed(() => sstsStore.sstsList.find(s => s.id === sstsId))
const mrList = computed(() => sstsStore.getMRsBySSTS(sstsId))

const traceData = computed(() => {
  if (!ssts.value) return []
  const feature = featureStore.features.find(f => f.id === ssts.value?.featureId)
  return [{
    name: `Feature: ${feature?.name || ''}`,
    children: [{
      name: `SSTS: ${ssts.value.title}`,
      children: mrList.value.map(mr => ({
        name: `MR: ${mr.title}`
      }))
    }]
  }]
})

const getFeatureName = (featureId?: string) => {
  if (!featureId) return '-'
  const feature = featureStore.features.find(f => f.id === featureId)
  return feature ? feature.name : featureId
}

const getUserName = (userId?: string) => {
  if (!userId) return '-'
  const user = userStore.users.find(u => u.id === userId)
  return user ? user.name : userId
}

const getTypeText = (type?: string) => {
  const map: Record<string, string> = {
    functional: '功能需求',
    technical: '技术需求'
  }
  return map[type || ''] || type
}

const getStatusType = (status?: string) => {
  const map: Record<string, any> = {
    draft: 'info',
    'pending-review': 'warning',
    reviewed: 'success',
    'in-progress': 'primary',
    completed: 'success'
  }
  return map[status || ''] || ''
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    'pending-review': '待评审',
    reviewed: '已评审',
    'in-progress': '进行中',
    completed: '已完成'
  }
  return map[status || ''] || status
}

const goBack = () => router.back()
const handleEdit = () => router.push(`/function/c1-requirement/ssts/edit/${sstsId}`)
const handleDecompose = () => router.push(`/function/c1-requirement/ssts/${sstsId}/decompose`)
const handleAddMR = () => router.push(`/function/c1-requirement/mr/create?sstsId=${sstsId}`)
const viewMR = (row: any) => router.push(`/function/c1-requirement/mr/${row.id}`)
const removeMR = async (row: any) => {
  await sstsStore.unlinkMR(sstsId, row.id)
  ElMessage.success('移除成功')
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      sstsStore.fetchSSTSList(),
      sstsStore.fetchMRList(),
      featureStore.fetchFeatures()
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.ssts-detail-container {
  height: 100%;
}

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

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.tab-header {
  margin-bottom: 16px;
}

.trace-tree {
  padding: 20px;
}
</style>
