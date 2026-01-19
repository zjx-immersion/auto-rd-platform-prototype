<template>
  <div class="feature-list-container">
    <!-- Action Bar -->
    <div class="action-bar">
      <div class="left">
        <el-tag type="info" size="large">{{ filteredFeatures.length }} 个Feature</el-tag>
      </div>
      <div class="right">
        <el-button type="primary" :icon="Plus" @click="handleCreate">创建Feature</el-button>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true">
        <el-form-item label="Epic">
          <el-select v-model="filters.epicId" placeholder="全部Epic" clearable style="width: 200px">
            <el-option v-for="epic in epics" :key="epic.id" :label="epic.title" :value="epic.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option label="待开始" value="backlog" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="已完成" value="done" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="filters.keyword" placeholder="搜索标题或编码" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" v-loading="loading">
      <el-table :data="paginatedFeatures" stripe @row-click="handleRowClick">
        <el-table-column prop="code" label="编码" width="140" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="Epic" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getEpicTitle(row.epicId) }}
          </template>
        </el-table-column>
        <el-table-column label="产品线" width="150">
          <template #default="{ row }">{{ row.productLine || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="故事点" width="100" align="center">
          <template #default="{ row }">{{ row.storyPoints }}</template>
        </el-table-column>
        <el-table-column label="SSTS" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.sstsIds.length }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click.stop="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click.stop="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="filteredFeatures.length"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useFeatureStore } from '@/stores/modules/feature'
import { useEpicStore } from '@/stores/modules/epic'

const featureStore = useFeatureStore()
const epicStore = useEpicStore()
const router = useRouter()

const features = computed(() => featureStore.features)
const epics = computed(() => epicStore.epics)
const loading = ref(false)

const filters = ref({
  epicId: '',
  status: '',
  keyword: '',
})

const pagination = ref({
  page: 1,
  pageSize: 20,
})

const filteredFeatures = computed(() => {
  let result = [...features.value]
  if (filters.value.epicId) result = result.filter(f => f.epicId === filters.value.epicId)
  if (filters.value.status) result = result.filter(f => f.status === filters.value.status)
  if (filters.value.keyword) {
    const kw = filters.value.keyword.toLowerCase()
    result = result.filter(f => f.title.toLowerCase().includes(kw) || f.code.toLowerCase().includes(kw))
  }
  return result
})

const paginatedFeatures = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  return filteredFeatures.value.slice(start, start + pagination.value.pageSize)
})

const handleSearch = () => { pagination.value.page = 1 }
const handleReset = () => {
  filters.value = { epicId: '', status: '', keyword: '' }
  pagination.value.page = 1
}
const handleSizeChange = () => { pagination.value.page = 1 }
const handleRowClick = (row: any) => handleView(row)
const handleCreate = () => router.push('/capability/c1-requirement/feature/create')
const handleView = (row: any) => router.push(`/capability/c1-requirement/feature/${row.id}`)
const handleEdit = (row: any) => router.push(`/capability/c1-requirement/feature/${row.id}?edit=true`)
const handleDelete = (row: any) => console.log('Delete:', row)

const getEpicTitle = (epicId: string) => epics.value.find(e => e.id === epicId)?.title || epicId
const getStatusText = (status: string) => {
  const map: Record<string, string> = { backlog: '待开始', 'in-progress': '进行中', done: '已完成' }
  return map[status] || status
}
const getStatusType = (status: string) => {
  const map: Record<string, any> = { backlog: 'info', 'in-progress': 'primary', done: 'success' }
  return map[status] || 'info'
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([featureStore.fetchFeatures(), epicStore.fetchEpics()])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.feature-list-container {
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
      h2 { margin: 0; font-size: 24px; font-weight: 600; }
    }
  }
  .filter-card { margin-bottom: 20px; }
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
