<template>
  <el-dialog
    v-model="visible"
    title="依赖冲突检测结果"
    width="900px"
    :close-on-click-modal="false"
  >
    <div v-if="result">
      <!-- 统计信息 -->
      <el-alert
        :type="result.valid ? 'success' : 'error'"
        :title="result.valid ? '未发现严重冲突' : `发现 ${errorCount} 个严重冲突`"
        :description="`共检测 ${result.statistics.totalDependencies} 个依赖关系`"
        show-icon
        style="margin-bottom: 16px;"
      />

      <!-- 统计卡片 -->
      <el-row :gutter="12" style="margin-bottom: 16px;">
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="循环依赖" :value="result.statistics.circularDependencies">
              <template #suffix>
                <el-icon color="#f56c6c"><CircleClose /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="缺失依赖" :value="result.statistics.missingDependencies">
              <template #suffix>
                <el-icon color="#e6a23c"><Warning /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="时间冲突" :value="result.statistics.timingConflicts">
              <template #suffix>
                <el-icon color="#409eff"><Clock /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="跨团队依赖" :value="result.statistics.crossTeamDependencies">
              <template #suffix>
                <el-icon color="#909399"><Connection /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>

      <!-- 冲突列表 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部冲突" name="all">
          <div v-if="result.conflicts.length === 0" style="text-align: center; padding: 40px;">
            <el-result icon="success" title="太棒了！" sub-title="未发现任何冲突" />
          </div>
          <div v-else style="max-height: 400px; overflow-y: auto;">
            <div
              v-for="conflict in result.conflicts"
              :key="conflict.id"
              class="conflict-item"
              :class="`conflict-${conflict.severity}`"
            >
              <div class="conflict-header">
                <div>
                  <el-tag :type="getSeverityType(conflict.severity)" size="small">
                    {{ getSeverityText(conflict.severity) }}
                  </el-tag>
                  <el-tag :type="getConflictTypeTag(conflict.type)" size="small" style="margin-left: 8px;">
                    {{ getConflictTypeText(conflict.type) }}
                  </el-tag>
                </div>
              </div>
              <div class="conflict-content">
                <el-text tag="b">{{ conflict.message }}</el-text>
                <div style="margin-top: 8px;">
                  <el-text size="small">来源: {{ conflict.source.code }} - {{ conflict.source.title }}</el-text>
                  <el-text v-if="conflict.target" size="small" style="margin-left: 16px;">
                    目标: {{ conflict.target.code }} - {{ conflict.target.title }}
                  </el-text>
                </div>
                <div v-if="conflict.suggestion" class="conflict-suggestion">
                  <el-icon><InfoFilled /></el-icon>
                  <el-text size="small">{{ conflict.suggestion }}</el-text>
                </div>
                <div v-if="conflict.affectedItems && conflict.affectedItems.length > 0" class="affected-items">
                  <el-text size="small" type="info">影响的项:</el-text>
                  <el-tag
                    v-for="item in conflict.affectedItems"
                    :key="item.id"
                    size="small"
                    style="margin-left: 4px;"
                  >
                    {{ item.code }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="`错误 (${errorConflicts.length})`" name="error">
          <div v-if="errorConflicts.length === 0" style="text-align: center; padding: 40px;">
            <el-result icon="success" title="无错误" sub-title="未发现严重错误" />
          </div>
          <div v-else style="max-height: 400px; overflow-y: auto;">
            <div
              v-for="conflict in errorConflicts"
              :key="conflict.id"
              class="conflict-item conflict-error"
            >
              <div class="conflict-header">
                <el-tag type="danger" size="small">错误</el-tag>
                <el-tag :type="getConflictTypeTag(conflict.type)" size="small" style="margin-left: 8px;">
                  {{ getConflictTypeText(conflict.type) }}
                </el-tag>
              </div>
              <div class="conflict-content">
                <el-text tag="b">{{ conflict.message }}</el-text>
                <div v-if="conflict.suggestion" class="conflict-suggestion">
                  <el-icon><InfoFilled /></el-icon>
                  <el-text size="small">{{ conflict.suggestion }}</el-text>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="`警告 (${warningConflicts.length})`" name="warning">
          <div v-if="warningConflicts.length === 0" style="text-align: center; padding: 40px;">
            <el-result icon="success" title="无警告" />
          </div>
          <div v-else style="max-height: 400px; overflow-y: auto;">
            <div
              v-for="conflict in warningConflicts"
              :key="conflict.id"
              class="conflict-item conflict-warning"
            >
              <div class="conflict-header">
                <el-tag type="warning" size="small">警告</el-tag>
                <el-tag :type="getConflictTypeTag(conflict.type)" size="small" style="margin-left: 8px;">
                  {{ getConflictTypeText(conflict.type) }}
                </el-tag>
              </div>
              <div class="conflict-content">
                <el-text tag="b">{{ conflict.message }}</el-text>
                <div v-if="conflict.suggestion" class="conflict-suggestion">
                  <el-icon><InfoFilled /></el-icon>
                  <el-text size="small">{{ conflict.suggestion }}</el-text>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleExport">导出报告</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CircleClose, Warning, Clock, Connection, InfoFilled } from '@element-plus/icons-vue'
import type { DependencyCheckResult, DependencyConflict } from '@/utils/dependency-checker'

// Props
interface Props {
  modelValue: boolean
  result: DependencyCheckResult | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'export'): void
}>()

// State
const activeTab = ref('all')

// Computed
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const errorConflicts = computed(() => {
  return props.result?.conflicts.filter(c => c.severity === 'error') || []
})

const warningConflicts = computed(() => {
  return props.result?.conflicts.filter(c => c.severity === 'warning') || []
})

const errorCount = computed(() => errorConflicts.value.length)

// Methods
function getSeverityType(severity: string): 'danger' | 'warning' | 'info' {
  const map: Record<string, 'danger' | 'warning' | 'info'> = {
    'error': 'danger',
    'warning': 'warning',
    'info': 'info'
  }
  return map[severity] || 'info'
}

function getSeverityText(severity: string): string {
  const map: Record<string, string> = {
    'error': '错误',
    'warning': '警告',
    'info': '提示'
  }
  return map[severity] || severity
}

function getConflictTypeTag(type: string): 'danger' | 'warning' | 'info' | '' {
  const map: Record<string, 'danger' | 'warning' | 'info' | ''> = {
    'circular': 'danger',
    'missing': 'danger',
    'timing': 'warning',
    'cross-team': 'info'
  }
  return map[type] || 'info'
}

function getConflictTypeText(type: string): string {
  const map: Record<string, string> = {
    'circular': '循环依赖',
    'missing': '缺失依赖',
    'timing': '时间冲突',
    'cross-team': '跨团队依赖'
  }
  return map[type] || type
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleExport() {
  emit('export')
}
</script>

<style scoped>
.conflict-item {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.conflict-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.conflict-error {
  background-color: #fef0f0;
  border-color: #f56c6c;
}

.conflict-warning {
  background-color: #fdf6ec;
  border-color: #e6a23c;
}

.conflict-info {
  background-color: #f4f4f5;
  border-color: #909399;
}

.conflict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.conflict-content {
  line-height: 1.8;
}

.conflict-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 8px;
  background-color: #f0f9ff;
  border-left: 3px solid #409eff;
  border-radius: 4px;
}

.affected-items {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
