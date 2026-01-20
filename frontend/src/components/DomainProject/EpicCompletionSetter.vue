<!-- EpicCompletionSetter.vue - Epic完成度设置组件 ⭐⭐⭐⭐⭐ -->
<template>
  <div class="epic-completion-setter">
    <el-card>
      <div class="epic-header">
        <span class="epic-code">{{ epic.code }}</span>
        <span class="epic-name">{{ epic.name }}</span>
      </div>

      <div class="completion-slider">
        <label>Epic完成度目标 ⭐</label>
        <el-slider
          v-model="completionTarget"
          :min="0"
          :max="100"
          :step="5"
          :marks="marks"
          show-stops
          @change="handleCompletionChange"
        />
        <div class="target-info">
          <span>完成度: <strong>{{ completionTarget }}%</strong></span>
          <span>目标SP: <strong>{{ targetSP }} SP</strong></span>
        </div>
      </div>

      <el-button
        @click="handleFeatureDetail"
        size="small"
        type="primary"
        style="margin-top: 12px"
      >
        Feature精细化设置 ⭐
      </el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  epic: any
  versionId: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  update: [epicId: string, completionTarget: number]
  featureDetail: [epic: any]
}>()

const completionTarget = ref((props.epic as any).completionTarget || 0)

const marks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%'
}

// 计算目标SP
const targetSP = computed(() => {
  const totalSP = props.epic.storyPoints || 0
  return Math.round(totalSP * (completionTarget.value / 100))
})

function handleCompletionChange() {
  emit('update', props.epic.id, completionTarget.value)
}

function handleFeatureDetail() {
  emit('featureDetail', props.epic)
}

watch(() => (props.epic as any).completionTarget, (newVal) => {
  if (newVal !== undefined) {
    completionTarget.value = newVal
  }
})
</script>

<style scoped lang="scss">
.epic-completion-setter {
  .epic-header {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;

    .epic-code {
      padding: 4px 8px;
      background: #e6a23c;
      color: white;
      border-radius: 4px;
      font-size: 12px;
    }

    .epic-name {
      font-weight: bold;
    }
  }

  .completion-slider {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;

    label {
      display: block;
      margin-bottom: 12px;
      font-weight: bold;
      color: #409eff;
    }

    .target-info {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-size: 14px;

      strong {
        color: #409eff;
        font-size: 16px;
      }
    }
  }
}
</style>
