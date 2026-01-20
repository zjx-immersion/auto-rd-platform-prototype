<template>
  <PageContainer>
    <!-- 页面头部 -->
    <div class="action-bar">
      <div class="action-bar-left">
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">PI Planning - 全局视角: Feature/SSTS排布</span>
        <el-text size="small" type="info" style="margin-left: 16px;">
          将Feature和SSTS分配到不同团队和迭代
        </el-text>
        <el-tag v-if="currentPI" :type="getPIStatusType(currentPI.status)" size="large" style="margin-left: 12px;">
          {{ currentPI.name }}
        </el-tag>
      </div>
      <div class="action-bar-right">
        <el-button type="primary" plain @click="handleGoToStage2">
          <el-icon><UserFilled /></el-icon>
          切换到团队视角
        </el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="success" @click="handleDetectConflicts">
          <el-icon><Warning /></el-icon>
          检测冲突
        </el-button>
      </div>
    </div>

    <!-- PI信息卡片 -->
    <el-card style="margin-bottom: 16px;" v-if="currentPI">
      <el-descriptions :column="4" border>
        <el-descriptions-item label="PI名称">
          <el-text tag="b">{{ currentPI.name }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="Sprint数量">
          {{ currentPI.sprintCount }} 个
        </el-descriptions-item>
        <el-descriptions-item label="周期">
          {{ formatDateRange(currentPI.startDate, currentPI.endDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getPIStatusType(currentPI.status)">{{ getPIStatusText(currentPI.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="规划进度" :span="4">
          <div style="display: flex; align-items: center; gap: 24px;">
            <el-text>Feature: {{ allocatedFeaturesCount }}/{{ totalFeaturesCount }} 已分配</el-text>
            <el-text>SSTS: {{ allocatedSSTSCount }}/{{ totalSSTSCount }} 已分配</el-text>
            <el-progress 
              :percentage="stage1Progress" 
              :status="stage1Progress === 100 ? 'success' : undefined"
              style="flex: 1;"
            />
            <el-text tag="b">{{ stage1Progress }}%</el-text>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 主要内容区域 -->
    <el-row :gutter="16">
      <!-- 左侧：待分配Feature/SSTS列表 -->
      <el-col :span="6">
        <el-card shadow="hover" style="height: calc(100vh - 300px); overflow-y: auto;">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>待分配列表</span>
              <el-button size="small" @click="handleSmartAllocate">智能分配</el-button>
            </div>
          </template>

          <!-- 搜索和筛选 -->
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索Feature/SSTS..." 
            clearable 
            style="margin-bottom: 12px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select v-model="filterType" placeholder="类型" clearable style="width: 100%; margin-bottom: 12px;">
            <el-option label="Feature" value="feature" />
            <el-option label="SSTS" value="ssts" />
          </el-select>

          <!-- Feature列表 -->
          <div v-if="filteredFeatures.length > 0" style="margin-bottom: 16px;">
            <el-text tag="b" type="info">未分配Feature ({{ filteredFeatures.length }})</el-text>
            <div 
              v-for="feature in filteredFeatures" 
              :key="feature.id"
              class="item-card"
              :class="{ 'selected': selectedItem?.id === feature.id && selectedItem?.type === 'feature' }"
              @click="handleSelectItem(feature, 'feature')"
              draggable="true"
              @dragstart="handleDragStart($event, feature, 'feature')"
            >
              <div class="item-header">
                <el-text tag="b">{{ feature.code }}</el-text>
                <el-button size="small" text @click.stop="handleManageDependencies(feature, 'feature')">
                  <el-icon><Connection /></el-icon>
                </el-button>
              </div>
              <el-text class="item-title">{{ feature.name }}</el-text>
              <div class="item-meta">
                <el-tag size="small">{{ feature.storyPoints }} SP</el-tag>
                <el-tag size="small" :type="getPriorityType(feature.priority)">{{ feature.priority }}</el-tag>
                <el-text size="small" type="info">产品: {{ feature.product }}</el-text>
              </div>
              <div class="item-meta" v-if="feature.sstsIds?.length">
                <el-text size="small" type="info">SSTS: {{ feature.sstsIds.length }}个</el-text>
              </div>
            </div>
          </div>

          <!-- SSTS列表 -->
          <div v-if="filteredSSTS.length > 0">
            <el-text tag="b" type="info">未分配SSTS ({{ filteredSSTS.length }})</el-text>
            <div 
              v-for="ssts in filteredSSTS" 
              :key="ssts.id"
              class="item-card"
              :class="{ 
                'selected': selectedItem?.id === ssts.id && selectedItem?.type === 'ssts',
                'highlight-dependency': highlightedSSTS.includes(ssts.id)
              }"
              @click="handleSelectItem(ssts, 'ssts')"
              draggable="true"
              @dragstart="handleDragStart($event, ssts, 'ssts')"
            >
              <div class="item-header">
                <el-text tag="b">{{ ssts.code }}</el-text>
                <el-button size="small" text @click.stop="handleManageDependencies(ssts, 'ssts')">
                  <el-icon><Connection /></el-icon>
                </el-button>
              </div>
              <el-text class="item-title">{{ ssts.title || ssts.name }}</el-text>
              <div class="item-meta">
                <el-tag size="small">{{ getSSTSStoryPoints(ssts) }} SP</el-tag>
                <el-tag size="small" :type="getPriorityType(ssts.priority)">{{ ssts.priority }}</el-tag>
                <el-text size="small" type="info">Feature: {{ getFeatureName(ssts.featureId) }}</el-text>
              </div>
              <div class="item-meta" v-if="ssts.dependencies?.length">
                <el-text size="small" type="warning">依赖: {{ ssts.dependencies.length }}个</el-text>
              </div>
            </div>
          </div>

          <el-empty v-if="filteredFeatures.length === 0 && filteredSSTS.length === 0" description="暂无待分配项" />
        </el-card>
      </el-col>

      <!-- 右侧：团队×Sprint排布看板 -->
      <el-col :span="18">
        <el-card shadow="hover" style="height: calc(100vh - 300px); overflow: auto;">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>团队×Sprint排布看板</span>
              <el-button size="small" @click="handleDetectConflicts">检测冲突</el-button>
            </div>
          </template>

          <!-- Sprint管理和里程碑设置 -->
          <div style="margin-bottom: 16px; padding: 12px; background: #f5f7fa; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <el-text tag="b">Sprint管理:</el-text>
              <div>
                <el-button size="small" @click="handleAddSprint" type="primary">
                  <el-icon><Plus /></el-icon>
                  添加Sprint
                </el-button>
                <el-button size="small" @click="handleRemoveSprint" type="danger" :disabled="sprints.length <= 1">
                  <el-icon><Minus /></el-icon>
                  删除最后一个Sprint
                </el-button>
              </div>
            </div>
            <el-divider style="margin: 12px 0;" />
            <div>
              <el-text tag="b" style="margin-right: 16px;">Sprint里程碑:</el-text>
              <el-button 
                v-for="sprint in sprints" 
                :key="sprint.id"
                size="small"
                :type="sprint.milestone ? 'success' : 'info'"
                @click="handleSetMilestone(sprint)"
                style="margin-right: 8px;"
              >
                {{ sprint.name }}
                <el-icon v-if="sprint.milestone" style="margin-left: 4px;"><Check /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 看板表格 -->
          <div class="planning-board">
            <!-- 表头：Sprint列表 -->
            <div class="board-header">
              <div class="team-header-cell">团队</div>
              <div 
                v-for="sprint in sprints" 
                :key="sprint.id"
                class="sprint-header-cell"
                :class="{ 'has-milestone': sprint.milestone }"
              >
                <div class="sprint-name">{{ sprint.name }}</div>
                <div class="sprint-dates">{{ formatSprintDates(sprint) }}</div>
                <div v-if="sprint.milestone" class="sprint-milestone">
                  <el-icon><Trophy /></el-icon>
                  <el-text size="small">{{ sprint.milestone.productVersion || sprint.milestone.vehicleNode }}</el-text>
                </div>
                <div class="sprint-capacity">
                  <el-text size="small" type="info">{{ getSprintTotalLoad(sprint) }}/{{ sprint.capacity }} SP</el-text>
                </div>
              </div>
            </div>

            <!-- 团队行 -->
            <div 
              v-for="team in teams" 
              :key="team.id"
              class="team-row"
            >
              <div class="team-cell">
                <el-text tag="b">{{ team.name }}</el-text>
                <el-text size="small" type="info">{{ team.capacity }} SP</el-text>
              </div>
              
              <!-- Sprint列 -->
              <div 
                v-for="sprint in sprints" 
                :key="sprint.id"
                class="sprint-cell"
                :class="{ 
                  'drop-target': dragTarget?.sprintId === sprint.id && dragTarget?.teamId === team.id,
                  'overload': getSprintTeamLoad(team.id, sprint.id) > team.capacity
                }"
                @dragover.prevent="handleDragOver($event, team.id, sprint.id)"
                @drop="handleDrop($event, team.id, sprint.id)"
                @dragleave="handleDragLeave"
              >
                <!-- 容量显示 -->
                <div class="capacity-info">
                  <el-text size="small" type="info">
                    {{ getSprintTeamLoad(team.id, sprint.id) }}/{{ team.capacity }} SP
                  </el-text>
                  <el-progress 
                    :percentage="getLoadRate(team.id, sprint.id)" 
                    :status="getLoadRate(team.id, sprint.id) > 100 ? 'exception' : undefined"
                    :stroke-width="4"
                  />
                </div>

                <!-- 已分配的Feature/SSTS卡片 -->
                <div class="allocated-items">
                  <div 
                    v-for="item in getAllocatedItems(team.id, sprint.id)"
                    :key="`${item.type}-${item.id}`"
                    class="allocated-card"
                    :class="{
                      'highlight-dependency': highlightedSSTS.includes(item.id),
                      'feature-card': item.type === 'feature',
                      'ssts-card': item.type === 'ssts',
                      'multi-sprint': item.duration && item.duration > 1
                    }"
                    @click.stop="handleSelectItem(item, item.type)"
                  >
                    <div class="card-header">
                      <el-text tag="b" size="small">{{ item.code }}</el-text>
                      <div style="display: flex; gap: 4px;">
                        <el-button 
                          v-if="item.type === 'feature'"
                          size="small" 
                          text 
                          @click.stop="handleSetDuration(item, team.id, sprint.id)"
                          :title="item.duration ? `横跨${item.duration}个Sprint` : '设置持续时间'"
                        >
                          <el-icon>
                            <el-icon-more-filled v-if="item.duration && item.duration > 1" />
                            <el-icon-more v-else />
                          </el-icon>
                        </el-button>
                        <el-button 
                          size="small" 
                          text 
                          type="danger"
                          @click.stop="handleRemoveAllocation(item, team.id, sprint.id)"
                        >
                          <el-icon><Close /></el-icon>
                        </el-button>
                      </div>
                    </div>
                    <el-text size="small" class="card-title">{{ item.name || item.title }}</el-text>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <el-tag size="small">{{ item.storyPoints || getSSTSStoryPoints(item) }} SP</el-tag>
                      <el-tag v-if="item.duration && item.duration > 1" size="small" type="warning">
                        {{ item.duration }}个Sprint
                      </el-tag>
                    </div>
                  </div>
                </div>

                <!-- 放置提示 -->
                <div v-if="getAllocatedItems(team.id, sprint.id).length === 0" class="drop-hint">
                  [+ 放置Feature/SSTS到此处]
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 依赖关系面板 -->
    <el-drawer
      v-model="dependencyDrawerVisible"
      title="依赖关系管理"
      :size="500"
    >
      <div v-if="selectedItem">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="当前项">
            <el-text tag="b">{{ selectedItem.code }}</el-text> - {{ selectedItem.name || selectedItem.title }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ selectedItem.type === 'feature' ? 'Feature' : 'SSTS' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <!-- 依赖的SSTS列表 -->
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <el-text tag="b">依赖的SSTS</el-text>
            <el-button size="small" type="primary" @click="handleAddDependency">添加依赖</el-button>
          </div>
          <el-empty v-if="currentDependencies.length === 0" description="暂无依赖" />
          <div v-for="dep in currentDependencies" :key="dep.id" class="dependency-item">
            <div class="dependency-header">
              <el-text tag="b">{{ dep.targetSSTSCode }}</el-text>
              <div>
                <el-button size="small" text @click="handleEditDependency(dep)">编辑</el-button>
                <el-button size="small" text type="danger" @click="handleDeleteDependency(dep.id)">删除</el-button>
              </div>
            </div>
            <el-text size="small">{{ dep.targetSSTSName }}</el-text>
            <div class="dependency-meta">
              <el-tag size="small" :type="getDependencyTypeTag(dep.type)">{{ getDependencyTypeText(dep.type) }}</el-tag>
              <el-text size="small" type="info">{{ dep.reason }}</el-text>
            </div>
            <el-text v-if="dep.details" size="small" type="info" style="display: block; margin-top: 4px;">
              {{ dep.details }}
            </el-text>
          </div>
        </div>

        <!-- 被依赖的SSTS列表 -->
        <div>
          <el-text tag="b">被依赖的SSTS</el-text>
          <el-empty v-if="currentDependents.length === 0" description="无其他SSTS依赖此项" />
          <div v-for="dep in currentDependents" :key="dep.id" class="dependency-item">
            <el-text tag="b">{{ dep.sourceSSTSCode }}</el-text> - {{ dep.sourceSSTSName }}
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 添加/编辑依赖对话框 -->
    <el-dialog
      v-model="dependencyDialogVisible"
      :title="editingDependency ? '编辑依赖关系' : '添加依赖关系'"
      width="600px"
    >
      <el-form :model="dependencyForm" label-width="120px">
        <el-form-item label="依赖的SSTS" required>
          <el-select 
            v-model="dependencyForm.targetSSTSId" 
            placeholder="选择SSTS"
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="ssts in availableSSTS"
              :key="ssts.id"
              :label="`${ssts.code} - ${ssts.title || ssts.name}`"
              :value="ssts.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="依赖类型" required>
          <el-radio-group v-model="dependencyForm.type">
            <el-radio value="strong">强依赖（必须完成）</el-radio>
            <el-radio value="weak">弱依赖（建议先完成）</el-radio>
            <el-radio value="optional">可选依赖</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="依赖原因" required>
          <el-input 
            v-model="dependencyForm.reason" 
            type="textarea" 
            :rows="3"
            placeholder="说明为什么需要这个依赖"
          />
        </el-form-item>
        <el-form-item label="依赖详情">
          <el-input 
            v-model="dependencyForm.details" 
            type="textarea" 
            :rows="2"
            placeholder="具体的依赖内容（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dependencyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDependency">保存</el-button>
      </template>
    </el-dialog>

    <!-- 里程碑设置对话框 -->
    <el-dialog
      v-model="milestoneDialogVisible"
      title="设置Sprint里程碑"
      width="600px"
    >
      <el-form :model="milestoneForm" label-width="120px" v-if="selectedSprint">
        <el-form-item label="Sprint">
          <el-text tag="b">{{ selectedSprint?.name }}</el-text>
          <el-text size="small" type="info" style="margin-left: 8px;">
            {{ formatSprintDates(selectedSprint) }}
          </el-text>
        </el-form-item>
        <el-form-item label="产品版本">
          <el-select 
            v-model="milestoneForm.productVersionId" 
            placeholder="选择产品版本"
            filterable
            clearable
            style="width: 100%;"
          >
            <el-option
              v-for="version in productVersions"
              :key="version.id"
              :label="`${version.name} (${version.version})`"
              :value="version.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="整车计划节点">
          <el-select 
            v-model="milestoneForm.vehicleNodeId" 
            placeholder="选择整车节点"
            filterable
            clearable
            style="width: 100%;"
          >
            <el-option
              v-for="node in vehicleNodes"
              :key="node.id"
              :label="`${node.name} (${formatDate(node.date)})`"
              :value="node.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="里程碑类型" required>
          <el-select v-model="milestoneForm.type" style="width: 100%;">
            <el-option label="产品发布" value="product-release" />
            <el-option label="整车节点" value="vehicle-milestone" />
            <el-option label="集成测试" value="integration" />
            <el-option label="测试里程碑" value="test" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="里程碑日期" required>
          <el-date-picker
            v-model="milestoneForm.milestoneDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="milestoneForm.description" 
            type="textarea" 
            :rows="2"
            placeholder="里程碑描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="milestoneDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDeleteMilestone" v-if="selectedSprint?.milestone">删除</el-button>
        <el-button type="primary" @click="handleSaveMilestone">保存</el-button>
      </template>
    </el-dialog>

    <!-- 持续时间设置对话框 -->
    <el-dialog
      v-model="durationDialogVisible"
      title="设置Feature持续时间"
      width="500px"
    >
      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 16px;"
      >
        设置Feature横跨多个Sprint，适用于工作量较大、需要多个迭代完成的Feature。
      </el-alert>
      <el-form v-if="selectedFeatureForDuration" label-width="120px">
        <el-form-item label="Feature">
          <el-text tag="b">{{ selectedFeatureForDuration.code }}</el-text>
          <el-text size="small" style="margin-left: 8px;">{{ selectedFeatureForDuration.name }}</el-text>
        </el-form-item>
        <el-form-item label="起始Sprint">
          <el-text>{{ currentDurationStartSprint?.name }}</el-text>
        </el-form-item>
        <el-form-item label="持续Sprint数" required>
          <el-input-number 
            v-model="durationValue"
            :min="1"
            :max="getMaxDuration()"
            :step="1"
            style="width: 100%;"
          />
          <el-text size="small" type="info" style="margin-top: 8px; display: block;">
            最多可横跨 {{ getMaxDuration() }} 个Sprint
          </el-text>
        </el-form-item>
        <el-form-item label="覆盖Sprint">
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <el-tag 
              v-for="(sprint, index) in getCoveredSprints()"
              :key="sprint.id"
              :type="index === 0 ? 'primary' : 'info'"
            >
              {{ sprint.name }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="durationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDuration">保存</el-button>
      </template>
    </el-dialog>

    <!-- 依赖冲突检测对话框 -->
    <DependencyConflictDialog
      v-model="conflictDialogVisible"
      :result="dependencyCheckResult"
      @export="handleExportConflictReport"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Search, Connection, Close, Check, Trophy, Plus, Minus, MoreFilled, More, UserFilled, Warning
} from '@element-plus/icons-vue'
import PageContainer from '@/components/Common/PageContainer.vue'
import DependencyConflictDialog from '@/components/Planning/DependencyConflictDialog.vue'
import { usePIStore } from '@/stores/modules/pi'
import { useSprintStore } from '@/stores/modules/sprint'
import { useFeatureStore } from '@/stores/modules/feature'
import { useSSTSStore } from '@/stores/modules/ssts'
import { useTeamStore } from '@/stores/modules/team'
import { useVersionStore } from '@/stores/modules/version'
import { useVehicleNodeStore } from '@/stores/modules/vehicle-node'
import { createDependencyChecker, type DependencyCheckResult } from '@/utils/dependency-checker'
import dayjs from 'dayjs'

// ============================================================================
// Setup
// ============================================================================

const route = useRoute()
const router = useRouter()
const piStore = usePIStore()
const sprintStore = useSprintStore()
const featureStore = useFeatureStore()
const sstsStore = useSSTSStore()
const teamStore = useTeamStore()
const versionStore = useVersionStore()
const vehicleNodeStore = useVehicleNodeStore()

const piId = route.params.piId as string

// ============================================================================
// State
// ============================================================================

const loading = ref(false)
const searchKeyword = ref('')
const filterType = ref<'feature' | 'ssts' | ''>('')
const selectedItem = ref<any>(null)
const highlightedSSTS = ref<string[]>([])
const dragTarget = ref<{ teamId: string; sprintId: string } | null>(null)
const draggedItem = ref<any>(null)

// 依赖关系管理
const dependencyDrawerVisible = ref(false)
const dependencyDialogVisible = ref(false)
const editingDependency = ref<any>(null)
const dependencyForm = ref({
  targetSSTSId: '',
  type: 'strong' as 'strong' | 'weak' | 'optional',
  reason: '',
  details: ''
})

// 里程碑设置
const milestoneDialogVisible = ref(false)
const selectedSprint = ref<any>(null)
const milestoneForm = ref({
  productVersionId: '',
  vehicleNodeId: '',
  type: 'product-release' as string,
  milestoneDate: '',
  description: ''
})

// 持续时间设置
const durationDialogVisible = ref(false)
const selectedFeatureForDuration = ref<any>(null)
const currentDurationTeamId = ref<string>('')
const currentDurationSprintId = ref<string>('')
const durationValue = ref(1)

// 阶段1分配数据
const stage1Allocations = ref<{
  features: Array<{ featureId: string; teamId: string; sprintId: string; duration?: number }>
  sstss: Array<{ sstsId: string; teamId: string; sprintId: string; duration?: number }>
}>({
  features: [],
  sstss: []
})

// 移除stage1Completed，不再有阶段完成的概念

// 依赖检查
const conflictDialogVisible = ref(false)
const dependencyCheckResult = ref<DependencyCheckResult | null>(null)

// ============================================================================
// Computed
// ============================================================================

const currentPI = computed(() => {
  return piStore.piVersions.find(p => p.id === piId)
})

const sprints = computed(() => {
  return sprintStore.sprints.filter(s => s.piId === piId).sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )
})

const teams = computed(() => teamStore.teams)

const features = computed(() => featureStore.features.filter(f => f.targetPI === piId))
const sstss = computed(() => sstsStore.sstsList.filter(s => {
  const feature = features.value.find(f => f.id === s.featureId)
  return feature && feature.targetPI === piId
}))

const filteredFeatures = computed(() => {
  let result = features.value.filter(f => {
    // 检查是否已分配
    const allocated = stage1Allocations.value.features.find(a => a.featureId === f.id)
    if (allocated) return false

    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      if (!f.code.toLowerCase().includes(keyword) && 
          !f.name.toLowerCase().includes(keyword)) {
        return false
      }
    }

    return true
  })

  if (filterType.value === 'ssts') return []
  return result
})

const filteredSSTS = computed(() => {
  let result = sstss.value.filter(s => {
    // 检查是否已分配
    const allocated = stage1Allocations.value.sstss.find(a => a.sstsId === s.id)
    if (allocated) return false

    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      if (!s.code.toLowerCase().includes(keyword) && 
          !(s.title || s.name)?.toLowerCase().includes(keyword)) {
        return false
      }
    }

    return true
  })

  if (filterType.value === 'feature') return []
  return result
})

const totalFeaturesCount = computed(() => features.value.length)
const allocatedFeaturesCount = computed(() => stage1Allocations.value.features.length)
const totalSSTSCount = computed(() => sstss.value.length)
const allocatedSSTSCount = computed(() => stage1Allocations.value.sstss.length)

const stage1Progress = computed(() => {
  const total = totalFeaturesCount.value + totalSSTSCount.value
  const allocated = allocatedFeaturesCount.value + allocatedSSTSCount.value
  return total > 0 ? Math.round((allocated / total) * 100) : 0
})

// 移除canCompleteStage1，不再需要检查是否可以完成

const currentDependencies = computed(() => {
  if (!selectedItem.value || selectedItem.value.type !== 'ssts') return []
  return sstsDependencies.value.filter(d => d.sourceSSTSId === selectedItem.value.id)
})

const currentDependents = computed(() => {
  if (!selectedItem.value || selectedItem.value.type !== 'ssts') return []
  return sstsDependencies.value.filter(d => d.targetSSTSId === selectedItem.value.id)
})

const availableSSTS = computed(() => {
  return sstss.value.filter(s => s.id !== selectedItem.value?.id)
})

const productVersions = computed(() => versionStore.versions)
const vehicleNodes = computed(() => {
  // 获取当前PI相关的整车节点
  return vehicleNodeStore.vehicleNodes.filter(node => {
    // 可以根据PI的时间范围过滤节点
    const nodeDate = new Date(node.date)
    const piStart = currentPI.value ? new Date(currentPI.value.startDate) : null
    const piEnd = currentPI.value ? new Date(currentPI.value.endDate) : null
    
    if (piStart && piEnd) {
      // 只显示PI时间范围内及稍后的节点
      const threeMonthsAfter = new Date(piEnd)
      threeMonthsAfter.setMonth(threeMonthsAfter.getMonth() + 3)
      return nodeDate >= piStart && nodeDate <= threeMonthsAfter
    }
    
    return true
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

const sstsDependencies = ref<Array<{
  id: string
  sourceSSTSId: string
  targetSSTSId: string
  type: 'strong' | 'weak' | 'optional'
  reason: string
  details?: string
}>>([])

// ============================================================================
// Methods
// ============================================================================

function formatDateRange(start: string, end: string) {
  return `${dayjs(start).format('YYYY/MM/DD')} ~ ${dayjs(end).format('YYYY/MM/DD')}`
}

function formatSprintDates(sprint: any) {
  return `${dayjs(sprint.startDate).format('MM/DD')} ~ ${dayjs(sprint.endDate).format('MM/DD')}`
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY/MM/DD')
}

function getPIStatusType(status: string) {
  const map: Record<string, 'success' | 'warning' | 'info' | ''> = {
    'planning': 'info',
    'committed': 'warning',
    'in-progress': 'warning',
    'completed': 'success'
  }
  return map[status] || 'info'
}

function getPIStatusText(status: string) {
  const map: Record<string, string> = {
    'planning': '规划中',
    'committed': '已承诺',
    'in-progress': '进行中',
    'completed': '已完成'
  }
  return map[status] || status
}

function getPriorityType(priority: string) {
  const map: Record<string, 'danger' | 'warning' | 'info' | ''> = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return map[priority] || 'info'
}

function getFeatureName(featureId: string) {
  const feature = features.value.find(f => f.id === featureId)
  return feature?.code || featureId
}

function getSSTSStoryPoints(ssts: any) {
  // SSTS可能没有storyPoints字段，使用estimate或默认值
  return ssts.storyPoints || ssts.estimate || 0
}

function getAllocatedItems(teamId: string, sprintId: string) {
  const items: any[] = []
  
  // Feature (包含duration信息)
  stage1Allocations.value.features.forEach(alloc => {
    if (alloc.teamId === teamId && alloc.sprintId === sprintId) {
      const feature = features.value.find(f => f.id === alloc.featureId)
      if (feature) {
        items.push({ ...feature, type: 'feature', duration: alloc.duration })
      }
    }
  })

  // SSTS (包含duration信息)
  stage1Allocations.value.sstss.forEach(alloc => {
    if (alloc.teamId === teamId && alloc.sprintId === sprintId) {
      const ssts = sstss.value.find(s => s.id === alloc.sstsId)
      if (ssts) {
        items.push({ ...ssts, type: 'ssts', duration: alloc.duration })
      }
    }
  })

  return items
}

function getSprintTeamLoad(teamId: string, sprintId: string) {
  const items = getAllocatedItems(teamId, sprintId)
  return items.reduce((sum, item) => {
    if (item.type === 'feature') {
      return sum + (item.storyPoints || 0)
    } else {
      return sum + getSSTSStoryPoints(item)
    }
  }, 0)
}

function getSprintTotalLoad(sprint: any) {
  let total = 0
  teams.value.forEach(team => {
    total += getSprintTeamLoad(team.id, sprint.id)
  })
  return total
}

function getLoadRate(teamId: string, sprintId: string) {
  const team = teams.value.find(t => t.id === teamId)
  if (!team) return 0
  const load = getSprintTeamLoad(teamId, sprintId)
  return team.capacity > 0 ? Math.round((load / team.capacity) * 100) : 0
}

function handleSelectItem(item: any, type: 'feature' | 'ssts') {
  selectedItem.value = { ...item, type }
  
  // 如果是SSTS，高亮显示依赖的SSTS
  if (type === 'ssts' && item.dependencies) {
    highlightedSSTS.value = item.dependencies || []
  } else {
    highlightedSSTS.value = []
  }
}

function handleDragStart(event: DragEvent, item: any, type: 'feature' | 'ssts') {
  draggedItem.value = { ...item, type }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleDragOver(event: DragEvent, teamId: string, sprintId: string) {
  event.preventDefault()
  dragTarget.value = { teamId, sprintId }
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDragLeave() {
  dragTarget.value = null
}

function handleDrop(event: DragEvent, teamId: string, sprintId: string) {
  event.preventDefault()
  dragTarget.value = null

  if (!draggedItem.value) return

  const item = draggedItem.value
  const team = teams.value.find(t => t.id === teamId)
  const sprint = sprints.value.find(s => s.id === sprintId)

  if (!team || !sprint) return

  // 容量检查
  const currentLoad = getSprintTeamLoad(teamId, sprintId)
  const itemSP = item.type === 'feature' ? (item.storyPoints || 0) : getSSTSStoryPoints(item)
  
  if (currentLoad + itemSP > team.capacity) {
    ElMessage.warning(`容量不足！当前负载: ${currentLoad} SP，添加后: ${currentLoad + itemSP} SP，容量: ${team.capacity} SP`)
    draggedItem.value = null
    return
  }

  // 依赖检查（如果是SSTS）
  if (item.type === 'ssts' && item.dependencies?.length > 0) {
    const unmetDeps = item.dependencies.filter((depId: string) => {
      const depAlloc = stage1Allocations.value.sstss.find(a => a.sstsId === depId)
      if (!depAlloc) return true // 依赖未分配
      // 检查依赖是否在更早的Sprint
      const depSprint = sprints.value.find(s => s.id === depAlloc.sprintId)
      const currentSprint = sprints.value.find(s => s.id === sprintId)
      if (depSprint && currentSprint) {
        return new Date(depSprint.endDate) > new Date(currentSprint.startDate)
      }
      return false
    })

    if (unmetDeps.length > 0) {
      ElMessage.warning(`依赖未满足！请先分配依赖的SSTS: ${unmetDeps.join(', ')}`)
      draggedItem.value = null
      return
    }
  }

  // 添加分配
  if (item.type === 'feature') {
    // 移除旧分配
    const index = stage1Allocations.value.features.findIndex(a => a.featureId === item.id)
    if (index !== -1) {
      stage1Allocations.value.features.splice(index, 1)
    }
    // 添加新分配
    stage1Allocations.value.features.push({
      featureId: item.id,
      teamId,
      sprintId
    })
  } else {
    // 移除旧分配
    const index = stage1Allocations.value.sstss.findIndex(a => a.sstsId === item.id)
    if (index !== -1) {
      stage1Allocations.value.sstss.splice(index, 1)
    }
    // 添加新分配
    stage1Allocations.value.sstss.push({
      sstsId: item.id,
      teamId,
      sprintId
    })
  }

  ElMessage.success('分配成功')
  draggedItem.value = null
}

function handleRemoveAllocation(item: any, teamId: string, sprintId: string) {
  if (item.type === 'feature') {
    const index = stage1Allocations.value.features.findIndex(
      a => a.featureId === item.id && a.teamId === teamId && a.sprintId === sprintId
    )
    if (index !== -1) {
      stage1Allocations.value.features.splice(index, 1)
      ElMessage.success('已移除')
    }
  } else {
    const index = stage1Allocations.value.sstss.findIndex(
      a => a.sstsId === item.id && a.teamId === teamId && a.sprintId === sprintId
    )
    if (index !== -1) {
      stage1Allocations.value.sstss.splice(index, 1)
      ElMessage.success('已移除')
    }
  }
}

function handleManageDependencies(item: any, type: 'feature' | 'ssts') {
  if (type !== 'ssts') {
    ElMessage.info('目前仅支持SSTS的依赖关系管理')
    return
  }
  selectedItem.value = { ...item, type }
  dependencyDrawerVisible.value = true
}

function handleAddDependency() {
  editingDependency.value = null
  dependencyForm.value = {
    targetSSTSId: '',
    type: 'strong',
    reason: '',
    details: ''
  }
  dependencyDialogVisible.value = true
}

function handleEditDependency(dep: any) {
  editingDependency.value = dep
  dependencyForm.value = {
    targetSSTSId: dep.targetSSTSId,
    type: dep.type,
    reason: dep.reason,
    details: dep.details || ''
  }
  dependencyDialogVisible.value = true
}

function handleDeleteDependency(depId: string) {
  ElMessageBox.confirm('确定要删除这个依赖关系吗？', '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = sstsDependencies.value.findIndex(d => d.id === depId)
    if (index !== -1) {
      sstsDependencies.value.splice(index, 1)
      ElMessage.success('已删除')
    }
  }).catch(() => {})
}

function handleSaveDependency() {
  if (!dependencyForm.value.targetSSTSId || !dependencyForm.value.reason) {
    ElMessage.warning('请填写必填项')
    return
  }

  if (editingDependency.value) {
    // 更新
    const index = sstsDependencies.value.findIndex(d => d.id === editingDependency.value.id)
    if (index !== -1) {
      sstsDependencies.value[index] = {
        ...sstsDependencies.value[index],
        ...dependencyForm.value
      }
    }
    ElMessage.success('依赖关系已更新')
  } else {
    // 新增
    const newDep = {
      id: `dep-${Date.now()}`,
      sourceSSTSId: selectedItem.value.id,
      targetSSTSId: dependencyForm.value.targetSSTSId,
      type: dependencyForm.value.type,
      reason: dependencyForm.value.reason,
      details: dependencyForm.value.details,
      sourceSSTSCode: selectedItem.value.code,
      sourceSSTSName: selectedItem.value.title || selectedItem.value.name,
      targetSSTSCode: availableSSTS.value.find(s => s.id === dependencyForm.value.targetSSTSId)?.code || '',
      targetSSTSName: availableSSTS.value.find(s => s.id === dependencyForm.value.targetSSTSId)?.title || 
                       availableSSTS.value.find(s => s.id === dependencyForm.value.targetSSTSId)?.name || ''
    }
    sstsDependencies.value.push(newDep)
    
    // 更新SSTS的dependencies字段
    const ssts = sstss.value.find(s => s.id === selectedItem.value.id)
    if (ssts) {
      if (!ssts.dependencies) ssts.dependencies = []
      if (!ssts.dependencies.includes(dependencyForm.value.targetSSTSId)) {
        ssts.dependencies.push(dependencyForm.value.targetSSTSId)
      }
    }
    
    ElMessage.success('依赖关系已添加')
  }

  dependencyDialogVisible.value = false
}

function getDependencyTypeTag(type: string) {
  const map: Record<string, 'danger' | 'warning' | 'info' | ''> = {
    'strong': 'danger',
    'weak': 'warning',
    'optional': 'info'
  }
  return map[type] || 'info'
}

function getDependencyTypeText(type: string) {
  const map: Record<string, string> = {
    'strong': '强依赖',
    'weak': '弱依赖',
    'optional': '可选依赖'
  }
  return map[type] || type
}

function handleSetMilestone(sprint: any) {
  selectedSprint.value = sprint
  if (sprint.milestone) {
    milestoneForm.value = {
      productVersionId: sprint.milestone.productVersionId || '',
      vehicleNodeId: sprint.milestone.vehicleNodeId || '',
      type: sprint.milestone.type || 'product-release',
      milestoneDate: sprint.milestone.milestoneDate || sprint.endDate,
      description: sprint.milestone.description || ''
    }
  } else {
    milestoneForm.value = {
      productVersionId: '',
      vehicleNodeId: '',
      type: 'product-release',
      milestoneDate: sprint.endDate,
      description: ''
    }
  }
  milestoneDialogVisible.value = true
}

function handleSaveMilestone() {
  if (!selectedSprint.value) return

  if (!milestoneForm.value.milestoneDate) {
    ElMessage.warning('请设置里程碑日期')
    return
  }

  const milestone = {
    id: `milestone-${Date.now()}`,
    sprintId: selectedSprint.value.id,
    productVersionId: milestoneForm.value.productVersionId || undefined,
    productVersion: milestoneForm.value.productVersionId ? 
      productVersions.value.find(v => v.id === milestoneForm.value.productVersionId)?.name : undefined,
    vehicleNodeId: milestoneForm.value.vehicleNodeId || undefined,
    vehicleNode: milestoneForm.value.vehicleNodeId ? 
      vehicleNodes.value.find(n => n.id === milestoneForm.value.vehicleNodeId)?.name : undefined,
    type: milestoneForm.value.type,
    milestoneDate: milestoneForm.value.milestoneDate,
    description: milestoneForm.value.description
  }

  // 更新Sprint的milestone字段
  const sprint = sprints.value.find(s => s.id === selectedSprint.value.id)
  if (sprint) {
    sprint.milestone = milestone
  }

  ElMessage.success('里程碑已设置')
  milestoneDialogVisible.value = false
}

function handleDeleteMilestone() {
  if (!selectedSprint.value) return

  ElMessageBox.confirm('确定要删除这个里程碑吗？', '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const sprint = sprints.value.find(s => s.id === selectedSprint.value.id)
    if (sprint) {
      sprint.milestone = undefined
      ElMessage.success('里程碑已删除')
    }
    milestoneDialogVisible.value = false
  }).catch(() => {})
}

// 持续时间设置函数
const currentDurationStartSprint = computed(() => {
  return sprints.value.find(s => s.id === currentDurationSprintId.value)
})

function getMaxDuration() {
  const startIndex = sprints.value.findIndex(s => s.id === currentDurationSprintId.value)
  if (startIndex === -1) return 1
  return sprints.value.length - startIndex
}

function getCoveredSprints() {
  const startIndex = sprints.value.findIndex(s => s.id === currentDurationSprintId.value)
  if (startIndex === -1) return []
  return sprints.value.slice(startIndex, startIndex + durationValue.value)
}

function handleSetDuration(item: any, teamId: string, sprintId: string) {
  selectedFeatureForDuration.value = item
  currentDurationTeamId.value = teamId
  currentDurationSprintId.value = sprintId
  
  // 获取当前的duration值
  const allocation = stage1Allocations.value.features.find(
    a => a.featureId === item.id && a.teamId === teamId && a.sprintId === sprintId
  )
  durationValue.value = allocation?.duration || 1
  
  durationDialogVisible.value = true
}

function handleSaveDuration() {
  if (!selectedFeatureForDuration.value || !currentDurationTeamId.value || !currentDurationSprintId.value) return

  // 更新allocation中的duration
  const allocation = stage1Allocations.value.features.find(
    a => a.featureId === selectedFeatureForDuration.value.id && 
         a.teamId === currentDurationTeamId.value && 
         a.sprintId === currentDurationSprintId.value
  )
  
  if (allocation) {
    allocation.duration = durationValue.value
  }

  ElMessage.success(`已设置Feature横跨${durationValue.value}个Sprint`)
  durationDialogVisible.value = false
}

// Sprint管理函数
function handleAddSprint() {
  if (!currentPI.value) return

  const lastSprint = sprints.value[sprints.value.length - 1]
  const newSprintNumber = sprints.value.length + 1
  const sprintDuration = 14 // 默认14天

  // 计算新Sprint的日期
  const lastEndDate = dayjs(lastSprint.endDate)
  const newStartDate = lastEndDate.add(1, 'day')
  const newEndDate = newStartDate.add(sprintDuration - 1, 'day')

  const newSprint = {
    id: `sprint-${Date.now()}`,
    code: `${currentPI.value.code}-S${newSprintNumber}`,
    name: `Sprint ${currentPI.value.name.split(' ')[1]}-${String(newSprintNumber).padStart(2, '0')}`,
    piId: currentPI.value.id,
    startDate: newStartDate.format('YYYY-MM-DD'),
    endDate: newEndDate.format('YYYY-MM-DD'),
    status: 'planning' as const,
    capacity: 100, // 默认容量
    goals: [],
    milestone: undefined
  }

  sprints.value.push(newSprint)
  
  // 更新PI的Sprint数量
  if (currentPI.value) {
    currentPI.value.sprintCount = sprints.value.length
  }

  ElMessage.success(`已添加 ${newSprint.name}`)
}

function handleRemoveSprint() {
  if (sprints.value.length <= 1) {
    ElMessage.warning('至少需要保留一个Sprint')
    return
  }

  const lastSprint = sprints.value[sprints.value.length - 1]
  
  // 检查该Sprint是否有分配的Feature或SSTS
  const hasAllocations = 
    stage1Allocations.value.features.some(alloc => alloc.sprintId === lastSprint.id) ||
    stage1Allocations.value.sstss.some(alloc => alloc.sprintId === lastSprint.id)

  if (hasAllocations) {
    ElMessageBox.confirm(
      `${lastSprint.name} 中已有分配的Feature或SSTS，删除后这些分配将被移除。确定要删除吗？`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 删除该Sprint的所有分配
      stage1Allocations.value.features = stage1Allocations.value.features.filter(
        alloc => alloc.sprintId !== lastSprint.id
      )
      stage1Allocations.value.sstss = stage1Allocations.value.sstss.filter(
        alloc => alloc.sprintId !== lastSprint.id
      )
      
      // 删除Sprint
      sprints.value.pop()
      
      // 更新PI的Sprint数量
      if (currentPI.value) {
        currentPI.value.sprintCount = sprints.value.length
      }
      
      ElMessage.success(`已删除 ${lastSprint.name}`)
    }).catch(() => {})
  } else {
    sprints.value.pop()
    
    // 更新PI的Sprint数量
    if (currentPI.value) {
      currentPI.value.sprintCount = sprints.value.length
    }
    
    ElMessage.success(`已删除 ${lastSprint.name}`)
  }
}

function handleSaveDraft() {
  // 保存草稿到localStorage或后端
  const draft = {
    piId,
    allocations: stage1Allocations.value,
    dependencies: sstsDependencies.value,
    milestones: sprints.value.map(s => s.milestone).filter(Boolean),
    updatedAt: new Date().toISOString()
  }
  localStorage.setItem(`pi-planning-stage1-draft-${piId}`, JSON.stringify(draft))
  ElMessage.success('草稿已保存')
}

// 移除handleCompleteStage1函数，不再有阶段完成的概念

function handleGoToStage2() {
  // 不需要检查完成状态，允许随时切换
  router.push(`/function/c3/planning/pi/${piId}/stage2`)
}

function handleSmartAllocate() {
  ElMessage.info('智能分配功能开发中...')
}

function handleDetectConflicts() {
  // 创建依赖检查器
  const checker = createDependencyChecker()
  
  // 添加Sprint信息
  sprints.value.forEach(sprint => {
    checker.addSprint(sprint.id, sprint.startDate, sprint.endDate)
  })
  
  // 添加Feature节点
  features.value.forEach(feature => {
    const alloc = stage1Allocations.value.features.find(a => a.featureId === feature.id)
    checker.addNode({
      id: feature.id,
      code: feature.code,
      title: feature.name,
      type: 'feature',
      sprintId: alloc?.sprintId,
      teamId: alloc?.teamId
    })
  })
  
  // 添加SSTS节点和依赖关系
  sstss.value.forEach(ssts => {
    const alloc = stage1Allocations.value.sstss.find(a => a.sstsId === ssts.id)
    checker.addNode({
      id: ssts.id,
      code: ssts.code,
      title: ssts.title || ssts.name || '',
      type: 'ssts',
      sprintId: alloc?.sprintId,
      teamId: alloc?.teamId
    })
    
    // 添加SSTS的依赖关系
    if (ssts.dependencies && Array.isArray(ssts.dependencies)) {
      ssts.dependencies.forEach((depId: string) => {
        checker.addEdge(ssts.id, depId, 'strong', '技术依赖')
      })
    }
    
    // 添加从sstsDependencies中定义的依赖
    sstsDependencies.value
      .filter(dep => dep.sourceSSTSId === ssts.id)
      .forEach(dep => {
        checker.addEdge(dep.sourceSSTSId, dep.targetSSTSId, dep.type, dep.reason)
      })
  })
  
  // 执行检查
  const result = checker.check()
  dependencyCheckResult.value = result
  
  // 显示结果
  if (result.valid) {
    ElMessage.success({
      message: '未发现严重冲突',
      duration: 2000
    })
  } else {
    const errorCount = result.conflicts.filter(c => c.severity === 'error').length
    ElMessage.warning({
      message: `发现 ${errorCount} 个严重冲突`,
      duration: 3000
    })
  }
  
  // 打开详情对话框
  conflictDialogVisible.value = true
}

function handleExportConflictReport() {
  if (!dependencyCheckResult.value) return
  
  // 生成报告内容
  const lines: string[] = []
  lines.push('='.repeat(80))
  lines.push('PI Planning 依赖冲突检测报告')
  lines.push('='.repeat(80))
  lines.push('')
  lines.push(`PI: ${currentPI.value?.name || piId}`)
  lines.push(`检测时间: ${new Date().toLocaleString('zh-CN')}`)
  lines.push(`检测结果: ${dependencyCheckResult.value.valid ? '通过' : '未通过'}`)
  lines.push('')
  
  // 统计信息
  lines.push('统计信息:')
  lines.push('-'.repeat(80))
  lines.push(`总依赖数: ${dependencyCheckResult.value.statistics.totalDependencies}`)
  lines.push(`循环依赖: ${dependencyCheckResult.value.statistics.circularDependencies}`)
  lines.push(`缺失依赖: ${dependencyCheckResult.value.statistics.missingDependencies}`)
  lines.push(`时间冲突: ${dependencyCheckResult.value.statistics.timingConflicts}`)
  lines.push(`跨团队依赖: ${dependencyCheckResult.value.statistics.crossTeamDependencies}`)
  lines.push('')
  
  // 冲突详情
  if (dependencyCheckResult.value.conflicts.length > 0) {
    lines.push('冲突详情:')
    lines.push('-'.repeat(80))
    
    dependencyCheckResult.value.conflicts.forEach((conflict, index) => {
      lines.push(`${index + 1}. [${conflict.severity.toUpperCase()}] ${conflict.type}`)
      lines.push(`   消息: ${conflict.message}`)
      lines.push(`   来源: ${conflict.source.code} - ${conflict.source.title}`)
      if (conflict.target) {
        lines.push(`   目标: ${conflict.target.code} - ${conflict.target.title}`)
      }
      if (conflict.suggestion) {
        lines.push(`   建议: ${conflict.suggestion}`)
      }
      lines.push('')
    })
  }
  
  lines.push('='.repeat(80))
  lines.push('报告结束')
  lines.push('='.repeat(80))
  
  // 下载为文本文件
  const content = lines.join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `PI-Planning-依赖冲突报告-${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('冲突报告已导出')
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(async () => {
  loading.value = true
  try {
    await piStore.fetchPIById(piId)
    // 加载草稿
    const draft = localStorage.getItem(`pi-planning-stage1-draft-${piId}`)
    if (draft) {
      const draftData = JSON.parse(draft)
      stage1Allocations.value = draftData.allocations || { features: [], sstss: [] }
      sstsDependencies.value = draftData.dependencies || []
      // 移除stage1Completed的加载，不再有阶段完成的概念
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.action-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.item-card {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.item-card:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.item-card.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.item-card.highlight-dependency {
  border-color: #e6a23c;
  background-color: #fdf6ec;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-title {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.item-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}

.planning-board {
  width: 100%;
  overflow-x: auto;
}

.board-header {
  display: flex;
  border-bottom: 2px solid #e4e7ed;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.team-header-cell {
  min-width: 120px;
  padding: 12px;
  font-weight: 600;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.sprint-header-cell {
  min-width: 200px;
  padding: 12px;
  border-right: 1px solid #e4e7ed;
  text-align: center;
}

.sprint-header-cell.has-milestone {
  background: #f0f9ff;
}

.sprint-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.sprint-dates {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.sprint-milestone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 4px;
  color: #409eff;
}

.sprint-capacity {
  font-size: 12px;
}

.team-row {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  min-height: 200px;
}

.team-cell {
  min-width: 120px;
  padding: 12px;
  background: #fafafa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.sprint-cell {
  min-width: 200px;
  padding: 12px;
  border-right: 1px solid #e4e7ed;
  position: relative;
  min-height: 200px;
}

.sprint-cell.drop-target {
  background-color: #e1f3d8;
  border: 2px dashed #67c23a;
}

.sprint-cell.overload {
  background-color: #fef0f0;
}

.capacity-info {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e4e7ed;
}

.allocated-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.allocated-card {
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.allocated-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.allocated-card.highlight-dependency {
  border-color: #e6a23c;
  background-color: #fdf6ec;
}

.allocated-card.feature-card {
  border-left: 3px solid #409eff;
}

.allocated-card.multi-sprint {
  background: linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%);
  border: 2px solid #f59e0b;
  border-left: 4px solid #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
}

.allocated-card.ssts-card {
  border-left: 3px solid #67c23a;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.card-title {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drop-hint {
  text-align: center;
  color: #c0c4cc;
  font-size: 12px;
  padding: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.dependency-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.dependency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dependency-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}
</style>
