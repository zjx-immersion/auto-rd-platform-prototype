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
        <el-button type="primary" @click="handleStartPlanning" v-if="!currentPlanning">进入规划工作台</el-button>
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

    <!-- PI迭代看板（按产品和迭代显示） -->
    <el-card shadow="never" style="margin-top: 20px" v-if="currentPI">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>PI迭代看板</span>
          <div style="display: flex; gap: 12px; align-items: center;">
            <el-text size="small">产品筛选:</el-text>
            <el-select 
              v-model="selectedProductIds" 
              multiple 
              placeholder="选择产品（默认显示全部）"
              style="width: 300px;"
              size="small"
            >
              <el-option label="全部产品" value="all" />
              <el-option 
                v-for="product in availableProducts" 
                :key="product.id"
                :label="product.name"
                :value="product.id"
              />
            </el-select>
          <el-button size="small" @click="handleDetectConflicts">检测冲突</el-button>
          </div>
        </div>
      </template>

      <!-- Sprint迭代时间轴 -->
      <div class="sprint-timeline">
        <div 
          class="sprint-column" 
          v-for="sprint in sprintList" 
          :key="sprint.id"
        >
          <div class="sprint-header">
            <div class="sprint-info">
              <el-text tag="b" size="large">{{ sprint.name }}</el-text>
              <el-text size="small" type="info">
                {{ formatDateRange(sprint.startDate, sprint.endDate) }}
              </el-text>
            </div>
            <div class="sprint-milestones" v-if="sprint.milestones && sprint.milestones.length > 0">
              <el-tag 
                v-for="milestone in sprint.milestones" 
                :key="milestone.id"
                size="small"
                type="warning"
                style="margin-right: 4px;"
              >
                {{ milestone.name }}
                </el-tag>
              </div>
          </div>

          <!-- 按产品分组显示Feature -->
          <div class="sprint-content">
            <div 
              v-for="product in getProductsInSprint(sprint.id)" 
              :key="product.id"
              class="product-section"
            >
              <div class="product-header">
                <el-text tag="b" size="small">{{ product.name }}</el-text>
                <el-tag size="small">{{ getFeaturesCountByProductAndSprint(product.id, sprint.id) }}</el-tag>
              </div>
              
              <div class="feature-list-compact">
                <div 
                  class="feature-card-compact" 
                  v-for="feature in getFeaturesByProductAndSprint(product.id, sprint.id)" 
                  :key="feature.id"
                >
                  <div class="feature-card-content">
                    <el-text class="feature-code" size="small" type="info">{{ feature.code }}</el-text>
                    <el-text class="feature-name-compact">{{ feature.name }}</el-text>
                    <el-tag size="small" type="primary">{{ feature.storyPoints }} SP</el-tag>
            </div>
                  <div class="feature-version" v-if="feature.version">
                    <el-tag size="small" type="success">v{{ feature.version }}</el-tag>
              </div>
                </div>
                <el-empty 
                  v-if="getFeaturesByProductAndSprint(product.id, sprint.id).length === 0" 
                  :image-size="40" 
                  description="暂无Feature"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
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
import { Refresh, Promotion } from '@element-plus/icons-vue'
import { usePIStore } from '@/stores/modules/pi'
import { usePlanningStore } from '@/stores/modules/planning'
import { useFeatureStore } from '@/stores/modules/feature'
import { useSprintStore } from '@/stores/modules/sprint'
import { useAssetStore } from '@/stores/modules/asset'
import dayjs from 'dayjs'

const piStore = usePIStore()
const planningStore = usePlanningStore()
const featureStore = useFeatureStore()
const sprintStore = useSprintStore()
const assetStore = useAssetStore()
const router = useRouter()

const piVersions = computed(() => piStore.piVersions)
const currentPI = computed(() => piStore.currentPI)
const currentPlanning = computed(() => planningStore.currentPlanning)
const teamPlannings = computed(() => planningStore.draftTeamPlannings)
const dependencies = computed(() => planningStore.draftDependencies)
const criticalDependencies = computed(() => planningStore.criticalDependencies)

const selectedPIId = ref('')
const loading = ref(false)
const selectedProductIds = ref<string[]>(['all'])

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

// 新增：产品和Sprint相关的computed
const availableProducts = computed(() => assetStore.products)

const sprintList = computed(() => {
  if (!currentPI.value) return []
  // 兼容ID大小写不匹配（sprint数据中piId可能是小写pi-001，而currentPI.id是大写PI-001）
  const currentPIIdLower = currentPI.value.id.toLowerCase()
  const matchedSprints = sprintStore.sprints.filter(s => {
    const sprintPIIdLower = (s.piId || '').toLowerCase()
    return sprintPIIdLower === currentPIIdLower
  })
  console.log('🔍 Sprint匹配:', {
    currentPIId: currentPI.value.id,
    totalSprints: sprintStore.sprints.length,
    matchedCount: matchedSprints.length,
    matchedIds: matchedSprints.map(s => s.id)
  })
  return matchedSprints
})

const filteredFeatures = computed(() => {
  const allFeatures = featureStore.features
  if (selectedProductIds.value.includes('all') || selectedProductIds.value.length === 0) {
    return allFeatures
  }
  return allFeatures.filter(f => selectedProductIds.value.includes(f.productId))
})

// 获取某个Sprint中的所有产品
const getProductsInSprint = (sprintId: string) => {
  const featuresInSprint = filteredFeatures.value.filter(f => f.targetSprint === sprintId)
  const productIds = [...new Set(featuresInSprint.map(f => f.productId))]
  return availableProducts.value.filter(p => productIds.includes(p.id))
}

// 获取某个产品在某个Sprint中的Feature数量
const getFeaturesCountByProductAndSprint = (productId: string, sprintId: string) => {
  return filteredFeatures.value.filter(f => f.productId === productId && f.targetSprint === sprintId).length
}

// 获取某个产品在某个Sprint中的所有Features
const getFeaturesByProductAndSprint = (productId: string, sprintId: string) => {
  return filteredFeatures.value.filter(f => f.productId === productId && f.targetSprint === sprintId)
}

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
    // 导航到全局视角页面
    router.push({
      path: `/function/c3/planning/pi/${selectedPIId.value}/stage1`
    })
    ElMessage.success('已进入规划工作台（全局视角）')
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

const handleGoToNewPlanning = () => {
  if (!selectedPIId.value) {
    ElMessage.warning('请先选择PI')
    return
  }
  // 跳转到新的2阶段规划工作台
  router.push(`/function/c3/planning/pi/${selectedPIId.value}/stage1`)
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
    // 加载所有必要的数据（products已经在initializer中被加载到assetStore）
    await Promise.all([
      piStore.fetchPIVersions(),
      featureStore.fetchFeatures(),
      sprintStore.fetchSprints()
    ])
    
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

  // 新增：Sprint时间轴样式
  .sprint-timeline {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding: 16px 0;

    .sprint-column {
      min-width: 280px;
      flex: 1;
      background: #f5f7fa;
      border-radius: 8px;
      padding: 16px;

      .sprint-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e4e7ed;

        .sprint-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }

        .sprint-milestones {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }

      .sprint-content {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .product-section {
          background: white;
          border-radius: 6px;
          padding: 12px;
          border: 1px solid #e4e7ed;

          .product-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ebeef5;
          }

          .feature-list-compact {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .feature-card-compact {
              background: #f0f9ff;
              border: 1px solid #b3e0ff;
              border-radius: 4px;
              padding: 8px;
              transition: all 0.2s;

              &:hover {
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
                transform: translateY(-1px);
              }

              .feature-card-content {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .feature-code {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                }

                .feature-name-compact {
                  font-size: 13px;
                  font-weight: 500;
                  color: #303133;
                  line-height: 1.4;
                }
              }

              .feature-version {
                margin-top: 6px;
                display: flex;
                justify-content: flex-end;
              }
            }
          }
        }
      }
    }
  }
}
</style>
