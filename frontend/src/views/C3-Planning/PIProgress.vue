<template>
  <PageContainer v-loading="piStore.loading">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="pi-info" v-if="pi?.name">
        <el-tag size="large">{{ pi.name }}</el-tag>
      </div>
      <div class="actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="handleReview">PI回顾</el-button>
      </div>
    </div>

    <!-- 关键指标 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总体完成率" :value="progressData.overallCompletion" suffix="%">
            <template #prefix>
              <el-icon color="#409eff"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
          <el-progress :percentage="progressData.overallCompletion" :stroke-width="8" style="margin-top: 12px;" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="Feature完成率" :value="progressData.featureCompletion" suffix="%">
            <template #prefix>
              <el-icon color="#67c23a"><CircleCheck /></el-icon>
            </template>
          </el-statistic>
          <div class="stat-detail">
            {{ progressData.completedFeatures }} / {{ progressData.totalFeatures }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="Story Points完成" :value="progressData.spCompletion" suffix="%">
            <template #prefix>
              <el-icon color="#e6a23c"><DataLine /></el-icon>
            </template>
          </el-statistic>
          <div class="stat-detail">
            {{ progressData.completedSP }} / {{ progressData.totalSP }} SP
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="速率" :value="progressData.velocity" suffix="SP/周">
            <template #prefix>
              <el-icon color="#909399"><Odometer /></el-icon>
            </template>
          </el-statistic>
          <div class="stat-detail">
            平均速率
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 燃尽图 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>PI燃尽图</span>
              <el-radio-group v-model="burndownType" size="small">
                <el-radio-button label="sp">Story Points</el-radio-button>
                <el-radio-button label="feature">Feature Count</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div style="height: 400px;">
            <v-chart :option="burndownChartOption" autoresize />
          </div>
        </el-card>

        <!-- 团队进度 -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>团队进度</span>
            </div>
          </template>
          <el-table :data="teamProgress" stripe>
            <el-table-column prop="teamName" label="团队" width="150" />
            <el-table-column label="完成率" width="150">
              <template #default="{ row }">
                <el-progress :percentage="row.completion" :stroke-width="8" />
              </template>
            </el-table-column>
            <el-table-column label="Story Points" width="150">
              <template #default="{ row }">
                {{ row.completedSP }} / {{ row.totalSP }}
              </template>
            </el-table-column>
            <el-table-column label="速率" width="120">
              <template #default="{ row }">
                {{ row.velocity }} SP/周
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getTeamStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 风险与依赖 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>风险</span>
              <el-badge :value="riskCount" :type="riskCount > 0 ? 'danger' : 'success'" />
            </div>
          </template>
          <el-alert
            v-if="riskCount === 0"
            title="无活跃风险"
            type="success"
            :closable="false"
          />
          <div v-else class="risk-list">
            <div v-for="risk in activeRisks" :key="risk.id" class="risk-item">
              <el-tag :type="getRiskTypeColor(risk.type)" size="small">
                {{ risk.type }}
              </el-tag>
              <div class="risk-desc">{{ risk.description }}</div>
            </div>
          </div>
        </el-card>

        <!-- 依赖 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>依赖</span>
              <el-badge :value="dependencyCount" :type="dependencyCount > 0 ? 'warning' : 'success'" />
            </div>
          </template>
          <el-alert
            v-if="dependencyCount === 0"
            title="无待解决依赖"
            type="success"
            :closable="false"
          />
          <div v-else class="dependency-list">
            <div v-for="dep in activeDependencies" :key="dep.id" class="dependency-item">
              <el-tag size="small">{{ dep.type }}</el-tag>
              <div class="dependency-desc">{{ dep.description }}</div>
            </div>
          </div>
        </el-card>

        <!-- 里程碑 -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>里程碑</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="milestone in milestones"
              :key="milestone.id"
              :timestamp="milestone.date"
              :type="milestone.status === 'completed' ? 'success' : 'primary'"
              :hollow="milestone.status !== 'completed'"
            >
              {{ milestone.name }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePIStore } from '@/stores/modules/pi'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import {
  TrendCharts,
  CircleCheck,
  DataLine,
  Odometer,
} from '@element-plus/icons-vue'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const route = useRoute()
const router = useRouter()
const piStore = usePIStore()

const piId = computed(() => route.params.id as string)
const pi = computed(() => piStore.currentPI)
const burndownType = ref('sp')

// 模拟进度数据
const progressData = ref({
  overallCompletion: 65,
  featureCompletion: 70,
  completedFeatures: 14,
  totalFeatures: 20,
  spCompletion: 68,
  completedSP: 340,
  totalSP: 500,
  velocity: 42,
})

// 模拟燃尽图数据
const burndownChartOption = computed(() => {
  const dates = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']
  const idealData = [500, 417, 333, 250, 167, 83]
  const actualData = [500, 440, 380, 310, 220, 160]

  return {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['理想燃尽', '实际燃尽'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: 'value',
      name: burndownType.value === 'sp' ? 'Story Points' : 'Feature Count',
    },
    series: [
      {
        name: '理想燃尽',
        type: 'line',
        data: idealData,
        smooth: true,
        lineStyle: {
          type: 'dashed',
          color: '#909399',
        },
        itemStyle: {
          color: '#909399',
        },
      },
      {
        name: '实际燃尽',
        type: 'line',
        data: actualData,
        smooth: true,
        lineStyle: {
          color: '#409eff',
        },
        itemStyle: {
          color: '#409eff',
        },
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.1)',
        },
      },
    ],
  }
})

// 模拟团队进度数据
const teamProgress = ref([
  { teamName: '前端团队', completion: 75, completedSP: 150, totalSP: 200, velocity: 45, status: '正常' },
  { teamName: '后端团队', completion: 68, completedSP: 170, totalSP: 250, velocity: 40, status: '正常' },
  { teamName: '测试团队', completion: 50, completedSP: 20, totalSP: 50, velocity: 38, status: '滞后' },
])

// 模拟风险数据
const activeRisks = ref([
  { id: '1', type: 'technical', description: '第三方API稳定性问题' },
  { id: '2', type: 'resource', description: '测试资源不足' },
])

const riskCount = computed(() => activeRisks.value.length)

// 模拟依赖数据
const activeDependencies = ref([
  { id: '1', type: 'external', description: '等待后端API完成' },
])

const dependencyCount = computed(() => activeDependencies.value.length)

// 模拟里程碑数据
const milestones = ref([
  { id: '1', name: 'PI Planning', date: '2026-01-01', status: 'completed' },
  { id: '2', name: 'Sprint 1 完成', date: '2026-01-15', status: 'completed' },
  { id: '3', name: 'Sprint 2 完成', date: '2026-02-01', status: 'in-progress' },
  { id: '4', name: 'PI Review', date: '2026-02-15', status: 'upcoming' },
])

const getTeamStatusType = (status: string): any => {
  const map: Record<string, string> = {
    '正常': 'success',
    '滞后': 'warning',
    '风险': 'danger',
  }
  return map[status] || ''
}

const getRiskTypeColor = (type: string): any => {
  const map: Record<string, string> = {
    technical: 'primary',
    resource: 'warning',
    dependency: 'danger',
    external: 'info',
  }
  return map[type] || ''
}

const goBack = () => {
  router.back()
}

const handleReview = () => {
  router.push(`/function/c3/pi/review/${piId.value}`)
}

onMounted(async () => {
  await piStore.fetchPIById(piId.value)
})
</script>

<style scoped lang="scss">
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .pi-info {
    flex: 1;
  }

  .actions {
    display: flex;
    gap: 8px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.stat-detail {
  margin-top: 8px;
  font-size: 14px;
  color: #909399;
}

.risk-list,
.dependency-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.risk-item,
.dependency-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;

  .risk-desc,
  .dependency-desc {
    margin-top: 8px;
    font-size: 14px;
    color: #606266;
  }
}
</style>
