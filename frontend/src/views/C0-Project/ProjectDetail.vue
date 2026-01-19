<template>
  <div class="project-detail-container">
    <PageContainer v-loading="loading">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
          <div class="title-section">
            <h2>{{ project?.name }}</h2>
            <el-tag :type="getStatusType(project?.status)" size="large">
              {{ getStatusText(project?.status) }}
            </el-tag>
          </div>
        </div>
        <div class="header-right">
          <el-button :icon="Edit" @click="handleEdit">编辑</el-button>
          <el-button :icon="Delete" type="danger" @click="handleDelete">删除</el-button>
        </div>
      </div>

      <!-- Tab导航 -->
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="项目编码">{{ project?.code }}</el-descriptions-item>
            <el-descriptions-item label="领域">{{ project?.domain }}</el-descriptions-item>
            <el-descriptions-item label="车型">{{ project?.metadata?.vehicleModel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ getUserName(project?.owner) }}</el-descriptions-item>
            <el-descriptions-item label="开始日期">{{ project?.startDate }}</el-descriptions-item>
            <el-descriptions-item label="结束日期">{{ project?.endDate }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ project?.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ project?.updatedAt }}</el-descriptions-item>
            <el-descriptions-item label="项目描述" :span="2">
              {{ project?.description }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 交付节点 -->
          <h3 style="margin-top: 24px">交付节点</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(milestone, index) in milestones"
              :key="index"
              :timestamp="milestone.date"
              placement="top"
            >
              <el-card>
                <h4>{{ milestone.name }}</h4>
                <p>{{ milestone.description }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>

        <!-- 版本管理 -->
        <el-tab-pane label="版本管理" name="versions">
          <div class="tab-header">
            <el-button type="primary" :icon="Plus" @click="handleCreateVersion">新建版本</el-button>
          </div>
          <el-table :data="versions" stripe>
            <el-table-column prop="code" label="版本编码" width="150" />
            <el-table-column prop="name" label="版本名称" width="200" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startDate" label="开始日期" width="120" />
            <el-table-column prop="endDate" label="结束日期" width="120" />
            <el-table-column label="PI数量" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ getPICountByVersion(row.id) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewVersion(row)">查看</el-button>
                <el-button link type="primary" size="small" @click="editVersion(row)">编辑</el-button>
                <el-button link type="danger" size="small" @click="deleteVersion(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- PI规划 -->
        <el-tab-pane label="PI规划" name="pis">
          <div class="tab-header">
            <el-button type="primary" :icon="Plus" @click="handleCreatePI">新建PI</el-button>
          </div>
          <el-table :data="pis" stripe>
            <el-table-column prop="code" label="PI编码" width="150" />
            <el-table-column prop="name" label="PI名称" width="200" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getPIStatusType(row.status)" size="small">
                  {{ getPIStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startDate" label="开始日期" width="120" />
            <el-table-column prop="endDate" label="结束日期" width="120" />
            <el-table-column label="Sprint数" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.sprints?.length || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewPI(row)">查看</el-button>
                <el-button link type="primary" size="small" @click="goPIPlanning(row)">PI Planning</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 团队配置 -->
        <el-tab-pane label="团队配置" name="teams">
          <el-table :data="projectTeams" stripe>
            <el-table-column prop="name" label="团队名称" width="200" />
            <el-table-column prop="leader" label="负责人" width="120" />
            <el-table-column label="团队规模" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ row.memberIds?.length || 0 }}人</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="技能" width="300">
              <template #default="{ row }">
                <el-tag v-for="skill in row.skills" :key="skill" size="small" style="margin-right: 4px">
                  {{ skill }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="容量" width="100">
              <template #default="{ row }">
                {{ row.capacity }}SP
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/modules/project'
import { useUserStore } from '@/stores/modules/user'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const userStore = useUserStore()

const loading = ref(false)
const activeTab = ref('basic')
const projectId = route.params.id as string

// 计算属性
const project = computed(() => projectStore.projects.find(p => p.id === projectId))
const versions = computed(() => {
  const result = projectStore.getVersionsByProject(projectId)
  return result || []
})
const pis = computed(() => {
  const result = projectStore.getPIsByProject(projectId)
  return result || []
})
const milestones = computed(() => project.value?.metadata?.milestones || [])
const projectTeams = computed(() => {
  const teamIds = project.value?.teamIds || []
  const teams = projectStore.teams || []
  return teams.filter(t => teamIds.includes(t.id))
})

// 辅助函数
const getUserName = (userId?: string) => {
  if (!userId) return '-'
  const user = userStore.users.find(u => u.id === userId)
  return user ? user.name : userId
}

const getStatusType = (status?: string) => {
  const map: Record<string, any> = {
    planning: 'info',
    'in-progress': 'warning',
    completed: 'success',
    paused: 'danger'
  }
  return map[status || ''] || ''
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    planning: '规划中',
    'in-progress': '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return map[status || ''] || status
}

const getPIStatusType = (status: string) => {
  const map: Record<string, any> = {
    planning: 'info',
    committed: 'warning',
    'in-progress': 'primary',
    completed: 'success'
  }
  return map[status] || ''
}

const getPIStatusText = (status: string) => {
  const map: Record<string, string> = {
    planning: 'Planning',
    committed: '已承诺',
    'in-progress': '进行中',
    completed: '已完成'
  }
  return map[status] || status
}

const getPICountByVersion = (versionId: string) => {
  if (!pis.value || !Array.isArray(pis.value)) return 0
  return pis.value.filter(pi => pi.versionId === versionId).length
}

// 事件处理
const goBack = () => {
  router.back()
}

const handleEdit = () => {
  router.push(`/function/c0-project/edit/${projectId}`)
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目"${project.value?.name}"吗？删除后将无法恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await projectStore.deleteProject(projectId)
    ElMessage.success('删除成功')
    router.push('/function/c0-project/list')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleCreateVersion = () => {
  router.push(`/function/c0-project/version/create?projectId=${projectId}`)
}

const handleCreatePI = () => {
  router.push(`/function/c0-project/pi/create?projectId=${projectId}`)
}

const viewVersion = (row: any) => {
  router.push(`/function/c0-project/version/${row.id}`)
}

const editVersion = (row: any) => {
  router.push(`/function/c0-project/version/edit/${row.id}`)
}

const deleteVersion = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除版本"${row.name}"吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await projectStore.deleteVersion(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const viewPI = (row: any) => {
  router.push(`/function/c3-planning/pi-detail/${row.id}`)
}

const goPIPlanning = (row: any) => {
  router.push(`/function/c3-planning/pi-planning-board?piId=${row.id}`)
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await projectStore.fetchProjects()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.project-detail-container {
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
        color: $text-color-primary;
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
