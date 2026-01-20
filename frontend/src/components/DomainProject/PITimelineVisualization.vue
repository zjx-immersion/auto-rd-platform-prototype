<!-- PITimelineVisualization.vue - PI时间线可视化组件 ⭐ -->
<template>
  <div class="pi-timeline-visualization">
    <div class="timeline-header">
      <h4>PI时间线</h4>
      <div class="timeline-legend">
        <span class="legend-item">
          <span class="status-dot completed"></span>
          已完成
        </span>
        <span class="legend-item">
          <span class="status-dot active"></span>
          进行中
        </span>
        <span class="legend-item">
          <span class="status-dot ready"></span>
          就绪
        </span>
      </div>
    </div>

    <div class="timeline-container" v-if="pis && pis.length > 0">
      <!-- 时间轴 -->
      <div class="timeline-axis">
        <div
          v-for="month in timelineMonths"
          :key="month.label"
          class="month-marker"
          :style="{ left: month.position + '%' }"
        >
          {{ month.label }}
        </div>
      </div>

      <!-- PI条 -->
      <div class="timeline-bars">
        <div
          v-for="pi in pis"
          :key="pi.id"
          class="pi-bar"
          :class="['status-' + pi.status]"
          :style="{
            left: calculatePosition(pi.startDate) + '%',
            width: calculateWidth(pi.startDate, pi.endDate) + '%'
          }"
          @click="handlePIClick(pi)"
        >
          <div class="pi-bar-content">
            <span class="pi-number">{{ pi.code }}</span>
            <span class="pi-name">{{ pi.name }}</span>
            <span v-if="pi.status === 'in-progress'" class="pi-progress">
              {{ (pi as any).progress?.overallProgress || 0 }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="暂无PI数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  pis: Array<any>
  milestones?: Array<any>
  projectStart: string
  projectEnd: string
}>()

const emit = defineEmits<{
  piClick: [pi: any]
}>()

// 计算时间轴月份标记
const timelineMonths = computed(() => {
  const start = new Date(props.projectStart)
  const end = new Date(props.projectEnd)
  const months = []

  let current = new Date(start.getFullYear(), start.getMonth(), 1)
  while (current <= end) {
    const position = calculatePosition(current.toISOString().split('T')[0])
    months.push({
      label: `${current.getMonth() + 1}月`,
      position
    })
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
  }

  return months
})

// 计算位置（百分比）
function calculatePosition(date: string): number {
  const start = new Date(props.projectStart).getTime()
  const end = new Date(props.projectEnd).getTime()
  const current = new Date(date).getTime()

  const totalDays = (end - start) / (1000 * 60 * 60 * 24)
  const currentDays = (current - start) / (1000 * 60 * 60 * 24)

  return (currentDays / totalDays) * 100
}

// 计算宽度（百分比）
function calculateWidth(startDate: string, endDate: string): number {
  const projectStart = new Date(props.projectStart).getTime()
  const projectEnd = new Date(props.projectEnd).getTime()
  const piStart = new Date(startDate).getTime()
  const piEnd = new Date(endDate).getTime()

  const totalDays = (projectEnd - projectStart) / (1000 * 60 * 60 * 24)
  const piDays = (piEnd - piStart) / (1000 * 60 * 60 * 24)

  return (piDays / totalDays) * 100
}

function handlePIClick(pi: any) {
  emit('piClick', pi)
}
</script>

<style scoped lang="scss">
.pi-timeline-visualization {
  padding: 24px;
  background: #fff;
  border-radius: 4px;

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h4 {
      margin: 0;
      font-size: 16px;
      color: #303133;
    }

    .timeline-legend {
      display: flex;
      gap: 16px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;

          &.completed {
            background: #67c23a;
          }

          &.active {
            background: #409eff;
          }

          &.ready {
            background: #e6a23c;
          }
        }
      }
    }
  }

  .timeline-container {
    position: relative;
    min-height: 150px;
  }

  .timeline-axis {
    position: relative;
    height: 30px;
    border-bottom: 2px solid #dcdfe6;
    margin-bottom: 20px;

    .month-marker {
      position: absolute;
      bottom: -25px;
      transform: translateX(-50%);
      font-size: 12px;
      color: #909399;
    }
  }

  .timeline-bars {
    position: relative;
    height: 80px;

    .pi-bar {
      position: absolute;
      height: 50px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      padding: 8px;

      &.status-completed {
        background: linear-gradient(to right, #67c23a, #85ce61);
      }

      &.status-in-progress {
        background: linear-gradient(to right, #409eff, #66b1ff);
      }

      &.status-planning {
        background: linear-gradient(to right, #e6a23c, #ebb563);
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .pi-bar-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
        color: white;
        font-size: 12px;

        .pi-number {
          font-weight: bold;
        }

        .pi-progress {
          font-size: 10px;
        }
      }
    }
  }

  .empty-state {
    padding: 40px 0;
    text-align: center;
  }
}
</style>
