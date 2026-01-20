<!-- MilestoneProgress.vue - 里程碑进度组件 -->
<template>
  <div class="milestone-progress">
    <div v-if="milestones && milestones.length > 0" class="milestone-list">
      <div
        v-for="milestone in sortedMilestones"
        :key="milestone.id"
        class="milestone-item"
      >
        <div class="milestone-header">
          <span class="milestone-icon">
            <el-icon v-if="milestone.status === 'completed'" color="#67c23a"><Check /></el-icon>
            <el-icon v-else-if="milestone.status === 'in-progress'" color="#409eff"><Clock /></el-icon>
            <el-icon v-else color="#909399"><Circle /></el-icon>
          </span>
          <span class="milestone-name">{{ milestone.name }}</span>
        </div>

        <div class="milestone-date">{{ milestone.date }}</div>

        <div v-if="milestone.progress !== undefined" class="milestone-progress-bar">
          <el-progress
            :percentage="milestone.progress"
            :status="getProgressStatus(milestone.status)"
          />
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="暂无里程碑" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, Clock, Circle } from '@element-plus/icons-vue'

const props = defineProps<{
  milestones: Array<any>
}>()

// 按日期排序里程碑
const sortedMilestones = computed(() => {
  if (!props.milestones) return []
  return [...props.milestones].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateA - dateB
  })
})

function getProgressStatus(status: string) {
  const statusMap: Record<string, any> = {
    'completed': 'success',
    'in-progress': undefined,
    'not-started': 'exception'
  }
  return statusMap[status]
}
</script>

<style scoped lang="scss">
.milestone-progress {
  .milestone-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .milestone-item {
    padding: 12px;
    border: 1px solid #ebeef5;
    border-radius: 4px;

    .milestone-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .milestone-name {
        font-weight: bold;
      }
    }

    .milestone-date {
      margin-bottom: 8px;
      color: #909399;
      font-size: 14px;
    }

    .milestone-progress-bar {
      margin-top: 8px;
    }
  }

  .empty-state {
    padding: 40px 0;
    text-align: center;
  }
}
</style>
