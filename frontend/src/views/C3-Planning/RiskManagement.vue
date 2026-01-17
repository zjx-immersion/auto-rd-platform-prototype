<template>
  <PageContainer>
    <PageHeader title="风险管理" description="识别、评估、缓解和跟踪PI规划和执行过程中的风险">
      <template #actions>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
        <el-button type="primary" @click="handleAddRisk">
          <el-icon><Plus /></el-icon>
          添加风险
        </el-button>
      </template>
    </PageHeader>

    <!-- 风险统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fef0f0;">
              <el-icon color="#f56c6c" :size="32"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalRisks }}</div>
              <div class="stat-label">总风险数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fef0f0;">
              <el-icon color="#f56c6c" :size="32"><CircleCloseFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value critical">{{ criticalRisks }}</div>
              <div class="stat-label">严重风险</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #fdf6ec;">
              <el-icon color="#e6a23c" :size="32"><WarningFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value warning">{{ activeRisks }}</div>
              <div class="stat-label">活跃风险</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f0f9ff;">
              <el-icon color="#409eff" :size="32"><InfoFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value info">{{ resolvedRisks }}</div>
              <div class="stat-label">已解决</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 风险矩阵 -->
    <el-card style="margin-bottom: 16px;">
      <template #header>
        <span>风险矩阵（概率 × 影响）</span>
      </template>
      <div class="risk-matrix">
        <div class="matrix-labels">
          <div class="y-label">概率</div>
          <div class="y-axis">
            <div>很高</div>
            <div>高</div>
            <div>中</div>
            <div>低</div>
            <div>很低</div>
          </div>
        </div>
        <div class="matrix-grid">
          <div v-for="(row, rowIdx) in riskMatrix" :key="rowIdx" class="matrix-row">
            <div
              v-for="(cell, colIdx) in row"
              :key="colIdx"
              class="matrix-cell"
              :class="getCellClass(rowIdx, colIdx)"
              @click="handleCellClick(rowIdx, colIdx)"
            >
              <div class="cell-count">{{ cell.length }}</div>
              <div class="cell-risks">
                <el-tag
                  v-for="risk in cell.slice(0, 3)"
                  :key="risk.id"
                  size="small"
                  :type="getRiskLevelType(risk.level)"
                  style="margin: 2px;"
                >
                  {{ risk.code }}
                </el-tag>
                <span v-if="cell.length > 3" class="more-count">+{{ cell.length - 3 }}</span>
              </div>
            </div>
          </div>
          <div class="x-axis">
            <div>很低</div>
            <div>低</div>
            <div>中</div>
            <div>高</div>
            <div>很高</div>
          </div>
          <div class="x-label">影响</div>
        </div>
      </div>
    </el-card>

    <!-- 风险列表 -->
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>风险列表</span>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="list">列表</el-radio-button>
            <el-radio-button label="board">看板</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-row :gutter="16" style="margin-bottom: 16px;">
        <el-col :span="6">
          <el-select v-model="filterPI" placeholder="选择PI" clearable style="width: 100%;">
            <el-option
              v-for="pi in pis"
              :key="pi.id"
              :label="pi.name"
              :value="pi.id"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterLevel" placeholder="风险等级" clearable style="width: 100%;">
            <el-option label="严重" value="critical" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="风险状态" clearable style="width: 100%;">
            <el-option label="识别" value="identified" />
            <el-option label="评估中" value="assessing" />
            <el-option label="缓解中" value="mitigating" />
            <el-option label="监控中" value="monitoring" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已接受" value="accepted" />
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

      <!-- 列表视图 -->
      <el-table v-if="viewMode === 'list'" :data="filteredRisks" v-loading="loading" style="width: 100%;">
        <el-table-column prop="code" label="编号" width="100" />
        <el-table-column label="风险描述" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row)">
              {{ row.description }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getRiskLevelType(row.level)">
              {{ getRiskLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="概率" width="80" align="center">
          <template #default="{ row }">
            {{ row.probability }}
          </template>
        </el-table-column>
        <el-table-column label="影响" width="80" align="center">
          <template #default="{ row }">
            {{ row.impact }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column prop="dueDate" label="截止日期" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link size="small" type="primary" @click="handleMitigate(row)">缓解</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 看板视图 -->
      <div v-else class="risk-board">
        <div
          v-for="status in boardStatuses"
          :key="status.value"
          class="board-column"
        >
          <div class="column-header" :style="{ borderTopColor: status.color }">
            <span class="column-title">{{ status.label }}</span>
            <el-badge :value="getRisksByStatus(status.value).length" />
          </div>
          <div class="column-body">
            <div
              v-for="risk in getRisksByStatus(status.value)"
              :key="risk.id"
              class="risk-card"
              @click="handleViewDetail(risk)"
            >
              <div class="risk-header">
                <el-tag :type="getRiskLevelType(risk.level)" size="small">
                  {{ getRiskLevelText(risk.level) }}
                </el-tag>
                <span class="risk-code">{{ risk.code }}</span>
              </div>
              <div class="risk-description">{{ risk.description }}</div>
              <div class="risk-footer">
                <el-avatar :size="24" :src="risk.ownerAvatar" />
                <span class="risk-owner">{{ risk.owner }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑风险对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑风险' : '添加风险'"
      width="700px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="风险编号" prop="code">
          <el-input v-model="form.code" placeholder="例如：RISK-001" />
        </el-form-item>
        <el-form-item label="风险描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="简要描述风险..."
          />
        </el-form-item>
        <el-form-item label="关联PI" prop="piId">
          <el-select v-model="form.piId" placeholder="选择PI" style="width: 100%;">
            <el-option
              v-for="pi in pis"
              :key="pi.id"
              :label="pi.name"
              :value="pi.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="概率" prop="probability">
              <el-select v-model="form.probability" placeholder="选择概率" style="width: 100%;">
                <el-option label="1 - 很低" :value="1" />
                <el-option label="2 - 低" :value="2" />
                <el-option label="3 - 中" :value="3" />
                <el-option label="4 - 高" :value="4" />
                <el-option label="5 - 很高" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="影响" prop="impact">
              <el-select v-model="form.impact" placeholder="选择影响" style="width: 100%;">
                <el-option label="1 - 很低" :value="1" />
                <el-option label="2 - 低" :value="2" />
                <el-option label="3 - 中" :value="3" />
                <el-option label="4 - 高" :value="4" />
                <el-option label="5 - 很高" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="风险等级">
          <el-tag :type="getRiskLevelType(calculateRiskLevel(form.probability, form.impact))">
            {{ getRiskLevelText(calculateRiskLevel(form.probability, form.impact)) }}
          </el-tag>
          <span style="margin-left: 8px; color: #909399;">
            （自动计算：概率 × 影响 = {{ (form.probability || 0) * (form.impact || 0) }}）
          </span>
        </el-form-item>
        <el-form-item label="缓解措施">
          <el-input
            v-model="form.mitigation"
            type="textarea"
            :rows="3"
            placeholder="描述缓解措施..."
          />
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="form.owner" placeholder="负责人姓名" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 风险详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="风险详情"
      width="800px"
    >
      <el-descriptions v-if="currentRisk" :column="2" border>
        <el-descriptions-item label="风险编号">{{ currentRisk.code }}</el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <el-tag :type="getRiskLevelType(currentRisk.level)">
            {{ getRiskLevelText(currentRisk.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="概率">{{ currentRisk.probability }}/5</el-descriptions-item>
        <el-descriptions-item label="影响">{{ currentRisk.impact }}/5</el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="getStatusType(currentRisk.status)">
            {{ getStatusText(currentRisk.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="风险描述" :span="2">
          {{ currentRisk.description }}
        </el-descriptions-item>
        <el-descriptions-item label="缓解措施" :span="2">
          {{ currentRisk.mitigation || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentRisk.owner }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ currentRisk.dueDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="识别日期">{{ currentRisk.identifiedDate }}</el-descriptions-item>
        <el-descriptions-item label="更新日期">{{ currentRisk.updatedDate }}</el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px;">
        <h4>缓解进度</h4>
        <el-timeline>
          <el-timeline-item
            v-for="log in currentRisk?.logs || []"
            :key="log.id"
            :timestamp="log.timestamp"
          >
            <strong>{{ log.action }}</strong> - {{ log.description }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  Download,
  Warning,
  WarningFilled,
  CircleCloseFilled,
  InfoFilled,
  Search
} from '@element-plus/icons-vue'
import { usePlanningStore } from '@/stores/modules/planning'
import { useProjectStore } from '@/stores/modules/project'
import type { Risk, PI } from '@/types'
import { ElMessage } from 'element-plus'

const router = useRouter()
const planningStore = usePlanningStore()
const projectStore = useProjectStore()

const loading = ref(false)
const submitting = ref(false)
const viewMode = ref<'list' | 'board'>('list')
const filterPI = ref('')
const filterLevel = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')

const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEditing = ref(false)
const formRef = ref()
const currentRisk = ref<Risk | null>(null)

const form = ref<Partial<Risk>>({
  code: '',
  description: '',
  piId: '',
  probability: 3,
  impact: 3,
  mitigation: '',
  owner: '',
  dueDate: '',
  status: 'identified'
})

const rules = {
  code: [{ required: true, message: '请输入风险编号', trigger: 'blur' }],
  description: [{ required: true, message: '请输入风险描述', trigger: 'blur' }],
  piId: [{ required: true, message: '请选择PI', trigger: 'change' }],
  probability: [{ required: true, message: '请选择概率', trigger: 'change' }],
  impact: [{ required: true, message: '请选择影响', trigger: 'change' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
}

const boardStatuses = [
  { value: 'identified', label: '识别', color: '#909399' },
  { value: 'assessing', label: '评估中', color: '#409eff' },
  { value: 'mitigating', label: '缓解中', color: '#e6a23c' },
  { value: 'monitoring', label: '监控中', color: '#67c23a' },
  { value: 'resolved', label: '已解决', color: '#67c23a' }
]

const pis = computed(() => {
  const allPIs: PI[] = []
  projectStore.projects.forEach(project => {
    project.versions.forEach(version => {
      allPIs.push(...version.pis)
    })
  })
  return allPIs
})

const risks = computed(() => planningStore.risks)

const filteredRisks = computed(() => {
  return risks.value.filter(r => {
    if (filterPI.value && r.piId !== filterPI.value) return false
    if (filterLevel.value && r.level !== filterLevel.value) return false
    if (filterStatus.value && r.status !== filterStatus.value) return false
    if (searchKeyword.value && !r.description.toLowerCase().includes(searchKeyword.value.toLowerCase())) return false
    return true
  })
})

const totalRisks = computed(() => risks.value.length)
const criticalRisks = computed(() => risks.value.filter(r => r.level === 'critical').length)
const activeRisks = computed(() => risks.value.filter(r => ['identified', 'assessing', 'mitigating', 'monitoring'].includes(r.status)).length)
const resolvedRisks = computed(() => risks.value.filter(r => r.status === 'resolved').length)

// 风险矩阵：5x5 (概率 x 影响)
const riskMatrix = computed(() => {
  const matrix: Risk[][][] = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []))
  
  filteredRisks.value.forEach(risk => {
    const row = 5 - risk.probability // 反转行索引（很高在顶部）
    const col = risk.impact - 1
    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      matrix[row][col].push(risk)
    }
  })
  
  return matrix
})

const calculateRiskLevel = (probability: number, impact: number): string => {
  const score = probability * impact
  if (score >= 20) return 'critical'
  if (score >= 12) return 'high'
  if (score >= 6) return 'medium'
  return 'low'
}

const getCellClass = (rowIdx: number, colIdx: number) => {
  const probability = 5 - rowIdx
  const impact = colIdx + 1
  const level = calculateRiskLevel(probability, impact)
  return `cell-${level}`
}

const getRiskLevelType = (level: string) => {
  const map: Record<string, any> = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return map[level] || 'info'
}

const getRiskLevelText = (level: string) => {
  const map: Record<string, string> = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[level] || level
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    identified: 'info',
    assessing: '',
    mitigating: 'warning',
    monitoring: 'success',
    resolved: 'success',
    accepted: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    identified: '识别',
    assessing: '评估中',
    mitigating: '缓解中',
    monitoring: '监控中',
    resolved: '已解决',
    accepted: '已接受'
  }
  return map[status] || status
}

const getRisksByStatus = (status: string) => {
  return filteredRisks.value.filter(r => r.status === status)
}

const handleCellClick = (rowIdx: number, colIdx: number) => {
  const cellRisks = riskMatrix.value[rowIdx][colIdx]
  if (cellRisks.length > 0) {
    ElMessage.info(`该区域有 ${cellRisks.length} 个风险`)
  }
}

const handleAddRisk = () => {
  isEditing.value = false
  form.value = {
    code: `RISK-${String(risks.value.length + 1).padStart(3, '0')}`,
    description: '',
    piId: '',
    probability: 3,
    impact: 3,
    mitigation: '',
    owner: '',
    dueDate: '',
    status: 'identified'
  }
  dialogVisible.value = true
}

const handleEdit = (row: Risk) => {
  isEditing.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleMitigate = (row: Risk) => {
  ElMessage.success('缓解功能待实现')
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const riskData = {
      ...form.value,
      level: calculateRiskLevel(form.value.probability || 3, form.value.impact || 3)
    } as Risk

    if (isEditing.value && form.value.id) {
      await planningStore.updateRisk(form.value.id, riskData)
      ElMessage.success('风险已更新')
    } else {
      await planningStore.createRisk(riskData)
      ElMessage.success('风险已添加')
    }
    dialogVisible.value = false
  } finally {
    submitting.value = false
  }
}

const handleViewDetail = (row: Risk) => {
  currentRisk.value = row
  detailDialogVisible.value = true
}

const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      planningStore.fetchRisks()
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;

        &.critical {
          color: #f56c6c;
        }

        &.warning {
          color: #e6a23c;
        }

        &.info {
          color: #409eff;
        }
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}

.risk-matrix {
  display: flex;
  gap: 16px;

  .matrix-labels {
    display: flex;
    flex-direction: column;
    align-items: center;

    .y-label {
      writing-mode: vertical-lr;
      transform: rotate(180deg);
      font-weight: 600;
      margin-bottom: 8px;
    }

    .y-axis {
      display: flex;
      flex-direction: column;
      gap: 4px;

      div {
        height: 80px;
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #606266;
      }
    }
  }

  .matrix-grid {
    flex: 1;

    .matrix-row {
      display: flex;
      gap: 4px;
      margin-bottom: 4px;

      .matrix-cell {
        flex: 1;
        height: 80px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 8px;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        &.cell-critical {
          background-color: #fef0f0;
          border-color: #fbc4c4;
        }

        &.cell-high {
          background-color: #fdf6ec;
          border-color: #f5dab1;
        }

        &.cell-medium {
          background-color: #f4f4f5;
          border-color: #e9e9eb;
        }

        &.cell-low {
          background-color: #f0f9ff;
          border-color: #c6e2ff;
        }

        .cell-count {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }

        .cell-risks {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2px;
          margin-top: 4px;

          .more-count {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .x-axis {
      display: flex;
      justify-content: space-around;
      margin-top: 8px;
      font-size: 12px;
      color: #606266;
    }

    .x-label {
      text-align: center;
      font-weight: 600;
      margin-top: 8px;
    }
  }
}

.risk-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  min-height: 600px;

  .board-column {
    flex: 1;
    min-width: 250px;
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 12px;

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      margin-bottom: 12px;
      border-top: 3px solid;
      background-color: white;
      border-radius: 4px;

      .column-title {
        font-weight: 600;
        font-size: 14px;
      }
    }

    .column-body {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .risk-card {
        padding: 12px;
        background-color: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .risk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .risk-code {
            font-size: 12px;
            color: #909399;
          }
        }

        .risk-description {
          font-size: 13px;
          color: #606266;
          margin-bottom: 12px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .risk-footer {
          display: flex;
          align-items: center;
          gap: 8px;

          .risk-owner {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
}
</style>
