<!-- VersionPlanningV2.vue - 版本规划V2（完成度管理）⭐⭐⭐⭐⭐ -->
<template>
  <div class="version-planning-v2-container">
    <PageContainer>
      <!-- 页面头部 -->
      <template #header>
        <div class="page-header">
          <div class="header-left">
            <h2 class="page-title">版本 {{ versionData?.name || 'V1.0' }} 规划</h2>
            <p class="page-subtitle">{{ projectName }} - {{ versionData?.description || '工程样车交付版本' }}</p>
          </div>
          <div class="header-right">
            <el-button @click="handleSaveDraft">保存草稿</el-button>
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSave">保存</el-button>
          </div>
        </div>
      </template>

      <!-- 主体内容 -->
      <div class="main-content">
        <el-row :gutter="24">
          <!-- 左侧信息面板 -->
          <el-col :span="6">
            <el-card class="info-panel" shadow="never">
              <!-- 版本基本信息 -->
              <div class="info-section">
                <h4>版本基本信息</h4>
                <el-descriptions :column="1" border size="small">
                  <el-descriptions-item label="版本号">
                    {{ versionData?.name || 'V1.0' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="版本类型">
                    {{ versionData?.type || '功能版本' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="关联里程碑">
                    {{ versionData?.milestone || '工程样车' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="目标日期">
                    {{ versionData?.targetDate || '2025-06-30' }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>

              <!-- 版本统计 -->
              <div class="info-section">
                <h4>版本统计 ⭐</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-label">Epic数量</div>
                    <div class="stat-value">{{ epicList.length }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">总Story Points</div>
                    <div class="stat-value">{{ totalSP }} SP</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">目标SP</div>
                    <div class="stat-value">{{ targetSP }} SP</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">完成度</div>
                    <div class="stat-value">{{ overallCompletion }}%</div>
                  </div>
                </div>

                <!-- 进度条 -->
                <el-progress 
                  :percentage="overallCompletion" 
                  :color="getProgressColor(overallCompletion)"
                  style="margin-top: 12px"
                />
              </div>

              <!-- 完成度验证 ⭐ -->
              <div class="info-section">
                <h4>完成度验证 ⭐</h4>
                <el-alert
                  :type="validationResult.isValid ? 'success' : 'warning'"
                  :closable="false"
                  :title="validationResult.message"
                  show-icon
                >
                  <template v-if="!validationResult.isValid && validationResult.details">
                    <div class="validation-details">
                      <div v-for="(detail, index) in validationResult.details" :key="index">
                        {{ detail }}
                      </div>
                    </div>
                  </template>
                </el-alert>
              </div>
            </el-card>
          </el-col>

          <!-- 右侧主工作区 -->
          <el-col :span="18">
            <el-card class="work-area" shadow="never">
              <div class="epic-list-header">
                <h3>Epic完成度设置 ⭐⭐⭐⭐⭐</h3>
                <el-button type="primary" :icon="Plus" @click="handleAddEpic">
                  添加Epic
                </el-button>
              </div>

              <!-- Epic列表 -->
              <div v-if="epicList.length > 0" class="epic-list">
                <div
                  v-for="(epic, index) in epicList"
                  :key="epic.id"
                  class="epic-item"
                >
                  <!-- Epic完成度设置器组件 ⭐⭐⭐⭐⭐ -->
                  <EpicCompletionSetter
                    :epic="epic"
                    :version-id="versionId"
                    @update="handleEpicCompletionUpdate"
                    @feature-detail="handleFeatureDetail"
                  />

                  <!-- Epic操作 -->
                  <div class="epic-actions">
                    <el-button
                      size="small"
                      :icon="Edit"
                      @click="handleEditEpic(epic)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      :icon="Delete"
                      @click="handleDeleteEpic(epic, index)"
                    >
                      移除
                    </el-button>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <el-empty
                v-else
                description="暂无Epic，请点击添加Epic按钮"
                :image-size="200"
              />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </PageContainer>

    <!-- Feature精细化设置对话框 ⭐⭐⭐⭐⭐ -->
    <FeatureCompletionDialog
      v-model="featureDialogVisible"
      :epic="currentEpic"
      :features="currentFeatures"
      @update="handleFeatureCompletionUpdate"
    />

    <!-- 添加Epic对话框 -->
    <el-dialog
      v-model="addEpicDialogVisible"
      title="添加Epic到版本"
      width="600px"
    >
      <el-form :model="addEpicForm" label-width="120px">
        <el-form-item label="选择Epic">
          <el-select
            v-model="addEpicForm.epicId"
            placeholder="请选择Epic"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="epic in availableEpics"
              :key="epic.id"
              :label="`${epic.code} - ${epic.name}`"
              :value="epic.id"
            >
              <span>{{ epic.code }} - {{ epic.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ epic.storyPoints }} SP
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="初始完成度">
          <el-slider
            v-model="addEpicForm.initialCompletion"
            :min="0"
            :max="100"
            :step="5"
            :marks="completionMarks"
            show-stops
          />
          <div class="completion-hint">
            当前设置: <strong>{{ addEpicForm.initialCompletion }}%</strong>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addEpicDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddEpic">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import PageContainer from '@/components/Common/PageContainer.vue'
import EpicCompletionSetter from '@/components/DomainProject/EpicCompletionSetter.vue'
import FeatureCompletionDialog from '@/components/DomainProject/FeatureCompletionDialog.vue'
import { useVersionStore } from '@/stores/modules/version'

const router = useRouter()
const route = useRoute()
const versionStore = useVersionStore()

// ============================================================================
// State
// ============================================================================

const versionId = ref(route.params.id as string || 'version-001')
const versionData = ref<any>(null)
const projectName = ref('岚图H56智能驾驶系统研发')

// Epic列表
const epicList = ref<any[]>([
  {
    id: 'epic-001',
    code: 'EPIC-AD-001',
    name: 'L2+自动驾驶',
    description: '高速公路和城市快速路自动驾驶',
    storyPoints: 100,
    completionTarget: 80,
    targetSP: 80,
    features: [
      { id: 'f1', name: 'AEB自动紧急制动', storyPoints: 30, completionTarget: 100 },
      { id: 'f2', name: 'ACC自适应巡航', storyPoints: 40, completionTarget: 100 },
      { id: 'f3', name: 'LKA车道保持', storyPoints: 30, completionTarget: 33 }
    ]
  },
  {
    id: 'epic-002',
    code: 'EPIC-HMI-001',
    name: '智能座舱HMI',
    description: '驾驶员人机交互界面',
    storyPoints: 80,
    completionTarget: 60,
    targetSP: 48,
    features: [
      { id: 'f4', name: 'HMI基础界面', storyPoints: 40, completionTarget: 100 },
      { id: 'f5', name: '语音交互', storyPoints: 40, completionTarget: 20 }
    ]
  }
])

// 可用Epic列表（用于添加）
const availableEpics = ref([
  { id: 'epic-003', code: 'EPIC-NAV-001', name: '智能导航', storyPoints: 60 },
  { id: 'epic-004', code: 'EPIC-APA-001', name: '自动泊车', storyPoints: 50 }
])

// Feature对话框
const featureDialogVisible = ref(false)
const currentEpic = ref<any>(null)
const currentFeatures = ref<any[]>([])

// 添加Epic对话框
const addEpicDialogVisible = ref(false)
const addEpicForm = ref({
  epicId: '',
  initialCompletion: 80
})

const completionMarks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%'
}

// ============================================================================
// Computed
// ============================================================================

// 总SP
const totalSP = computed(() => {
  return epicList.value.reduce((sum, epic) => sum + epic.storyPoints, 0)
})

// 目标SP
const targetSP = computed(() => {
  return epicList.value.reduce((sum, epic) => sum + (epic.targetSP || 0), 0)
})

// 整体完成度
const overallCompletion = computed(() => {
  if (totalSP.value === 0) return 0
  return Math.round((targetSP.value / totalSP.value) * 100)
})

// 完成度验证 ⭐
const validationResult = computed(() => {
  const results: string[] = []
  let isValid = true

  epicList.value.forEach(epic => {
    // 验证Epic完成度 = Feature完成度加权平均
    const calculatedCompletion = versionStore.calculateEpicCompletion(
      epic.id,
      epic.features || []
    )

    const diff = Math.abs(calculatedCompletion - (epic.completionTarget || 0))
    if (diff > 1) {
      isValid = false
      results.push(
        `${epic.code}: Feature完成度(${calculatedCompletion}%) ≠ Epic目标(${epic.completionTarget}%)`
      )
    }
  })

  if (isValid) {
    return {
      isValid: true,
      message: '✓ 完成度验证通过',
      details: []
    }
  } else {
    return {
      isValid: false,
      message: '⚠️ 完成度不一致，请调整',
      details: results
    }
  }
})

// ============================================================================
// Methods
// ============================================================================

// 进度条颜色
function getProgressColor(percentage: number) {
  if (percentage < 50) return '#f56c6c'
  if (percentage < 80) return '#e6a23c'
  return '#67c23a'
}

// Epic完成度更新 ⭐
function handleEpicCompletionUpdate(epicId: string, completionTarget: number) {
  const epic = epicList.value.find(e => e.id === epicId)
  if (epic) {
    epic.completionTarget = completionTarget
    epic.targetSP = Math.round(epic.storyPoints * (completionTarget / 100))

    // 调用Store方法
    versionStore.updateEpicCompletion(versionId.value, epicId, completionTarget)

    ElMessage.success(`Epic完成度已更新为 ${completionTarget}%`)
  }
}

// Feature精细化设置 ⭐⭐⭐⭐⭐
function handleFeatureDetail(epic: any) {
  currentEpic.value = epic
  currentFeatures.value = epic.features || []
  featureDialogVisible.value = true
}

// Feature完成度更新 ⭐
function handleFeatureCompletionUpdate(epicId: string, features: any[]) {
  const epic = epicList.value.find(e => e.id === epicId)
  if (epic) {
    epic.features = features

    // 重新计算Epic完成度
    const calculatedCompletion = versionStore.calculateEpicCompletion(epicId, features)
    epic.completionTarget = calculatedCompletion
    epic.targetSP = Math.round(epic.storyPoints * (calculatedCompletion / 100))

    // 调用Store方法
    versionStore.updateFeatureCompletions(versionId.value, epicId, features)

    ElMessage.success('Feature完成度已更新')
  }
}

// 添加Epic
function handleAddEpic() {
  addEpicDialogVisible.value = true
  addEpicForm.value = {
    epicId: '',
    initialCompletion: 80
  }
}

// 确认添加Epic
function handleConfirmAddEpic() {
  if (!addEpicForm.value.epicId) {
    ElMessage.warning('请选择Epic')
    return
  }

  const selectedEpic = availableEpics.value.find(e => e.id === addEpicForm.value.epicId)
  if (selectedEpic) {
    const newEpic = {
      ...selectedEpic,
      completionTarget: addEpicForm.value.initialCompletion,
      targetSP: Math.round(selectedEpic.storyPoints * (addEpicForm.value.initialCompletion / 100)),
      features: []
    }

    epicList.value.push(newEpic)

    // 从可用列表中移除
    const index = availableEpics.value.findIndex(e => e.id === selectedEpic.id)
    if (index > -1) {
      availableEpics.value.splice(index, 1)
    }

    addEpicDialogVisible.value = false
    ElMessage.success(`已添加Epic: ${selectedEpic.name}`)
  }
}

// 编辑Epic
function handleEditEpic(epic: any) {
  ElMessage.info(`编辑Epic: ${epic.name}`)
}

// 删除Epic
function handleDeleteEpic(epic: any, index: number) {
  ElMessageBox.confirm(
    `确定要从版本中移除 "${epic.name}" 吗？`,
    '确认移除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    epicList.value.splice(index, 1)

    // 加回可用列表
    availableEpics.value.push({
      id: epic.id,
      code: epic.code,
      name: epic.name,
      storyPoints: epic.storyPoints
    })

    ElMessage.success('已移除Epic')
  }).catch(() => {
    // 取消
  })
}

// 保存草稿
function handleSaveDraft() {
  ElMessage.success('草稿已保存')
}

// 取消
function handleCancel() {
  ElMessageBox.confirm(
    '确定要取消吗？未保存的更改将丢失。',
    '确认取消',
    {
      confirmButtonText: '确定',
      cancelButtonText: '返回',
      type: 'warning'
    }
  ).then(() => {
    router.back()
  }).catch(() => {
    // 取消
  })
}

// 保存
function handleSave() {
  // 验证完成度
  if (!validationResult.value.isValid) {
    ElMessageBox.confirm(
      '完成度验证未通过，是否仍要保存？',
      '确认保存',
      {
        confirmButtonText: '仍要保存',
        cancelButtonText: '返回修改',
        type: 'warning'
      }
    ).then(() => {
      doSave()
    }).catch(() => {
      // 取消
    })
  } else {
    doSave()
  }
}

function doSave() {
  // TODO: 调用API保存
  console.log('保存版本规划:', {
    versionId: versionId.value,
    epics: epicList.value,
    totalSP: totalSP.value,
    targetSP: targetSP.value,
    overallCompletion: overallCompletion.value
  })

  ElMessage.success('版本规划已保存')
  setTimeout(() => {
    router.push('/function/c0-project/version/list')
  }, 1000)
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  // TODO: 加载版本数据
  console.log('加载版本规划页面, versionId:', versionId.value)
})
</script>

<style scoped lang="scss">
.version-planning-v2-container {
  min-height: 100vh;
  background: #f5f7fa;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: white;
    border-bottom: 1px solid #e4e7ed;

    .header-left {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }

      .page-subtitle {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .main-content {
    padding: 24px;
  }

  // 左侧信息面板
  .info-panel {
    .info-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: bold;
        color: #303133;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;

        .stat-item {
          padding: 12px;
          background: #f5f7fa;
          border-radius: 4px;
          text-align: center;

          .stat-label {
            margin-bottom: 4px;
            font-size: 12px;
            color: #909399;
          }

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #409eff;
          }
        }
      }

      .validation-details {
        margin-top: 8px;
        padding-left: 16px;
        font-size: 13px;
        line-height: 1.8;
      }
    }
  }

  // 右侧工作区
  .work-area {
    min-height: 600px;

    .epic-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
        color: #303133;
      }
    }

    .epic-list {
      .epic-item {
        margin-bottom: 24px;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .epic-actions {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
      }
    }
  }

  .completion-hint {
    margin-top: 8px;
    text-align: center;
    font-size: 14px;
    color: #606266;

    strong {
      color: #409eff;
      font-size: 16px;
    }
  }
}
</style>
