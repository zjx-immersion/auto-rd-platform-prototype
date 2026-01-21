<template>
  <div class="project-timeline-container">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/function/c0-project/list' }">项目列表</el-breadcrumb-item>
        <el-breadcrumb-item>项目Timeline</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button type="primary" @click="goToVersionPlanning">
          进入版本规划工作台
        </el-button>
        <el-button @click="goToPICollection">查看PI集合</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <el-card class="project-info-card" v-loading="loading">
      <h2>{{ projectName }}</h2>
      <div class="project-stats">
        <el-statistic title="项目周期" :value="projectDuration" />
        <el-statistic title="迭代配置" :value="iterationConfig" />
        <el-statistic title="里程碑数" :value="milestoneCount" />
        <el-statistic title="产品版本" :value="versionCount" />
        <el-statistic title="PI数" :value="piCount" />
      </div>
    </el-card>

    <el-card class="timeline-card">
      <template #header>
        <span>项目Timeline - 整体多集计划</span>
      </template>
      
      <div class="timeline-placeholder">
        <el-empty description="Timeline甘特图展示区域（待实现）">
          <template #image>
            <el-icon :size="100"><Calendar /></el-icon>
          </template>
          <p>将展示：</p>
          <ul>
            <li>里程碑标注线（EP, PP, SOP）</li>
            <li>产品版本条状图</li>
            <li>PI时间块</li>
            <li>统一迭代轴（26个迭代）</li>
          </ul>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/modules/project'
import { useVersionStore } from '@/stores/modules/version'
import { usePIStore } from '@/stores/modules/pi'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const versionStore = useVersionStore()
const piStore = usePIStore()

const projectId = ref(route.params.projectId as string)
const loading = ref(false)

const project = computed(() => projectStore.getProjectById(projectId.value))
const projectName = computed(() => project.value?.name || '')
const projectDuration = computed(() => {
  if (!project.value) return ''
  const weeks = Math.ceil(
    (new Date(project.value.endDate).getTime() - new Date(project.value.startDate).getTime()) /
    (7 * 24 * 60 * 60 * 1000)
  )
  return `${weeks}周`
})
const iterationConfig = computed(() => 
  project.value ? `${project.value.iterationWeeks}周/迭代，共${project.value.totalIterations}个迭代` : ''
)
const milestoneCount = computed(() => project.value?.milestones?.length || 0)
const versionCount = computed(() => project.value?.statistics?.totalVersions || 0)
const piCount = computed(() => project.value?.statistics?.totalPIs || 0)

onMounted(async () => {
  console.log('ProjectTimeline mounted, projectId:', projectId.value)
  
  loading.value = true
  try {
    // 并行加载项目、版本、PI数据
    await Promise.all([
      projectStore.fetchProjectById(projectId.value),
      versionStore.fetchVersions(projectId.value),
      piStore.fetchPIs(projectId.value)
    ])
    console.log('✅ ProjectTimeline: 数据加载完成')
  } catch (error) {
    console.error('❌ ProjectTimeline: 加载失败', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
})

const goToVersionPlanning = () => {
  router.push(`/function/c0-project/version-planning-workspace/${projectId.value}`)
}

const goToPICollection = () => {
  router.push(`/function/c0-project/pi-collection/${projectId.value}`)
}

const goBack = () => {
  router.push('/function/c0-project/list')
}
</script>

<style scoped lang="scss">
.project-timeline-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .project-info-card {
    margin-bottom: 20px;
    
    h2 {
      margin: 0 0 20px 0;
      font-size: 24px;
      color: #303133;
    }
    
    .project-stats {
      display: flex;
      gap: 40px;
    }
  }
  
  .timeline-card {
    min-height: 600px;
    
    .timeline-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 500px;
      background: #f5f7fa;
      border-radius: 4px;
      
      ul {
        text-align: left;
        margin-top: 20px;
        color: #606266;
        
        li {
          margin: 8px 0;
        }
      }
    }
  }
}
</style>
