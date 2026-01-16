<template>
  <PageContainer>
    <template #header>
      <PageHeader
        title="燃尽图"
        description="Sprint进度可视化追踪"
      />
    </template>

    <!-- Sprint选择 -->
    <el-card>
      <el-form :inline="true">
        <el-form-item label="Sprint">
          <el-select v-model="selectedSprint" @change="handleSprintChange">
            <el-option
              v-for="sprint in sprints"
              :key="sprint.id"
              :label="sprint.name"
              :value="sprint.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="查看维度">
          <el-radio-group v-model="viewType" @change="handleViewTypeChange">
            <el-radio-button value="story-points">Story Points</el-radio-button>
            <el-radio-button value="tasks">任务数</el-radio-button>
            <el-radio-button value="hours">工时</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 燃尽图表 -->
    <el-card style="margin-top: 20px">
      <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总工作量" :value="statistics.total" :suffix="getUnit()">
            <template #prefix>
              <el-icon><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已完成" :value="statistics.completed" :suffix="getUnit()">
            <template #prefix>
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="剩余" :value="statistics.remaining" :suffix="getUnit()">
            <template #prefix>
              <el-icon color="#E6A23C"><Clock /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="完成度" :value="statistics.completionRate" suffix="%">
            <template #prefix>
              <el-icon color="#409EFF"><DataAnalysis /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <span>每日进度详情</span>
      </template>
      <el-table :data="dailyData">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="planned" :label="`计划剩余(${getUnit()})`" width="150" align="center" />
        <el-table-column prop="actual" :label="`实际剩余(${getUnit()})`" width="150" align="center" />
        <el-table-column prop="completed" :label="`当日完成(${getUnit()})`" width="150" align="center" />
        <el-table-column prop="velocity" label="速率" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.velocity > 0 ? 'success' : 'info'" size="small">
              {{ row.velocity > 0 ? '+' : '' }}{{ row.velocity }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="200" />
      </el-table>
    </el-card>

    <!-- 风险提示 -->
    <el-card style="margin-top: 20px" v-if="risks.length > 0">
      <template #header>
        <span>风险提示</span>
      </template>
      <el-alert
        v-for="risk in risks"
        :key="risk.id"
        :title="risk.title"
        :type="risk.type"
        :description="risk.description"
        show-icon
        style="margin-bottom: 12px"
      />
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { TrendCharts, CircleCheck, Clock, DataAnalysis } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const selectedSprint = ref('sprint1')
const viewType = ref('story-points')

const sprints = ref([
  { id: 'sprint1', name: 'Sprint 1 (2026-04-01 ~ 2026-04-14)' },
  { id: 'sprint2', name: 'Sprint 2 (2026-04-15 ~ 2026-04-28)' }
])

const statistics = ref({
  total: 120,
  completed: 75,
  remaining: 45,
  completionRate: 62.5
})

const dailyData = ref([
  { date: '04-01', planned: 120, actual: 120, completed: 0, velocity: 0, notes: 'Sprint开始' },
  { date: '04-02', planned: 111, actual: 110, completed: 10, velocity: 10, notes: '' },
  { date: '04-03', planned: 103, actual: 100, completed: 10, velocity: 10, notes: '' },
  { date: '04-04', planned: 94, actual: 85, completed: 15, velocity: 15, notes: '进度超前' },
  { date: '04-05', planned: 86, actual: 80, completed: 5, velocity: 5, notes: '周末' },
  { date: '04-08', planned: 77, actual: 75, completed: 5, velocity: 5, notes: '' },
  { date: '04-09', planned: 69, actual: 65, completed: 10, velocity: 10, notes: '' },
  { date: '04-10', planned: 60, actual: 45, completed: 20, velocity: 20, notes: '今天' }
])

const risks = ref([
  {
    id: 1,
    title: '进度风险',
    type: 'warning',
    description: '当前实际进度略快于计划，请注意保持质量'
  }
])

function getUnit() {
  const units: Record<string, string> = {
    'story-points': 'SP',
    'tasks': '个',
    'hours': 'h'
  }
  return units[viewType.value] || ''
}

function initChart() {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    title: {
      text: 'Sprint燃尽图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['理想燃尽线', '实际燃尽线'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dailyData.value.map(d => d.date)
    },
    yAxis: {
      type: 'value',
      name: `剩余工作量 (${getUnit()})`,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '理想燃尽线',
        type: 'line',
        data: dailyData.value.map(d => d.planned),
        lineStyle: {
          type: 'dashed',
          color: '#909399'
        },
        itemStyle: {
          color: '#909399'
        }
      },
      {
        name: '实际燃尽线',
        type: 'line',
        data: dailyData.value.map(d => d.actual),
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        markLine: {
          data: [{ xAxis: dailyData.value.length - 1 }],
          label: {
            formatter: '今天'
          }
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

function handleSprintChange() {
  initChart()
}

function handleViewTypeChange() {
  initChart()
}

onMounted(() => {
  initChart()
  
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
})

onUnmounted(() => {
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
// 样式与其他页面保持一致
</style>
