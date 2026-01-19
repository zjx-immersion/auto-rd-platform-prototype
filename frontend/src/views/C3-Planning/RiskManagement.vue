<template>
  <PageContainer>
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        创建风险
      </el-button>
    </div>

    <!-- 风险统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="风险总数" :value="statistics.total">
            <template #prefix>
              <el-icon color="#409eff"><Warning /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="高优先级风险" :value="statistics.highPriority">
            <template #prefix>
              <el-icon color="#f56c6c"><CircleClose /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="未缓解风险" :value="statistics.byStatus.open">
            <template #prefix>
              <el-icon color="#e6a23c"><InfoFilled /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="已解决风险" :value="statistics.byStatus.resolved">
            <template #prefix>
              <el-icon color="#67c23a"><CircleCheck /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和搜索 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="按状态筛选" clearable style="width: 100%;">
            <el-option label="未缓解" value="open" />
            <el-option label="缓解中" value="mitigating" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已接受" value="accepted" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterType" placeholder="按类型筛选" clearable style="width: 100%;">
            <el-option label="技术风险" value="technical" />
            <el-option label="资源风险" value="resource" />
            <el-option label="依赖风险" value="dependency" />
            <el-option label="外部风险" value="external" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterPriority" placeholder="按优先级筛选" clearable style="width: 100%;">
            <el-option label="高优先级" value="high" />
            <el-option label="中优先级" value="medium" />
            <el-option label="低优先级" value="low" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input v-model="searchKeyword" placeholder="搜索风险..." clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </el-card>

    <!-- 风险看板视图 -->
    <el-tabs v-model="activeView" type="card">
      <el-tab-pane label="看板视图" name="kanban">
        <el-row :gutter="20">
          <!-- 未缓解 -->
          <el-col :span="6">
            <el-card shadow="never" class="risk-column">
              <template #header>
                <div class="column-header">
                  <span>未缓解</span>
                  <el-badge :value="risksByStatus('open').length" class="badge" />
                </div>
              </template>
              <div class="risk-list">
                <el-card
                  v-for="risk in risksByStatus('open')"
                  :key="risk.id"
                  shadow="hover"
                  class="risk-card"
                  @click="handleViewRisk(risk)"
                >
                  <el-tag :type="getTypeColor(risk.type)" size="small" style="margin-bottom: 8px;">
                    {{ getTypeText(risk.type) }}
                  </el-tag>
                  <div class="risk-description">{{ risk.description }}</div>
                  <div class="risk-meta">
                    <el-tag :type="getProbabilityColor(risk.probability)" size="small">
                      概率: {{ risk.probability }}
                    </el-tag>
                    <el-tag :type="getImpactColor(risk.impact)" size="small">
                      影响: {{ risk.impact }}
                    </el-tag>
                    <el-tag type="info" size="small">
                      评分: {{ riskStore.calculateRiskScore(risk) }}
                    </el-tag>
                  </div>
                  <div class="risk-owner">负责人: {{ risk.owner }}</div>
                </el-card>
              </div>
            </el-card>
          </el-col>

          <!-- 缓解中 -->
          <el-col :span="6">
            <el-card shadow="never" class="risk-column">
              <template #header>
                <div class="column-header">
                  <span>缓解中</span>
                  <el-badge :value="risksByStatus('mitigating').length" class="badge" />
                </div>
              </template>
              <div class="risk-list">
                <el-card
                  v-for="risk in risksByStatus('mitigating')"
                  :key="risk.id"
                  shadow="hover"
                  class="risk-card"
                  @click="handleViewRisk(risk)"
                >
                  <el-tag :type="getTypeColor(risk.type)" size="small" style="margin-bottom: 8px;">
                    {{ getTypeText(risk.type) }}
                  </el-tag>
                  <div class="risk-description">{{ risk.description }}</div>
                  <div class="risk-meta">
                    <el-tag :type="getProbabilityColor(risk.probability)" size="small">
                      概率: {{ risk.probability }}
                    </el-tag>
                    <el-tag :type="getImpactColor(risk.impact)" size="small">
                      影响: {{ risk.impact }}
                    </el-tag>
                  </div>
                  <div class="risk-owner">负责人: {{ risk.owner }}</div>
                </el-card>
              </div>
            </el-card>
          </el-col>

          <!-- 已解决 -->
          <el-col :span="6">
            <el-card shadow="never" class="risk-column">
              <template #header>
                <div class="column-header">
                  <span>已解决</span>
                  <el-badge :value="risksByStatus('resolved').length" class="badge" type="success" />
                </div>
              </template>
              <div class="risk-list">
                <el-card
                  v-for="risk in risksByStatus('resolved')"
                  :key="risk.id"
                  shadow="hover"
                  class="risk-card"
                  @click="handleViewRisk(risk)"
                >
                  <el-tag :type="getTypeColor(risk.type)" size="small" style="margin-bottom: 8px;">
                    {{ getTypeText(risk.type) }}
                  </el-tag>
                  <div class="risk-description">{{ risk.description }}</div>
                  <div class="risk-meta">
                    <el-tag type="success" size="small">已解决</el-tag>
                  </div>
                  <div class="risk-owner">负责人: {{ risk.owner }}</div>
                </el-card>
              </div>
            </el-card>
          </el-col>

          <!-- 已接受 -->
          <el-col :span="6">
            <el-card shadow="never" class="risk-column">
              <template #header>
                <div class="column-header">
                  <span>已接受</span>
                  <el-badge :value="risksByStatus('accepted').length" class="badge" type="info" />
                </div>
              </template>
              <div class="risk-list">
                <el-card
                  v-for="risk in risksByStatus('accepted')"
                  :key="risk.id"
                  shadow="hover"
                  class="risk-card"
                  @click="handleViewRisk(risk)"
                >
                  <el-tag :type="getTypeColor(risk.type)" size="small" style="margin-bottom: 8px;">
                    {{ getTypeText(risk.type) }}
                  </el-tag>
                  <div class="risk-description">{{ risk.description }}</div>
                  <div class="risk-meta">
                    <el-tag type="info" size="small">已接受</el-tag>
                  </div>
                  <div class="risk-owner">负责人: {{ risk.owner }}</div>
                </el-card>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="列表视图" name="list">
        <el-table :data="filteredRisks" stripe v-loading="riskStore.loading">
          <el-table-column prop="id" label="ID" width="120" />
          <el-table-column label="描述" min-width="250">
            <template #default="{ row }">
              <el-link type="primary" @click="handleViewRisk(row)">
                {{ row.description }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTypeColor(row.type)" size="small">
                {{ getTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="概率" width="100">
            <template #default="{ row }">
              <el-tag :type="getProbabilityColor(row.probability)" size="small">
                {{ row.probability }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="影响" width="100">
            <template #default="{ row }">
              <el-tag :type="getImpactColor(row.impact)" size="small">
                {{ row.impact }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="评分" width="80" align="center">
            <template #default="{ row }">
              <el-text :type="getScoreType(riskStore.calculateRiskScore(row))">
                {{ riskStore.calculateRiskScore(row) }}
              </el-text>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusColor(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="负责人" width="120" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link size="small" @click="handleViewRisk(row)">查看</el-button>
              <el-button link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 创建/编辑风险对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑风险' : '创建风险'"
      width="700px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="风险描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请描述风险..." />
        </el-form-item>
        <el-form-item label="风险类型">
          <el-select v-model="formData.type" style="width: 100%;">
            <el-option label="技术风险" value="technical" />
            <el-option label="资源风险" value="resource" />
            <el-option label="依赖风险" value="dependency" />
            <el-option label="外部风险" value="external" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发生概率">
              <el-select v-model="formData.probability" style="width: 100%;">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="影响程度">
              <el-select v-model="formData.impact" style="width: 100%;">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="缓解措施">
          <el-input v-model="formData.mitigation" type="textarea" :rows="3" placeholder="请描述缓解措施..." />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="formData.owner" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-select v-model="formData.status" style="width: 100%;">
            <el-option label="未缓解" value="open" />
            <el-option label="缓解中" value="mitigating" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已接受" value="accepted" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Warning,
  CircleClose,
  InfoFilled,
  CircleCheck,
} from '@element-plus/icons-vue'
import { useRiskStore } from '@/stores/modules/risk'
import type { Risk } from '@/types'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'

const router = useRouter()
const riskStore = useRiskStore()

const activeView = ref('kanban')
const filterStatus = ref('')
const filterType = ref('')
const filterPriority = ref('')
const searchKeyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)

const formData = ref({
  description: '',
  type: 'technical' as Risk['type'],
  probability: 'medium' as Risk['probability'],
  impact: 'medium' as Risk['impact'],
  mitigation: '',
  owner: '',
  status: 'open' as Risk['status'],
})

const statistics = computed(() => riskStore.getRiskStatistics())

const risksByStatus = (status: Risk['status']) => {
  return riskStore.risksByStatus(status)
}

const filteredRisks = computed(() => {
  let result = [...riskStore.risks]

  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }
  if (filterType.value) {
    result = result.filter(r => r.type === filterType.value)
  }
  if (filterPriority.value) {
    result = result.filter(r =>
      r.probability === filterPriority.value || r.impact === filterPriority.value
    )
  }
  if (searchKeyword.value) {
    result = result.filter(r =>
      r.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  return result
})

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    technical: '技术',
    resource: '资源',
    dependency: '依赖',
    external: '外部',
  }
  return map[type] || type
}

const getTypeColor = (type: string): any => {
  const map: Record<string, string> = {
    technical: 'primary',
    resource: 'warning',
    dependency: 'danger',
    external: 'info',
  }
  return map[type] || ''
}

const getProbabilityColor = (probability: string): any => {
  const map: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  }
  return map[probability] || ''
}

const getImpactColor = (impact: string): any => {
  const map: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  }
  return map[impact] || ''
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    open: '未缓解',
    mitigating: '缓解中',
    resolved: '已解决',
    accepted: '已接受',
  }
  return map[status] || status
}

const getStatusColor = (status: string): any => {
  const map: Record<string, string> = {
    open: 'danger',
    mitigating: 'warning',
    resolved: 'success',
    accepted: 'info',
  }
  return map[status] || ''
}

const getScoreType = (score: number): any => {
  if (score >= 6) return 'danger'
  if (score >= 4) return 'warning'
  return 'success'
}

const handleCreate = () => {
  isEdit.value = false
  formData.value = {
    description: '',
    type: 'technical',
    probability: 'medium',
    impact: 'medium',
    mitigation: '',
    owner: '',
    status: 'open',
  }
  dialogVisible.value = true
}

const handleEdit = (risk: Risk) => {
  isEdit.value = true
  formData.value = { ...risk }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.value.description) {
    ElMessage.warning('请输入风险描述')
    return
  }

  try {
    submitting.value = true
    if (isEdit.value && formData.value.id) {
      await riskStore.updateRisk(formData.value.id, formData.value)
      ElMessage.success('更新成功')
    } else {
      await riskStore.createRisk(formData.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

const handleViewRisk = (risk: Risk) => {
  router.push(`/function/c3/risk/detail/${risk.id}`)
}

const handleDelete = async (risk: Risk) => {
  try {
    await ElMessageBox.confirm('确定要删除此风险吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await riskStore.deleteRisk(risk.id)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

onMounted(async () => {
  await riskStore.fetchRisks()
})
</script>

<style scoped lang="scss">
.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.risk-column {
  min-height: 600px;

  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;

    .badge {
      margin-left: 8px;
    }
  }
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 550px;
  overflow-y: auto;
}

.risk-card {
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  .risk-description {
    font-size: 14px;
    margin-bottom: 12px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .risk-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .risk-owner {
    font-size: 12px;
    color: #909399;
  }
}
</style>
