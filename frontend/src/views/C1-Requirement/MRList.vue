<template>
  <div class="mr-list-container">
    <PageContainer>
    <div class="page-header">
        <div class="header-left">
          <h2>MR管理</h2>
          <p class="description">模块需求管理</p>
        </div>
        <div class="header-right">
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建MR</el-button>
          <el-button>批量分配</el-button>
        </div>
      </div>

      <el-card class="filter-card" shadow="never">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="SSTS">
            <el-select v-model="filterForm.sstsId" placeholder="全部" clearable style="width: 200px">
              <el-option v-for="ssts in allSSTSList" :key="ssts.id" :label="ssts.title" :value="ssts.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 150px">
              <el-option label="草稿" value="draft" />
              <el-option label="待分配" value="pending-assign" />
              <el-option label="进行中" value="in-progress" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item label="团队">
            <el-select v-model="filterForm.teamId" placeholder="全部" clearable style="width: 150px">
              <el-option v-for="team in allTeams" :key="team.id" :label="team.name" :value="team.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="filterForm.keyword" placeholder="搜索MR" clearable style="width: 200px">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleFilter">查询</el-button>
            <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="table-card" shadow="never">
        <el-table v-loading="loading" :data="paginatedList" stripe @row-click="handleRowClick">
          <el-table-column prop="code" label="MR编码" width="150" fixed="left" />
          <el-table-column prop="title" label="标题" width="250" show-overflow-tooltip />
          <el-table-column label="SSTS" width="180">
            <template #default="{ row }">{{ getSSTSTitle(row.sstsId) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="复杂度" width="100">
            <template #default="{ row }"><el-tag>{{ row.complexity }}</el-tag></template>
          </el-table-column>
          <el-table-column label="工作量" width="100">
            <template #default="{ row }">{{ row.storyPoints }}SP</template>
          </el-table-column>
          <el-table-column label="分配团队" width="150">
            <template #default="{ row }">{{ getTeamName(row.assignedTeam) }}</template>
          </el-table-column>
          <el-table-column label="负责人" width="120">
            <template #default="{ row }">{{ getUserName(row.owner) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click.stop="handleView(row)">查看</el-button>
              <el-button link type="primary" size="small" @click.stop="handleAssign(row)">分配</el-button>
              <el-button link type="primary" size="small" @click.stop="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click.stop="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

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
import { Plus, Search, RefreshLeft } from '@element-plus/icons-vue'
import { useSSTSStore } from '@/stores/modules/ssts'
import { useProjectStore } from '@/stores/modules/project'
import { useUserStore } from '@/stores/modules/user'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const sstsStore = useSSTSStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

const loading = ref(false)
const filterForm = ref({ sstsId: '', status: '', teamId: '', keyword: '' })
const pagination = ref({ currentPage: 1, pageSize: 20 })

const allMRList = computed(() => sstsStore.mrList)
const allSSTSList = computed(() => sstsStore.sstsList)
const allTeams = computed(() => projectStore.teams)

const filteredList = computed(() => {
  let result = allMRList.value
  if (filterForm.value.sstsId) result = result.filter(m => m.sstsId === filterForm.value.sstsId)
  if (filterForm.value.status) result = result.filter(m => m.status === filterForm.value.status)
  if (filterForm.value.teamId) result = result.filter(m => m.assignedTeam === filterForm.value.teamId)
  if (filterForm.value.keyword) {
    const keyword = filterForm.value.keyword.toLowerCase()
    result = result.filter(m => m.title.toLowerCase().includes(keyword) || m.code.toLowerCase().includes(keyword))
  }
  return result
})

const paginatedList = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  return filteredList.value.slice(start, start + pagination.value.pageSize)
})

const getSSTSTitle = (sstsId: string) => allSSTSList.value.find(s => s.id === sstsId)?.title || sstsId
const getTeamName = (teamId?: string) => teamId ? allTeams.value.find(t => t.id === teamId)?.name || teamId : '未分配'
const getUserName = (userId: string) => userStore.users.find(u => u.id === userId)?.name || userId

const getStatusType = (status: string) => {
  const map: Record<string, any> = { draft: 'info', 'pending-assign': 'warning', 'in-progress': 'primary', completed: 'success' }
  return map[status] || ''
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = { draft: '草稿', 'pending-assign': '待分配', 'in-progress': '进行中', completed: '已完成' }
  return map[status] || status
}

const handleFilter = () => { pagination.value.currentPage = 1 }
const handleReset = () => {
  filterForm.value = { sstsId: '', status: '', teamId: '', keyword: '' }
  pagination.value.currentPage = 1
}
const handleRowClick = (row: any) => router.push(`/function/c1-requirement/mr/${row.id}`)
const handleView = (row: any) => router.push(`/function/c1-requirement/mr/${row.id}`)
const handleCreate = () => router.push('/function/c1-requirement/mr/create')
const handleAssign = (row: any) => router.push(`/function/c1-requirement/mr/${row.id}/assign`)
const handleEdit = (row: any) => router.push(`/function/c1-requirement/mr/edit/${row.id}`)
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除MR"${row.title}"吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await sstsStore.deleteMR(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([sstsStore.fetchMRList(), sstsStore.fetchSSTSList()])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.mr-list-container {
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
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
