<template>
  <div class="version-management-container">
    <PageContainer>
      <!-- Action Bar -->
      <div class="action-bar">
        <div class="filters">
          <el-input placeholder="搜索版本..." style="width: 200px" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select placeholder="筛选项目" clearable style="width: 150px">
            <el-option v-for="project in allProjects" :key="project.id" :label="project.name" :value="project.id" />
          </el-select>
        </div>
        <div class="actions">
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建版本</el-button>
        </div>
      </div>

      <el-card>
        <el-table :data="versions" stripe>
          <el-table-column prop="code" label="版本编码" width="150" />
          <el-table-column prop="name" label="版本名称" width="200" />
          <el-table-column prop="projectId" label="所属项目" width="200">
            <template #default="{ row }">{{ getProjectName(row.projectId) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始日期" width="120" />
          <el-table-column prop="endDate" label="结束日期" width="120" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/modules/project'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const projectStore = useProjectStore()

const versions = computed(() => projectStore.versions)
const allProjects = computed(() => projectStore.projects)

const getProjectName = (projectId: string) => {
  const project = projectStore.projects.find(p => p.id === projectId)
  return project ? project.name : projectId
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = { planning: 'info', 'in-progress': 'warning', completed: 'success' }
  return map[status] || ''
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = { planning: '规划中', 'in-progress': '进行中', completed: '已完成' }
  return map[status] || status
}

const handleCreate = () => router.push('/function/c0-project/version/create')
const handleView = (row: any) => router.push(`/function/c0-project/version/${row.id}`)
const handleEdit = (row: any) => router.push(`/function/c0-project/version/edit/${row.id}`)
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除版本"${row.name}"吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await projectStore.deleteVersion(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(async () => {
  await projectStore.fetchProjects()
})
</script>

<style scoped lang="scss">
.version-management-container {
  height: 100%;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .filters {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .actions {
    display: flex;
    gap: 8px;
  }
}
</style>
