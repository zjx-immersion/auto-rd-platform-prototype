<template>
  <PageContainer>
    <template #header>
      <PageHeader
        title="版本管理"
        description="管理项目版本，规划版本内容和发布计划"
      >
        <template #actions>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建版本
          </el-button>
        </template>
      </PageHeader>
    </template>

    <el-card>
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="版本名称" width="200" />
        <el-table-column prop="project" label="所属项目" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="releaseDate" label="发布日期" width="150" />
        <el-table-column prop="progress" label="完成度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)

interface Version {
  id: string
  name: string
  project: string
  status: string
  releaseDate: string
  progress: number
  description: string
}

const tableData = ref<Version[]>([])

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

function getStatusType(status: string) {
  const map: Record<string, any> = {
    '规划中': 'info',
    '开发中': 'warning',
    '测试中': 'primary',
    '已发布': 'success'
  }
  return map[status] || 'info'
}

async function fetchData() {
  loading.value = true
  try {
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      {
        id: 'v1',
        name: 'V1.0.0',
        project: '整车控制域',
        status: '已发布',
        releaseDate: '2026-01-15',
        progress: 100,
        description: '首个正式版本'
      },
      {
        id: 'v2',
        name: 'V1.1.0',
        project: '整车控制域',
        status: '测试中',
        releaseDate: '2026-03-20',
        progress: 75,
        description: '功能增强版本'
      },
      {
        id: 'v3',
        name: 'V2.0.0',
        project: '智能座舱',
        status: '开发中',
        releaseDate: '2026-06-30',
        progress: 45,
        description: '重大架构升级'
      },
      {
        id: 'v4',
        name: 'V2.1.0',
        project: '智能座舱',
        status: '规划中',
        releaseDate: '2026-09-15',
        progress: 0,
        description: '待规划版本'
      }
    ]
    pagination.value.total = 4
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  ElMessage.info('创建版本功能待实现')
}

function handleView(row: Version) {
  ElMessage.info(`查看版本: ${row.name}`)
}

function handleEdit(row: Version) {
  ElMessage.info(`编辑版本: ${row.name}`)
}

function handleDelete(row: Version) {
  ElMessageBox.confirm(`确定要删除版本 ${row.name} 吗？`, '确认删除', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchData()
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
