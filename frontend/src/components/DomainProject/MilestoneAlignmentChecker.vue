<!-- MilestoneAlignmentChecker.vue - 里程碑对齐检查组件 ⭐⭐⭐⭐⭐ -->
<template>
  <div class="milestone-alignment-checker">
    <el-card>
      <template #header>
        <span>里程碑对齐检查 ⭐</span>
      </template>

      <!-- PI时间范围 -->
      <el-alert :closable="false" type="info" style="margin-bottom: 16px">
        <strong>PI时间范围:</strong>
        {{ piStartDate }} ~ {{ piEndDate }} ({{ piDuration }}周固定)
      </el-alert>

      <!-- 里程碑列表 -->
      <div v-if="alignmentResults.length > 0" class="milestone-list">
        <h4>可用里程碑列表</h4>

        <div
          v-for="(result, index) in alignmentResults"
          :key="result.milestone.milestoneId"
          class="milestone-item"
          :class="{ 'selected': selectedMilestones.includes(result.milestone.milestoneId) }"
        >
          <div class="milestone-header">
            <span class="milestone-number">{{ index + 1 }}️⃣</span>
            <span class="milestone-name">{{ result.milestone.milestoneName }}</span>
          </div>

          <div class="milestone-info">
            <span class="date">目标日期: {{ result.milestone.targetDate }}</span>
            <span class="diff">
              相差: {{ result.absDiff }}天
              <span v-if="result.daysDiff > 0">(里程碑晚于PI)</span>
              <span v-else-if="result.daysDiff < 0">(PI晚于里程碑)</span>
            </span>
          </div>

          <div class="alignment-status">
            <el-tag 
              :type="getAlignmentTagType(result.level)" 
              size="large"
            >
              {{ getAlignmentText(result.level) }}
            </el-tag>
            <span class="recommendation">{{ result.recommendation }}</span>
          </div>

          <!-- 调整建议（仅不对齐时显示）-->
          <div v-if="result.level === 'MISALIGNED'" class="suggestions">
            <div class="suggestion-title">
              <el-icon><Lightbulb /></el-icon>
              智能调整建议:
            </div>

            <el-radio-group 
              v-model="selectedSuggestion[result.milestone.milestoneId]"
              class="suggestion-list"
            >
              <el-radio
                v-for="(suggestion, idx) in result.suggestions"
                :key="idx"
                :label="suggestion.type"
                :class="{ 'recommended': suggestion.recommended }"
              >
                <div class="suggestion-content">
                  <strong>方案{{ idx + 1 }}:</strong>
                  {{ suggestion.description }}
                  <el-tag v-if="suggestion.recommended" size="small" type="success">
                    推荐
                  </el-tag>
                  <div class="suggestion-details">
                    <span>影响: {{ suggestion.impact }}</span>
                    <span>风险: {{ suggestion.risk }}</span>
                  </div>
                </div>
              </el-radio>
            </el-radio-group>
          </div>

          <el-checkbox
            :model-value="selectedMilestones.includes(result.milestone.milestoneId)"
            @change="handleMilestoneSelect(result.milestone.milestoneId)"
            class="milestone-checkbox"
          >
            关联到此PI
          </el-checkbox>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-empty description="暂无可用里程碑" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Lightbulb } from '@element-plus/icons-vue'
import { usePIStore } from '@/stores/modules/pi'

const props = defineProps<{
  piStartDate: string
  piEndDate: string
  piDuration: number
  milestones: Array<{
    milestoneId: string
    milestoneName: string
    targetDate: string
  }>
}>()

const emit = defineEmits<{
  update: [selectedMilestones: string[], decisions: any[]]
}>()

const piStore = usePIStore()
const selectedMilestones = ref<string[]>([])
const selectedSuggestion = ref<Record<string, string>>({})

// 对齐结果
const alignmentResults = computed(() => {
  if (!props.milestones || props.milestones.length === 0) return []
  return piStore.checkMilestoneAlignment(props.piEndDate, props.milestones)
})

// 里程碑选择
function handleMilestoneSelect(milestoneId: string) {
  const index = selectedMilestones.value.indexOf(milestoneId)
  if (index > -1) {
    selectedMilestones.value.splice(index, 1)
  } else {
    selectedMilestones.value.push(milestoneId)
  }
  emitUpdate()
}

// 发送更新事件
function emitUpdate() {
  const decisions = selectedMilestones.value.map(id => ({
    milestoneId: id,
    suggestion: selectedSuggestion.value[id] || 'NO_LINK'
  }))
  emit('update', selectedMilestones.value, decisions)
}

// 获取对齐标签类型
function getAlignmentTagType(level: string) {
  return {
    'PERFECT': 'success',
    'ACCEPTABLE': 'warning',
    'MISALIGNED': 'info'
  }[level]
}

// 获取对齐文本
function getAlignmentText(level: string) {
  return {
    'PERFECT': '✓ 完美对齐 (≤7天)',
    'ACCEPTABLE': '✓ 可接受对齐 (8-14天)',
    'MISALIGNED': '⚠️ 不对齐 (>14天)'
  }[level]
}

// 监听建议选择变化
watch(selectedSuggestion, () => {
  emitUpdate()
}, { deep: true })
</script>

<style scoped lang="scss">
.milestone-alignment-checker {
  .milestone-list {
    h4 {
      margin-bottom: 16px;
      color: #409eff;
    }
  }

  .milestone-item {
    margin-bottom: 24px;
    padding: 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    &.selected {
      border-color: #409eff;
      background: #ecf5ff;
    }

    .milestone-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .milestone-name {
        font-weight: bold;
        font-size: 16px;
      }
    }

    .milestone-info {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      color: #606266;
      font-size: 14px;
    }

    .alignment-status {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .recommendation {
        color: #909399;
      }
    }

    .suggestions {
      margin: 16px 0;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 4px;

      .suggestion-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-weight: bold;
      }

      .suggestion-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .el-radio {
          margin-right: 0;

          &.recommended {
            background: #f0f9ff;
            border-left: 3px solid #67c23a;
            padding-left: 12px;
          }
        }
      }

      .suggestion-content {
        .suggestion-details {
          display: flex;
          gap: 16px;
          margin-top: 4px;
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .milestone-checkbox {
      margin-top: 12px;
    }
  }

  .empty-state {
    padding: 40px 0;
    text-align: center;
  }
}
</style>
