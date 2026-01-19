<template>
  <PageContainer>
    <!-- 页面头部 -->
    <div class="action-bar">
      <div class="action-bar-left">
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">PI Planning - 团队视角: 模块需求排布</span>
        <el-tag v-if="currentPI" :type="getPIStatusType(currentPI.status)" size="large" style="margin-left: 12px;">
          {{ currentPI.name }}
        </el-tag>
      </div>
      <div class="action-bar-right">
        <el-button @click="handleSaveDraft">保存草稿</el-button>
      </div>
    </div>

    <!-- PI信息卡片 -->
    <el-card style="margin-bottom: 16px;" v-if="currentPI">
      <el-descriptions :column="4" border>
        <el-descriptions-item label="PI名称">
          <el-text tag="b">{{ currentPI.name }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="时间范围">
          <el-text>{{ currentPI.startDate }} ~ {{ currentPI.endDate }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="Sprint数量">
          <el-text>{{ currentPI.sprintCount || 6 }} 个迭代</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="整体进度">
          <el-progress :percentage="overallProgress" />
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 团队选择 -->
    <el-card style="margin-bottom: 16px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <el-text tag="b" size="large">选择团队</el-text>
            <el-text size="small" type="info" style="margin-left: 12px;">
              单团队视角：选择一个团队，查看该团队管理模块相关的特性需求，并将模块需求分配到不同迭代
            </el-text>
          </div>
          <el-button type="primary" plain @click="$router.push(`/function/c3/planning/pi/${piId.value}/stage1`)">
            <el-icon><ArrowLeft /></el-icon>
            切换到全局视角
          </el-button>
        </div>
      </template>
      <el-radio-group v-model="selectedTeamId" size="large">
        <el-radio-button 
          v-for="team in teams" 
          :key="team.id"
          :value="team.id"
        >
          {{ team.name }}
        </el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 主要内容区域 -->
    <el-row :gutter="16" v-if="selectedTeamId">
      <!-- 左侧：特性树（Feature → SSTS → MR） -->
      <el-col :span="12">
        <el-card shadow="hover" style="height: calc(100vh - 400px);">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>{{ getTeamName(selectedTeamId) }} - 特性需求树</span>
              <div>
                <el-input 
                  v-model="treeSearchKeyword"
                  placeholder="搜索..."
                  clearable
                  size="small"
                  style="width: 200px; margin-right: 8px;"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-button size="small" @click="handleExpandAll">
                  {{ expandAll ? '全部收起' : '全部展开' }}
                </el-button>
              </div>
            </div>
          </template>

          <div style="height: calc(100vh - 500px); overflow-y: auto;">
            <!-- 批量操作按钮 -->
            <div v-if="checkedMRKeys.length > 0" style="margin-bottom: 12px; padding: 8px; background: #ecf5ff; border-radius: 4px;">
              <el-text size="small" type="primary" style="margin-right: 12px;">
                已选择 {{ checkedMRKeys.length }} 个MR
              </el-text>
              <el-button size="small" type="primary" @click="handleBatchAllocate">
                批量分配到Sprint
              </el-button>
              <el-button size="small" @click="handleClearSelection">
                清空选择
              </el-button>
            </div>

            <!-- 特性树 -->
            <el-tree
              ref="treeRef"
              :data="featureTreeData"
              :props="treeProps"
              node-key="id"
              :default-expand-all="false"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              show-checkbox
              :check-strictly="true"
              @check="handleTreeCheck"
              style="margin-top: 12px;"
            >
              <template #default="{ node, data }">
                <div 
                  class="tree-node" 
                  :class="`tree-node-${data.type}`"
                  :draggable="data.type === 'mr'"
                  @dragstart="data.type === 'mr' && handleTreeDragStart($event, data)"
                  @dragend="handleTreeDragEnd"
                >
                  <div class="tree-node-content">
                    <el-icon v-if="data.type === 'feature'" color="#409EFF" style="margin-right: 6px;"><Document /></el-icon>
                    <el-icon v-else-if="data.type === 'ssts'" color="#E6A23C" style="margin-right: 6px;"><FolderOpened /></el-icon>
                    <el-icon v-else-if="data.type === 'mr'" color="#67C23A" style="margin-right: 6px;"><Files /></el-icon>
                    
                    <el-text class="tree-node-code" size="small" type="info">{{ data.code }}</el-text>
                    <el-text class="tree-node-title">{{ data.name || data.title }}</el-text>
                    
                    <el-tag v-if="data.type === 'feature'" size="small" type="primary" style="margin-left: 8px;">{{ data.storyPoints }} SP</el-tag>
                    <el-tag v-else-if="data.type === 'ssts'" size="small" type="warning" style="margin-left: 8px;">{{ data.storyPoints }} SP</el-tag>
                    <el-tag v-else-if="data.type === 'mr'" size="small" type="success" style="margin-left: 8px;">{{ data.effortHours }}h</el-tag>
                    
                    <el-tag 
                      v-if="data.type === 'mr' && data.targetSprint" 
                      size="small" 
                      type="info"
                      style="margin-left: 4px;"
                    >
                      已分配: {{ getSprintName(data.targetSprint) }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-tree>
            
            <el-empty v-if="featureTreeData.length === 0" description="该团队暂无相关需求" />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：Sprint列表（作为分配目标） -->
      <el-col :span="12">
        <el-card shadow="hover" style="height: calc(100vh - 400px);">
          <template #header>
            <span>{{ getTeamName(selectedTeamId) }} - Sprint列表</span>
          </template>

          <div style="height: calc(100vh - 500px); overflow-y: auto;">
            <div 
              v-for="sprint in teamSprints" 
              :key="sprint.id"
              class="sprint-card"
              :class="{ 'drop-target': dragTargetSprintId === sprint.id }"
              @dragover.prevent="handleDragOver($event, sprint.id)"
              @drop="handleDrop($event, sprint.id)"
              @dragleave="handleDragLeave"
            >
              <div class="sprint-header">
                <div>
                  <el-text tag="b">{{ sprint.name }}</el-text>
                  <el-text size="small" type="info" style="margin-left: 8px;">
                    {{ sprint.startDate }} ~ {{ sprint.endDate }}
                  </el-text>
                </div>
                <el-tag size="small" :type="getLoadRateType(sprint)">
                  {{ getSprintLoadRate(sprint) }}%
                </el-tag>
              </div>

              <div class="sprint-capacity">
                <el-text size="small">
                  容量: {{ sprint.capacity }} SP | 
                  已分配: {{ getMRLoad(sprint) }} SP | 
                  可用: {{ sprint.capacity - getMRLoad(sprint) }} SP
                </el-text>
                <el-progress 
                  :percentage="getSprintLoadRate(sprint)"
                  :status="getSprintLoadRate(sprint) > 100 ? 'exception' : undefined"
                  :stroke-width="8"
                  style="margin-top: 8px;"
                />
              </div>

              <!-- MR分配列表 -->
              <div class="mr-items">
                <el-text size="small" type="success" style="margin-bottom: 8px; display: block;">
                  MR分配:
                </el-text>
                <div 
                  v-for="mr in getMRsInSprint(sprint.id)" 
                  :key="mr.id"
                  class="mr-item"
                >
                  <div class="mr-header">
                    <el-tag size="small" type="success">{{ mr.code }}</el-tag>
                    <el-button 
                      size="small" 
                      text 
                      type="danger"
                      @click="handleRemoveMR(mr.id, sprint.id)"
                    >
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </div>
                  <el-text size="small" class="mr-title">{{ mr.title }}</el-text>
                  <div class="mr-meta">
                    <el-tag size="small">{{ mr.effortHours }}h</el-tag>
                    <el-text size="small" type="info">SSTS: {{ getSSTSCode(mr.sstsId) }}</el-text>
                  </div>
                </div>
                
                <div v-if="getMRsInSprint(sprint.id).length === 0" class="drop-hint">
                  [+ 拖拽MR到此处]
                </div>
              </div>
            </div>

            <el-empty v-if="teamSprints.length === 0" description="暂无Sprint数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 提示信息 -->
    <el-empty v-if="!selectedTeamId" description="请先选择一个团队" />

    <!-- 批量分配对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量分配到Sprint"
      width="500px"
    >
      <div>
        <el-text style="display: block; margin-bottom: 12px;">
          已选择 {{ checkedMRKeys.length }} 个MR，请选择目标Sprint：
        </el-text>
        <el-select 
          v-model="batchTargetSprintId" 
          placeholder="请选择Sprint"
          style="width: 100%;"
        >
          <el-option 
            v-for="sprint in teamSprints" 
            :key="sprint.id" 
            :label="`${sprint.name} (${sprint.startDate} ~ ${sprint.endDate})`"
            :value="sprint.id"
          />
        </el-select>
        
        <!-- Sprint容量预警 -->
        <el-alert
          v-if="batchTargetSprintId"
          :title="`容量: ${getTargetSprintCapacity()} SP | 已分配: ${getTargetSprintLoad()} SP | 批量后: ${getTargetSprintLoad() + getBatchTotalHours()} SP`"
          :type="getTargetSprintLoad() + getBatchTotalHours() > getTargetSprintCapacity() ? 'warning' : 'success'"
          style="margin-top: 12px;"
          show-icon
        />
      </div>
      
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :disabled="!batchTargetSprintId"
          @click="confirmBatchAllocate"
        >
          确认分配
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElTree } from 'element-plus'
import { ArrowLeft, Document, FolderOpened, Files, Search, Close } from '@element-plus/icons-vue'
import type { PI } from '@/types/execution-models'
import { usePIStore } from '@/stores/modules/pi'
import { useSprintStore } from '@/stores/modules/sprint'
import { useFeatureStore } from '@/stores/modules/feature'
import { useSSTSStore } from '@/stores/modules/ssts'
import { useMRStore } from '@/stores/modules/mr'
import { useTeamStore } from '@/stores/modules/team'
import PageContainer from '@/components/Common/PageContainer.vue'

const route = useRoute()
const router = useRouter()
const piId = computed(() => route.params.piId as string)

// Stores
const piStore = usePIStore()
const sprintStore = useSprintStore()
const featureStore = useFeatureStore()
const sstsStore = useSSTSStore()
const mrStore = useMRStore()
const teamStore = useTeamStore()

// State
const loading = ref(false)
const currentPI = ref<PI | null>(null)
const selectedTeamId = ref<string>('')
const expandAll = ref(false)
const treeSearchKeyword = ref('')
const draggedMR = ref<any>(null)
const dragTargetSprintId = ref<string | null>(null)
const treeRef = ref<InstanceType<typeof ElTree>>()
const checkedMRKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])
const batchDialogVisible = ref(false)
const batchTargetSprintId = ref<string>('')

// MR分配数据
const mrAllocations = ref<Array<{
  mrId: string
  teamId: string
  sprintId: string
}>>([])

// Computed
const teams = computed(() => teamStore.teams || [])

const sprints = computed(() => {
  const allSprints = sprintStore.sprints || []
  return allSprints.filter(s => s.piId === piId.value)
})

const features = computed(() => {
  return (featureStore.features || []).filter(f => f.targetPI === piId.value)
})

const allSsts = computed(() => sstsStore.sstsList || [])

const allMRs = computed(() => mrStore.mrList || [])

// 该团队的Sprint（来自全局视角的分配）
const teamSprints = computed(() => {
  if (!selectedTeamId.value) return []
  // 这里简化处理，显示所有Sprint
  // 实际应该基于全局视角的分配结果来过滤
  return sprints.value || []
})

// 该团队相关的MR（该团队管理的模块）
const teamMRs = computed(() => {
  if (!selectedTeamId.value) return []
  return (allMRs.value || []).filter(mr => mr.teamId === selectedTeamId.value)
})

// 该团队相关的SSTS（通过MR反向查找）
const teamSSTSIds = computed(() => {
  const sstsIds = new Set<string>()
  teamMRs.value.forEach(mr => {
    sstsIds.add(mr.sstsId)
  })
  return Array.from(sstsIds)
})

// 该团队相关的Feature（通过SSTS反向查找）
const teamFeatureIds = computed(() => {
  const featureIds = new Set<string>()
  teamSSTSIds.value.forEach(sstsId => {
    const ssts = (allSsts.value || []).find(s => s.id === sstsId)
    if (ssts) {
      featureIds.add(ssts.featureId)
    }
  })
  return Array.from(featureIds)
})

// 构建特性树数据
const featureTreeData = computed(() => {
  if (!selectedTeamId.value) return []
  
  const treeData: any[] = []
  
  // 遍历该团队相关的Feature
  teamFeatureIds.value.forEach(featureId => {
    const feature = features.value.find(f => f.id === featureId)
    if (!feature) return
    
    const featureNode: any = {
      id: `feature-${feature.id}`,
      code: feature.code,
      name: feature.name,
      storyPoints: feature.storyPoints,
      type: 'feature',
      children: []
    }
    
    // 遍历该Feature下的SSTS
    const featureSSTSs = (allSsts.value || []).filter(s => 
      s.featureId === featureId && teamSSTSIds.value.includes(s.id)
    )
    
    featureSSTSs.forEach(ssts => {
      const sstsNode: any = {
        id: `ssts-${ssts.id}`,
        code: ssts.code,
        name: ssts.title,
        storyPoints: ssts.storyPoints,
        type: 'ssts',
        children: []
      }
      
      // 遍历该SSTS下的MR
      const sstsMRs = teamMRs.value.filter(mr => mr.sstsId === ssts.id)
      
      sstsMRs.forEach(mr => {
        const mrNode: any = {
          id: `mr-${mr.id}`,
          code: mr.code,
          title: mr.title,
          effortHours: mr.effortHours,
          type: 'mr',
          targetSprint: mr.targetSprint,
          mrData: mr  // 保存完整的MR数据供拖拽使用
        }
        sstsNode.children.push(mrNode)
      })
      
      if (sstsNode.children.length > 0) {
        featureNode.children.push(sstsNode)
      }
    })
    
    if (featureNode.children.length > 0) {
      treeData.push(featureNode)
    }
  })
  
  return treeData
})

const treeProps = {
  children: 'children',
  label: 'name'
}

const overallProgress = computed(() => {
  if (teamMRs.value.length === 0) return 0
  const allocated = teamMRs.value.filter(mr => mr.targetSprint).length
  return Math.round((allocated / teamMRs.value.length) * 100)
})

// Functions
function getTeamName(teamId: string) {
  return (teams.value || []).find(t => t.id === teamId)?.name || '未知团队'
}

function getSprintName(sprintId: string) {
  return (sprints.value || []).find(s => s.id === sprintId)?.name || '未知Sprint'
}

function getSSTSCode(sstsId: string) {
  return (allSsts.value || []).find(s => s.id === sstsId)?.code || '未知'
}

function getPIStatusType(status: string) {
  const typeMap: Record<string, any> = {
    'planning': 'info',
    'in-progress': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

function getMRsInSprint(sprintId: string) {
  return (teamMRs.value || []).filter(mr => mr.targetSprint === sprintId)
}

function getMRLoad(sprint: any) {
  const mrs = getMRsInSprint(sprint.id)
  return mrs.reduce((sum, mr) => sum + (mr.effortHours || 0), 0)
}

function getSprintLoadRate(sprint: any) {
  const load = getMRLoad(sprint)
  return sprint.capacity > 0 ? Math.round((load / sprint.capacity) * 100) : 0
}

function getLoadRateType(sprint: any) {
  const rate = getSprintLoadRate(sprint)
  if (rate > 100) return 'danger'
  if (rate > 80) return 'warning'
  return 'success'
}

function handleTreeDragStart(event: DragEvent, data: any) {
  // 保存当前展开状态
  saveExpandedState()
  
  draggedMR.value = data.mrData
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleTreeDragEnd() {
  draggedMR.value = null
  dragTargetSprintId.value = null
}

// 保存树的展开状态
function saveExpandedState() {
  if (treeRef.value) {
    const nodes = treeRef.value.store.nodesMap
    expandedKeys.value = Object.keys(nodes)
      .filter(key => nodes[key].expanded)
      .map(key => nodes[key].data.id)
  }
}

// 恢复树的展开状态
function restoreExpandedState() {
  nextTick(() => {
    if (treeRef.value && expandedKeys.value.length > 0) {
      expandedKeys.value.forEach(key => {
        const node = treeRef.value!.store.nodesMap[key]
        if (node) {
          node.expanded = true
        }
      })
    }
  })
}

function handleDragOver(event: DragEvent, sprintId: string) {
  event.preventDefault()
  dragTargetSprintId.value = sprintId
}

function handleDragLeave() {
  dragTargetSprintId.value = null
}

function handleDrop(event: DragEvent, sprintId: string) {
  event.preventDefault()
  
  if (!draggedMR.value) {
    ElMessage.warning('请从左侧树拖拽MR')
    return
  }
  
  // 检查是否已经在该Sprint
  if (draggedMR.value.targetSprint === sprintId) {
    ElMessage.info('MR已在该Sprint中')
    dragTargetSprintId.value = null
    return
  }
  
  // 更新MR的targetSprint
  const mr = teamMRs.value.find(m => m.id === draggedMR.value.id)
  if (mr) {
    mr.targetSprint = sprintId
    ElMessage.success(`已将 ${mr.code} 分配到 ${getSprintName(sprintId)}`)
    
    // 恢复展开状态
    restoreExpandedState()
    
    handleSaveDraft()
  }
  
  dragTargetSprintId.value = null
}

function handleRemoveMR(mrId: string, sprintId: string) {
  const mr = teamMRs.value.find(m => m.id === mrId)
  if (mr) {
    mr.targetSprint = undefined
    ElMessage.success(`已移除 ${mr.code}`)
    
    // 恢复展开状态
    restoreExpandedState()
    
    handleSaveDraft()
  }
}

// 处理树节点选择
function handleTreeCheck(data: any, checkedInfo: any) {
  // 只收集MR类型的节点
  const checkedNodes = checkedInfo.checkedNodes || []
  checkedMRKeys.value = checkedNodes
    .filter((node: any) => node.type === 'mr')
    .map((node: any) => node.id)
}

// 清空选择
function handleClearSelection() {
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([])
  }
  checkedMRKeys.value = []
}

// 批量分配到Sprint
function handleBatchAllocate() {
  if (checkedMRKeys.value.length === 0) {
    ElMessage.warning('请先选择MR')
    return
  }
  
  // 重置目标Sprint
  batchTargetSprintId.value = ''
  batchDialogVisible.value = true
}

// 确认批量分配
function confirmBatchAllocate() {
  if (!batchTargetSprintId.value) {
    ElMessage.warning('请选择Sprint')
    return
  }
  
  // 保存展开状态
  saveExpandedState()
  
  // 批量分配
  let successCount = 0
  checkedMRKeys.value.forEach(mrKey => {
    const mrId = mrKey.replace('mr-', '')
    const mr = teamMRs.value.find(m => m.id === mrId)
    if (mr) {
      mr.targetSprint = batchTargetSprintId.value
      successCount++
    }
  })
  
  ElMessage.success(`已将 ${successCount} 个MR分配到 ${getSprintName(batchTargetSprintId.value)}`)
  
  // 恢复展开状态
  restoreExpandedState()
  
  handleSaveDraft()
  handleClearSelection()
  batchTargetSprintId.value = ''
  batchDialogVisible.value = false
}

// 获取目标Sprint的容量
function getTargetSprintCapacity() {
  const sprint = teamSprints.value.find(s => s.id === batchTargetSprintId.value)
  return sprint?.capacity || 0
}

// 获取目标Sprint当前负载
function getTargetSprintLoad() {
  if (!batchTargetSprintId.value) return 0
  return getMRLoad({ id: batchTargetSprintId.value })
}

// 获取批量分配的总工时
function getBatchTotalHours() {
  let total = 0
  checkedMRKeys.value.forEach(mrKey => {
    const mrId = mrKey.replace('mr-', '')
    const mr = teamMRs.value.find(m => m.id === mrId)
    if (mr) {
      total += mr.effortHours || 0
    }
  })
  return total
}

function handleExpandAll() {
  expandAll.value = !expandAll.value
  if (treeRef.value) {
    Object.keys(treeRef.value.store.nodesMap).forEach(key => {
      treeRef.value!.store.nodesMap[key].expanded = expandAll.value
    })
  }
}

function filterNode(value: string, data: any) {
  if (!value) return true
  return data.code?.toLowerCase().includes(value.toLowerCase()) ||
         data.name?.toLowerCase().includes(value.toLowerCase()) ||
         data.title?.toLowerCase().includes(value.toLowerCase())
}

function handleSaveDraft() {
  try {
    // 保存MR分配结果
    const draftData = {
      teamId: selectedTeamId.value,
      allocations: teamMRs.value.map(mr => ({
        mrId: mr.id,
        sprintId: mr.targetSprint
      })),
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem(`pi-planning-team-draft-${piId.value}`, JSON.stringify(draftData))
    ElMessage.success('草稿已保存')
  } catch (error: any) {
    ElMessage.error('保存失败: ' + error.message)
  }
}

// Watch
watch(treeSearchKeyword, (val) => {
  treeRef.value!.filter(val)
})

watch(selectedTeamId, () => {
  // 加载该团队的草稿
  try {
    const draft = localStorage.getItem(`pi-planning-team-draft-${piId.value}`)
    if (draft) {
      const draftData = JSON.parse(draft)
      if (draftData.teamId === selectedTeamId.value) {
        // 恢复MR分配
        draftData.allocations.forEach((alloc: any) => {
          const mr = teamMRs.value.find(m => m.id === alloc.mrId)
          if (mr) {
            mr.targetSprint = alloc.sprintId
          }
        })
      }
    }
  } catch (error) {
    console.error('加载草稿失败:', error)
  }
})

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      piStore.fetchPIById(piId.value),
      sprintStore.fetchSprints(),
      featureStore.fetchFeatures(),
      sstsStore.fetchSSTSList(),
      mrStore.fetchMRs(),
      teamStore.fetchTeams()
    ])
    
    currentPI.value = piStore.currentPI
    
    // 等待 nextTick 确保 teams computed 已更新
    await nextTick()
    
    // 默认选择第一个团队
    if (teams.value && teams.value.length > 0) {
      selectedTeamId.value = teams.value[0].id
    }
  } catch (error: any) {
    ElMessage.error('加载数据失败: ' + error.message)
    console.error('加载数据错误:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);

  &-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

// 树节点样式
.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
  }

  &-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &-code {
    min-width: 100px;
  }

  &-title {
    flex: 1;
  }

  &-mr[draggable="true"] {
    cursor: move;
    
    &:hover {
      background: #e3f2fd;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  }
}

// Sprint卡片样式
.sprint-card {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  &.drop-target {
    border-color: #409EFF;
    background: #ecf5ff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.sprint-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sprint-capacity {
  margin-bottom: 16px;
}

.mr-items {
  margin-top: 16px;
}

.mr-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f5f7fa;
  transition: all 0.3s;

  &:hover {
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  }
}

.mr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mr-title {
  display: block;
  margin-bottom: 8px;
  color: #606266;
}

.mr-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drop-hint {
  padding: 24px;
  text-align: center;
  color: #909399;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}
</style>
