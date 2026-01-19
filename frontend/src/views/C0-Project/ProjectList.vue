<template>
  <div class="project-list-container">
    <PageContainer>
      <!-- Action Bar: 筛选+操作 -->
      <div class="action-bar">
        <div class="filters">
          <el-input 
            v-model="filterForm.keyword" 
            placeholder="搜索项目名称、编码" 
            clearable 
            style="width: 220px"
            @change="handleFilter"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="filterForm.status" placeholder="状态" clearable style="width: 120px" @change="handleFilter">
            <el-option label="规划中" value="planning" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
          </el-select>
          <el-select v-model="filterForm.domain" placeholder="领域" clearable style="width: 120px" @change="handleFilter">
            <el-option label="智能驾驶" value="智能驾驶" />
            <el-option label="智能座舱" value="智能座舱" />
            <el-option label="电子电器" value="电子电器" />
            <el-option label="底盘域" value="底盘域" />
            <el-option label="新能源" value="新能源" />
          </el-select>
          <el-select v-model="filterForm.owner" placeholder="负责人" clearable style="width: 120px" @change="handleFilter">
            <el-option v-for="user in allUsers" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
          <el-button :icon="RefreshLeft" @click="handleReset" circle title="重置筛选" />
        </div>
        <div class="actions">
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建项目</el-button>
          <el-button :icon="Upload">导入</el-button>
          <el-button :icon="Download">导出</el-button>
        </div>
      </div>

      <!-- 数据表格 - 无卡片包裹，最大化空间 -->
      <div class="table-wrapper">
        <el-table
          v-loading="loading"
          :data="filteredProjects"
          stripe
          border
          :height="tableHeight"
          style="width: 100%"
          @row-click="handleRowClick"
        >
          <el-table-column prop="code" label="项目编码" width="150" />
          <el-table-column prop="name" label="项目名称" width="220" show-overflow-tooltip />
          <el-table-column prop="domain" label="领域" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="负责人" width="120">
            <template #default="{ row }">
              {{ getUserName(row.owner) }}
            </template>
          </el-table-column>
          <el-table-column label="版本数" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ getVersionCount(row.id) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="PI数" width="100">
            <template #default="{ row }">
              <el-tag size="small" type="warning">{{ getPICount(row.id) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始日期" width="120" />
          <el-table-column prop="endDate" label="结束日期" width="120" />
          <el-table-column label="进度" width="150">
            <template #default="{ row }">
              <div class="progress-wrapper">
                <el-progress :percentage="calculateProgress(row)" :stroke-width="8" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click.stop="handleView(row)">
                查看
              </el-button>
              <el-button link type="primary" size="small" @click.stop="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click.stop="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 底部分页栏 -->
      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="filteredProjects.length"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </PageContainer>

    <!-- 创建/编辑项目对话框 -->
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
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目编码" prop="code">
          <el-input v-model="formData.code" placeholder="自动生成或手动输入" />
        </el-form-item>
        <el-form-item label="领域" prop="domain">
          <el-select v-model="formData.domain" placeholder="请选择领域" style="width: 100%">
            <el-option label="智能驾驶" value="智能驾驶" />
            <el-option label="智能座舱" value="智能座舱" />
            <el-option label="电子电器" value="电子电器" />
            <el-option label="底盘域" value="底盘域" />
            <el-option label="新能源" value="新能源" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-select v-model="formData.owner" placeholder="请选择负责人" style="width: 100%">
            <el-option
              v-for="user in allUsers"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="formData.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="formData.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="规划中" value="planning" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Search, RefreshLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useProjectStore } from '@/stores/modules/project'
import { useUserStore } from '@/stores/modules/user'
import type { Project } from '@/types'
import PageContainer from '@/components/Common/PageContainer.vue'

// 表格高度自适应
const tableHeight = ref<number>(600)

const router = useRouter()
const projectStore = useProjectStore()
const userStore = useUserStore()

// 数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建项目')
const formRef = ref<FormInstance>()
const currentEditId = ref<string>()

// 筛选表单
const filterForm = ref({
  status: '',
  domain: '',
  owner: '',
  keyword: ''
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 20
})

// 表单数据
const formData = ref<Partial<Project>>({
  name: '',
  code: '',
  domain: '',
  description: '',
  owner: '',
  startDate: '',
  endDate: '',
  status: 'planning'
})

// 表单验证规则
const formRules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入项目编码', trigger: 'blur' }],
  domain: [{ required: true, message: '请选择领域', trigger: 'change' }],
  owner: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

// 计算属性
const allProjects = computed(() => projectStore.projects)
const allUsers = computed(() => userStore.users || [])

const filteredProjects = computed(() => {
  let result = allProjects.value

  if (filterForm.value.status) {
    result = result.filter(p => p.status === filterForm.value.status)
  }
  if (filterForm.value.domain) {
    result = result.filter(p => p.domain === filterForm.value.domain)
  }
  if (filterForm.value.owner) {
    result = result.filter(p => p.owner === filterForm.value.owner)
  }
  if (filterForm.value.keyword) {
    const keyword = filterForm.value.keyword.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      p.code.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 辅助函数
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    planning: 'info',
    'in-progress': 'warning',
    completed: 'success',
    paused: 'danger'
  }
  return map[status] || ''
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    planning: '规划中',
    'in-progress': '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return map[status] || status
}

const getUserName = (userId: string) => {
  const user = allUsers.value.find(u => u.id === userId)
  return user ? user.name : userId
}

const getVersionCount = (projectId: string) => {
  return projectStore.getVersionsByProject(projectId).length
}

const getPICount = (projectId: string) => {
  return projectStore.getPIsByProject(projectId).length
}

const calculateProgress = (project: Project) => {
  // 简单计算：基于时间进度
  if (!project.startDate || !project.endDate) return 0
  
  const start = new Date(project.startDate).getTime()
  const end = new Date(project.endDate).getTime()
  const now = Date.now()
  
  if (isNaN(start) || isNaN(end)) return 0
  if (now < start) return 0
  if (now > end) return 100
  
  const progress = Math.round(((now - start) / (end - start)) * 100)
  return Math.max(0, Math.min(100, progress)) // 确保在0-100范围内
}

// 事件处理
const handleFilter = () => {
  pagination.value.currentPage = 1
}

const handleReset = () => {
  filterForm.value = {
    status: '',
    domain: '',
    owner: '',
    keyword: ''
  }
  pagination.value.currentPage = 1
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
}

const handleRowClick = (row: Project) => {
  router.push(`/function/c0-project/detail/${row.id}`)
}

const handleView = (row: Project) => {
  router.push(`/function/c0-project/detail/${row.id}`)
}

const handleCreate = () => {
  dialogTitle.value = '新建项目'
  currentEditId.value = undefined
  formData.value = {
    name: '',
    code: `PROJ-${Date.now().toString().slice(-6)}`,
    domain: '',
    description: '',
    owner: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'planning'
  }
  dialogVisible.value = true
}

const handleEdit = (row: Project) => {
  dialogTitle.value = '编辑项目'
  currentEditId.value = row.id
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row: Project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目"${row.name}"吗？删除后将无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await projectStore.deleteProject(row.id)
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
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      if (currentEditId.value) {
        await projectStore.updateProject(currentEditId.value, formData.value)
        ElMessage.success('更新成功')
      } else {
        await projectStore.createProject(formData.value as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}

// 计算表格高度
const calculateTableHeight = () => {
  nextTick(() => {
    // 工具栏56px + 分页栏56px + 容器padding 32px + 间距24px = 168px
    const windowHeight = window.innerHeight
    const headerHeight = 64 // 顶部导航
    const toolbarHeight = 56 // 紧凑工具栏
    const paginationHeight = 56 // 分页栏
    const padding = 56 // 容器padding和间距
    tableHeight.value = windowHeight - headerHeight - toolbarHeight - paginationHeight - padding
  })
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await projectStore.fetchProjects()
  } finally {
    loading.value = false
  }
  
  calculateTableHeight()
  window.addEventListener('resize', calculateTableHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateTableHeight)
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.project-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background: #f5f5f5;
}

// Action Bar 布局
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

// 表格容器
.table-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  
  .progress-wrapper {
    padding: 0 16px;
  }
}

// 分页栏
.pagination-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 4px;
  margin-top: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
</style>
