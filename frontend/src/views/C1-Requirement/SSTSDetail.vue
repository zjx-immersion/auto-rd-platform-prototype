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

        <!-- 评审Tab -->
        <el-tab-pane name="review">
          <template #label>
            SSTS评审 
            <el-badge v-if="ssts?.reviewStatus" :value="getReviewStatusText(ssts.reviewStatus)" :type="getReviewStatusType(ssts.reviewStatus)" />
          </template>
          
          <el-card shadow="never">
            <!-- 评审状态 -->
            <el-alert
              v-if="ssts?.reviewStatus"
              :title="`评审状态: ${getReviewStatusText(ssts.reviewStatus)}`"
              :type="getReviewStatusType(ssts.reviewStatus)"
              :closable="false"
              style="margin-bottom: 20px;"
            >
              <template v-if="ssts.reviewStatus === 'approved'">
                SSTS评审已通过，可以继续分解MR
              </template>
              <template v-else-if="ssts.reviewStatus === 'rejected'">
                SSTS评审被拒绝，请根据评审意见修改后重新提交
              </template>
              <template v-else-if="ssts.reviewStatus === 'in-review'">
                SSTS正在评审中，请等待评审人员反馈
              </template>
              <template v-else>
                SSTS尚未提交评审，请完善规格说明后提交
              </template>
            </el-alert>

            <!-- 评审操作 -->
            <div class="review-actions" style="margin-bottom: 20px;">
              <el-button
                v-if="!ssts?.reviewStatus || ssts.reviewStatus === 'pending' || ssts.reviewStatus === 'rejected'"
                type="primary"
                :icon="Check"
                @click="handleSubmitReview"
              >
                提交评审
              </el-button>
              <el-button
                v-if="ssts?.reviewStatus === 'in-review'"
                type="success"
                :icon="Check"
                @click="handleApproveReview"
              >
                批准通过
              </el-button>
              <el-button
                v-if="ssts?.reviewStatus === 'in-review'"
                type="danger"
                :icon="Close"
                @click="handleRejectReview"
              >
                拒绝
              </el-button>
              <el-button
                v-if="ssts?.reviewStatus === 'in-review'"
                :icon="ChatDotRound"
                @click="showCommentDialog = true"
              >
                添加评论
              </el-button>
            </div>

            <!-- 评审意见列表 -->
            <el-divider content-position="left">
              <el-icon><ChatDotRound /></el-icon>
              评审意见
            </el-divider>

            <el-timeline v-if="ssts?.reviewComments && ssts.reviewComments.length > 0">
              <el-timeline-item
                v-for="comment in ssts.reviewComments"
                :key="comment.id"
                :timestamp="comment.createdAt"
                placement="top"
              >
                <el-card>
                  <div class="review-comment">
                    <div class="comment-header">
                      <el-tag :type="getCommentType(comment.type)" size="small">
                        {{ getCommentTypeText(comment.type) }}
                      </el-tag>
                      <span class="comment-author">{{ comment.author }}</span>
                    </div>
                    <div class="comment-content">{{ comment.content }}</div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>

            <el-empty v-else description="暂无评审意见" />
          </el-card>
        </el-tab-pane>
      </el-tabs>

      <!-- 评审意见对话框 -->
      <el-dialog
        v-model="showCommentDialog"
        title="添加评审意见"
        width="600px"
      >
        <el-form label-width="80px">
          <el-form-item label="意见类型">
            <el-radio-group v-model="commentType">
              <el-radio label="comment">评论</el-radio>
              <el-radio label="approve">批准</el-radio>
              <el-radio label="reject">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="意见内容">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="4"
              placeholder="请输入评审意见..."
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCommentDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddComment">提交</el-button>
        </template>
      </el-dialog>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
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

// 评审相关状态
const showCommentDialog = ref(false)
const commentType = ref<'approve' | 'reject' | 'comment'>('comment')
const commentContent = ref('')

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

// 评审相关方法
const handleSubmitReview = async () => {
  try {
    await sstsStore.submitSSTSReview(sstsId)
    ElMessage.success('已提交评审')
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

const handleApproveReview = async () => {
  try {
    await ElMessageBox.prompt('请输入批准意见', '批准SSTS', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入批准意见（可选）',
    })
      .then(async ({ value }) => {
        await sstsStore.addSSTSReviewComment(
          sstsId,
          'approve',
          value || '批准通过',
          '当前用户'
        )
        ElMessage.success('已批准')
      })
  } catch (error) {
    // 用户取消操作
  }
}

const handleRejectReview = async () => {
  try {
    await ElMessageBox.prompt('请输入拒绝原因', '拒绝SSTS', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入拒绝原因（必填）',
      inputValidator: (value) => {
        if (!value) {
          return '请输入拒绝原因'
        }
        return true
      }
    })
      .then(async ({ value }) => {
        await sstsStore.addSSTSReviewComment(
          sstsId,
          'reject',
          value,
          '当前用户'
        )
        ElMessage.success('已拒绝')
      })
  } catch (error) {
    // 用户取消操作
  }
}

const handleAddComment = async () => {
  if (!commentContent.value) {
    ElMessage.warning('请输入评审意见')
    return
  }

  try {
    await sstsStore.addSSTSReviewComment(
      sstsId,
      commentType.value,
      commentContent.value,
      '当前用户'
    )
    ElMessage.success('评审意见已添加')
    showCommentDialog.value = false
    commentContent.value = ''
    commentType.value = 'comment'
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

// 评审状态相关
const getReviewStatusText = (status?: string) => {
  const map: Record<string, string> = {
    pending: '待评审',
    'in-review': '评审中',
    approved: '已批准',
    rejected: '已拒绝'
  }
  return map[status || ''] || '未知'
}

const getReviewStatusType = (status?: string): any => {
  const map: Record<string, string> = {
    pending: 'info',
    'in-review': 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status || ''] || 'info'
}

const getCommentType = (type: string): any => {
  const map: Record<string, string> = {
    comment: '',
    approve: 'success',
    reject: 'danger'
  }
  return map[type] || ''
}

const getCommentTypeText = (type: string) => {
  const map: Record<string, string> = {
    comment: '评论',
    approve: '批准',
    reject: '拒绝'
  }
  return map[type] || '评论'
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

.review-actions {
  display: flex;
  gap: 12px;
}

.review-comment {
  .comment-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    .comment-author {
      font-weight: 600;
      color: #303133;
    }
  }

  .comment-content {
    color: #606266;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}
</style>
