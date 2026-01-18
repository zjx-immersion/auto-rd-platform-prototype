<template>
  <PageContainer>
    <PageHeader title="Epic分配工作台" description="将Epic分配到版本和PI，支持拖拽分配和容量管理">
      <template #actions>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" @click="handleSaveAllocation" :loading="saving">
          <el-icon><Check /></el-icon>
          保存分配
        </el-button>
      </template>
    </PageHeader>

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
      <!-- 左侧：待分配Epic -->
      <el-col :span="10">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>待分配Epic ({{ unallocatedEpics.length }})</span>
            </div>
          </template>

          <!-- 筛选栏 -->
          <el-row :gutter="8" style="margin-bottom: 16px;">
            <el-col :span="8">
              <el-select v-model="filterStatus" placeholder="状态" size="small" style="width: 100%;" clearable>
                <el-option label="草稿" value="draft" />
                <el-option label="待评审" value="pending-review" />
                <el-option label="已批准" value="approved" />
                <el-option label="进行中" value="in-progress" />
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

          <!-- Epic列表 -->
          <div class="epic-list">
            <div
              v-for="epic in filteredUnallocatedEpics"
              :key="epic.id"
              class="epic-card"
              draggable="true"
              @dragstart="handleDragStart($event, epic)"
              @dragend="handleDragEnd"
            >
              <div class="epic-header">
                <el-tag size="small" :type="getPriorityType(epic.priority)">
                  {{ epic.priority }}
                </el-tag>
                <span class="epic-code">{{ epic.code }}</span>
              </div>
              <div class="epic-title">{{ epic.name }}</div>
              <div class="epic-meta">
                <el-tag size="small" :type="getStatusType(epic.status)">{{ getStatusText(epic.status) }}</el-tag>
                <el-tag size="small" type="info">{{ getEpicFeatureCount(epic.id) }} Features</el-tag>
              </div>
            </div>
            <el-empty v-if="filteredUnallocatedEpics.length === 0" description="暂无待分配Epic" />
          </div>

          <!-- 批量操作 -->
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e4e7ed;">
            <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
            <el-button size="small" type="primary" style="margin-left: 16px;" @click="handleBatchAllocate">
              批量分配
            </el-button>
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
              <span>版本容量（Epic数量）</span>
              <span>{{ totalAllocatedEpics }} / {{ versionCapacity }} Epic ({{ capacityPercentage }}%)</span>
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
              容量超载！请调整Epic分配
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
                  <el-tag size="small">{{ getPIEpicCount(pi.id) }}个Epic</el-tag>
                  <el-tag size="small" type="info">{{ getPIFeatureCount(pi.id) }} Features</el-tag>
                </div>
              </div>

              <div class="pi-epics">
                <div
                  v-for="epic in getPIEpics(pi.id)"
                  :key="epic.id"
                  class="allocated-epic-card"
                  draggable="true"
                  @dragstart="handleDragStart($event, epic, pi.id)"
                >
                  <div class="epic-header">
                    <el-tag size="small" :type="getPriorityType(epic.priority)">
                      {{ epic.priority }}
                    </el-tag>
                    <span class="epic-code">{{ epic.code }}</span>
                    <el-button
                      link
                      size="small"
                      type="danger"
                      @click="unallocateEpic(epic.id, pi.id)"
                    >
                      移除
                    </el-button>
                  </div>
                  <div class="epic-title">{{ epic.name }}</div>
                  <div class="epic-meta">
                    <el-tag size="small" type="info">{{ getEpicFeatureCount(epic.id) }} Features</el-tag>
                  </div>
                </div>
                <el-empty v-if="getPIEpics(pi.id).length === 0" description="拖拽Epic到此处进行分配" />
              </div>
            </div>
          </div>
          <el-empty v-else description="该版本下没有PI，请先创建PI" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 批量分配对话框 -->
    <el-dialog v-model="batchAllocateDialogVisible" title="批量分配Epic" width="500px">
      <el-select v-model="batchTargetPI" placeholder="选择目标PI" style="width: 100%;">
        <el-option
          v-for="pi in pis"
          :key="pi.id"
          :label="pi.name"
          :value="pi.id"
        />
      </el-select>
      <template #footer>
        <el-button @click="batchAllocateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchAllocate">确认分配</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, Search } from '@element-plus/icons-vue'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'
import { useProjectStore } from '@/stores/modules/project'
import { useEpicStore } from '@/stores/modules/epic'
import { useFeatureStore } from '@/stores/modules/feature'
import { usePIStore } from '@/stores/modules/pi'
import { useVersionStore } from '@/stores/modules/version'
import { ElMessage } from 'element-plus'
import type { Epic, PI, Version } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()
const epicStore = useEpicStore()
const featureStore = useFeatureStore()
const piStore = usePIStore()
const versionStore = useVersionStore()

const loading = ref(false)
const saving = ref(false)
const selectedProjectId = ref('')
const selectedVersionId = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const searchKeyword = ref('')
const selectAll = ref(false)
const batchAllocateDialogVisible = ref(false)
const batchTargetPI = ref('')

const projects = computed(() => projectStore.projects)
const versions = computed(() => {
  if (!selectedProjectId.value) return []
  return versionStore.getVersionsByProject(selectedProjectId.value)
})
const selectedVersion = computed(() => {
  return versions.value.find(v => v.id === selectedVersionId.value)
})
const epics = computed(() => {
  if (!selectedProjectId.value) return []
  return epicStore.epics.filter(e => e.projectId === selectedProjectId.value)
})
const pis = computed(() => {
  if (!selectedVersionId.value) return []
  return piStore.pisByProject(selectedProjectId.value).filter(pi => pi.versionId === selectedVersionId.value)
})

// 分配映射：{ epicId: piId }
const allocationMap = ref<Record<string, string>>({})

// 选中的Epic IDs（用于批量操作）
const selectedEpicIds = ref<string[]>([])

const unallocatedEpics = computed(() => {
  return epics.value.filter(epic => !allocationMap.value[epic.id])
})

const filteredUnallocatedEpics = computed(() => {
  return unallocatedEpics.value.filter(epic => {
    if (filterStatus.value && epic.status !== filterStatus.value) return false
    if (filterPriority.value && epic.priority !== filterPriority.value) return false
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      return epic.name.toLowerCase().includes(keyword) || epic.code.toLowerCase().includes(keyword)
    }
    return true
  })
})

const versionCapacity = computed(() => {
  // 模拟版本容量
  return 20
})

const totalAllocatedEpics = computed(() => {
  return Object.keys(allocationMap.value).length
})

const capacityPercentage = computed(() => {
  if (versionCapacity.value === 0) return 0
  return Math.min(Math.round((totalAllocatedEpics.value / versionCapacity.value) * 100), 150)
})

const getPIEpics = (piId: string) => {
  const epicIds = Object.keys(allocationMap.value).filter(eid => allocationMap.value[eid] === piId)
  return epicIds.map(eid => epics.value.find(e => e.id === eid)).filter(Boolean) as Epic[]
}

const getPIEpicCount = (piId: string) => getPIEpics(piId).length

const getPIFeatureCount = (piId: string) => {
  const piEpics = getPIEpics(piId)
  return piEpics.reduce((sum, epic) => sum + getEpicFeatureCount(epic.id), 0)
}

const getEpicFeatureCount = (epicId: string) => {
  return featureStore.features.filter(f => f.epicId === epicId).length
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

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    draft: 'info',
    'pending-review': 'warning',
    approved: 'success',
    'in-progress': 'primary'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    'pending-review': '待评审',
    approved: '已批准',
    'in-progress': '进行中'
  }
  return map[status] || status
}

const getCapacityColor = (percentage: number) => {
  if (percentage < 70) return '#67c23a'
  if (percentage < 90) return '#e6a23c'
  return '#f56c6c'
}

// 拖拽相关
const draggedEpic = ref<Epic | null>(null)
const draggedFromPI = ref<string | null>(null)

const handleDragStart = (e: DragEvent, epic: Epic, fromPI?: string) => {
  draggedEpic.value = epic
  draggedFromPI.value = fromPI || null
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragEnd = () => {
  draggedEpic.value = null
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
  if (!draggedEpic.value) return

  // 检查是否已分配
  if (allocationMap.value[draggedEpic.value.id] === targetPI) {
    ElMessage.info('该Epic已分配到该PI')
    return
  }

  // 更新分配
  if (draggedFromPI.value) {
    // 从一个PI移到另一个PI
    delete allocationMap.value[draggedEpic.value.id]
  }
  allocationMap.value[draggedEpic.value.id] = targetPI

  const pi = pis.value.find(p => p.id === targetPI)
  ElMessage.success(`${draggedEpic.value.name} 已分配到 ${pi?.name || 'PI'}`)
}

const unallocateEpic = (epicId: string, piId: string) => {
  delete allocationMap.value[epicId]
  ElMessage.success('Epic已移除')
}

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedEpicIds.value = filteredUnallocatedEpics.value.map(e => e.id)
  } else {
    selectedEpicIds.value = []
  }
}

const handleBatchAllocate = () => {
  if (selectedEpicIds.value.length === 0) {
    ElMessage.warning('请先选择要分配的Epic')
    return
  }
  batchAllocateDialogVisible.value = true
}

const confirmBatchAllocate = () => {
  if (!batchTargetPI.value) {
    ElMessage.warning('请选择目标PI')
    return
  }

  selectedEpicIds.value.forEach(epicId => {
    allocationMap.value[epicId] = batchTargetPI.value
  })

  const pi = pis.value.find(p => p.id === batchTargetPI.value)
  ElMessage.success(`已批量分配 ${selectedEpicIds.value.length} 个Epic到 ${pi?.name || 'PI'}`)
  
  selectedEpicIds.value = []
  batchAllocateDialogVisible.value = false
  batchTargetPI.value = ''
}

const goBack = () => router.back()

const handleSaveAllocation = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('分配已保存')
  } finally {
    saving.value = false
  }
}

const loadProjectData = async () => {
  if (!selectedProjectId.value) return
  loading.value = true
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      epicStore.fetchEpics(),
      featureStore.fetchFeatures(),
      versionStore.fetchVersions(),
      piStore.fetchPIVersions()
    ])
  } finally {
    loading.value = false
  }
}

const loadVersionData = () => {
  // 加载版本相关的PI数据
}
</script>

<style scoped lang="scss">
.epic-list {
  max-height: 500px;
  overflow-y: auto;
}

.epic-card,
.allocated-epic-card {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: move;
  background-color: #fff;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  }

  .epic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .epic-code {
    font-size: 12px;
    color: #909399;
  }

  .epic-title {
    font-weight: 500;
    margin-bottom: 8px;
  }

  .epic-meta {
    display: flex;
    gap: 8px;
    font-size: 12px;
  }
}

.pi-allocation-area {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  min-height: 200px;

  .pi-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;

    .pi-name {
      font-weight: 500;
      font-size: 16px;
    }

    .pi-stats {
      display: flex;
      gap: 8px;
    }
  }

  .pi-epics {
    min-height: 150px;
  }
}

.allocated-epic-card {
  background-color: #fff;
  border-left: 3px solid #409eff;
}
</style>
