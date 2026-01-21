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

    <el-card class="project-info-card">
      <h2>{{ projectName }}</h2>
      <div class="project-stats">
        <el-statistic title="项目周期" :value="projectDuration" />
        <el-statistic title="迭代配置" :value="iterationConfig" />
        <el-statistic title="里程碑数" :value="milestoneCount" />
        <el-statistic title="产品版本" :value="versionCount" />
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const projectId = ref(route.params.projectId as string)
const projectName = ref('岚图H56整车软件研发项目')
const projectDuration = ref('52周')
const iterationConfig = ref('2周/迭代，共26个迭代')
const milestoneCount = ref(3)
const versionCount = ref(8)

onMounted(() => {
  console.log('ProjectTimeline mounted, projectId:', projectId.value)
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
