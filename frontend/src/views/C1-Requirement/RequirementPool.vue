<template>
  <div class="requirement-pool-container">
    <PageContainer>
      <div class="page-header">
        <h2>需求池管理</h2>
        <p class="description">管理和导入Epic到项目</p>
      </div>

      <el-card>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="需求池" name="pool">
            <el-table :data="poolEpics" stripe>
              <el-table-column type="selection" width="55" />
              <el-table-column prop="code" label="Epic编码" width="150" />
              <el-table-column prop="name" label="Epic名称" width="250" />
              <el-table-column label="优先级" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.priority === 'P0' ? 'danger' : 'warning'" size="small">{{ row.priority }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="importToProject(row)">导入项目</el-button>
                  <el-button link type="primary" size="small" @click="viewDetail(row)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="待评审" name="review">
            <el-table :data="reviewEpics" stripe>
              <el-table-column prop="code" label="Epic编码" width="150" />
              <el-table-column prop="name" label="Epic名称" width="250" />
              <el-table-column label="优先级" width="100">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.priority }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button link type="success" size="small" @click="approve(row)">通过</el-button>
                  <el-button link type="danger" size="small" @click="reject(row)">拒绝</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </PageContainer>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入Epic到项目" width="500px">
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="选择项目">
          <el-select v-model="importForm.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option v-for="proj in allProjects" :key="proj.id" :label="proj.name" :value="proj.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEpicStore } from '@/stores/modules/epic'
import { useProjectStore } from '@/stores/modules/project'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const epicStore = useEpicStore()
const projectStore = useProjectStore()

const activeTab = ref('pool')
const importDialogVisible = ref(false)
const currentEpic = ref<any>(null)
const importForm = ref({ projectId: '' })

const poolEpics = computed(() => epicStore.epics.filter(e => !e.projectId))
const reviewEpics = computed(() => epicStore.epics.filter(e => e.status === 'pending-review'))
const allProjects = computed(() => projectStore.projects)

const getStatusType = (status: string) => {
  const map: Record<string, any> = { draft: 'info', 'pending-review': 'warning', approved: 'success', 'in-progress': 'primary' }
  return map[status] || ''
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = { draft: '草稿', 'pending-review': '待评审', approved: '已批准', 'in-progress': '进行中' }
  return map[status] || status
}

const importToProject = (row: any) => {
  currentEpic.value = row
  importDialogVisible.value = true
}

const confirmImport = async () => {
  if (!importForm.value.projectId) {
    ElMessage.warning('请选择项目')
    return
  }
  await epicStore.updateEpic(currentEpic.value.id, { projectId: importForm.value.projectId })
  ElMessage.success('导入成功')
  importDialogVisible.value = false
}

const viewDetail = (row: any) => router.push(`/function/c1-requirement/epic/${row.id}`)
const approve = async (row: any) => {
  await epicStore.updateEpic(row.id, { status: 'approved' })
  ElMessage.success('评审通过')
}
const reject = async (row: any) => {
  await epicStore.updateEpic(row.id, { status: 'rejected' })
  ElMessage.success('已拒绝')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.requirement-pool-container {
  height: 100%;
}

.page-header {
  margin-bottom: 20px;

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
</style>
