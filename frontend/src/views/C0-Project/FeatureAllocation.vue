<template>
  <PageContainer>
    <!-- Action Bar -->
    <div class="action-bar">
      <div class="left">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-tag size="large">Feature分配工作台</el-tag>
      </div>
      <div class="right">
        <el-button type="primary" @click="handleSaveAllocation" :loading="saving">
          <el-icon><Check /></el-icon>
          保存分配
        </el-button>
      </div>
    </div>

    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="12">
        <el-select v-model="selectedProjectId" placeholder="选择项目" style="width: 100%;" @change="loadProjectData">
          <el-option
            v-for="project in projects"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-select v-model="selectedVersionId" placeholder="选择版本" style="width: 100%;" @change="loadVersionData">
          <el-option
            v-for="version in versions"
            :key="version.id"
            :label="`${version.name} (${version.startDate} ~ ${version.endDate})`"
            :value="version.id"
          />
        </el-select>
      </el-col>
    </el-row>

    <el-row :gutter="16" v-loading="loading">
      <!-- 左侧：待分配Feature -->
      <el-col :span="10">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>待分配Feature ({{ unallocatedFeatures.length }})</span>
              <el-button size="small" @click="showFilterDialog = true">
                <el-icon><Filter /></el-icon>
                筛选
              </el-button>
            </div>
          </template>

          <!-- 筛选栏 -->
          <el-row :gutter="8" style="margin-bottom: 16px;">
            <el-col :span="8">
              <el-select v-model="filterEpic" placeholder="Epic" size="small" style="width: 100%;" clearable>
                <el-option
                  v-for="epic in epics"
                  :key="epic.id"
                  :label="epic.name"
                  :value="epic.id"
                />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-select v-model="filterPriority" placeholder="优先级" size="small" style="width: 100%;" clearable>
                <el-option label="P0" value="P0" />
                <el-option label="P1" value="P1" />
                <el-option label="P2" value="P2" />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-input v-model="searchKeyword" placeholder="搜索" size="small" clearable>
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
          </el-row>

          <!-- Feature列表 -->
          <div class="feature-list">
            <div
              v-for="feature in filteredUnallocatedFeatures"
              :key="feature.id"
              class="feature-card"
              draggable="true"
              @dragstart="handleDragStart($event, feature)"
              @dragend="handleDragEnd"
            >
              <div class="feature-header">
                <el-tag size="small" :type="getPriorityType(feature.priority)">
                  {{ feature.priority }}
                </el-tag>
                <span class="feature-code">{{ feature.code }}</span>
              </div>
              <div class="feature-title">{{ feature.name }}</div>
              <div class="feature-meta">
                <span>Epic: {{ getEpicName(feature.epicId) }}</span>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <el-tag size="small" type="warning">{{ feature.estimate || 0 }} SP</el-tag>
                  <el-button link size="small" @click.stop="handleEditWorkload(feature)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            <el-empty v-if="filteredUnallocatedFeatures.length === 0" description="暂无待分配Feature" />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：版本容量和PI分配 -->
      <el-col :span="14">
        <el-card>
          <template #header>
            <span>{{ selectedVersion?.name || '请选择版本' }}</span>
          </template>

          <!-- 版本容量 -->
          <div v-if="selectedVersion" style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>版本容量</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>{{ totalAllocatedSP }} / {{ versionCapacity }} SP ({{ capacityPercentage }}%)</span>
                <el-button size="small" link type="primary" @click="showCapacityDialog = true">
                  <el-icon><Setting /></el-icon>
                  设置容量
                </el-button>
              </div>
            </div>
            <el-progress
              :percentage="capacityPercentage"
              :color="getCapacityColor(capacityPercentage)"
              :status="capacityPercentage > 100 ? 'exception' : undefined"
            />
            <el-alert
              v-if="capacityPercentage > 100"
              type="error"
              :closable="false"
              style="margin-top: 8px;"
            >
              容量超载！请调整Feature分配
            </el-alert>
            <el-alert
              v-else-if="capacityPercentage > 90"
              type="warning"
              :closable="false"
              style="margin-top: 8px;"
            >
              容量使用率较高，建议预留缓冲
            </el-alert>
          </div>

          <!-- PI分配区域 -->
          <div v-if="pis.length > 0">
            <div
              v-for="pi in pis"
              :key="pi.id"
              class="pi-allocation-area"
              @dragover="handleDragOver"
              @drop="handleDrop($event, pi.id)"
            >
              <div class="pi-header">
                <span class="pi-name">{{ pi.name }}</span>
                <div class="pi-stats">
                  <el-tag size="small">{{ getPIFeatureCount(pi.id) }}个Feature</el-tag>
                  <el-tag size="small" type="warning">{{ getPITotalSP(pi.id) }} SP</el-tag>
                </div>
              </div>

              <div class="pi-features">
                <div
                  v-for="feature in getPIFeatures(pi.id)"
                  :key="feature.id"
                  class="allocated-feature-card"
                  draggable="true"
                  @dragstart="handleDragStart($event, feature, pi.id)"
                >
                  <div class="feature-header">
                    <el-tag size="small" :type="getPriorityType(feature.priority)">
                      {{ feature.priority }}
                    </el-tag>
                    <span class="feature-code">{{ feature.code }}</span>
                    <el-button
                      link
                      size="small"
                      type="danger"
                      @click="unallocateFeature(feature.id, pi.id)"
                    >
                      移除
                    </el-button>
                  </div>
                  <div class="feature-title">{{ feature.name }}</div>
                  <div class="feature-meta">
                    <el-tag size="small" type="warning">{{ feature.estimate || 0 }} SP</el-tag>
                  </div>
                </div>
                <el-empty v-if="getPIFeatures(pi.id).length === 0" description="拖拽Feature到此处进行分配" />
              </div>

              <!-- 依赖冲突警告 -->
              <el-alert
                v-if="hasConflicts(pi.id)"
                type="warning"
                :closable="false"
                style="margin-top: 8px;"
              >
                <template #title>
                  <div>存在依赖冲突：</div>
                  <ul style="margin: 4px 0 0 20px;">
                    <li v-for="conflict in getConflicts(pi.id)" :key="conflict.featureId">
                      {{ conflict.featureName }} 依赖 {{ conflict.dependencyName }}
                    </li>
                  </ul>
                </template>
              </el-alert>
            </div>
          </div>
          <el-empty v-else description="该版本暂无PI，请先创建PI" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 批量操作对话框 -->
    <el-dialog v-model="showBatchDialog" title="批量分配" width="500px">
      <el-form label-width="100px">
        <el-form-item label="选择PI">
          <el-select v-model="batchTargetPI" placeholder="请选择PI" style="width: 100%;">
            <el-option
              v-for="pi in pis"
              :key="pi.id"
              :label="pi.name"
              :value="pi.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择Feature">
          <el-checkbox-group v-model="batchSelectedFeatures">
            <el-checkbox v-for="feature in unallocatedFeatures" :key="feature.id" :label="feature.id">
              {{ feature.code }} - {{ feature.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchDialog = false">取消</el-button>
        <el-button type="primary" @click="handleBatchAllocate">确定分配</el-button>
      </template>
    </el-dialog>

    <!-- 容量设置对话框 -->
    <el-dialog v-model="showCapacityDialog" title="设置版本容量" width="500px">
      <el-form label-width="120px">
        <el-form-item label="版本名称">
          <el-input :value="selectedVersion?.name" disabled />
        </el-form-item>
        <el-form-item label="容量(SP)">
          <el-input-number
            v-model="capacityInput"
            :min="0"
            :max="10000"
            :step="10"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="当前已分配">
          <span>{{ totalAllocatedSP }} SP</span>
        </el-form-item>
        <el-form-item label="剩余容量">
          <span :style="{ color: (capacityInput - totalAllocatedSP) < 0 ? '#f56c6c' : '#67c23a' }">
            {{ capacityInput - totalAllocatedSP }} SP
          </span>
        </el-form-item>
        <el-alert
          v-if="capacityInput < totalAllocatedSP"
          type="warning"
          :closable="false"
          style="margin-bottom: 16px;"
        >
          警告：设置的容量小于已分配的工作量，可能导致超载
        </el-alert>
        <el-form-item label="建议容量">
          <el-tag>{{ suggestedCapacity }} SP</el-tag>
          <span style="margin-left: 8px; font-size: 12px; color: #909399;">
            基于已分配Feature + 20%缓冲
          </span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCapacityDialog = false">取消</el-button>
        <el-button @click="capacityInput = suggestedCapacity">采用建议值</el-button>
        <el-button type="primary" @click="handleSaveCapacity">确定</el-button>
      </template>
    </el-dialog>

    <!-- Feature工作量编辑对话框 -->
    <el-dialog v-model="showWorkloadDialog" title="编辑工作量估算" width="500px">
      <el-form v-if="editingFeature" label-width="120px">
        <el-form-item label="Feature">
          <el-input :value="`${editingFeature.code} - ${editingFeature.name}`" disabled />
        </el-form-item>
        <el-form-item label="工作量(SP)">
          <el-input-number
            v-model="workloadInput"
            :min="0"
            :max="1000"
            :step="1"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="复杂度">
          <el-radio-group v-model="complexityInput">
            <el-radio label="low">低</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="high">高</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="建议工作量">
          <el-tag>{{ getEstimatedWorkload(complexityInput) }} SP</el-tag>
          <span style="margin-left: 8px; font-size: 12px; color: #909399;">
            基于复杂度的参考值
          </span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showWorkloadDialog = false">取消</el-button>
        <el-button @click="workloadInput = getEstimatedWorkload(complexityInput)">采用建议值</el-button>
        <el-button type="primary" @click="handleSaveWorkload">确定</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, Filter, Search, Setting, Edit } from '@element-plus/icons-vue'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'
import { useProjectStore } from '@/stores/modules/project'
import { useFeatureStore } from '@/stores/modules/feature'
import { useEpicStore } from '@/stores/modules/epic'
import type { Feature, PI } from '@/types'
import { ElMessage } from 'element-plus'

import { useVersionStore } from '@/stores/modules/version'
import { usePIStore } from '@/stores/modules/pi'

const router = useRouter()
const projectStore = useProjectStore()
const featureStore = useFeatureStore()
const epicStore = useEpicStore()
const versionStore = useVersionStore()
const piStore = usePIStore()

const loading = ref(false)
const saving = ref(false)
const selectedProjectId = ref('')
const selectedVersionId = ref('')
const filterEpic = ref('')
const filterPriority = ref('')
const searchKeyword = ref('')
const showFilterDialog = ref(false)
const showBatchDialog = ref(false)
const showCapacityDialog = ref(false)
const showWorkloadDialog = ref(false)
const batchTargetPI = ref('')
const batchSelectedFeatures = ref<string[]>([])
const capacityInput = ref(300)
const workloadInput = ref(0)
const complexityInput = ref<'low' | 'medium' | 'high'>('medium')
const editingFeature = ref<Feature | null>(null)

const versionCapacity = computed(() => {
  if (!selectedVersionId.value) return 300
  return versionStore.getVersionCapacity(selectedVersionId.value)
})

const suggestedCapacity = computed(() => {
  return Math.ceil(totalAllocatedSP.value * 1.2) // 已分配 + 20%缓冲
})

const projects = computed(() => projectStore.projects)
const versions = computed(() => {
  if (!selectedProjectId.value) return []
  return projectStore.getVersionsByProject(selectedProjectId.value) || []
})
const selectedVersion = computed(() => versions.value.find(v => v.id === selectedVersionId.value))
const pis = computed(() => selectedVersion.value?.pis || [])
const epics = computed(() => epicStore.epics)

// Feature分配状态
const allocationMap = ref<Record<string, string>>({}) // featureId -> piId

const unallocatedFeatures = computed(() => {
  return featureStore.features.filter(f => !allocationMap.value[f.id])
})

const filteredUnallocatedFeatures = computed(() => {
  return unallocatedFeatures.value.filter(f => {
    if (filterEpic.value && f.epicId !== filterEpic.value) return false
    if (filterPriority.value && f.priority !== filterPriority.value) return false
    if (searchKeyword.value && !f.name.toLowerCase().includes(searchKeyword.value.toLowerCase())) return false
    return true
  })
})

const totalAllocatedSP = computed(() => {
  return Object.keys(allocationMap.value).reduce((sum, featureId) => {
    const feature = featureStore.features.find(f => f.id === featureId)
    return sum + (feature?.estimate || 0)
  }, 0)
})

const capacityPercentage = computed(() => {
  if (versionCapacity.value === 0) return 0
  return Math.min(Math.round((totalAllocatedSP.value / versionCapacity.value) * 100), 150)
})

const getPIFeatures = (piId: string) => {
  const featureIds = Object.keys(allocationMap.value).filter(fid => allocationMap.value[fid] === piId)
  return featureIds.map(fid => featureStore.features.find(f => f.id === fid)).filter(Boolean) as Feature[]
}

const getPIFeatureCount = (piId: string) => getPIFeatures(piId).length

const getPITotalSP = (piId: string) => {
  return getPIFeatures(piId).reduce((sum, f) => sum + (f.estimate || 0), 0)
}

const getEpicName = (epicId: string) => {
  const epic = epics.value.find(e => e.id === epicId)
  return epic?.name || epicId
}

const getPriorityType = (priority: string) => {
  const map: Record<string, any> = {
    P0: 'danger',
    P1: 'warning',
    P2: 'info',
    P3: 'success'
  }
  return map[priority] || 'info'
}

const getCapacityColor = (percentage: number) => {
  if (percentage < 70) return '#67c23a'
  if (percentage < 90) return '#e6a23c'
  return '#f56c6c'
}

// 拖拽相关
const draggedFeature = ref<Feature | null>(null)
const draggedFromPI = ref<string | null>(null)

const handleDragStart = (e: DragEvent, feature: Feature, fromPI?: string) => {
  draggedFeature.value = feature
  draggedFromPI.value = fromPI || null
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragEnd = () => {
  draggedFeature.value = null
  draggedFromPI.value = null
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

const handleDrop = (e: DragEvent, targetPI: string) => {
  e.preventDefault()
  if (!draggedFeature.value) return
  
  // 检查冲突
  const conflicts = checkConflicts(draggedFeature.value, targetPI)
  if (conflicts.length > 0) {
    ElMessage.warning(`存在依赖冲突：${conflicts.map(c => c.dependencyName).join(', ')}`)
    // 仍然允许分配，只是警告
  }
  
  // 更新分配
  if (draggedFromPI.value) {
    // 从一个PI移到另一个PI
    delete allocationMap.value[draggedFeature.value.id]
  }
  allocationMap.value[draggedFeature.value.id] = targetPI
  
  ElMessage.success(`${draggedFeature.value.name} 已分配到 ${pis.value.find(p => p.id === targetPI)?.name}`)
}

const unallocateFeature = (featureId: string, piId: string) => {
  delete allocationMap.value[featureId]
  ElMessage.success('Feature已移除')
}

const checkConflicts = (feature: Feature, targetPI: string) => {
  const conflicts: Array<{ featureId: string; featureName: string; dependencyId: string; dependencyName: string }> = []
  
  // 模拟依赖检查
  // 实际应该从feature.dependencies中获取依赖并检查
  
  return conflicts
}

const hasConflicts = (piId: string) => {
  return getConflicts(piId).length > 0
}

const getConflicts = (piId: string) => {
  const features = getPIFeatures(piId)
  const conflicts: Array<{ featureId: string; featureName: string; dependencyName: string }> = []
  
  // 简化的冲突检测逻辑
  // 实际应该检查Feature的依赖关系
  
  return conflicts
}

const handleBatchAllocate = () => {
  if (!batchTargetPI.value) {
    ElMessage.warning('请选择目标PI')
    return
  }
  if (batchSelectedFeatures.value.length === 0) {
    ElMessage.warning('请选择Feature')
    return
  }
  
  batchSelectedFeatures.value.forEach(featureId => {
    allocationMap.value[featureId] = batchTargetPI.value
  })
  
  ElMessage.success(`已批量分配 ${batchSelectedFeatures.value.length} 个Feature`)
  showBatchDialog.value = false
  batchSelectedFeatures.value = []
}

const handleSaveAllocation = async () => {
  saving.value = true
  try {
    // 保存分配结果到Version Store
    const success = await versionStore.saveFeatureAllocation(selectedVersionId.value, allocationMap.value)
    
    if (success) {
      // 更新Feature的targetPI和targetVersion
      for (const [featureId, piId] of Object.entries(allocationMap.value)) {
        await featureStore.updateFeature(featureId, {
          targetPI: piId,
          targetVersion: selectedVersionId.value
        })
      }
      
      ElMessage.success('Feature分配已保存')
    } else {
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

const loadProjectData = async () => {
  selectedVersionId.value = ''
  allocationMap.value = {}
}

const loadVersionData = async () => {
  // 加载已有的分配数据
  if (selectedVersionId.value) {
    allocationMap.value = versionStore.getFeatureAllocation(selectedVersionId.value)
    capacityInput.value = versionStore.getVersionCapacity(selectedVersionId.value)
  } else {
    allocationMap.value = {}
    capacityInput.value = 300
  }
}

const handleSaveCapacity = async () => {
  if (!selectedVersionId.value) return
  
  await versionStore.setVersionCapacity(selectedVersionId.value, capacityInput.value)
  showCapacityDialog.value = false
  ElMessage.success('容量设置已保存')
}

const handleEditWorkload = (feature: Feature) => {
  editingFeature.value = feature
  workloadInput.value = feature.estimate || 0
  complexityInput.value = feature.complexity || 'medium'
  showWorkloadDialog.value = true
}

const handleSaveWorkload = async () => {
  if (!editingFeature.value) return
  
  await featureStore.updateFeature(editingFeature.value.id, {
    estimate: workloadInput.value,
    complexity: complexityInput.value,
    storyPoints: workloadInput.value
  })
  
  showWorkloadDialog.value = false
  editingFeature.value = null
  ElMessage.success('工作量已更新')
}

const getEstimatedWorkload = (complexity: 'low' | 'medium' | 'high'): number => {
  const map = { low: 5, medium: 13, high: 34 }
  return map[complexity] || 13
}

const goBack = () => router.back()

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      featureStore.fetchFeatures(),
      epicStore.fetchEpics()
    ])
    
    // 默认选择第一个项目
    if (projects.value.length > 0) {
      selectedProjectId.value = projects.value[0].id
      if (versions.value.length > 0) {
        selectedVersionId.value = versions.value[0].id
      }
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.feature-list {
  max-height: 600px;
  overflow-y: auto;
}

.feature-card {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  cursor: move;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .feature-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .feature-code {
      font-weight: 500;
      color: #606266;
    }
  }
  
  .feature-title {
    font-size: 14px;
    margin-bottom: 8px;
    color: #303133;
  }
  
  .feature-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #909399;
  }
}

.pi-allocation-area {
  margin-bottom: 16px;
  padding: 16px;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  min-height: 150px;
  
  &:hover {
    border-color: #409eff;
    background-color: #f0f9ff;
  }
  
  .pi-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
    
    .pi-name {
      font-weight: 600;
      font-size: 16px;
      color: #303133;
    }
    
    .pi-stats {
      display: flex;
      gap: 8px;
    }
  }
  
  .pi-features {
    min-height: 100px;
  }
}

.allocated-feature-card {
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  background-color: #ecf5ff;
  cursor: move;
  
  .feature-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    
    .feature-code {
      flex: 1;
      font-weight: 500;
      color: #606266;
    }
  }
  
  .feature-title {
    font-size: 13px;
    margin-bottom: 6px;
    color: #303133;
  }
  
  .feature-meta {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
