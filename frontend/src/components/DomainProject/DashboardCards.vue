<!-- DashboardCards.vue - 统计卡片组件 -->
<template>
  <div class="dashboard-cards">
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="PI数量" :value="stats.piCount">
            <template #suffix>
              <span class="suffix">/ {{ stats.totalPIs }}</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="版本数量" :value="stats.versionCount">
            <template #suffix>
              <span class="suffix">/ {{ stats.totalVersions }}</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="里程碑进度" :value="stats.milestoneProgress">
            <template #suffix>
              <span class="suffix">%</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="团队数量" :value="stats.teamCount">
            <template #suffix>
              <span class="suffix">个</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  project: any
}>()

// 计算统计数据
const stats = computed(() => {
  if (!props.project) {
    return {
      piCount: 0,
      totalPIs: 0,
      versionCount: 0,
      totalVersions: 0,
      milestoneProgress: 0,
      teamCount: 0
    }
  }

  return {
    piCount: props.project.completedPIs || 0,
    totalPIs: props.project.totalPIs || 4,
    versionCount: props.project.completedVersions || 0,
    totalVersions: props.project.totalVersions || 3,
    milestoneProgress: props.project.milestoneProgress || 0,
    teamCount: props.project.teams?.length || 0
  }
})
</script>

<style scoped lang="scss">
.dashboard-cards {
  margin-bottom: 24px;

  .stat-card {
    text-align: center;
    
    .suffix {
      font-size: 14px;
      color: #909399;
    }
  }
}
</style>
