<!-- CurrentPIProgress.vue - 当前PI进度组件 -->
<template>
  <div class="current-pi-progress">
    <div v-if="pi" class="pi-info">
      <h4>{{ pi.code }}: {{ pi.name }}</h4>
      <p class="pi-date">{{ pi.startDate }} ~ {{ pi.endDate }}</p>

      <div class="progress-info">
        <div class="progress-item">
          <label>Sprint进度:</label>
          <el-progress 
            :percentage="sprintProgress" 
            :format="() => `${currentSprint}/${totalSprints}`"
          />
        </div>

        <div class="progress-item">
          <label>Story Points:</label>
          <el-progress 
            :percentage="storyPointProgress"
            :format="() => `${completedSP}/${totalSP} SP`"
          />
        </div>
      </div>

      <div class="actions">
        <el-button size="small" @click="$emit('viewDetail', pi)">查看详情</el-button>
        <el-button size="small" type="primary" @click="$emit('enterPlanning', pi)">
          进入PI Planning
        </el-button>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="暂无当前PI" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  pi: any
}>()

const emit = defineEmits<{
  viewDetail: [pi: any]
  enterPlanning: [pi: any]
}>()

const currentSprint = computed(() => (props.pi as any)?.currentSprint || 0)
const totalSprints = computed(() => props.pi?.sprintCount || 6)
const sprintProgress = computed(() => 
  Math.round((currentSprint.value / totalSprints.value) * 100)
)

const completedSP = computed(() => props.pi?.completedStoryPoints || 0)
const totalSP = computed(() => props.pi?.committedStoryPoints || 0)
const storyPointProgress = computed(() => 
  totalSP.value > 0 ? Math.round((completedSP.value / totalSP.value) * 100) : 0
)
</script>

<style scoped lang="scss">
.current-pi-progress {
  .pi-info {
    h4 {
      margin: 0 0 8px 0;
      color: #303133;
    }

    .pi-date {
      margin: 0 0 16px 0;
      color: #909399;
      font-size: 14px;
    }

    .progress-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 16px;

      .progress-item {
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          font-size: 14px;
        }
      }
    }

    .actions {
      display: flex;
      gap: 8px;
    }
  }

  .empty-state {
    padding: 40px 0;
    text-align: center;
  }
}
</style>
