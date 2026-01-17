<template>
  <PageContainer>
    <PageHeader title="项目监控" description="实时监控项目进度、里程碑、资源和风险">
      <template #actions>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </template>
    </PageHeader>

    <!-- 项目选择 -->
    <el-card style="margin-bottom: 16px;">
      <el-select v-model="selectedProjectId" placeholder="选择项目" style="width: 400px;" @change="loadProjectData">
        <el-option
          v-for="project in projects"
          :key="project.id"
          :label="`${project.name} (${project.domain})`"
          :value="project.id"
        />
      </el-select>
    </el-card>

    <div v-if="selectedProject" v-loading="loading">
      <!-- 关键指标 -->
      <el-row :gutter="16" style="margin-bottom: 16px;">
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-header">
              <el-icon :size="24" color="#409eff"><TrendCharts /></el-icon>
              <span>项目进度</span>
            </div>
            <div class="metric-body">
              <div class="metric-value">{{ projectProgress }}%</div>
              <el-progress
                :percentage="projectProgress"
                :color="getProgressColor(projectProgress)"
                style="margin-top: 8px;"
              />
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-header">
              <el-icon :size="24" color="#67c23a"><Timer /></el-icon>
              <span>健康度</span>
            </div>
            <div class="metric-body">
              <el-rate
                v-model="healthScore"
                disabled
                :colors="['#f56c6c', '#e6a23c', '#67c23a']"
                show-score
                score-template="{value}/5"
              />
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-header">
              <el-icon :size="24" color="#e6a23c"><User /></el-icon>
              <span>团队资源</span>
            </div>
            <div class="metric-body">
              <div class="metric-value">{{ teamMemberCount }}</div>
              <div class="metric-sub">{{ activeTeamCount }} 个团队</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-header">
              <el-icon :size="24" color="#f56c6c"><WarningFilled /></el-icon>
              <span>风险数量</span>
            </div>
            <div class="metric-body">
              <div class="metric-value critical">{{ riskCount }}</div>
              <div class="metric-sub">{{ criticalRiskCount }} 个严重</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 里程碑和Epic进度 -->
      <el-row :gutter="16" style="margin-bottom: 16px;">
        <el-col :span="16">
          <el-card>
            <template #header>
              <span>里程碑时间线</span>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="milestone in milestones"
                :key="milestone.id"
                :timestamp="milestone.date"
                :color="getMilestoneColor(milestone)"
                :hollow="!milestone.completed"
              >
                <div class="milestone-item">
                  <div class="milestone-name">{{ milestone.name }}</div>
                  <el-tag :type="milestone.completed ? 'success' : getDeadlineType(milestone.date)">
                    {{ milestone.completed ? '已完成' : getMilestoneStatus(milestone.date) }}
                  </el-tag>
                </div>
                <div class="milestone-deliverables" v-if="milestone.deliverables">
                  交付物：{{ milestone.deliverables.join('、') }}
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>Epic完成情况</span>
            </template>
            <div class="epic-list">
              <div v-for="epic in epics" :key="epic.id" class="epic-item">
                <div class="epic-header">
                  <span class="epic-name">{{ epic.code }}</span>
                  <el-tag size="small" :type="getEpicStatusType(epic.status)">
                    {{ epic.status }}
                  </el-tag>
                </div>
                <el-progress
                  :percentage="epic.progress"
                  :color="getProgressColor(epic.progress)"
                  :stroke-width="6"
                />
              </div>
            </div>
            <el-empty v-if="epics.length === 0" description="暂无Epic" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>

      <!-- Feature和版本 -->
      <el-row :gutter="16" style="margin-bottom: 16px;">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>Feature状态分布</span>
            </template>
            <div class="chart-container" ref="featureChartRef"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>版本规划</span>
            </template>
            <el-table :data="versions" style="width: 100%;">
              <el-table-column prop="name" label="版本" width="120" />
              <el-table-column label="时间范围" min-width="200">
                <template #default="{ row }">
                  {{ row.startDate }} ~ {{ row.endDate }}
                </template>
              </el-table-column>
              <el-table-column label="Feature" width="80" align="center">
                <template #default="{ row }">
                  {{ row.featureCount }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getVersionStatusType(row.status)">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <!-- 团队效能和质量 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>团队效能</span>
            </template>
            <div class="chart-container" ref="velocityChartRef"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>质量指标</span>
            </template>
            <el-row :gutter="16">
              <el-col :span="12">
                <div class="quality-metric">
                  <div class="quality-label">缺陷密度</div>
                  <div class="quality-value">{{ defectDensity }}</div>
                  <div class="quality-unit">个/KLOC</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="quality-metric">
                  <div class="quality-label">测试覆盖率</div>
                  <div class="quality-value">{{ testCoverage }}%</div>
                  <el-progress
                    :percentage="testCoverage"
                    :color="getProgressColor(testCoverage)"
                    :show-text="false"
                  />
                </div>
              </el-col>
              <el-col :span="12">
                <div class="quality-metric">
                  <div class="quality-label">代码评审率</div>
                  <div class="quality-value">{{ codeReviewRate }}%</div>
                  <el-progress
                    :percentage="codeReviewRate"
                    :color="getProgressColor(codeReviewRate)"
                    :show-text="false"
                  />
                </div>
              </el-col>
              <el-col :span="12">
                <div class="quality-metric">
                  <div class="quality-label">CI成功率</div>
                  <div class="quality-value">{{ ciSuccessRate }}%</div>
                  <el-progress
                    :percentage="ciSuccessRate"
                    :color="getProgressColor(ciSuccessRate)"
                    :show-text="false"
                  />
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty v-else description="请选择项目" />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Refresh,
  Download,
  TrendCharts,
  Timer,
  User,
  WarningFilled
} from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/modules/project'
import { useEpicStore } from '@/stores/modules/epic'
import type { Project } from '@/types'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const router = useRouter()
const projectStore = useProjectStore()
const epicStore = useEpicStore()

const loading = ref(false)
const selectedProjectId = ref('')

const featureChartRef = ref()
const velocityChartRef = ref()

let featureChart: echarts.ECharts | null = null
let velocityChart: echarts.ECharts | null = null

const projects = computed(() => projectStore.projects)
const selectedProject = computed(() => projects.value.find(p => p.id === selectedProjectId.value))

// 模拟数据
const projectProgress = ref(68)
const healthScore = ref(4)
const teamMemberCount = ref(45)
const activeTeamCount = ref(6)
const riskCount = ref(12)
const criticalRiskCount = ref(3)

const defectDensity = ref(2.3)
const testCoverage = ref(85)
const codeReviewRate = ref(92)
const ciSuccessRate = ref(94)

const milestones = ref([
  { id: 'm1', name: 'Kickoff', date: '2026-01-06', deliverables: ['项目计划', '团队组建'], completed: true },
  { id: 'm2', name: 'Alpha', date: '2026-02-28', deliverables: ['核心功能完成', 'Alpha版本'], completed: true },
  { id: 'm3', name: 'Beta', date: '2026-04-30', deliverables: ['功能冻结', 'Beta版本'], completed: false },
  { id: 'm4', name: 'RC', date: '2026-06-15', deliverables: ['代码冻结', 'RC版本'], completed: false },
  { id: 'm5', name: 'SOP', date: '2026-07-31', deliverables: ['量产版本', 'SOP'], completed: false }
])

const epics = ref([
  { id: 'e1', code: 'EPIC-001', progress: 85, status: '进行中' },
  { id: 'e2', code: 'EPIC-002', progress: 72, status: '进行中' },
  { id: 'e3', code: 'EPIC-003', progress: 45, status: '进行中' },
  { id: 'e4', code: 'EPIC-004', progress: 20, status: '待开始' }
])

const versions = ref([
  { id: 'v1', name: 'V1.0', startDate: '2026-01-01', endDate: '2026-03-31', featureCount: 25, status: '进行中' },
  { id: 'v2', name: 'V2.0', startDate: '2026-04-01', endDate: '2026-06-30', featureCount: 30, status: '规划中' },
  { id: 'v3', name: 'V3.0', startDate: '2026-07-01', endDate: '2026-09-30', featureCount: 20, status: '规划中' }
])

const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#f56c6c'
  if (percentage < 80) return '#e6a23c'
  return '#67c23a'
}

const getMilestoneColor = (milestone: any) => {
  if (milestone.completed) return '#67c23a'
  const today = new Date()
  const milestoneDate = new Date(milestone.date)
  if (milestoneDate < today) return '#f56c6c'
  return '#409eff'
}

const getMilestoneStatus = (date: string) => {
  const today = new Date()
  const milestoneDate = new Date(date)
  const diffDays = Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return '已逾期'
  if (diffDays === 0) return '今天'
  if (diffDays <= 7) return `${diffDays}天后`
  return `剩余${diffDays}天`
}

const getDeadlineType = (date: string) => {
  const today = new Date()
  const milestoneDate = new Date(date)
  const diffDays = Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'danger'
  if (diffDays <= 7) return 'warning'
  return 'info'
}

const getEpicStatusType = (status: string) => {
  const map: Record<string, any> = {
    '进行中': 'primary',
    '待开始': 'info',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

const getVersionStatusType = (status: string) => {
  const map: Record<string, any> = {
    '进行中': 'primary',
    '规划中': 'info',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

const initFeatureChart = () => {
  if (!featureChartRef.value) return
  
  featureChart = echarts.init(featureChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        center: ['40%', '50%'],
        data: [
          { value: 35, name: '已完成', itemStyle: { color: '#67c23a' } },
          { value: 28, name: '开发中', itemStyle: { color: '#409eff' } },
          { value: 15, name: '测试中', itemStyle: { color: '#e6a23c' } },
          { value: 12, name: '待开始', itemStyle: { color: '#909399' } },
          { value: 5, name: '阻塞', itemStyle: { color: '#f56c6c' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  featureChart.setOption(option)
}

const initVelocityChart = () => {
  if (!velocityChartRef.value) return
  
  velocityChart = echarts.init(velocityChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['计划速率', '实际速率']
    },
    xAxis: {
      type: 'category',
      data: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6']
    },
    yAxis: {
      type: 'value',
      name: 'Story Points'
    },
    series: [
      {
        name: '计划速率',
        type: 'line',
        data: [40, 40, 40, 40, 40, 40],
        lineStyle: {
          type: 'dashed',
          color: '#909399'
        },
        itemStyle: {
          color: '#909399'
        }
      },
      {
        name: '实际速率',
        type: 'bar',
        data: [42, 38, 41, 37, 0, 0],
        itemStyle: {
          color: '#409eff'
        }
      }
    ]
  }
  velocityChart.setOption(option)
}

const loadProjectData = async () => {
  if (!selectedProjectId.value) return
  
  loading.value = true
  try {
    await nextTick()
    initCharts()
  } finally {
    loading.value = false
  }
}

const initCharts = () => {
  initFeatureChart()
  initVelocityChart()
}

const handleRefresh = () => {
  loadProjectData()
}

const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      epicStore.fetchEpics()
    ])
    
    // 默认选择第一个项目
    if (projects.value.length > 0) {
      selectedProjectId.value = projects.value[0].id
      await loadProjectData()
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.metric-card {
  .metric-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #606266;
  }

  .metric-body {
    .metric-value {
      font-size: 32px;
      font-weight: 600;
      color: #303133;

      &.critical {
        color: #f56c6c;
      }
    }

    .metric-sub {
      font-size: 13px;
      color: #909399;
      margin-top: 8px;
    }
  }
}

.milestone-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  .milestone-name {
    font-weight: 500;
    font-size: 14px;
  }
}

.milestone-deliverables {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.epic-list {
  .epic-item {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .epic-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .epic-name {
        font-weight: 500;
        font-size: 14px;
      }
    }
  }
}

.chart-container {
  height: 300px;
}

.quality-metric {
  text-align: center;
  padding: 16px;

  .quality-label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .quality-value {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .quality-unit {
    font-size: 12px;
    color: #c0c4cc;
  }
}
</style>
