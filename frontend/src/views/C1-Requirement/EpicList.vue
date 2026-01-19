<template>
  <div class="epic-list-container">
    <!-- Action Bar -->
    <div class="action-bar">
      <div class="left">
        <el-tag type="info" size="large">{{ epics.length }} 个Epic</el-tag>
      </div>
      <div class="right">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          创建Epic
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" @submit.prevent="handleSearch">
        <el-form-item label="项目">
          <el-select v-model="filters.projectId" placeholder="全部项目" clearable style="width: 200px">
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="待开始" value="backlog" />
            <el-option label="分析中" value="analysis" />
            <el-option label="就绪" value="ready" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="已完成" value="done" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-select v-model="filters.priority" placeholder="全部优先级" clearable style="width: 120px">
            <el-option label="P0" value="P0" />
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
            <el-option label="P3" value="P3" />
            <el-option label="P4" value="P4" />
          </el-select>
        </el-form-item>

        <el-form-item label="搜索">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索标题或编码"
            clearable
            style="width: 250px"
            :prefix-icon="Search"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Epic列表 -->
    <el-card class="table-card" shadow="never" v-loading="loading">
      <el-table
        :data="filteredEpics"
        stripe
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        style="width: 100%; cursor: pointer"
      >
        <el-table-column prop="code" label="编码" width="140" sortable="custom" />
        
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        
        <el-table-column label="项目" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getProjectName(row.projectId) }}
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="优先级" width="90" align="center" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="故事点" width="100" align="center" sortable="custom">
          <template #default="{ row }">
            {{ row.completedStoryPoints }} / {{ row.storyPoints }}
          </template>
        </el-table-column>
        
        <el-table-column label="进度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :color="getProgressColor(row.progress)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="Features" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.featureIds.length }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="负责人" width="120">
          <template #default="{ row }">
            {{ getUserName(row.owner) }}
          </template>
        </el-table-column>
        
        <el-table-column label="更新时间" width="160" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="handleDecompose(row)"
            >
              分解Feature
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="filteredEpics.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑Epic对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="Epic标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入Epic标题" />
        </el-form-item>

        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="formData.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="formData.priority" placeholder="请选择优先级">
            <el-option label="P0 - 最高" value="P0" />
            <el-option label="P1 - 高" value="P1" />
            <el-option label="P2 - 中" value="P2" />
            <el-option label="P3 - 低" value="P3" />
            <el-option label="P4 - 最低" value="P4" />
          </el-select>
        </el-form-item>

        <el-form-item label="故事点" prop="storyPoints">
          <el-input-number v-model="formData.storyPoints" :min="0" :max="500" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入Epic描述"
          />
        </el-form-item>

        <el-form-item label="业务价值" prop="businessValue">
          <el-input
            v-model="formData.businessValue"
            type="textarea"
            :rows="2"
            placeholder="请描述业务价值"
          />
        </el-form-item>

        <el-form-item label="验收标准" prop="acceptanceCriteria">
          <el-input
            v-model="acceptanceCriteriaText"
            type="textarea"
            :rows="4"
            placeholder="每行一个验收标准"
          />
        </el-form-item>

        <el-form-item label="负责人" prop="owner">
          <el-select v-model="formData.owner" placeholder="请选择负责人" filterable>
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标签">
          <el-select v-model="formData.tags" multiple placeholder="请选择标签" allow-create filterable>
            <el-option label="高价值" value="高价值" />
            <el-option label="核心功能" value="核心功能" />
            <el-option label="创新" value="创新" />
            <el-option label="优化" value="优化" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { useEpicStore } from '@/stores/modules/epic'
import { useProjectStore } from '@/stores/modules/project'
import type { Epic } from '@/types'
import dayjs from 'dayjs'

// Stores
const epicStore = useEpicStore()
const projectStore = useProjectStore()
const router = useRouter()

// 数据
const epics = computed(() => epicStore.epics)
const projects = computed(() => projectStore.projects)
const users = ref([
  { id: 'user-001', name: '张三' },
  { id: 'user-002', name: '李四' },
  { id: 'user-003', name: '王五' },
  { id: 'user-004', name: '赵六' },
  { id: 'user-005', name: '钱七' },
])

const loading = ref(false)

// 筛选条件
const filters = ref({
  projectId: '',
  status: '',
  priority: '',
  keyword: '',
})

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => (isEdit.value ? '编辑Epic' : '创建Epic'))
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const formData = ref<Partial<Epic>>({
  title: '',
  projectId: '',
  description: '',
  businessValue: '',
  acceptanceCriteria: [],
  priority: 'P2',
  storyPoints: 0,
  owner: '',
  tags: [],
})

const acceptanceCriteriaText = ref('')

const formRules = {
  title: [{ required: true, message: '请输入Epic标题', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  owner: [{ required: true, message: '请选择负责人', trigger: 'change' }],
}

// 筛选后的Epic
const filteredEpics = computed(() => {
  let result = [...epics.value]

  // 项目筛选
  if (filters.value.projectId) {
    result = result.filter(e => e.projectId === filters.value.projectId)
  }

  // 状态筛选
  if (filters.value.status) {
    result = result.filter(e => e.status === filters.value.status)
  }

  // 优先级筛选
  if (filters.value.priority) {
    result = result.filter(e => e.priority === filters.value.priority)
  }

  // 关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(
      e =>
        e.title.toLowerCase().includes(keyword) ||
        e.code.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 方法
const handleSearch = () => {
  pagination.value.page = 1
}

const handleReset = () => {
  filters.value = {
    projectId: '',
    status: '',
    priority: '',
    keyword: '',
  }
  pagination.value.page = 1
}

const handleSortChange = ({ prop, order }: any) => {
  // 实现排序逻辑
  console.log('Sort:', prop, order)
}

const handleRowClick = (row: Epic) => {
  handleView(row)
}

const handleView = (epic: Epic) => {
  router.push(`/function/c1-requirement/epic/${epic.id}`)
}

const handleCreate = () => {
  isEdit.value = false
  formData.value = {
    title: '',
    projectId: '',
    description: '',
    businessValue: '',
    acceptanceCriteria: [],
    priority: 'P2',
    storyPoints: 0,
    owner: '',
    tags: [],
  }
  acceptanceCriteriaText.value = ''
  dialogVisible.value = true
}

const handleEdit = (epic: Epic) => {
  isEdit.value = true
  formData.value = { ...epic }
  acceptanceCriteriaText.value = epic.acceptanceCriteria.join('\n')
  dialogVisible.value = true
}

const handleDecompose = (epic: Epic) => {
  router.push(`/function/c1-requirement/epic/${epic.id}?tab=features`)
}

const handleDelete = async (epic: Epic) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除Epic "${epic.title}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await epicStore.deleteEpic(epic.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true

    // 处理验收标准
    if (acceptanceCriteriaText.value) {
      formData.value.acceptanceCriteria = acceptanceCriteriaText.value
        .split('\n')
        .filter(line => line.trim())
    }

    if (isEdit.value) {
      await epicStore.updateEpic(formData.value.id!, formData.value)
      ElMessage.success('更新成功')
    } else {
      await epicStore.createEpic(formData.value)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('Submit error:', error)
  } finally {
    submitting.value = false
  }
}

const handleSizeChange = () => {
  pagination.value.page = 1
}

const handlePageChange = () => {
  // 翻页逻辑
}

// 辅助方法
const getProjectName = (projectId: string) => {
  const project = projects.value.find(p => p.id === projectId)
  return project?.name || projectId
}

const getUserName = (userId: string) => {
  const user = users.value.find(u => u.id === userId)
  return user?.name || userId
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    backlog: '待开始',
    analysis: '分析中',
    ready: '就绪',
    'in-progress': '进行中',
    done: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    backlog: 'info',
    analysis: 'warning',
    ready: '',
    'in-progress': 'primary',
    done: 'success',
    cancelled: 'danger',
  }
  return typeMap[status] || 'info'
}

const getPriorityType = (priority: string) => {
  const typeMap: Record<string, any> = {
    P0: 'danger',
    P1: 'warning',
    P2: '',
    P3: 'info',
    P4: 'info',
  }
  return typeMap[priority] || 'info'
}

const getProgressColor = (progress: number) => {
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      epicStore.fetchEpics(),
      projectStore.fetchProjects(),
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.epic-list-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .table-card {
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
