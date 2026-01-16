<template>
  <PageContainer>
    <template #header>
      <PageHeader
        title="PI规划"
        description="Program Increment 规划与管理"
      >
        <template #actions>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建PI
          </el-button>
        </template>
      </PageHeader>
    </template>

    <el-card>
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="PI名称" width="150" />
        <el-table-column prop="project" label="所属项目" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column prop="sprintCount" label="Sprint数量" width="110" />
        <el-table-column prop="teamCount" label="团队数" width="90" />
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="row.progress === 100 ? 'success' : undefined" />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="目标" min-width="200" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" @click="handlePlanning(row)">
              PI Planning
            </el-button>
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
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
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

interface PI {
  id: string
  name: string
  project: string
  status: string
  startDate: string
  endDate: string
  sprintCount: number
  teamCount: number
  progress: number
  description: string
}

const tableData = ref<PI[]>([])

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

function getStatusType(status: string) {
  const map: Record<string, any> = {
    '未开始': 'info',
    '规划中': 'warning',
    '进行中': 'primary',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

async function fetchData() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      {
        id: 'pi1',
        name: 'PI-2026-Q1',
        project: '整车控制域',
        status: '已完成',
        startDate: '2026-01-06',
        endDate: '2026-03-28',
        sprintCount: 6,
        teamCount: 5,
        progress: 100,
        description: '完成核心架构搭建'
      },
      {
        id: 'pi2',
        name: 'PI-2026-Q2',
        project: '整车控制域',
        status: '进行中',
        startDate: '2026-04-01',
        endDate: '2026-06-26',
        sprintCount: 6,
        teamCount: 5,
        progress: 35,
        description: '完成主要功能模块开发'
      },
      {
        id: 'pi3',
        name: 'PI-2026-Q1',
        project: '智能座舱',
        status: '规划中',
        startDate: '2026-01-13',
        endDate: '2026-04-04',
        sprintCount: 6,
        teamCount: 3,
        progress: 10,
        description: '启动新项目开发'
      }
    ]
    pagination.value.total = 3
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  ElMessage.info('创建PI功能待实现')
}

function handleView(row: PI) {
  ElMessage.info(`查看PI: ${row.name}`)
}

function handlePlanning(row: PI) {
  router.push('/function/c3/pi/planning')
}

function handleEdit(row: PI) {
  ElMessage.info(`编辑PI: ${row.name}`)
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
