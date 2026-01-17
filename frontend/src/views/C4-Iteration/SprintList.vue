<template>
  <PageContainer>
    <PageHeader title="Sprint管理" description="管理所有Sprint的规划、执行和监控">
      <template #actions>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建Sprint
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总Sprint数" :value="sprints.length" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="进行中" :value="activeSprints.length" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="规划中" :value="planningSprints.length" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已完成" :value="completedSprints.length" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选 -->
    <el-card style="margin-bottom: 16px;">
      <el-form :inline="true">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="规划中" value="planning" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="PI">
          <el-select v-model="filters.piId" placeholder="全部PI" clearable>
            <el-option v-for="pi in pis" :key="pi.id" :label="pi.name" :value="pi.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Sprint列表 -->
    <el-card>
      <el-table :data="filteredSprints" v-loading="loading">
        <el-table-column prop="code" label="编号" width="120" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column label="PI" width="150">
          <template #default="{ row }">
            {{ getPIName(row.piId) }}
          </template>
        </el-table-column>
        <el-table-column label="时间范围" width="200">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }} ~ {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column label="容量/规划/完成" width="180">
          <template #default="{ row }">
            <div>{{ row.capacity || 0 }} / {{ row.plannedStoryPoints || 0 }} / {{ row.completedStoryPoints || 0 }}</div>
            <el-progress 
              :percentage="getCompletionRate(row)" 
              :status="getProgressStatus(row)"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link @click="handleView(row.id)">查看</el-button>
            <el-button link @click="handleBoard(row.id)">看板</el-button>
            <el-button link @click="handleBurndown(row.id)">燃尽图</el-button>
            <el-button link v-if="row.status === 'planning'" @click="handleStart(row.id)">启动</el-button>
            <el-button link v-if="row.status === 'active'" type="success" @click="handleComplete(row.id)">完成</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useSprintStore } from '@/stores/modules/sprint'
import { usePIStore } from '@/stores/modules/pi'

const router = useRouter()
const sprintStore = useSprintStore()
const piStore = usePIStore()

const loading = ref(false)
const filters = ref({
  status: '',
  piId: ''
})

const sprints = computed(() => sprintStore.sprints)
const activeSprints = computed(() => sprintStore.activeSprints)
const planningSprints = computed(() => sprintStore.planningSprints)
const completedSprints = computed(() => sprintStore.completedSprints)
const pis = computed(() => piStore.pis)

const filteredSprints = computed(() => {
  let result = sprints.value
  if (filters.value.status) {
    result = result.filter(s => s.status === filters.value.status)
  }
  if (filters.value.piId) {
    result = result.filter(s => s.piId === filters.value.piId)
  }
  return result
})

const handleCreate = () => router.push('/function/c4/sprint/create')
const handleView = (id: string) => router.push(`/function/c4/sprint/${id}`)
const handleBoard = (id: string) => router.push({ name: 'TaskBoard', params: { sprintId: id } })
const handleBurndown = (id: string) => router.push({ name: 'BurndownChart', params: { sprintId: id } })

const handleStart = async (id: string) => {
  await sprintStore.startSprint(id)
}

const handleComplete = async (id: string) => {
  await sprintStore.completeSprint(id)
}

const getPIName = (piId: string) => pis.value.find(p => p.id === piId)?.name || piId
const formatDate = (date: Date) => new Date(date).toLocaleDateString('zh-CN')

const getCompletionRate = (sprint: any) => {
  const planned = sprint.plannedStoryPoints || 0
  const completed = sprint.completedStoryPoints || 0
  return planned > 0 ? Math.round((completed / planned) * 100) : 0
}

const getProgressStatus = (sprint: any) => {
  const rate = getCompletionRate(sprint)
  if (rate >= 90) return 'success'
  if (rate >= 60) return 'warning'
  return undefined
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    planning: '规划中',
    active: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    planning: 'info',
    active: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      sprintStore.fetchSprints(),
      piStore.fetchPIs()
    ])
  } finally {
    loading.value = false
  }
})
</script>
