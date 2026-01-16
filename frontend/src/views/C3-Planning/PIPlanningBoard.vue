<template>
  <div class="pi-planning-board" v-loading="loading">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>PI Planning 看板</h2>
        <el-select v-model="selectedPIId" placeholder="选择PI" style="width: 250px; margin-left: 20px" @change="handlePIChange">
          <el-option v-for="pi in piVersions" :key="pi.id" :label="pi.name" :value="pi.id" />
        </el-select>
      </div>
      <div class="header-right">
        <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        <el-button type="primary" @click="handleStartPlanning" v-if="!currentPlanning">开始规划</el-button>
        <el-button type="success" @click="handleCommitPlanning" v-if="currentPlanning && currentPlanning.status === 'draft'">
          提交规划
        </el-button>
      </div>
    </div>

    <!-- PI信息卡片 -->
    <el-row :gutter="20" v-if="currentPI">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><span>PI信息</span></template>
          <div class="info-item">
            <span class="label">PI名称:</span>
            <span class="value">{{ currentPI.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Sprint数量:</span>
            <span class="value">{{ currentPI.sprintCount }}</span>
          </div>
          <div class="info-item">
            <span class="label">周期:</span>
            <span class="value">{{ formatDateRange(currentPI.startDate, currentPI.endDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">状态:</span>
            <el-tag :type="getPIStatusType(currentPI.status)" size="small">
              {{ getPIStatusText(currentPI.status) }}
            </el-tag>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><span>团队容量</span></template>
          <div class="stat-item">
            <span class="label">总容量:</span>
            <span class="value primary">{{ totalCapacity }}</span>
          </div>
          <div class="stat-item">
            <span class="label">已规划:</span>
            <span class="value success">{{ totalPlannedLoad }}</span>
          </div>
          <div class="stat-item">
            <span class="label">负载率:</span>
            <span class="value" :class="getLoadRateClass(loadRate)">{{ loadRate }}%</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><span>依赖关系</span></template>
          <div class="stat-item">
            <span class="label">总依赖:</span>
            <span class="value">{{ dependencies.length }}</span>
          </div>
          <div class="stat-item">
            <span class="label">阻塞中:</span>
            <span class="value danger">{{ blockingDependencies.length }}</span>
          </div>
          <div class="stat-item">
            <span class="label">关键路径:</span>
            <span class="value warning">{{ criticalDependencies.length }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><span>风险管理</span></template>
          <div class="stat-item">
            <span class="label">总风险:</span>
            <span class="value">{{ risks.length }}</span>
          </div>
          <div class="stat-item">
            <span class="label">高风险:</span>
            <span class="value danger">{{ highRisks.length }}</span>
          </div>
          <div class="stat-item">
            <span class="label">已缓解:</span>
            <span class="value success">{{ mitigatedRisks.length }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 团队规划看板 -->
    <el-card shadow="never" style="margin-top: 20px" v-if="currentPlanning">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>团队规划看板</span>
          <el-button size="small" @click="handleDetectConflicts">检测冲突</el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8" v-for="teamPlanning in teamPlannings" :key="teamPlanning.teamId">
          <el-card class="team-card" shadow="hover">
            <template #header>
              <div class="team-header">
                <span class="team-name">{{ teamPlanning.teamName }}</span>
                <el-tag size="small" :type="getLoadStatusType(teamPlanning.loadPercentage)">
                  {{ teamPlanning.loadPercentage }}%
                </el-tag>
              </div>
            </template>

            <div class="team-capacity">
              <el-progress
                :percentage="Math.min(teamPlanning.loadPercentage, 100)"
                :color="getProgressColor(teamPlanning.loadPercentage)"
                :stroke-width="10"
              />
              <div class="capacity-text">
                {{ teamPlanning.totalLoad }} / {{ teamPlanning.capacity }} SP
              </div>
            </div>

            <el-divider />

            <div class="feature-list">
              <div class="list-header">
                <span>Features ({{ teamPlanning.features.length }})</span>
                <el-button size="small" text @click="handleAddFeatureToTeam(teamPlanning.teamId)">
                  +添加
                </el-button>
              </div>
              <div class="feature-item" v-for="feature in teamPlanning.features" :key="feature.featureId">
                <div class="feature-info">
                  <span class="feature-name">{{ feature.featureName }}</span>
                  <el-tag size="small">{{ feature.storyPoints }} SP</el-tag>
                </div>
                <el-button
                  size="small"
                  text
                  type="danger"
                  @click="handleRemoveFeatureFromTeam(teamPlanning.teamId, feature.featureId)"
                >
                  移除
                </el-button>
              </div>
              <el-empty v-if="teamPlanning.features.length === 0" :image-size="60" description="暂无分配" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- PI目标 -->
    <el-card shadow="never" style="margin-top: 20px" v-if="currentPI">
      <template #header>
        <div style="display: flex; justify-content: space-between">
          <span>PI目标</span>
          <el-button size="small" type="primary" @click="handleAddObjective">添加目标</el-button>
        </div>
      </template>
      <el-table :data="currentPI.objectives" stripe>
        <el-table-column label="目标描述" prop="description" min-width="300" />
        <el-table-column label="业务价值" prop="businessValue" width="120" align="center" />
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getObjectiveStatusType(row.status)" size="small">
              {{ getObjectiveStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="120">
          <template #default="{ row }">{{ getUserName(row.owner) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small">编辑</el-button>
            <el-button type="danger" link size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 依赖矩阵按钮 -->
    <el-card shadow="never" style="margin-top: 20px">
      <el-button type="primary" @click="handleViewDependencyMatrix">查看依赖矩阵</el-button>
      <el-button @click="handleViewRisks">查看风险列表</el-button>
      <el-button @click="handleExportPlanning">导出规划</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { usePIStore } from '@/stores/modules/pi'
import { usePlanningStore } from '@/stores/modules/planning'
import dayjs from 'dayjs'

const piStore = usePIStore()
const planningStore = usePlanningStore()
const router = useRouter()

const piVersions = computed(() => piStore.piVersions)
const currentPI = computed(() => piStore.currentPI)
const currentPlanning = computed(() => planningStore.currentPlanning)
const teamPlannings = computed(() => planningStore.draftTeamPlannings)
const dependencies = computed(() => planningStore.draftDependencies)
const criticalDependencies = computed(() => planningStore.criticalDependencies)

const selectedPIId = ref('')
const loading = ref(false)

const blockingDependencies = computed(() => dependencies.value.filter(d => d.status === 'blocking'))
const risks = computed(() => currentPI.value?.risks || [])
const highRisks = computed(() => risks.value.filter(r => r.impact === 'high'))
const mitigatedRisks = computed(() => risks.value.filter(r => r.status === 'mitigating' || r.status === 'resolved'))

const totalCapacity = computed(() => {
  return teamPlannings.value.reduce((sum, t) => sum + t.capacity, 0)
})

const totalPlannedLoad = computed(() => {
  return teamPlannings.value.reduce((sum, t) => sum + t.totalLoad, 0)
})

const loadRate = computed(() => {
  if (totalCapacity.value === 0) return 0
  return Math.round((totalPlannedLoad.value / totalCapacity.value) * 100)
})

const handlePIChange = async (piId: string) => {
  loading.value = true
  try {
    await piStore.fetchPIById(piId)
    await planningStore.fetchPlanningResult(piId)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  if (selectedPIId.value) {
    handlePIChange(selectedPIId.value)
  }
}

const handleStartPlanning = async () => {
  if (!selectedPIId.value) {
    ElMessage.warning('请先选择PI')
    return
  }
  try {
    await planningStore.startPlanning(selectedPIId.value)
    ElMessage.success('已开始PI Planning')
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

const handleCommitPlanning = async () => {
  try {
    await planningStore.commitPlanning()
    ElMessage.success('规划已提交')
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

const handleDetectConflicts = async () => {
  const conflicts = await planningStore.detectConflicts()
  if (conflicts.length === 0) {
    ElMessage.success('未发现冲突')
  } else {
    ElMessage.warning(`发现 ${conflicts.length} 个冲突`)
  }
}

const handleAddFeatureToTeam = (teamId: string) => {
  ElMessage.info('添加Feature功能待实现')
}

const handleRemoveFeatureFromTeam = async (teamId: string, featureId: string) => {
  await planningStore.removeFeatureFromTeam(teamId, featureId)
  ElMessage.success('已移除')
}

const handleAddObjective = () => {
  ElMessage.info('添加目标功能待实现')
}

const handleViewDependencyMatrix = () => {
  router.push('/capability/c3-planning/dependency-matrix')
}

const handleViewRisks = () => {
  ElMessage.info('风险列表功能待实现')
}

const handleExportPlanning = () => {
  ElMessage.info('导出功能待实现')
}

const formatDateRange = (start: string, end: string) => {
  return `${dayjs(start).format('MM-DD')} ~ ${dayjs(end).format('MM-DD')}`
}

const getPIStatusType = (status: string) => {
  const map: Record<string, any> = {
    planning: 'info',
    committed: 'warning',
    'in-progress': 'primary',
    completed: 'success',
  }
  return map[status] || 'info'
}

const getPIStatusText = (status: string) => {
  const map: Record<string, string> = {
    planning: '规划中',
    committed: '已承诺',
    'in-progress': '进行中',
    completed: '已完成',
  }
  return map[status] || status
}

const getLoadStatusType = (loadPercentage: number) => {
  if (loadPercentage > 100) return 'danger'
  if (loadPercentage > 90) return 'warning'
  return 'success'
}

const getLoadRateClass = (rate: number) => {
  if (rate > 100) return 'danger'
  if (rate > 90) return 'warning'
  if (rate < 70) return 'info'
  return 'success'
}

const getProgressColor = (percentage: number) => {
  if (percentage > 100) return '#f56c6c'
  if (percentage > 90) return '#e6a23c'
  return '#67c23a'
}

const getObjectiveStatusType = (status: string) => {
  const map: Record<string, any> = {
    committed: 'info',
    'in-progress': 'primary',
    'at-risk': 'warning',
    achieved: 'success',
  }
  return map[status] || 'info'
}

const getObjectiveStatusText = (status: string) => {
  const map: Record<string, string> = {
    committed: '已承诺',
    'in-progress': '进行中',
    'at-risk': '有风险',
    achieved: '已达成',
  }
  return map[status] || status
}

const getUserName = (userId: string) => userId

onMounted(async () => {
  loading.value = true
  try {
    await piStore.fetchPIVersions()
    if (piVersions.value.length > 0) {
      selectedPIId.value = piVersions.value[0].id
      await handlePIChange(selectedPIId.value)
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.pi-planning-board {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .info-item, .stat-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;

    .label {
      color: #606266;
      font-size: 14px;
    }

    .value {
      font-weight: 600;
      font-size: 16px;

      &.primary { color: #409eff; }
      &.success { color: #67c23a; }
      &.warning { color: #e6a23c; }
      &.danger { color: #f56c6c; }
      &.info { color: #909399; }
    }
  }

  .team-card {
    margin-bottom: 20px;

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .team-name {
        font-weight: 600;
        font-size: 16px;
      }
    }

    .team-capacity {
      .capacity-text {
        text-align: center;
        margin-top: 8px;
        font-size: 14px;
        color: #606266;
      }
    }

    .feature-list {
      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 600;
      }

      .feature-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        margin-bottom: 8px;
        background: #f5f7fa;
        border-radius: 4px;

        .feature-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .feature-name {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
