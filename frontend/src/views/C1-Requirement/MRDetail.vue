<template>
  <div class="mr-detail-container">
    <PageContainer v-loading="loading">
      <div class="page-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
          <div class="title-section">
            <h2>{{ mr?.title }}</h2>
            <el-tag :type="getStatusType(mr?.status)" size="large">{{ getStatusText(mr?.status) }}</el-tag>
          </div>
        </div>
        <div class="header-right">
          <el-button :icon="Edit" @click="handleEdit">编辑</el-button>
          <el-button type="primary" @click="handleAssign">分配团队</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="MR编码">{{ mr?.code }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ mr?.title }}</el-descriptions-item>
            <el-descriptions-item label="关联SSTS">{{ getSSTSTitle(mr?.sstsId) }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ getStatusText(mr?.status) }}</el-descriptions-item>
            <el-descriptions-item label="复杂度">{{ mr?.complexity }}</el-descriptions-item>
            <el-descriptions-item label="工作量">{{ mr?.storyPoints }}SP</el-descriptions-item>
            <el-descriptions-item label="分配团队">{{ getTeamName(mr?.assignedTeam) }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ getUserName(mr?.owner) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ mr?.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ mr?.updatedAt }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ mr?.description }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="关联资产" name="assets">
          <div class="tab-header">
            <el-button type="primary" :icon="Plus" @click="handleLinkAsset">关联资产</el-button>
            <el-button @click="handleRecommendAsset">智能推荐</el-button>
          </div>
          <el-table :data="linkedAssets" stripe>
            <el-table-column prop="name" label="资产名称" width="200" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="maturity" label="成熟度" width="120">
              <template #default="{ row }">
                <el-rate v-model="row.maturity" disabled />
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="unlinkAsset(row)">取消关联</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="任务列表" name="tasks">
          <div class="tab-header">
            <el-button type="primary" :icon="Plus" @click="handleCreateTask">创建任务</el-button>
          </div>
          <el-table :data="tasks" stripe>
            <el-table-column prop="title" label="任务标题" width="250" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getTaskStatusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="assignee" label="负责人" width="120" />
            <el-table-column prop="estimatedHours" label="预估工时" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewTask(row)">查看</el-button>
                <el-button link type="primary" size="small" @click="editTask(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, Plus } from '@element-plus/icons-vue'
import { useSSTSStore } from '@/stores/modules/ssts'
import { useProjectStore } from '@/stores/modules/project'
import { useUserStore } from '@/stores/modules/user'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const route = useRoute()
const sstsStore = useSSTSStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

const loading = ref(false)
const activeTab = ref('basic')
const mrId = route.params.id as string

const mr = computed(() => sstsStore.mrList.find(m => m.id === mrId))
const linkedAssets = ref<any[]>([])
const tasks = ref<any[]>([])

const getSSTSTitle = (sstsId?: string) => sstsId ? sstsStore.sstsList.find(s => s.id === sstsId)?.title || sstsId : '-'
const getTeamName = (teamId?: string) => teamId ? projectStore.teams.find(t => t.id === teamId)?.name || teamId : '未分配'
const getUserName = (userId?: string) => userId ? userStore.users.find(u => u.id === userId)?.name || userId : '-'

const getStatusType = (status?: string) => {
  const map: Record<string, any> = { draft: 'info', 'pending-assign': 'warning', 'in-progress': 'primary', completed: 'success' }
  return map[status || ''] || ''
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = { draft: '草稿', 'pending-assign': '待分配', 'in-progress': '进行中', completed: '已完成' }
  return map[status || ''] || status
}

const getTaskStatusType = (status: string) => {
  const map: Record<string, any> = { todo: 'info', 'in-progress': 'primary', done: 'success' }
  return map[status] || ''
}

const goBack = () => router.back()
const handleEdit = () => router.push(`/function/c1-requirement/mr/edit/${mrId}`)
const handleAssign = () => router.push(`/function/c1-requirement/mr/${mrId}/assign`)
const handleLinkAsset = () => ElMessage.info('资产关联功能开发中')
const handleRecommendAsset = () => ElMessage.info('智能推荐功能开发中')
const unlinkAsset = (row: any) => ElMessage.success('取消关联成功')
const handleCreateTask = () => ElMessage.info('任务创建功能开发中')
const viewTask = (row: any) => ElMessage.info('查看任务')
const editTask = (row: any) => ElMessage.info('编辑任务')

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
.mr-detail-container {
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .title-section {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.tab-header {
  margin-bottom: 16px;
}
</style>
