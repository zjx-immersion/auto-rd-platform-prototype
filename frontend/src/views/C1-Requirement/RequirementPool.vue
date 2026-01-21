<template>
  <div class="requirement-pool-container">
    <PageContainer>
      <!-- 页面标题和统计 -->
      <div class="page-header">
        <div class="title-section">
        <h2>需求池管理</h2>
          <p class="description">管理和分配Epic到项目</p>
        </div>
        <div class="stats-section">
          <el-statistic title="总数" :value="statistics.totalEpics" />
          <el-statistic title="未分配" :value="statistics.unallocated" />
          <el-statistic title="已分配" :value="statistics.allocated" />
          <el-statistic title="已完成" :value="statistics.completed" />
        </div>
      </div>

      <!-- 筛选和操作栏 -->
      <div class="action-bar">
        <div class="filters">
          <el-input
            v-model="searchText"
            placeholder="搜索Epic名称、编码..."
            clearable
            style="width: 240px"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="selectedStatus"
            placeholder="分配状态"
            clearable
            multiple
            collapse-tags
            style="width: 160px"
            @change="handleFilterChange"
          >
            <el-option label="未分配" value="unallocated" />
            <el-option label="已分配" value="allocated" />
            <el-option label="已完成" value="completed" />
          </el-select>

          <el-select
            v-model="selectedPriority"
            placeholder="优先级"
            clearable
            multiple
            collapse-tags
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option label="P0" value="P0" />
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
            <el-option label="P3" value="P3" />
          </el-select>

          <el-select
            v-model="selectedDomain"
            placeholder="领域"
            clearable
            multiple
            collapse-tags
            style="width: 160px"
            @change="handleFilterChange"
          >
            <el-option label="智能驾驶" value="智能驾驶" />
            <el-option label="智能座舱" value="智能座舱" />
            <el-option label="电子电器架构" value="电子电器架构" />
            <el-option label="底盘域" value="底盘域" />
            <el-option label="新能源" value="新能源" />
          </el-select>

          <el-button :icon="RefreshLeft" @click="handleResetFilters">重置</el-button>
        </div>

        <div class="actions">
          <el-button
            type="primary"
            :icon="Plus"
            :disabled="selectedEpics.length === 0"
            @click="handleBatchAllocate"
          >
            批量分配 ({{ selectedEpics.length }})
          </el-button>
          <el-button :icon="Plus" @click="handleCreateEpic">创建Epic</el-button>
          <el-button :icon="Upload">导入</el-button>
        </div>
      </div>

      <!-- Epic列表 -->
      <div class="table-wrapper">
        <el-table
          v-loading="loading"
          :data="filteredEpics"
          stripe
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
              <el-table-column type="selection" width="55" />
          
          <el-table-column prop="code" label="Epic编码" width="140" />
          
          <el-table-column label="Epic名称" min-width="220">
            <template #default="{ row }">
              <div class="epic-name-cell">
                <span class="epic-name">{{ row.name }}</span>
                <el-tag
                  v-if="row.allocationStatus === 'allocated'"
                  type="success"
                  size="small"
                  style="margin-left: 8px"
                >
                  已分配
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="领域" width="120">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.domain }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="优先级" width="90" align="center">
                <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)" size="small">
                {{ row.priority }}
              </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="状态" width="100">
                <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
                </template>
              </el-table-column>

          <el-table-column label="Story Points" width="110" align="center">
                <template #default="{ row }">
              <el-tag size="small">{{ row.totalStoryPoints }} SP</el-tag>
                </template>
              </el-table-column>

          <el-table-column label="分配状态" width="200">
                <template #default="{ row }">
              <div v-if="row.allocations.length === 0" class="allocation-empty">
                <el-text type="info" size="small">未分配</el-text>
              </div>
              <div v-else class="allocation-list">
                <el-tag
                  v-for="alloc in row.allocations"
                  :key="alloc.allocationId"
                  size="small"
                  closable
                  @close="handleRemoveAllocation(row, alloc)"
                >
                  {{ alloc.projectName }}
                </el-tag>
              </div>
                </template>
              </el-table-column>

          <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                :disabled="row.allocationStatus === 'completed'"
                @click="handleAllocateToProject(row)"
              >
                分配到项目
              </el-button>
              <el-button link type="primary" size="small" @click="handleViewDetail(row)">
                查看详情
              </el-button>
                </template>
              </el-table-column>
            </el-table>
      </div>
    </PageContainer>

    <!-- 分配到项目对话框 -->
    <el-dialog
      v-model="allocateDialogVisible"
      title="分配Epic到项目"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="allocateFormRef" :model="allocateForm" :rules="allocateFormRules" label-width="100px">
        <el-form-item label="选择项目" prop="projectId">
          <el-select
            v-model="allocateForm.projectId"
            placeholder="请选择项目"
            style="width: 100%"
            @change="handleProjectChange"
          >
            <el-option
              v-for="project in availableProjects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Epic数量">
          <el-text>{{ allocateForm.epicIds.length }} 个Epic</el-text>
        </el-form-item>

        <el-form-item label="Epic列表">
          <div class="epic-list-in-dialog">
            <el-tag
              v-for="epic in getEpicsByIds(allocateForm.epicIds)"
              :key="epic.id"
              size="small"
              style="margin: 4px"
            >
              {{ epic.code }}: {{ epic.name }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="allocateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="allocating" @click="handleConfirmAllocate">
          确认分配
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Search, RefreshLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRequirementPoolStore } from '@/stores/modules/requirement-pool'
import { useProjectStore } from '@/stores/modules/project'
import { useUserStore } from '@/stores/modules/user'
import type { PoolEpic } from '@/types/requirement-pool'
import type { Priority } from '@/types/domain-models'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const poolStore = useRequirementPoolStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

// 数据
const loading = ref(false)
const allocating = ref(false)
const allocateDialogVisible = ref(false)
const allocateFormRef = ref<FormInstance>()

// 筛选条件
const searchText = ref('')
const selectedStatus = ref<string[]>([])
const selectedPriority = ref<Priority[]>([])
const selectedDomain = ref<string[]>([])

// 选中的Epic
const selectedEpics = ref<PoolEpic[]>([])

// 分配表单
const allocateForm = ref({
  projectId: '',
  projectName: '',
  epicIds: [] as string[]
})

const allocateFormRules: FormRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }]
}

// 计算属性
const statistics = computed(() => poolStore.statistics)
const filteredEpics = computed(() => poolStore.filteredEpics)

const availableProjects = computed(() => {
  // 获取所有活动项目
  return projectStore.projects.filter(p => p.status === 'planning' || p.status === 'active')
})

// 辅助函数
const getPriorityType = (priority: Priority) => {
  const map: Record<Priority, any> = {
    P0: 'danger',
    P1: 'warning',
    P2: 'info',
    P3: ''
  }
  return map[priority] || ''
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    draft: 'info',
    'pending-review': 'warning',
    approved: 'success',
    'in-progress': 'warning',
    completed: 'success'
  }
  return map[status] || ''
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    'pending-review': '待评审',
    approved: '已批准',
    'in-progress': '进行中',
    completed: '已完成'
  }
  return map[status] || status
}

const getEpicsByIds = (epicIds: string[]) => {
  if (!poolStore.pool) return []
  return poolStore.pool.epics.filter(epic => epicIds.includes(epic.id))
}

// 事件处理
const handleSearch = () => {
  poolStore.setFilters({ searchText: searchText.value })
}

const handleFilterChange = () => {
  poolStore.setFilters({
    status: selectedStatus.value as any,
    priority: selectedPriority.value,
    domain: selectedDomain.value
  })
}

const handleResetFilters = () => {
  searchText.value = ''
  selectedStatus.value = []
  selectedPriority.value = []
  selectedDomain.value = []
  poolStore.clearFilters()
}

const handleSelectionChange = (selection: PoolEpic[]) => {
  selectedEpics.value = selection
}

const handleAllocateToProject = (epic: PoolEpic) => {
  allocateForm.value = {
    projectId: '',
    projectName: '',
    epicIds: [epic.id]
  }
  allocateDialogVisible.value = true
}

const handleBatchAllocate = () => {
  if (selectedEpics.value.length === 0) {
    ElMessage.warning('请先选择Epic')
    return
  }

  allocateForm.value = {
    projectId: '',
    projectName: '',
    epicIds: selectedEpics.value.map(e => e.id)
  }
  allocateDialogVisible.value = true
}

const handleProjectChange = (projectId: string) => {
  const project = availableProjects.value.find(p => p.id === projectId)
  if (project) {
    allocateForm.value.projectName = project.name
  }
}

const handleConfirmAllocate = async () => {
  if (!allocateFormRef.value) return

  await allocateFormRef.value.validate(async (valid) => {
    if (!valid) return

    allocating.value = true
    try {
      // 调用Store分配Epic
      await poolStore.batchAllocateEpics({
        epicIds: allocateForm.value.epicIds,
        projectId: allocateForm.value.projectId,
        projectName: allocateForm.value.projectName,
        allocatedBy: userStore.currentUser?.userId || 'current-user'
      })

      ElMessage.success(`成功分配 ${allocateForm.value.epicIds.length} 个Epic到项目`)
      allocateDialogVisible.value = false

      // 清空选择
      selectedEpics.value = []
    } catch (error) {
      ElMessage.error('分配失败')
      console.error(error)
    } finally {
      allocating.value = false
    }
  })
}

const handleRemoveAllocation = async (epic: PoolEpic, allocation: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要从项目"${allocation.projectName}"移除此Epic吗？`,
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 实现移除分配逻辑
    ElMessage.success('已移除分配')
  } catch (error) {
    // 用户取消
  }
}

const handleDialogClose = () => {
  allocateFormRef.value?.resetFields()
}

const handleViewDetail = (epic: PoolEpic) => {
  router.push(`/function/c1-requirement/epic/${epic.id}`)
}

const handleCreateEpic = () => {
  router.push('/function/c1-requirement/epic/create')
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      poolStore.fetchPool(),
      projectStore.fetchProjects()
    ])
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.requirement-pool-container {
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

  .title-section {
  h2 {
    margin: 0 0 8px 0;
      font-size: 20px;
    font-weight: 600;
      color: $text-color-primary;
  }

  .description {
    margin: 0;
    font-size: 14px;
    color: $text-color-secondary;
  }
  }

  .stats-section {
    display: flex;
    gap: 40px;
  }
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .filters {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .actions {
    display: flex;
    gap: 8px;
  }
}

.table-wrapper {
  background: #fff;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.epic-name-cell {
  display: flex;
  align-items: center;

  .epic-name {
    font-weight: 500;
  }
}

.allocation-empty {
  color: $text-color-secondary;
}

.allocation-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.epic-list-in-dialog {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: $background-color-base;
  border-radius: 4px;
}
</style>
