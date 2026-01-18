<template>
  <PageContainer>
    <PageHeader title="PI版本规划工作台" description="多项目时间线视图，Epic/Feature分配到版本/PI">
      <template #actions>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleSave">
          <el-icon><Check /></el-icon>
          保存规划
        </el-button>
      </template>
    </PageHeader>

    <el-row :gutter="16" v-loading="loading">
      <!-- 左侧：项目列表和Epic/Feature列表 -->
      <el-col :span="6">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>项目与需求</span>
              <el-select v-model="selectedProjectId" placeholder="选择项目" size="small" style="width: 150px;" @change="loadProjectData">
                <el-option
                  v-for="project in projects"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
                />
              </el-select>
            </div>
          </template>

          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="Epic" name="epic">
              <div class="item-list">
                <div
                  v-for="epic in epics"
                  :key="epic.id"
                  class="item-card"
                  draggable="true"
                  @dragstart="handleDragStart($event, epic, 'epic')"
                  @dragend="handleDragEnd"
                >
                  <div class="item-header">
                    <el-tag size="small" :type="getPriorityType(epic.priority)">
                      {{ epic.priority }}
                    </el-tag>
                    <span class="item-code">{{ epic.code }}</span>
                  </div>
                  <div class="item-title">{{ epic.name }}</div>
                  <div class="item-meta">
                    <span>{{ epic.status }}</span>
                    <el-tag size="small" type="info">{{ getEpicFeatureCount(epic.id) }} Features</el-tag>
                  </div>
                </div>
                <el-empty v-if="epics.length === 0" description="暂无Epic" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="Feature" name="feature">
              <div class="item-list">
                <div
                  v-for="feature in features"
                  :key="feature.id"
                  class="item-card"
                  draggable="true"
                  @dragstart="handleDragStart($event, feature, 'feature')"
                  @dragend="handleDragEnd"
                >
                  <div class="item-header">
                    <el-tag size="small" :type="getPriorityType(feature.priority || 'P1')">
                      {{ feature.priority || 'P1' }}
                    </el-tag>
                    <span class="item-code">{{ feature.code }}</span>
                  </div>
                  <div class="item-title">{{ feature.name }}</div>
                  <div class="item-meta">
                    <span>Epic: {{ getEpicName(feature.epicId) }}</span>
                    <el-tag size="small" type="warning">{{ feature.storyPoints || 0 }} SP</el-tag>
                  </div>
                </div>
                <el-empty v-if="features.length === 0" description="暂无Feature" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <!-- 右侧：时间线视图和PI分配 -->
      <el-col :span="18">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>版本与PI规划</span>
              <el-button-group size="small">
                <el-button @click="viewMode = 'timeline'" :type="viewMode === 'timeline' ? 'primary' : ''">时间线</el-button>
                <el-button @click="viewMode = 'pi'" :type="viewMode === 'pi' ? 'primary' : ''">PI视图</el-button>
              </el-button-group>
            </div>
          </template>

          <!-- 时间线视图 -->
          <div v-if="viewMode === 'timeline'" class="timeline-view">
            <div class="timeline-container">
              <div
                v-for="version in versions"
                :key="version.id"
                class="version-timeline-item"
                @dragover="handleDragOver"
                @drop="handleDrop($event, version.id, 'version')"
              >
                <div class="version-header">
                  <h4>{{ version.name }}</h4>
                  <el-tag size="small">{{ version.startDate }} ~ {{ version.endDate }}</el-tag>
                </div>
                <div class="version-pis">
                  <div
                    v-for="pi in getPIsByVersion(version.id)"
                    :key="pi.id"
                    class="pi-timeline-item"
                    @dragover="handleDragOver"
                    @drop="handleDrop($event, pi.id, 'pi')"
                  >
                    <div class="pi-header">
                      <span>{{ pi.name }}</span>
                      <el-tag size="small" type="warning">{{ getPIFeatureCount(pi.id) }} Features</el-tag>
                    </div>
                    <div class="pi-items">
                      <div
                        v-for="item in getAllocatedItems(pi.id)"
                        :key="item.id"
                        class="allocated-item"
                        :class="item.type"
                      >
                        <span>{{ item.code }}</span>
                        <el-button link size="small" type="danger" @click="unallocateItem(item.id, item.type, pi.id)">×</el-button>
                      </div>
                      <div v-if="getAllocatedItems(pi.id).length === 0" class="empty-drop-zone">
                        拖拽Epic/Feature到此处
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PI视图 -->
          <div v-else class="pi-view">
            <div class="pi-grid">
              <div
                v-for="pi in pis"
                :key="pi.id"
                class="pi-card"
                @dragover="handleDragOver"
                @drop="handleDrop($event, pi.id, 'pi')"
              >
                <div class="pi-card-header">
                  <h4>{{ pi.name }}</h4>
                  <div class="pi-stats">
                    <el-tag size="small">{{ getPIFeatureCount(pi.id) }} Features</el-tag>
                    <el-tag size="small" type="warning">{{ getPITotalSP(pi.id) }} SP</el-tag>
                  </div>
                </div>
                <div class="pi-card-items">
                  <div
                    v-for="item in getAllocatedItems(pi.id)"
                    :key="item.id"
                    class="allocated-item-card"
                    :class="item.type"
                  >
                    <div class="item-header">
                      <el-tag size="small" :type="getPriorityType(item.priority || 'P1')">
                        {{ item.priority || 'P1' }}
                      </el-tag>
                      <span class="item-code">{{ item.code }}</span>
                      <el-button link size="small" type="danger" @click="unallocateItem(item.id, item.type, pi.id)">移除</el-button>
                    </div>
                    <div class="item-title">{{ item.name }}</div>
                    <div v-if="item.type === 'feature'" class="item-meta">
                      <el-tag size="small" type="warning">{{ item.storyPoints || 0 }} SP</el-tag>
                    </div>
                  </div>
                  <div v-if="getAllocatedItems(pi.id).length === 0" class="empty-drop-zone">
                    拖拽Epic/Feature到此处
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- PI目标映射 -->
        <el-card style="margin-top: 16px;">
          <template #header>
            <span>PI目标与Epic/Feature映射</span>
          </template>
          <div v-for="pi in pis" :key="pi.id" class="pi-objectives">
            <h4>{{ pi.name }}</h4>
            <div v-if="pi.objectives && pi.objectives.length > 0">
              <div v-for="objective in pi.objectives" :key="objective.id" class="objective-item">
                <div class="objective-header">
                  <span>{{ objective.description }}</span>
                  <el-progress :percentage="getObjectiveProgress(objective.id, pi.id)" :stroke-width="8" />
                </div>
                <div class="objective-items">
                  <el-tag
                    v-for="itemId in getObjectiveItems(objective.id, pi.id)"
                    :key="itemId"
                    size="small"
                    style="margin-right: 8px; margin-top: 4px;"
                  >
                    {{ getItemCode(itemId) }}
                  </el-tag>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无PI目标" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh, Check } from '@element-plus/icons-vue'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'
import { useProjectStore } from '@/stores/modules/project'
import { useEpicStore } from '@/stores/modules/epic'
import { useFeatureStore } from '@/stores/modules/feature'
import { usePIStore } from '@/stores/modules/pi'
import { useVersionStore } from '@/stores/modules/version'
import { ElMessage } from 'element-plus'
import type { Epic, Feature, PI, Version } from '@/types'

const projectStore = useProjectStore()
const epicStore = useEpicStore()
const featureStore = useFeatureStore()
const piStore = usePIStore()
const versionStore = useVersionStore()

const loading = ref(false)
const selectedProjectId = ref('')
const activeTab = ref<'epic' | 'feature'>('epic')
const viewMode = ref<'timeline' | 'pi'>('timeline')

const projects = computed(() => projectStore.projects)
const epics = computed(() => {
  if (!selectedProjectId.value) return []
  return epicStore.epics.filter(e => e.projectId === selectedProjectId.value)
})
const features = computed(() => {
  if (!selectedProjectId.value) return []
  return featureStore.features.filter(f => {
    const epic = epicStore.epics.find(e => e.id === f.epicId)
    return epic && epic.projectId === selectedProjectId.value
  })
})
const versions = computed(() => {
  if (!selectedProjectId.value) return []
  return versionStore.getVersionsByProject(selectedProjectId.value)
})
const pis = computed(() => {
  if (!selectedProjectId.value) return []
  return piStore.pisByProject(selectedProjectId.value)
})

// 分配映射：{ itemId: { piId, type } }
const allocationMap = ref<Record<string, { piId: string; type: 'epic' | 'feature' }>>({})

// 拖拽相关
const draggedItem = ref<any>(null)
const draggedType = ref<'epic' | 'feature' | null>(null)

const handleDragStart = (e: DragEvent, item: Epic | Feature, type: 'epic' | 'feature') => {
  draggedItem.value = item
  draggedType.value = type
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragEnd = () => {
  draggedItem.value = null
  draggedType.value = null
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

const handleDrop = (e: DragEvent, targetId: string, targetType: 'version' | 'pi') => {
  e.preventDefault()
  if (!draggedItem.value || !draggedType.value) return

  // 如果是版本，需要找到对应的PI
  let piId = targetId
  if (targetType === 'version') {
    const versionPIs = pis.value.filter(pi => pi.versionId === targetId)
    if (versionPIs.length === 0) {
      ElMessage.warning('该版本下没有PI，请先创建PI')
      return
    }
    // 默认分配到第一个PI
    piId = versionPIs[0].id
  }

  // 检查是否已分配
  const existingAllocation = allocationMap.value[draggedItem.value.id]
  if (existingAllocation && existingAllocation.piId === piId) {
    ElMessage.info('该需求已分配到该PI')
    return
  }

  // 更新分配
  allocationMap.value[draggedItem.value.id] = {
    piId,
    type: draggedType.value
  }

  const pi = pis.value.find(p => p.id === piId)
  ElMessage.success(`${draggedItem.value.name} 已分配到 ${pi?.name || 'PI'}`)
}

const unallocateItem = (itemId: string, type: 'epic' | 'feature', piId: string) => {
  delete allocationMap.value[itemId]
  ElMessage.success('已移除分配')
}

const getAllocatedItems = (piId: string) => {
  const items: any[] = []
  Object.keys(allocationMap.value).forEach(itemId => {
    const allocation = allocationMap.value[itemId]
    if (allocation.piId === piId) {
      if (allocation.type === 'epic') {
        const epic = epics.value.find(e => e.id === itemId)
        if (epic) items.push({ ...epic, type: 'epic' })
      } else {
        const feature = features.value.find(f => f.id === itemId)
        if (feature) items.push({ ...feature, type: 'feature' })
      }
    }
  })
  return items
}

const getPIsByVersion = (versionId: string) => {
  return pis.value.filter(pi => pi.versionId === versionId)
}

const getPIFeatureCount = (piId: string) => {
  return getAllocatedItems(piId).filter(item => item.type === 'feature').length
}

const getPITotalSP = (piId: string) => {
  return getAllocatedItems(piId)
    .filter(item => item.type === 'feature')
    .reduce((sum, item) => sum + (item.storyPoints || 0), 0)
}

const getEpicFeatureCount = (epicId: string) => {
  return features.value.filter(f => f.epicId === epicId).length
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

const getObjectiveProgress = (objectiveId: string, piId: string) => {
  const items = getObjectiveItems(objectiveId, piId)
  const totalItems = getAllocatedItems(piId).length
  if (totalItems === 0) return 0
  return Math.round((items.length / totalItems) * 100)
}

const getObjectiveItems = (objectiveId: string, piId: string) => {
  // 模拟：返回关联到该目标的item IDs
  const items = getAllocatedItems(piId)
  return items.slice(0, Math.floor(items.length / 2)).map(item => item.id)
}

const getItemCode = (itemId: string) => {
  const epic = epics.value.find(e => e.id === itemId)
  if (epic) return epic.code
  const feature = features.value.find(f => f.id === itemId)
  return feature?.code || itemId
}

const handleRefresh = () => {
  loadProjectData()
}

const handleSave = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('规划已保存')
  } finally {
    loading.value = false
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

onMounted(() => {
  loadProjectData()
  if (projects.value.length > 0) {
    selectedProjectId.value = projects.value[0].id
  }
})
</script>

<style scoped lang="scss">
.item-list {
  max-height: 600px;
  overflow-y: auto;
}

.item-card {
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

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .item-code {
    font-size: 12px;
    color: #909399;
  }

  .item-title {
    font-weight: 500;
    margin-bottom: 8px;
  }

  .item-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #606266;
  }
}

.timeline-view {
  .timeline-container {
    min-height: 400px;
  }

  .version-timeline-item {
    margin-bottom: 24px;
    padding: 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fafafa;

    .version-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #409eff;

      h4 {
        margin: 0;
      }
    }

    .version-pis {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 12px;
    }

    .pi-timeline-item {
      padding: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      background-color: #fff;
      min-height: 150px;

      .pi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .pi-items {
        min-height: 100px;
      }
    }
  }
}

.pi-view {
  .pi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 16px;
  }

  .pi-card {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 16px;
    background-color: #fafafa;
    min-height: 300px;

    .pi-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #409eff;

      h4 {
        margin: 0;
      }

      .pi-stats {
        display: flex;
        gap: 8px;
      }
    }

    .pi-card-items {
      min-height: 200px;
    }
  }
}

.allocated-item,
.allocated-item-card {
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.epic {
    border-left: 3px solid #409eff;
  }

  &.feature {
    border-left: 3px solid #67c23a;
  }

  .item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .item-code {
    font-size: 12px;
    color: #909399;
  }

  .item-title {
    font-size: 14px;
    margin: 4px 0;
  }

  .item-meta {
    margin-top: 4px;
  }
}

.empty-drop-zone {
  padding: 40px;
  text-align: center;
  color: #909399;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
}

.pi-objectives {
  margin-bottom: 24px;

  h4 {
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
  }

  .objective-item {
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #fafafa;

    .objective-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .objective-items {
      margin-top: 8px;
    }
  }
}
</style>
