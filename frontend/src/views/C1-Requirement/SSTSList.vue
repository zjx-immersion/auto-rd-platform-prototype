<template>
  <div class="ssts-list-container">
    <PageContainer>
      <!-- 页面头部 -->
    <div class="page-header">
        <div class="header-left">
          <h2>SSTS管理</h2>
          <p class="description">软硬件技术规格管理</p>
        </div>
        <div class="header-right">
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建SSTS</el-button>
          <el-button :icon="Upload">导入</el-button>
          <el-button :icon="Download">导出</el-button>
        </div>
      </div>

      <!-- 筛选区 -->
      <el-card class="filter-card" shadow="never">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="Feature">
            <el-select v-model="filterForm.featureId" placeholder="全部" clearable style="width: 200px">
              <el-option
                v-for="feature in allFeatures"
                :key="feature.id"
                :label="feature.name"
                :value="feature.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="filterForm.type" placeholder="全部" clearable style="width: 150px">
              <el-option label="功能需求" value="functional" />
              <el-option label="技术需求" value="technical" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 150px">
              <el-option label="草稿" value="draft" />
              <el-option label="待评审" value="pending-review" />
              <el-option label="已评审" value="reviewed" />
              <el-option label="进行中" value="in-progress" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="filterForm.priority" placeholder="全部" clearable style="width: 130px">
              <el-option label="P0" value="P0" />
              <el-option label="P1" value="P1" />
              <el-option label="P2" value="P2" />
              <el-option label="P3" value="P3" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="filterForm.keyword" placeholder="搜索SSTS" clearable style="width: 200px">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleFilter">查询</el-button>
            <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- SSTS列表 -->
      <el-card class="table-card" shadow="never">
        <el-table
          v-loading="loading"
          :data="paginatedList"
          stripe
          style="width: 100%"
          @row-click="handleRowClick"
        >
          <el-table-column prop="code" label="SSTS编码" width="150" fixed="left" />
          <el-table-column prop="title" label="标题" width="250" show-overflow-tooltip />
          <el-table-column label="Feature" width="180" show-overflow-tooltip>
            <template #default="{ row }">
              {{ getFeatureName(row.featureId) }}
            </template>
          </el-table-column>
          <el-table-column label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeText(row.type) }}
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
          <el-table-column label="优先级" width="90">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)" size="small">
                {{ row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="MR数量" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ getMRCount(row.id) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="负责人" width="120">
            <template #default="{ row }">
              {{ getUserName(row.owner) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="120" />
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click.stop="handleView(row)">查看</el-button>
              <el-button link type="primary" size="small" @click.stop="handleDecompose(row)">拆解MR</el-button>
              <el-button link type="primary" size="small" @click.stop="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click.stop="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[20, 50, 100]"
            :total="filteredList.length"
            layout="total, sizes, prev, pager, next, jumper"
          />
    </div>
    </el-card>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Search, RefreshLeft } from '@element-plus/icons-vue'
import { useSSTSStore } from '@/stores/modules/ssts'
import { useFeatureStore } from '@/stores/modules/feature'
import { useUserStore } from '@/stores/modules/user'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const sstsStore = useSSTSStore()
const featureStore = useFeatureStore()
const userStore = useUserStore()

const loading = ref(false)
const filterForm = ref({
  featureId: '',
  type: '',
  status: '',
  priority: '',
  keyword: ''
})

const pagination = ref({
  currentPage: 1,
  pageSize: 20
})

// 计算属性
const allSSTSList = computed(() => sstsStore.sstsList)
const allFeatures = computed(() => featureStore.features)

const filteredList = computed(() => {
  let result = allSSTSList.value

  if (filterForm.value.featureId) {
    result = result.filter(s => s.featureId === filterForm.value.featureId)
  }
  if (filterForm.value.type) {
    result = result.filter(s => s.type === filterForm.value.type)
  }
  if (filterForm.value.status) {
    result = result.filter(s => s.status === filterForm.value.status)
  }
  if (filterForm.value.priority) {
    result = result.filter(s => s.priority === filterForm.value.priority)
  }
  if (filterForm.value.keyword) {
    const keyword = filterForm.value.keyword.toLowerCase()
    result = result.filter(s =>
      s.title.toLowerCase().includes(keyword) ||
      s.code.toLowerCase().includes(keyword)
    )
  }

  return result
})

const paginatedList = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredList.value.slice(start, end)
})

// 辅助函数
const getFeatureName = (featureId: string) => {
  const feature = allFeatures.value.find(f => f.id === featureId)
  return feature ? feature.name : featureId
}

const getUserName = (userId: string) => {
  const user = userStore.users.find(u => u.id === userId)
  return user ? user.name : userId
}

const getMRCount = (sstsId: string) => {
  return sstsStore.getMRsBySSTS(sstsId).length
}

const getTypeTagType = (type: string) => {
  return type === 'functional' ? 'primary' : 'warning'
}

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    functional: '功能需求',
    technical: '技术需求'
  }
  return map[type] || type
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    draft: 'info',
    'pending-review': 'warning',
    reviewed: 'success',
    'in-progress': 'primary',
    completed: 'success'
  }
  return map[status] || ''
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    'pending-review': '待评审',
    reviewed: '已评审',
    'in-progress': '进行中',
    completed: '已完成'
  }
  return map[status] || status
}

const getPriorityType = (priority: string) => {
  const map: Record<string, any> = {
    P0: 'danger',
    P1: 'warning',
    P2: 'primary',
    P3: 'info'
  }
  return map[priority] || ''
}

// 事件处理
const handleFilter = () => {
  pagination.value.currentPage = 1
}

const handleReset = () => {
  filterForm.value = {
    featureId: '',
    type: '',
    status: '',
    priority: '',
    keyword: ''
  }
  pagination.value.currentPage = 1
}

const handleRowClick = (row: any) => {
  router.push(`/function/c1-requirement/ssts/${row.id}`)
}

const handleView = (row: any) => {
  router.push(`/function/c1-requirement/ssts/${row.id}`)
}

const handleCreate = () => {
  router.push('/function/c1-requirement/ssts/create')
}

const handleDecompose = (row: any) => {
  router.push(`/function/c1-requirement/ssts/${row.id}/decompose`)
}

const handleEdit = (row: any) => {
  router.push(`/function/c1-requirement/ssts/edit/${row.id}`)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除SSTS"${row.title}"吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await sstsStore.deleteSSTS(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      sstsStore.fetchSSTSList(),
      featureStore.fetchFeatures()
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.ssts-list-container {
  height: 100%;
}

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

  .header-left {
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: $text-color-primary;
    }

    .description {
      margin: 0;
      font-size: 14px;
      color: $text-color-secondary;
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.filter-card {
  margin-bottom: 16px;
  
  .filter-form {
    margin-bottom: 0;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
