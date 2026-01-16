<template>
  <div class="epic-detail-container" v-loading="loading">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <div class="title-section">
          <h2>{{ epic?.title }}</h2>
          <el-tag :type="getStatusType(epic?.status)" size="large">
            {{ getStatusText(epic?.status) }}
          </el-tag>
          <el-tag :type="getPriorityType(epic?.priority)" size="large">
            {{ epic?.priority }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-button :icon="Edit" @click="handleEdit">编辑</el-button>
        <el-button type="primary" :icon="Plus" @click="handleAddFeature">
          添加Feature
        </el-button>
      </div>
    </div>

    <!-- Tab导航 -->
    <el-tabs v-model="activeTab" class="epic-tabs">
      <!-- 基本信息Tab -->
      <el-tab-pane label="基本信息" name="info">
        <el-card shadow="never">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Epic编码">
              {{ epic?.code }}
            </el-descriptions-item>
            <el-descriptions-item label="所属项目">
              {{ getProjectName(epic?.projectId) }}
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityType(epic?.priority)">
                {{ epic?.priority }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(epic?.status)">
                {{ getStatusText(epic?.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="故事点">
              {{ epic?.completedStoryPoints }} / {{ epic?.storyPoints }}
            </el-descriptions-item>
            <el-descriptions-item label="进度">
              <el-progress
                :percentage="epic?.progress || 0"
                :color="getProgressColor(epic?.progress || 0)"
              />
            </el-descriptions-item>
            <el-descriptions-item label="负责人">
              {{ getUserName(epic?.owner) }}
            </el-descriptions-item>
            <el-descriptions-item label="相关人">
              <el-tag
                v-for="userId in epic?.stakeholders"
                :key="userId"
                size="small"
                style="margin-right: 8px"
              >
                {{ getUserName(userId) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="目标版本">
              {{ epic?.targetVersion || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="目标PI">
              {{ epic?.targetPI || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <el-tag
                v-for="tag in epic?.tags"
                :key="tag"
                size="small"
                style="margin-right: 8px"
              >
                {{ tag }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(epic?.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDate(epic?.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <div class="section">
            <h3>描述</h3>
            <div class="content" v-html="epic?.description || '暂无描述'"></div>
          </div>

          <el-divider />

          <div class="section">
            <h3>业务价值</h3>
            <div class="content" v-html="epic?.businessValue || '暂无业务价值描述'"></div>
          </div>

          <el-divider />

          <div class="section">
            <h3>验收标准</h3>
            <ul class="acceptance-criteria">
              <li v-for="(criterion, index) in epic?.acceptanceCriteria" :key="index">
                {{ criterion }}
              </li>
            </ul>
            <div v-if="!epic?.acceptanceCriteria || epic.acceptanceCriteria.length === 0" class="empty-text">
              暂无验收标准
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- Features Tab -->
      <el-tab-pane name="features">
        <template #label>
          Features <el-badge :value="features.length" class="tab-badge" />
        </template>
        
        <el-card shadow="never">
          <div class="feature-header">
            <h3>Features列表</h3>
            <el-button type="primary" size="small" :icon="Plus" @click="handleAddFeature">
              添加Feature
            </el-button>
          </div>

          <el-table :data="features" stripe style="width: 100%">
            <el-table-column prop="code" label="编码" width="140" />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column label="产品线" width="150" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.productLine || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="故事点" width="100" align="center">
              <template #default="{ row }">
                {{ row.storyPoints }}
              </template>
            </el-table-column>
            <el-table-column label="SSTS" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ row.sstsIds.length }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleViewFeature(row)">
                  查看
                </el-button>
                <el-button type="danger" link size="small" @click="handleRemoveFeature(row)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="features.length === 0" description="暂无Features" />
        </el-card>
      </el-tab-pane>

      <!-- 进度跟踪Tab -->
      <el-tab-pane label="进度跟踪" name="progress">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>故事点统计</span>
                </div>
              </template>
              <div class="stat-item">
                <div class="stat-label">总故事点</div>
                <div class="stat-value">{{ epic?.storyPoints || 0 }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">已完成</div>
                <div class="stat-value success">{{ epic?.completedStoryPoints || 0 }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">待完成</div>
                <div class="stat-value warning">
                  {{ (epic?.storyPoints || 0) - (epic?.completedStoryPoints || 0) }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">完成率</div>
                <div class="stat-value primary">{{ epic?.progress || 0 }}%</div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>Feature统计</span>
                </div>
              </template>
              <div class="stat-item">
                <div class="stat-label">总Features</div>
                <div class="stat-value">{{ features.length }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">已完成</div>
                <div class="stat-value success">
                  {{ features.filter(f => f.status === 'done').length }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">进行中</div>
                <div class="stat-value primary">
                  {{ features.filter(f => f.status === 'in-progress').length }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">待开始</div>
                <div class="stat-value info">
                  {{ features.filter(f => f.status === 'backlog').length }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>Feature状态分布</span>
            </div>
          </template>
          <!-- 这里可以添加图表 -->
          <div class="progress-chart" style="height: 300px; display: flex; align-items: center; justify-content: center">
            <el-text type="info">图表待实现（可使用ECharts）</el-text>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 活动记录Tab -->
      <el-tab-pane label="活动记录" name="activity">
        <el-card shadow="never">
          <el-timeline>
            <el-timeline-item
              :timestamp="formatDate(epic?.createdAt)"
              placement="top"
            >
              <div class="activity-item">
                <strong>{{ getUserName(epic?.createdBy) }}</strong> 创建了Epic
              </div>
            </el-timeline-item>
            <el-timeline-item
              :timestamp="formatDate(epic?.updatedAt)"
              placement="top"
            >
              <div class="activity-item">
                <strong>{{ getUserName(epic?.updatedBy) }}</strong> 更新了Epic
              </div>
            </el-timeline-item>
            <!-- 更多活动记录可以从后端获取 -->
          </el-timeline>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加Feature对话框 -->
    <el-dialog
      v-model="addFeatureDialogVisible"
      title="添加Feature到Epic"
      width="700px"
    >
      <el-form :model="featureFormData" label-width="120px">
        <el-form-item label="Feature标题">
          <el-input v-model="featureFormData.title" placeholder="请输入Feature标题" />
        </el-form-item>
        <el-form-item label="产品线">
          <el-input v-model="featureFormData.productLine" placeholder="请输入产品线" />
        </el-form-item>
        <el-form-item label="产品">
          <el-input v-model="featureFormData.product" placeholder="请输入产品" />
        </el-form-item>
        <el-form-item label="故事点">
          <el-input-number v-model="featureFormData.storyPoints" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="featureFormData.owner" placeholder="请选择负责人" filterable style="width: 100%">
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addFeatureDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitFeature" :loading="submitting">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Plus } from '@element-plus/icons-vue'
import { useEpicStore } from '@/stores/modules/epic'
import { useFeatureStore } from '@/stores/modules/feature'
import { useProjectStore } from '@/stores/modules/project'
import type { Epic, Feature } from '@/types'
import dayjs from 'dayjs'

// Stores
const epicStore = useEpicStore()
const featureStore = useFeatureStore()
const projectStore = useProjectStore()
const route = useRoute()
const router = useRouter()

// 数据
const epicId = computed(() => route.params.id as string)
const epic = computed(() => epicStore.currentEpic)
const features = computed(() => featureStore.featuresByEpic(epicId.value))
const projects = computed(() => projectStore.projects)

const users = ref([
  { id: 'user-001', name: '张三' },
  { id: 'user-002', name: '李四' },
  { id: 'user-003', name: '王五' },
  { id: 'user-004', name: '赵六' },
  { id: 'user-005', name: '钱七' },
])

const loading = ref(false)
const activeTab = ref('info')
const addFeatureDialogVisible = ref(false)
const submitting = ref(false)

const featureFormData = ref({
  title: '',
  productLine: '',
  product: '',
  storyPoints: 0,
  owner: '',
})

// 方法
const goBack = () => {
  router.push('/capability/c1-requirement/epic')
}

const handleEdit = () => {
  // 跳转到编辑页面或打开编辑对话框
  ElMessage.info('编辑功能待实现')
}

const handleAddFeature = () => {
  featureFormData.value = {
    title: '',
    productLine: '',
    product: '',
    storyPoints: 0,
    owner: '',
  }
  addFeatureDialogVisible.value = true
}

const handleSubmitFeature = async () => {
  if (!featureFormData.value.title) {
    ElMessage.warning('请输入Feature标题')
    return
  }

  try {
    submitting.value = true

    await featureStore.createFeature({
      ...featureFormData.value,
      epicId: epicId.value,
    })

    ElMessage.success('创建成功')
    addFeatureDialogVisible.value = false

    // 重新加载Features
    await featureStore.fetchFeaturesByEpicId(epicId.value)
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}

const handleViewFeature = (feature: Feature) => {
  router.push(`/capability/c1-requirement/feature/${feature.id}`)
}

const handleRemoveFeature = async (feature: Feature) => {
  try {
    await ElMessageBox.confirm(
      `确定要从此Epic中移除Feature "${feature.title}" 吗？`,
      '移除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 这里应该调用解除关联的API
    ElMessage.success('移除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

// 辅助方法
const getProjectName = (projectId: string | undefined) => {
  if (!projectId) return '-'
  const project = projects.value.find(p => p.id === projectId)
  return project?.name || projectId
}

const getUserName = (userId: string | undefined) => {
  if (!userId) return '-'
  const user = users.value.find(u => u.id === userId)
  return user?.name || userId
}

const getStatusText = (status: string | undefined) => {
  if (!status) return '-'
  const statusMap: Record<string, string> = {
    backlog: '待开始',
    analysis: '分析中',
    ready: '就绪',
    'in-progress': '进行中',
    done: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

const getStatusType = (status: string | undefined) => {
  if (!status) return 'info'
  const typeMap: Record<string, any> = {
    backlog: 'info',
    analysis: 'warning',
    ready: '',
    'in-progress': 'primary',
    done: 'success',
    cancelled: 'danger',
  }
  return typeMap[status] || 'info'
}

const getPriorityType = (priority: string | undefined) => {
  if (!priority) return 'info'
  const typeMap: Record<string, any> = {
    P0: 'danger',
    P1: 'warning',
    P2: '',
    P3: 'info',
    P4: 'info',
  }
  return typeMap[priority] || 'info'
}

const getProgressColor = (progress: number) => {
  if (progress < 30) return '#f56c6c'
  if (progress < 70) return '#e6a23c'
  return '#67c23a'
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      epicStore.fetchEpicById(epicId.value),
      featureStore.fetchFeaturesByEpicId(epicId.value),
      projectStore.fetchProjects(),
    ])

    // 根据URL参数切换tab
    const tab = route.query.tab as string
    if (tab) {
      activeTab.value = tab
    }
  } finally {
    loading.value = false
  }
})

// 监听路由变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    loading.value = true
    try {
      await epicStore.fetchEpicById(newId as string)
      await featureStore.fetchFeaturesByEpicId(newId as string)
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped lang="scss">
.epic-detail-container {
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

  .epic-tabs {
    :deep(.el-tabs__content) {
      padding-top: 20px;
    }
  }

  .section {
    margin: 20px 0;

    h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .content {
      color: #606266;
      line-height: 1.8;
      white-space: pre-wrap;
    }

    .empty-text {
      color: #909399;
      font-style: italic;
    }
  }

  .acceptance-criteria {
    margin: 0;
    padding-left: 24px;

    li {
      margin-bottom: 8px;
      color: #606266;
      line-height: 1.6;
    }
  }

  .feature-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .tab-badge {
    margin-left: 8px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }

    .stat-label {
      font-size: 14px;
      color: #606266;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: #303133;

      &.success {
        color: #67c23a;
      }

      &.warning {
        color: #e6a23c;
      }

      &.primary {
        color: #409eff;
      }

      &.info {
        color: #909399;
      }
    }
  }

  .progress-chart {
    background: #f5f7fa;
    border-radius: 4px;
  }

  .activity-item {
    font-size: 14px;
    color: #606266;

    strong {
      color: #303133;
    }
  }
}
</style>
