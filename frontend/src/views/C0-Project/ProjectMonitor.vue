<template>
  <PageContainer v-loading="projectStore.loading">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="project-info" v-if="project?.name">
        <el-tag size="large">{{ project.name }}</el-tag>
      </div>
      <div class="actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <el-statistic title="项目进度" :value="projectMetrics.progress" suffix="%">
            <template #prefix>
              <el-icon color="#409eff"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
              <el-progress
            :percentage="projectMetrics.progress"
            :stroke-width="8"
            style="margin-top: 12px;"
          />
          </el-card>
        </el-col>
        <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <el-statistic title="活跃风险" :value="projectMetrics.activeRisks">
            <template #prefix>
              <el-icon :color="projectMetrics.activeRisks > 0 ? '#f56c6c' : '#67c23a'">
                <Warning />
              </el-icon>
            </template>
          </el-statistic>
          <div class="metric-desc">
            {{ projectMetrics.activeRisks > 0 ? '需要关注' : '风险可控' }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <el-statistic title="团队负载" :value="projectMetrics.teamLoad" suffix="%">
            <template #prefix>
              <el-icon :color="getLoadColor(projectMetrics.teamLoad)">
                <User />
              </el-icon>
            </template>
          </el-statistic>
          <div class="metric-desc">
            {{ getLoadDesc(projectMetrics.teamLoad) }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
        <el-card shadow="hover" class="metric-card">
          <el-statistic title="预算使用" :value="projectMetrics.budgetUsage" suffix="%">
            <template #prefix>
              <el-icon color="#e6a23c"><Money /></el-icon>
            </template>
          </el-statistic>
          <div class="metric-desc">
            {{ projectMetrics.remainingBudget }}万元 剩余
            </div>
          </el-card>
        </el-col>
      </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <!-- Epic完成率 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
            <template #header>
            <div class="card-header">
              <span>Epic完成率</span>
            </div>
            </template>
          <div style="height: 300px;">
            <v-chart :option="epicChartOption" autoresize />
                </div>
          </el-card>

        <!-- Feature完成率 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
            <template #header>
            <div class="card-header">
              <span>Feature完成率</span>
              <el-tag>{{ featureCompletion.completed }} / {{ featureCompletion.total }}</el-tag>
            </div>
            </template>
                <el-progress
            :percentage="featureCompletion.percentage"
            :stroke-width="24"
            :text-inside="true"
          />
          <el-row :gutter="12" style="margin-top: 16px;">
            <el-col :span="8">
              <div class="status-item">
                <el-tag type="info">待开始: {{ featureCompletion.backlog }}</el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="status-item">
                <el-tag type="warning">进行中: {{ featureCompletion.inProgress }}</el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="status-item">
                <el-tag type="success">已完成: {{ featureCompletion.completed }}</el-tag>
            </div>
        </el-col>
      </el-row>
        </el-card>

        <!-- 团队效能 -->
        <el-card shadow="never">
            <template #header>
            <div class="card-header">
              <span>团队效能</span>
            </div>
            </template>
          <el-table :data="teamEfficiency" stripe>
            <el-table-column prop="teamName" label="团队" width="150" />
            <el-table-column label="负载" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.load"
                  :stroke-width="8"
                  :color="getLoadProgressColor(row.load)"
                />
            </template>
            </el-table-column>
            <el-table-column label="速率" width="120">
                <template #default="{ row }">
                {{ row.velocity }} SP/周
                </template>
              </el-table-column>
            <el-table-column label="完成率" width="120">
                <template #default="{ row }">
                {{ row.completion }}%
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                <el-tag :type="getTeamStatusType(row.status)" size="small">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="12">
        <!-- 里程碑达成情况 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
            <template #header>
            <div class="card-header">
              <span>里程碑达成情况</span>
              <el-tag type="success">{{ completedMilestones }} / {{ totalMilestones }}</el-tag>
            </div>
            </template>
          <el-timeline>
            <el-timeline-item
              v-for="milestone in milestones"
              :key="milestone.id"
              :timestamp="milestone.date"
              :type="getMilestoneType(milestone.status)"
              :hollow="milestone.status !== 'completed'"
            >
              <div class="milestone-item">
                <div class="milestone-name">{{ milestone.name }}</div>
                <el-tag :type="getMilestoneTagType(milestone.status)" size="small">
                  {{ milestone.status }}
                </el-tag>
              </div>
              <div v-if="milestone.description" class="milestone-desc">
                {{ milestone.description }}
              </div>
            </el-timeline-item>
          </el-timeline>
          </el-card>

        <!-- 资源分配 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
            <template #header>
            <div class="card-header">
              <span>资源分配</span>
            </div>
            </template>
          <div style="height: 200px;">
            <v-chart :option="resourceChartOption" autoresize />
          </div>
        </el-card>

        <!-- 风险汇总 -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>风险汇总</span>
              <el-link type="primary" @click="viewAllRisks">查看全部</el-link>
                </div>
          </template>
          <el-row :gutter="12">
            <el-col :span="8">
              <div class="risk-stat">
                <div class="risk-count high">{{ riskSummary.high }}</div>
                <div class="risk-label">高风险</div>
                </div>
              </el-col>
            <el-col :span="8">
              <div class="risk-stat">
                <div class="risk-count medium">{{ riskSummary.medium }}</div>
                <div class="risk-label">中风险</div>
                </div>
              </el-col>
            <el-col :span="8">
              <div class="risk-stat">
                <div class="risk-count low">{{ riskSummary.low }}</div>
                <div class="risk-label">低风险</div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/modules/project'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import {
  TrendCharts,
  Warning,
  User,
  Money,
} from '@element-plus/icons-vue'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const projectId = computed(() => route.params.id as string)
const project = computed(() => projectStore.currentProject)

// 模拟项目指标数据
const projectMetrics = ref({
  progress: 68,
  activeRisks: 3,
  teamLoad: 85,
  budgetUsage: 62,
  remainingBudget: 380,
})

// 模拟Epic数据
const epicChartOption = computed(() => ({
    tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
    top: 'center',
    },
    series: [
      {
      name: 'Epic状态',
        type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
        data: [
        { value: 8, name: '已完成', itemStyle: { color: '#67c23a' } },
        { value: 4, name: '进行中', itemStyle: { color: '#409eff' } },
        { value: 2, name: '待开始', itemStyle: { color: '#909399' } },
      ],
    },
  ],
}))

// Feature完成率数据
const featureCompletion = ref({
  total: 45,
  completed: 28,
  inProgress: 12,
  backlog: 5,
  percentage: 62,
})

// 团队效能数据
const teamEfficiency = ref([
  { teamName: '前端团队', load: 85, velocity: 45, completion: 72, status: '正常' },
  { teamName: '后端团队', load: 92, velocity: 42, completion: 68, status: '超载' },
  { teamName: '测试团队', load: 65, velocity: 38, completion: 55, status: '正常' },
  { teamName: 'DevOps团队', load: 75, velocity: 40, completion: 65, status: '正常' },
])

// 里程碑数据
const milestones = ref([
  {
    id: '1',
    name: '项目启动',
    date: '2025-12-01',
    status: 'completed',
    description: '项目正式启动',
  },
  {
    id: '2',
    name: '需求分析完成',
    date: '2025-12-15',
    status: 'completed',
    description: '所有Epic和Feature已完成分析',
  },
  {
    id: '3',
    name: 'PI 1完成',
    date: '2026-01-31',
    status: 'in-progress',
    description: '第一个PI即将完成',
  },
  {
    id: '4',
    name: '系统集成测试',
    date: '2026-03-15',
    status: 'upcoming',
    description: '开始系统集成测试',
  },
  {
    id: '5',
    name: '项目上线',
    date: '2026-04-30',
    status: 'upcoming',
    description: '项目计划上线',
  },
])

const completedMilestones = computed(() =>
  milestones.value.filter(m => m.status === 'completed').length
)
const totalMilestones = computed(() => milestones.value.length)

// 资源分配图表
const resourceChartOption = computed(() => ({
    tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
    },
    xAxis: {
    type: 'value',
    max: 100,
    },
    yAxis: {
    type: 'category',
    data: ['开发', '测试', '设计', '管理'],
    },
    series: [
      {
      name: '资源占比',
      type: 'bar',
      data: [50, 25, 15, 10],
      itemStyle: {
        color: '#409eff',
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
      },
    },
  ],
}))

// 风险汇总
const riskSummary = ref({
  high: 2,
  medium: 3,
  low: 5,
})

const getLoadColor = (load: number) => {
  if (load >= 90) return '#f56c6c'
  if (load >= 75) return '#e6a23c'
  return '#67c23a'
}

const getLoadDesc = (load: number) => {
  if (load >= 90) return '负载过高'
  if (load >= 75) return '负载正常'
  return '负载较低'
}

const getLoadProgressColor = (load: number) => {
  if (load >= 90) return '#f56c6c'
  if (load >= 75) return '#e6a23c'
  return '#67c23a'
}

const getTeamStatusType = (status: string): any => {
  const map: Record<string, string> = {
    '正常': 'success',
    '超载': 'danger',
    '闲置': 'info',
  }
  return map[status] || ''
}

const getMilestoneType = (status: string): any => {
  const map: Record<string, string> = {
    completed: 'success',
    'in-progress': 'primary',
    upcoming: 'info',
  }
  return map[status] || 'info'
}

const getMilestoneTagType = (status: string): any => {
  const map: Record<string, string> = {
    completed: 'success',
    'in-progress': 'warning',
    upcoming: 'info',
  }
  return map[status] || 'info'
}

const goBack = () => {
  router.back()
}

const handleRefresh = () => {
  window.location.reload()
}

const viewAllRisks = () => {
  router.push('/function/c3/risk/management')
}

onMounted(async () => {
  await projectStore.fetchProjectById(projectId.value)
})
</script>

<style scoped lang="scss">
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .project-info {
    flex: 1;
  }

  .actions {
    display: flex;
    gap: 8px;
  }
}

.metric-card {
  height: 140px;

  .metric-desc {
    margin-top: 8px;
    font-size: 14px;
      color: #909399;
    text-align: center;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.status-item {
  text-align: center;
  padding: 8px;
}

.milestone-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .milestone-name {
    font-weight: 600;
    font-size: 14px;
  }
}

.milestone-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.risk-stat {
  text-align: center;
  padding: 20px;

  .risk-count {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;

    &.high {
      color: #f56c6c;
    }

    &.medium {
      color: #e6a23c;
    }

    &.low {
      color: #67c23a;
    }
  }

  .risk-label {
    font-size: 14px;
    color: #606266;
  }
}
</style>
