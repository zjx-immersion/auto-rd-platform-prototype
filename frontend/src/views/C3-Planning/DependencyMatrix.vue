<template>
  <div class="dependency-matrix-container" v-loading="loading">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <h2>依赖矩阵</h2>
      </div>
      <div class="header-right">
        <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        <el-button type="primary" @click="handleAddDependency">添加依赖</el-button>
        <el-button @click="handleIdentifyDependencies">自动识别依赖</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-label">总依赖</div>
            <div class="stat-value">{{ dependencies.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-label">阻塞中</div>
            <div class="stat-value danger">{{ blockingCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-label">关键路径</div>
            <div class="stat-value warning">{{ criticalPathCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-label">已解决</div>
            <div class="stat-value success">{{ resolvedCount }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 依赖列表 -->
    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>依赖关系列表</span>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="list">列表视图</el-radio-button>
            <el-radio-button value="graph">图形视图</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 列表视图 -->
      <el-table v-if="viewMode === 'list'" :data="dependencies" stripe>
        <el-table-column prop="code" label="编码" width="120" />
        <el-table-column label="源Feature" min-width="200">
          <template #default="{ row }">
            <div>{{ row.sourceFeatureName }}</div>
            <el-text size="small" type="info">{{ row.sourceTeamName }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="目标Feature" min-width="200">
          <template #default="{ row }">
            <div>{{ row.targetFeatureName }}</div>
            <el-text size="small" type="info">{{ row.targetTeamName }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="依赖类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getDependencyTypeText(row.dependencyType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getDependencyStatusType(row.status)" size="small">
              {{ getDependencyStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关键路径" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.criticalPath" type="warning" size="small">是</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="解决期限" width="120">
          <template #default="{ row }">
            {{ formatDate(row.resolveBy) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 图形视图 -->
      <div v-else class="graph-view">
        <div class="graph-placeholder">
          <el-icon :size="80" color="#909399"><Connection /></el-icon>
          <p>依赖关系图形视图</p>
          <el-text type="info">可使用 ECharts 或 D3.js 实现依赖关系的可视化图形</el-text>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Refresh, Connection } from '@element-plus/icons-vue'
import { usePlanningStore } from '@/stores/modules/planning'
import dayjs from 'dayjs'

const planningStore = usePlanningStore()
const router = useRouter()

const dependencies = computed(() => planningStore.draftDependencies)
const loading = ref(false)
const viewMode = ref('list')

const blockingCount = computed(() => dependencies.value.filter(d => d.status === 'blocking').length)
const criticalPathCount = computed(() => dependencies.value.filter(d => d.criticalPath).length)
const resolvedCount = computed(() => dependencies.value.filter(d => d.status === 'resolved').length)

const goBack = () => router.back()
const handleRefresh = () => ElMessage.info('刷新功能待实现')
const handleAddDependency = () => ElMessage.info('添加依赖功能待实现')
const handleIdentifyDependencies = async () => {
  try {
    await planningStore.identifyDependencies()
    ElMessage.success('依赖识别完成')
  } catch (error) {
    ElMessage.error('识别失败')
  }
}
const handleEdit = (row: any) => ElMessage.info('编辑功能待实现')
const handleDelete = (row: any) => ElMessage.info('删除功能待实现')

const formatDate = (date: string) => dayjs(date).format('MM-DD')

const getDependencyTypeText = (type: string) => {
  const map: Record<string, string> = {
    interface: '接口',
    data: '数据',
    timing: '时序',
    resource: '资源',
  }
  return map[type] || type
}

const getDependencyStatusType = (status: string) => {
  const map: Record<string, any> = {
    identified: 'info',
    resolved: 'success',
    blocking: 'danger',
    'at-risk': 'warning',
  }
  return map[status] || 'info'
}

const getDependencyStatusText = (status: string) => {
  const map: Record<string, string> = {
    identified: '已识别',
    resolved: '已解决',
    blocking: '阻塞中',
    'at-risk': '有风险',
  }
  return map[status] || status
}

onMounted(async () => {
  loading.value = true
  try {
    // 加载依赖数据
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.dependency-matrix-container {
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

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .stat-card {
    text-align: center;
    padding: 12px 0;

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #303133;

      &.success { color: #67c23a; }
      &.warning { color: #e6a23c; }
      &.danger { color: #f56c6c; }
    }
  }

  .graph-view {
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;

    .graph-placeholder {
      text-align: center;

      p {
        margin: 20px 0 10px;
        font-size: 18px;
        font-weight: 600;
        color: #606266;
      }
    }
  }
}
</style>
