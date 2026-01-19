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

        <el-tab-pane label="评审" name="review">
          <el-card shadow="never">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>SSTS评审</span>
                <el-button 
                  v-if="reviewStatus !== 'pending' && reviewStatus !== 'in-review'" 
                  size="small" 
                  type="primary" 
                  @click="handleSubmitReview"
                >
                  提交评审
                </el-button>
              </div>
            </template>

            <!-- 评审状态 -->
            <div style="margin-bottom: 16px;">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="评审状态">
                  <el-tag v-if="reviewStatus" :type="getReviewStatusType(reviewStatus)">
                    {{ getReviewStatusText(reviewStatus) }}
                  </el-tag>
                  <span v-else>未提交</span>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 添加评审意见 -->
            <div v-if="reviewStatus === 'pending' || reviewStatus === 'in-review'" style="margin-bottom: 16px;">
              <el-form label-width="80px" size="small">
                <el-form-item label="评审意见">
                  <el-input
                    v-model="newReviewComment"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入评审意见..."
                  />
                </el-form-item>
                <el-form-item>
                  <el-button-group>
                    <el-button type="success" @click="handleAddReviewComment('approve')">
                      <el-icon><Check /></el-icon>
                      批准
                    </el-button>
                    <el-button type="danger" @click="handleAddReviewComment('reject')">
                      <el-icon><Close /></el-icon>
                      拒绝
                    </el-button>
                    <el-button @click="handleAddReviewComment('comment')">
                      <el-icon><ChatDotRound /></el-icon>
                      评论
                    </el-button>
                  </el-button-group>
                </el-form-item>
              </el-form>
            </div>

            <!-- 评审意见列表 -->
            <div class="review-comments">
              <el-timeline v-if="reviewComments.length > 0">
                <el-timeline-item
                  v-for="comment in reviewComments"
                  :key="comment.id"
                  :timestamp="formatDateTime(comment.createdAt)"
                >
                  <div class="review-comment-item">
                    <div class="comment-header">
                      <strong>{{ comment.author }}</strong>
                      <el-tag :type="getCommentTypeColor(comment.type)" size="small">
                        {{ getCommentTypeText(comment.type) }}
                      </el-tag>
                    </div>
                    <div class="comment-content">{{ comment.content }}</div>
                  </div>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无评审意见" />
            </div>
          </el-card>
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
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, Plus, Check, Close, ChatDotRound } from '@element-plus/icons-vue'
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

// 评审相关
const reviewStatus = ref<'pending' | 'in-review' | 'approved' | 'rejected' | undefined>(undefined)
const reviewComments = ref<any[]>([])
const newReviewComment = ref('')

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
  try {
    // 从SSTS的mrIds中移除
    const currentSSTS = ssts.value
    if (currentSSTS) {
      const updatedMrIds = currentSSTS.mrIds.filter(id => id !== row.id)
      await sstsStore.updateSSTS(sstsId, { mrIds: updatedMrIds })
      ElMessage.success('移除成功')
    }
  } catch (error) {
    ElMessage.error('移除失败')
  }
}

// 评审相关方法
const handleSubmitReview = async () => {
  try {
    await sstsStore.submitSSTSReview(sstsId)
    await sstsStore.fetchSSTSList()
    loadReviewData()
    ElMessage.success('已提交评审')
  } catch (error) {
    ElMessage.error('提交评审失败')
  }
}

const handleAddReviewComment = async (type: 'approve' | 'reject' | 'comment') => {
  if (!newReviewComment.value.trim()) {
    ElMessage.warning('请输入评审意见')
    return
  }

  try {
    await sstsStore.addSSTSReviewComment(
      sstsId,
      type,
      newReviewComment.value,
      getUserName(userStore.currentUser?.id) || '当前用户'
    )
    newReviewComment.value = ''
    await sstsStore.fetchSSTSList()
    loadReviewData()
    
    const typeText = type === 'approve' ? '批准' : type === 'reject' ? '拒绝' : '评论'
    ElMessage.success(`${typeText}意见已添加`)
  } catch (error) {
    ElMessage.error('添加评审意见失败')
  }
}

const getReviewStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'warning',
    'in-review': 'primary',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getReviewStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待评审',
    'in-review': '评审中',
    approved: '已批准',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const getCommentTypeColor = (type: string) => {
  const map: Record<string, any> = {
    approve: 'success',
    reject: 'danger',
    comment: 'info'
  }
  return map[type] || 'info'
}

const getCommentTypeText = (type: string) => {
  const map: Record<string, string> = {
    approve: '批准',
    reject: '拒绝',
    comment: '评论'
  }
  return map[type] || type
}

const formatDateTime = (date: string | undefined) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadReviewData = () => {
  if (ssts.value) {
    reviewStatus.value = ssts.value.reviewStatus
    reviewComments.value = ssts.value.reviewComments || []
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      sstsStore.fetchSSTSList(),
      sstsStore.fetchMRList(),
      featureStore.fetchFeatures()
    ])
    loadReviewData()
  } finally {
    loading.value = false
  }
})

// 监听ssts变化，更新评审数据
watch(() => ssts.value, () => {
  loadReviewData()
}, { deep: true })
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

.review-comments {
  margin-top: 16px;

  .review-comment-item {
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 8px;

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      strong {
        color: #303133;
        font-size: 14px;
      }
    }

    .comment-content {
      color: #606266;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
  }
}
</style>
