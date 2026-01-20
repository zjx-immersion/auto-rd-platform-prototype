<!-- TeamLoadCalculator.vue - 团队负载计算组件 ⭐ -->
<template>
  <div class="team-load-calculator">
    <el-card>
      <template #header>
        <span>团队分配与负载 ⭐</span>
      </template>

      <div v-if="teamLoadResults.length > 0" class="team-load-list">
        <div
          v-for="result in teamLoadResults"
          :key="result.teamId"
          class="team-load-item"
        >
          <div class="team-header">
            <span class="team-name">{{ result.teamName }}</span>
            <el-tag :type="getLoadStatusType(result.status)" size="small">
              {{ result.status }}
            </el-tag>
          </div>

          <div class="team-info">
            <span>分配SP: {{ result.allocatedSP }}</span>
            <span>速率: {{ result.velocity }} SP/PI</span>
            <span>容量: {{ result.capacity }} 人天</span>
          </div>

          <div class="load-rate">
            <label>负载率:</label>
            <el-progress
              :percentage="result.loadRate"
              :status="getLoadProgressStatus(result.status)"
            />
          </div>

          <div class="recommendation">
            <el-alert
              :type="getLoadAlertType(result.status)"
              :closable="false"
            >
              {{ result.recommendation }}
            </el-alert>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-empty description="暂无团队数据" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePIStore } from '@/stores/modules/pi'

const props = defineProps<{
  teams: Array<any>
  allocatedEpics: Array<any>
  piDuration?: number
}>()

const emit = defineEmits<{
  update: [teamAllocations: any[]]
}>()

const piStore = usePIStore()
const piDuration = props.piDuration || 12

// 计算团队负载
const teamLoadResults = computed(() => {
  if (!props.teams || props.teams.length === 0) return []

  return props.teams.map(team => {
    // 计算该团队分配的SP
    const allocatedSP = props.allocatedEpics
      ?.filter(epic => epic.teamId === team.teamId)
      ?.reduce((sum, epic) => sum + (epic.targetSP || 0), 0) || 0

    return piStore.calculateTeamLoad(team, allocatedSP, piDuration)
  })
})

// 获取负载状态类型
function getLoadStatusType(status: string) {
  const typeMap: Record<string, any> = {
    'LOW': 'info',
    'OPTIMAL': 'success',
    'HIGH': 'warning',
    'OVERLOAD': 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取进度条状态
function getLoadProgressStatus(status: string) {
  const statusMap: Record<string, any> = {
    'OPTIMAL': 'success',
    'HIGH': 'warning',
    'OVERLOAD': 'exception'
  }
  return statusMap[status] || undefined
}

// 获取告警类型
function getLoadAlertType(status: string) {
  const typeMap: Record<string, any> = {
    'LOW': 'info',
    'OPTIMAL': 'success',
    'HIGH': 'warning',
    'OVERLOAD': 'error'
  }
  return typeMap[status] || 'info'
}

// 监听变化并发送更新
watch(teamLoadResults, (results) => {
  emit('update', results)
}, { deep: true })
</script>

<style scoped lang="scss">
.team-load-calculator {
  .team-load-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .team-load-item {
    padding: 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .team-name {
        font-weight: bold;
        font-size: 16px;
      }
    }

    .team-info {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #606266;
    }

    .load-rate {
      margin-bottom: 12px;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
      }
    }

    .recommendation {
      margin-top: 12px;
    }
  }

  .empty-state {
    padding: 40px 0;
    text-align: center;
  }
}
</style>
