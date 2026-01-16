<template>
  <page-container>
    <!-- 页面头部 -->
    <page-header :show-back="true">
      <template #title>
        <div class="title-with-status">
          {{ epicData.title }}
          <el-tag :type="getStatusType(epicData.status)">
            {{ getStatusText(epicData.status) }}
          </el-tag>
        </div>
      </template>
      <template #actions>
        <el-button @click="handleEdit">编辑</el-button>
        <el-button @click="handleCreateFeature" type="primary">
          拆解Feature
        </el-button>
      </template>
    </page-header>

    <!-- 标签页 -->
    <div class="tabs-container">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <div class="tab-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Epic ID">
                {{ epicData.id }}
              </el-descriptions-item>
              <el-descriptions-item label="优先级">
                <el-tag :type="getPriorityType(epicData.priority)">
                  {{ epicData.priority?.toUpperCase() }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="负责人">
                {{ epicData.owner }}
              </el-descriptions-item>
              <el-descriptions-item label="所属项目">
                {{ epicData.projectId }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDate(epicData.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间">
                {{ formatDate(epicData.updatedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="描述" :span="2">
                {{ epicData.description }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <el-tab-pane label="关联Feature" name="features">
          <div class="tab-content">
            <el-empty v-if="epicData.features?.length === 0" description="暂无关联Feature">
              <el-button type="primary" @click="handleCreateFeature">
                创建Feature
              </el-button>
            </el-empty>
            <div v-else>
              <!-- Feature列表 -->
              <el-card v-for="featureId in epicData.features" :key="featureId" class="feature-card">
                <div>Feature: {{ featureId }}</div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="操作历史" name="history">
          <div class="tab-content">
            <el-timeline>
              <el-timeline-item timestamp="2024-01-15 10:30" placement="top">
                创建了Epic
              </el-timeline-item>
              <el-timeline-item timestamp="2024-01-16 14:20" placement="top">
                更新了描述
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </page-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'
import type { Epic } from '@/types/entities'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const activeTab = ref('basic')

const epicData = ref<Epic>({
  id: route.params.id as string,
  title: '自动驾驶L4功能Epic',
  description: '实现L4级别自动驾驶功能，包括高速公路、城市道路等场景',
  status: 'inprogress',
  priority: 'p0',
  projectId: 'PROJECT-001',
  owner: '张三',
  features: [],
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-16T14:20:00Z',
  createdBy: 'user1',
  updatedBy: 'user1'
})

function handleEdit() {
  ElMessage.info('编辑Epic')
}

function handleCreateFeature() {
  router.push('/function/c1/feature/create?epicId=' + epicData.value.id)
}

function getStatusType(status: string) {
  const map: Record<string, any> = {
    todo: '',
    inprogress: 'primary',
    done: 'success'
  }
  return map[status] || ''
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    todo: '待处理',
    inprogress: '进行中',
    done: '已完成'
  }
  return map[status] || status
}

function getPriorityType(priority: string) {
  const map: Record<string, any> = {
    p0: 'danger',
    p1: 'warning',
    p2: 'info',
    p3: 'success'
  }
  return map[priority] || ''
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  // 加载数据
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.title-with-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tabs-container {
  flex: 1;
  padding: 0 24px 24px;
  overflow: auto;
}

.tab-content {
  padding: 24px 0;
}

.feature-card {
  margin-bottom: 16px;
}
</style>
