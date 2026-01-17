<template>
  <PageContainer>
    <PageHeader title="PI进度跟踪" description="监控PI执行进度、燃尽图和关键指标">
      <template #actions>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </template>
    </PageHeader>

    <!-- PI选择 -->
    <el-card style="margin-bottom: 16px;">
      <el-select v-model="selectedPIId" placeholder="选择PI" style="width: 300px;" @change="loadPIData">
        <el-option
          v-for="pi in pis"
          :key="pi.id"
          :label="`${pi.name} (${pi.startDate} ~ ${pi.endDate})`"
          :value="pi.id"
        />
      </el-select>
    </el-card>

    <div v-if="selectedPI" v-loading="loading">
      <!-- PI关键指标 -->
      <el-row :gutter="16" style="margin-bottom: 16px;">
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon" style="background-color: #ecf5ff;">
                <el-icon color="#409eff" :size="32"><TrendCharts /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ progressPercentage }}%</div>
                <div class="metric-label">整体进度</div>
                <el-progress
                  :percentage="progressPercentage"
                  :color="getProgressColor(progressPercentage)"
                  :show-text="false"
                  style="margin-top: 8px;"
                />
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon" style="background-color: #f0f9ff;">
                <el-icon color="#67c23a" :size="32"><Timer /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ remainingDays }}</div>
                <div class="metric-label">剩余天数</div>
                <div class="metric-sub">总计 {{ totalDays }} 天</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon" style="background-color: #fdf6ec;">
                <el-icon color="#e6a23c" :size="32"><DataLine /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ completedSP }}/{{ totalSP }}</div>
                <div class="metric-label">Story Points</div>
                <div class="metric-sub">速率: {{ velocity }} SP/Sprint</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-content">
              <div class="metric-icon" style="background-color: #fef0f0;">
                <el-icon color="#f56c6c" :size="32"><WarningFilled /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ riskCount }}</div>
                <div class="metric-label">活跃风险</div>
                <div class="metric-sub">{{ blockerCount }} 个阻塞</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Feature完成情况 -->
      <el-row :gutter="16" style="margin-bottom: 16px;">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>Feature完成情况</span>
            </template>
            <div class="chart-container" ref="featureChartRef"></div>
            <el-divider />
            <el-row :gutter="16">
              <el-col :span="6" v-for="status in featureStatuses" :key="status.key">
                <div class="status-stat">
                  <div class="status-count" :style="{ color: status.color }">
                    {{ getFeatureCountByStatus(status.key) }}
                  </div>
                  <div class="status-label">{{ status.label }}</div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>团队负载分布</span>
            </template>
            <div class="chart-container" ref="teamChartRef"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 燃尽图 -->
      <el-card style="margin-bottom: 16px;">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>PI燃尽图</span>
            <el-radio-group v-model="burndownType" size="small">
              <el-radio-button label="storyPoints">Story Points</el-radio-button>
              <el-radio-button label="featureCount">Feature数量</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="chart-container large" ref="burndownChartRef"></div>
      </el-card>

      <!-- Sprint执行情况 -->
      <el-card style="margin-bottom: 16px;">
        <template #header>
          <span>Sprint执行情况</span>
        </template>
        <el-table :data="sprintData" style="width: 100%;">
          <el-table-column prop="name" label="Sprint" width="150" />
          <el-table-column label="时间" width="220">
            <template #default="{ row }">
              {{ row.startDate }} ~ {{ row.endDate }}
            </template>
          </el-table-column>
          <el-table-column label="计划SP" width="100" align="center">
            <template #default="{ row }">
              {{ row.plannedSP }}
            </template>
          </el-table-column>
          <el-table-column label="完成SP" width="100" align="center">
            <template #default="{ row }">
              {{ row.completedSP }}
            </template>
          </el-table-column>
          <el-table-column label="完成率" width="150">
            <template #default="{ row }">
              <el-progress
                :percentage="Math.round((row.completedSP / row.plannedSP) * 100)"
                :color="getProgressColor((row.completedSP / row.plannedSP) * 100)"
              />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getSprintStatusType(row.status)">
                {{ getSprintStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Feature" width="100" align="center">
            <template #default="{ row }">
              {{ row.featureCount }}个
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right">
            <template #default="{ row }">
              <el-button link size="small" @click="viewSprintDetail(row)">
                详情
              </el-button>
              <el-button link size="small" @click="viewSprintBurndown(row)">
                燃尽图
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 依赖和风险 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>依赖跟踪 ({{ dependencies.length }})</span>
                <el-button link size="small" @click="goToDependencyManagement">
                  查看全部
                </el-button>
              </div>
            </template>
            <el-table :data="dependencies.slice(0, 5)" style="width: 100%;" :show-header="false">
              <el-table-column label="依赖">
                <template #default="{ row }">
                  <div class="dependency-item">
                    <el-tag size="small" :type="getDependencyStatusType(row.status)">
                      {{ getDependencyStatusText(row.status) }}
                    </el-tag>
                    <span class="dependency-desc">{{ row.sourceFeature }} 依赖 {{ row.targetFeature }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="dependencies.length === 0" description="暂无依赖" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>风险跟踪 ({{ risks.length }})</span>
                <el-button link size="small" @click="goToRiskManagement">
                  查看全部
                </el-button>
              </div>
            </template>
            <el-table :data="risks.slice(0, 5)" style="width: 100%;" :show-header="false">
              <el-table-column label="风险">
                <template #default="{ row }">
                  <div class="risk-item">
                    <el-tag size="small" :type="getRiskLevelType(row.level)">
                      {{ getRiskLevelText(row.level) }}
                    </el-tag>
                    <span class="risk-desc">{{ row.description }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="risks.length === 0" description="暂无风险" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty v-else description="请选择PI" />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Refresh,
  Download,
  TrendCharts,
  Timer,
  DataLine,
  WarningFilled
} from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/modules/project'
import { usePlanningStore } from '@/stores/modules/planning'
import { useFeatureStore } from '@/stores/modules/feature'
import type { PI } from '@/types'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const router = useRouter()
const projectStore = useProjectStore()
const planningStore = usePlanningStore()
const featureStore = useFeatureStore()

const loading = ref(false)
const selectedPIId = ref('')
const burndownType = ref<'storyPoints' | 'featureCount'>('storyPoints')

const featureChartRef = ref()
const teamChartRef = ref()
const burndownChartRef = ref()

let featureChart: echarts.ECharts | null = null
let teamChart: echarts.ECharts | null = null
let burndownChart: echarts.ECharts | null = null

const pis = computed(() => {
  const allPIs: PI[] = []
  projectStore.projects.forEach(project => {
    project.versions.forEach(version => {
      allPIs.push(...version.pis)
    })
  })
  return allPIs
})

const selectedPI = computed(() => pis.value.find(pi => pi.id === selectedPIId.value))

const featureStatuses = [
  { key: 'completed', label: '已完成', color: '#67c23a' },
  { key: 'inProgress', label: '进行中', color: '#409eff' },
  { key: 'pending', label: '待开始', color: '#909399' },
  { key: 'blocked', label: '阻塞', color: '#f56c6c' }
]

// 模拟数据
const progressPercentage = ref(65)
const remainingDays = ref(28)
const totalDays = ref(84)
const completedSP = ref(156)
const totalSP = ref(240)
const velocity = ref(26)
const riskCount = ref(8)
const blockerCount = ref(2)

const sprintData = ref([
  { id: 's1', name: 'Sprint 1', startDate: '2026-01-06', endDate: '2026-01-19', plannedSP: 40, completedSP: 42, status: 'completed', featureCount: 8 },
  { id: 's2', name: 'Sprint 2', startDate: '2026-01-20', endDate: '2026-02-02', plannedSP: 40, completedSP: 38, status: 'completed', featureCount: 7 },
  { id: 's3', name: 'Sprint 3', startDate: '2026-02-03', endDate: '2026-02-16', plannedSP: 40, completedSP: 35, status: 'active', featureCount: 9 },
  { id: 's4', name: 'Sprint 4', startDate: '2026-02-17', endDate: '2026-03-02', plannedSP: 40, completedSP: 0, status: 'planned', featureCount: 8 },
  { id: 's5', name: 'Sprint 5', startDate: '2026-03-03', endDate: '2026-03-16', plannedSP: 40, completedSP: 0, status: 'planned', featureCount: 10 },
  { id: 's6', name: 'Sprint 6', startDate: '2026-03-17', endDate: '2026-03-30', plannedSP: 40, completedSP: 0, status: 'planned', featureCount: 8 }
])

const dependencies = ref([
  { id: 'd1', sourceFeature: 'FEAT-001', targetFeature: 'FEAT-005', status: 'resolved' },
  { id: 'd2', sourceFeature: 'FEAT-003', targetFeature: 'FEAT-007', status: 'pending' },
  { id: 'd3', sourceFeature: 'FEAT-004', targetFeature: 'FEAT-006', status: 'blocked' }
])

const risks = ref([
  { id: 'r1', level: 'high', description: '第三方API接口不稳定', status: 'mitigating' },
  { id: 'r2', level: 'medium', description: '测试资源不足', status: 'identified' },
  { id: 'r3', level: 'critical', description: '关键技术人员请假', status: 'mitigating' }
])

const getFeatureCountByStatus = (status: string) => {
  // 模拟数据
  const counts: Record<string, number> = {
    completed: 18,
    inProgress: 12,
    pending: 8,
    blocked: 2
  }
  return counts[status] || 0
}

const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#f56c6c'
  if (percentage < 80) return '#e6a23c'
  return '#67c23a'
}

const getSprintStatusType = (status: string) => {
  const map: Record<string, any> = {
    completed: 'success',
    active: 'primary',
    planned: 'info'
  }
  return map[status] || 'info'
}

const getSprintStatusText = (status: string) => {
  const map: Record<string, string> = {
    completed: '已完成',
    active: '进行中',
    planned: '计划中'
  }
  return map[status] || status
}

const getDependencyStatusType = (status: string) => {
  const map: Record<string, any> = {
    resolved: 'success',
    pending: 'warning',
    blocked: 'danger'
  }
  return map[status] || 'info'
}

const getDependencyStatusText = (status: string) => {
  const map: Record<string, string> = {
    resolved: '已解决',
    pending: '待解决',
    blocked: '阻塞'
  }
  return map[status] || status
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

const initFeatureChart = () => {
  if (!featureChartRef.value) return
  
  featureChart = echarts.init(featureChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 18, name: '已完成', itemStyle: { color: '#67c23a' } },
          { value: 12, name: '进行中', itemStyle: { color: '#409eff' } },
          { value: 8, name: '待开始', itemStyle: { color: '#909399' } },
          { value: 2, name: '阻塞', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }
  featureChart.setOption(option)
}

const initTeamChart = () => {
  if (!teamChartRef.value) return
  
  teamChart = echarts.init(teamChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value',
      max: 100
    },
    yAxis: {
      type: 'category',
      data: ['Team A', 'Team B', 'Team C', 'Team D']
    },
    series: [
      {
        name: '负载',
        type: 'bar',
        data: [85, 92, 78, 88],
        itemStyle: {
          color: (params: any) => {
            const value = params.value
            if (value > 90) return '#f56c6c'
            if (value > 80) return '#e6a23c'
            return '#67c23a'
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        }
      }
    ]
  }
  teamChart.setOption(option)
}

const initBurndownChart = () => {
  if (!burndownChartRef.value) return
  
  burndownChart = echarts.init(burndownChartRef.value)
  updateBurndownChart()
}

const updateBurndownChart = () => {
  if (!burndownChart) return
  
  const dates = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12']
  const idealLine = [240, 220, 200, 180, 160, 140, 120, 100, 80, 60, 40, 20, 0]
  const actualLine = [240, 215, 195, 182, 165, 156, null, null, null, null, null, null, null]
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['理想燃尽', '实际燃尽']
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      name: burndownType.value === 'storyPoints' ? 'Story Points' : 'Feature数量'
    },
    series: [
      {
        name: '理想燃尽',
        type: 'line',
        data: idealLine,
        lineStyle: {
          type: 'dashed',
          color: '#909399'
        },
        itemStyle: {
          color: '#909399'
        }
      },
      {
        name: '实际燃尽',
        type: 'line',
        data: actualLine,
        lineStyle: {
          width: 3,
          color: '#409eff'
        },
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(64, 158, 255, 0.3)'
            }, {
              offset: 1, color: 'rgba(64, 158, 255, 0.05)'
            }]
          }
        }
      }
    ]
  }
  burndownChart.setOption(option)
}

const loadPIData = async () => {
  if (!selectedPIId.value) return
  
  loading.value = true
  try {
    // 加载PI数据
    await nextTick()
    initCharts()
  } finally {
    loading.value = false
  }
}

const initCharts = () => {
  initFeatureChart()
  initTeamChart()
  initBurndownChart()
}

const handleRefresh = () => {
  loadPIData()
}

const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

const viewSprintDetail = (sprint: any) => {
  router.push(`/function/c4/sprint/board?sprintId=${sprint.id}`)
}

const viewSprintBurndown = (sprint: any) => {
  ElMessage.info('Sprint燃尽图功能待实现')
}

const goToDependencyManagement = () => {
  router.push('/function/c3/dependency')
}

const goToRiskManagement = () => {
  router.push('/function/c3/risk')
}

watch(burndownType, () => {
  updateBurndownChart()
})

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      featureStore.fetchFeatures()
    ])
    
    // 默认选择第一个PI
    if (pis.value.length > 0) {
      selectedPIId.value = pis.value[0].id
      await loadPIData()
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.metric-card {
  .metric-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .metric-icon {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metric-info {
      flex: 1;

      .metric-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
      }

      .metric-label {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }

      .metric-sub {
        font-size: 12px;
        color: #c0c4cc;
        margin-top: 4px;
      }
    }
  }
}

.chart-container {
  height: 300px;

  &.large {
    height: 400px;
  }
}

.status-stat {
  text-align: center;
  padding: 12px;

  .status-count {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .status-label {
    font-size: 13px;
    color: #909399;
  }
}

.dependency-item,
.risk-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;

  .dependency-desc,
  .risk-desc {
    flex: 1;
    font-size: 13px;
    color: #606266;
  }
}
</style>
