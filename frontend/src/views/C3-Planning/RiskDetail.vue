<template>
  <PageContainer v-loading="riskStore.loading">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <div class="title-section">
          <h2>风险详情</h2>
          <el-tag :type="getStatusColor(risk?.status)" size="large">
            {{ getStatusText(risk?.status) }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-button :icon="Edit" @click="handleEdit">编辑</el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 基本信息 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="风险ID">{{ risk?.id }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(risk?.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="风险类型">
              <el-tag :type="getTypeColor(risk?.type)" size="small">
                {{ getTypeText(risk?.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="负责人">{{ risk?.owner }}</el-descriptions-item>
            <el-descriptions-item label="发生概率">
              <el-tag :type="getProbabilityColor(risk?.probability)" size="small">
                {{ risk?.probability }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="影响程度">
              <el-tag :type="getImpactColor(risk?.impact)" size="small">
                {{ risk?.impact }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="风险评分">
              <el-text :type="getScoreType(riskScore)" size="large" style="font-weight: 600;">
                {{ riskScore }}
              </el-text>
            </el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusColor(risk?.status)" size="small">
                {{ getStatusText(risk?.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 风险描述 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>风险描述</span>
            </div>
          </template>
          <div class="content">
            {{ risk?.description || '暂无描述' }}
          </div>
        </el-card>

        <!-- 缓解措施 -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>缓解措施</span>
              <el-button size="small" @click="showMitigationDialog = true">
                添加措施
              </el-button>
            </div>
          </template>
          <div class="content">
            {{ risk?.mitigation || '暂无缓解措施' }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 风险评分卡片 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>风险评分</span>
            </div>
          </template>
          <div class="score-display">
            <div class="score-value" :class="getScoreClass(riskScore)">
              {{ riskScore }}
            </div>
            <div class="score-label">风险评分</div>
            <div class="score-desc">
              概率 ({{ risk?.probability }}) × 影响 ({{ risk?.impact }})
            </div>
          </div>
        </el-card>

        <!-- 状态操作 -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>状态操作</span>
            </div>
          </template>
          <div class="status-actions">
            <el-button
              v-if="risk?.status === 'open'"
              type="warning"
              style="width: 100%; margin-bottom: 12px;"
              @click="updateStatus('mitigating')"
            >
              开始缓解
            </el-button>
            <el-button
              v-if="risk?.status === 'mitigating'"
              type="success"
              style="width: 100%; margin-bottom: 12px;"
              @click="updateStatus('resolved')"
            >
              标记为已解决
            </el-button>
            <el-button
              v-if="risk?.status === 'open' || risk?.status === 'mitigating'"
              type="info"
              style="width: 100%; margin-bottom: 12px;"
              @click="updateStatus('accepted')"
            >
              接受风险
            </el-button>
            <el-button
              v-if="risk?.status !== 'open'"
              style="width: 100%;"
              @click="updateStatus('open')"
            >
              重新打开
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加缓解措施对话框 -->
    <el-dialog v-model="showMitigationDialog" title="添加缓解措施" width="600px">
      <el-input
        v-model="mitigationText"
        type="textarea"
        :rows="5"
        placeholder="请输入缓解措施..."
      />
      <template #footer>
        <el-button @click="showMitigationDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddMitigation">保存</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit } from '@element-plus/icons-vue'
import { useRiskStore } from '@/stores/modules/risk'
import PageContainer from '@/components/Common/PageContainer.vue'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const riskStore = useRiskStore()

const riskId = computed(() => route.params.id as string)
const risk = computed(() => riskStore.currentRisk)
const riskScore = computed(() => risk.value ? riskStore.calculateRiskScore(risk.value) : 0)

const showMitigationDialog = ref(false)
const mitigationText = ref('')

const getTypeText = (type?: string) => {
  const map: Record<string, string> = {
    technical: '技术风险',
    resource: '资源风险',
    dependency: '依赖风险',
    external: '外部风险',
  }
  return type ? map[type] || type : ''
}

const getTypeColor = (type?: string): any => {
  const map: Record<string, string> = {
    technical: 'primary',
    resource: 'warning',
    dependency: 'danger',
    external: 'info',
  }
  return type ? map[type] || '' : ''
}

const getProbabilityColor = (probability?: string): any => {
  const map: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  }
  return probability ? map[probability] || '' : ''
}

const getImpactColor = (impact?: string): any => {
  const map: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  }
  return impact ? map[impact] || '' : ''
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    open: '未缓解',
    mitigating: '缓解中',
    resolved: '已解决',
    accepted: '已接受',
  }
  return status ? map[status] || status : ''
}

const getStatusColor = (status?: string): any => {
  const map: Record<string, string> = {
    open: 'danger',
    mitigating: 'warning',
    resolved: 'success',
    accepted: 'info',
  }
  return status ? map[status] || '' : ''
}

const getScoreType = (score: number): any => {
  if (score >= 6) return 'danger'
  if (score >= 4) return 'warning'
  return 'success'
}

const getScoreClass = (score: number) => {
  if (score >= 6) return 'score-high'
  if (score >= 4) return 'score-medium'
  return 'score-low'
}

const formatDate = (date?: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : ''
}

const goBack = () => {
  router.back()
}

const handleEdit = () => {
  ElMessage.info('编辑功能待实现')
}

const updateStatus = async (status: string) => {
  try {
    await riskStore.updateRiskStatus(riskId.value, status as any)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

const handleAddMitigation = async () => {
  if (!mitigationText.value) {
    ElMessage.warning('请输入缓解措施')
    return
  }

  try {
    await riskStore.addMitigationPlan(riskId.value, mitigationText.value)
    ElMessage.success('缓解措施添加成功')
    showMitigationDialog.value = false
    mitigationText.value = ''
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

onMounted(async () => {
  await riskStore.fetchRiskById(riskId.value)
})
</script>

<style scoped lang="scss">
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.content {
  color: #606266;
  line-height: 1.8;
  white-space: pre-wrap;
}

.score-display {
  text-align: center;
  padding: 20px;

  .score-value {
    font-size: 64px;
    font-weight: 700;
    margin-bottom: 12px;

    &.score-high {
      color: #f56c6c;
    }

    &.score-medium {
      color: #e6a23c;
    }

    &.score-low {
      color: #67c23a;
    }
  }

  .score-label {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .score-desc {
    font-size: 14px;
    color: #909399;
  }
}

.status-actions {
  padding: 12px 0;
}
</style>
