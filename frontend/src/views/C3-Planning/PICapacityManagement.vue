<template>
  <PageContainer>
    <PageHeader title="PI容量管理" description="管理PI中各团队的容量和负载">
      <template #actions>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" @click="handleSaveAll" :loading="saving">
          <el-icon><Check /></el-icon>
          保存全部
        </el-button>
      </template>
    </PageHeader>

    <el-row :gutter="16">
      <el-col :span="8">
        <el-select v-model="selectedPIId" placeholder="选择PI" style="width: 100%;" @change="loadPIData">
          <el-option
            v-for="pi in pis"
            :key="pi.id"
            :label="pi.name"
            :value="pi.id"
          />
        </el-select>
      </el-col>
    </el-row>

    <el-row :gutter="16" v-loading="loading" style="margin-top: 16px;">
      <!-- 团队容量输入 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>团队容量输入</span>
          </template>

          <el-table :data="teamCapacities" stripe>
            <el-table-column prop="teamName" label="团队" width="150" />
            <el-table-column label="容量(SP)" width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.capacity"
                  :min="0"
                  :max="10000"
                  :step="10"
                  size="small"
                  style="width: 100%;"
                  @change="handleCapacityChange"
                />
              </template>
            </el-table-column>
            <el-table-column label="速率(SP/Sprint)" width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.velocity"
                  :min="0"
                  :max="1000"
                  :step="5"
                  size="small"
                  style="width: 100%;"
                />
              </template>
            </el-table-column>
            <el-table-column label="已规划(SP)" width="120" align="center">
              <template #default="{ row }">
                <span>{{ row.plannedStoryPoints }}</span>
              </template>
            </el-table-column>
            <el-table-column label="利用率" width="150">
              <template #default="{ row }">
                <el-progress
                  :percentage="getUtilization(row)"
                  :status="getUtilization(row) > 100 ? 'exception' : undefined"
                  :color="getCapacityColor(getUtilization(row))"
                />
              </template>
            </el-table-column>
          </el-table>

          <el-alert
            v-if="hasOverloadedTeams"
            type="warning"
            :closable="false"
            style="margin-top: 16px;"
          >
            {{ overloadedTeamsCount }}个团队容量超载，请调整分配或增加容量
          </el-alert>
        </el-card>
      </el-col>

      <!-- 容量可视化 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>容量负载可视化</span>
          </template>

          <!-- 总体容量概览 -->
          <div class="capacity-overview">
            <el-statistic title="总容量" :value="totalCapacity" suffix="SP" />
            <el-statistic title="已规划" :value="totalPlanned" suffix="SP" />
            <el-statistic title="剩余容量" :value="totalRemaining" suffix="SP" />
            <el-statistic title="平均利用率" :value="averageUtilization" suffix="%" />
          </div>

          <el-divider />

          <!-- 团队负载图表 -->
          <div class="team-load-chart">
            <v-chart :option="chartOption" style="height: 350px;" />
          </div>

          <el-divider />

          <!-- 容量分布 -->
          <div class="capacity-distribution">
            <div class="distribution-item" v-for="team in teamCapacities" :key="team.teamId">
              <div class="team-name">{{ team.teamName }}</div>
              <div class="capacity-bar">
                <div
                  class="capacity-used"
                  :style="{
                    width: `${Math.min(getUtilization(team), 100)}%`,
                    backgroundColor: getCapacityBarColor(getUtilization(team))
                  }"
                ></div>
              </div>
              <div class="capacity-stats">
                <span>{{ team.plannedStoryPoints }} / {{ team.capacity }} SP</span>
                <span :style="{ color: getCapacityColor(getUtilization(team)) }">
                  {{ getUtilization(team) }}%
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 智能建议 -->
    <el-card style="margin-top: 16px;">
      <template #header>
        <span>智能建议</span>
      </template>

      <el-timeline>
        <el-timeline-item
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          :type="suggestion.type"
          :icon="suggestion.icon"
        >
          <div>
            <strong>{{ suggestion.title }}</strong>
            <p style="margin: 4px 0 0 0; color: #909399;">{{ suggestion.description }}</p>
            <el-button v-if="suggestion.action" link size="small" type="primary" @click="suggestion.action">
              {{ suggestion.actionText }}
            </el-button>
          </div>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-if="suggestions.length === 0" description="暂无建议" />
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, Warning, InfoFilled } from '@element-plus/icons-vue'
import { usePIStore } from '@/stores/modules/pi'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

const router = useRouter()
const piStore = usePIStore()

const loading = ref(false)
const saving = ref(false)
const selectedPIId = ref('')
const teamCapacities = ref<any[]>([])

const pis = computed(() => piStore.piVersions)

const totalCapacity = computed(() => {
  return teamCapacities.value.reduce((sum, team) => sum + team.capacity, 0)
})

const totalPlanned = computed(() => {
  return teamCapacities.value.reduce((sum, team) => sum + team.plannedStoryPoints, 0)
})

const totalRemaining = computed(() => {
  return totalCapacity.value - totalPlanned.value
})

const averageUtilization = computed(() => {
  if (teamCapacities.value.length === 0) return 0
  const totalUtil = teamCapacities.value.reduce((sum, team) => sum + getUtilization(team), 0)
  return Math.round(totalUtil / teamCapacities.value.length)
})

const hasOverloadedTeams = computed(() => {
  return teamCapacities.value.some(team => getUtilization(team) > 100)
})

const overloadedTeamsCount = computed(() => {
  return teamCapacities.value.filter(team => getUtilization(team) > 100).length
})

const chartOption = computed(() => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['容量', '已规划', '剩余']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: teamCapacities.value.map(t => t.teamName)
    },
    yAxis: {
      type: 'value',
      name: 'Story Points'
    },
    series: [
      {
        name: '容量',
        type: 'bar',
        data: teamCapacities.value.map(t => t.capacity),
        itemStyle: { color: '#409eff' }
      },
      {
        name: '已规划',
        type: 'bar',
        data: teamCapacities.value.map(t => t.plannedStoryPoints),
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '剩余',
        type: 'bar',
        data: teamCapacities.value.map(t => Math.max(0, t.capacity - t.plannedStoryPoints)),
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }
})

const suggestions = computed(() => {
  const result: any[] = []

  teamCapacities.value.forEach(team => {
    const utilization = getUtilization(team)
    if (utilization > 100) {
      result.push({
        id: `overload-${team.teamId}`,
        type: 'danger',
        icon: Warning,
        title: `${team.teamName} 容量超载`,
        description: `当前利用率${utilization}%，建议减少${team.plannedStoryPoints - team.capacity}SP或增加容量`,
        actionText: '调整分配',
        action: () => handleAdjustTeam(team)
      })
    } else if (utilization < 70) {
      result.push({
        id: `underload-${team.teamId}`,
        type: 'info',
        icon: InfoFilled,
        title: `${team.teamName} 容量利用率较低`,
        description: `当前利用率${utilization}%，还可以承接更多Feature`,
        actionText: '查看可分配Feature',
        action: () => handleViewAvailableFeatures(team)
      })
    }
  })

  return result
})

const getUtilization = (team: any) => {
  if (team.capacity === 0) return 0
  return Math.round((team.plannedStoryPoints / team.capacity) * 100)
}

const getCapacityColor = (percentage: number) => {
  if (percentage < 70) return '#67c23a'
  if (percentage < 90) return '#e6a23c'
  return '#f56c6c'
}

const getCapacityBarColor = (percentage: number) => {
  if (percentage > 100) return '#f56c6c'
  if (percentage > 90) return '#e6a23c'
  if (percentage > 70) return '#409eff'
  return '#67c23a'
}

const handleCapacityChange = () => {
  // 容量变化时触发
}

const handleSaveAll = async () => {
  saving.value = true
  try {
    if (!selectedPIId.value) {
      ElMessage.warning('请选择PI')
      return
    }

    const capacities = teamCapacities.value.map(team => ({
      teamId: team.teamId,
      capacity: team.capacity,
      velocity: team.velocity
    }))

    await piStore.batchUpdateTeamCapacities(selectedPIId.value, capacities)
    ElMessage.success('团队容量已保存')
  } finally {
    saving.value = false
  }
}

const loadPIData = async () => {
  if (!selectedPIId.value) return

  loading.value = true
  try {
    const teamsLoad = piStore.getAllTeamsLoadInfo(selectedPIId.value)
    teamCapacities.value = teamsLoad
  } finally {
    loading.value = false
  }
}

const handleAdjustTeam = (team: any) => {
  router.push(`/function/c0-project/version/feature-allocation?team=${team.teamId}`)
}

const handleViewAvailableFeatures = (team: any) => {
  router.push(`/function/c0-project/version/feature-allocation?team=${team.teamId}`)
}

const goBack = () => router.back()

onMounted(async () => {
  loading.value = true
  try {
    await piStore.fetchPIVersions()
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
.capacity-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.team-load-chart {
  margin: 16px 0;
}

.capacity-distribution {
  .distribution-item {
    margin-bottom: 16px;

    .team-name {
      font-weight: 500;
      margin-bottom: 8px;
      color: #303133;
    }

    .capacity-bar {
      height: 24px;
      background-color: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;

      .capacity-used {
        height: 100%;
        transition: all 0.3s;
      }
    }

    .capacity-stats {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #606266;
    }
  }
}
</style>
