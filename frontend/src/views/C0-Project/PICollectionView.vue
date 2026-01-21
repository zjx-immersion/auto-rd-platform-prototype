<template>
  <div class="pi-collection-container">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/function/c0-project/list' }">项目列表</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/function/c0-project/timeline/${projectId}` }">
          项目Timeline
        </el-breadcrumb-item>
        <el-breadcrumb-item>PI集合视图</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button type="primary" icon="Refresh" @click="refreshPICollection">
          刷新PI集合
        </el-button>
        <el-button @click="goBack">返回Timeline</el-button>
      </div>
    </div>

    <el-alert
      title="PI集合说明"
      type="info"
      :closable="false"
      show-icon
    >
      <ul>
        <li>PI由系统根据版本规划自动生成，与里程碑对齐</li>
        <li>每个PI包含同期交付的多个产品版本</li>
        <li>如需调整PI，请返回版本规划工作台调整版本规划</li>
        <li>点击"进入PI Planning"开始Feature细化</li>
      </ul>
    </el-alert>

    <el-row :gutter="20" class="statistics">
      <el-col :span="6">
        <el-statistic title="总PI数" :value="3" suffix="个" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="总版本" :value="8" suffix="个" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="总Epic" :value="15" suffix="个" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="总SP" :value="1200" />
      </el-col>
    </el-row>

    <div class="pi-cards">
      <el-card class="pi-card" v-for="pi in mockPIs" :key="pi.piId">
        <template #header>
          <div class="pi-header">
            <span class="pi-title">{{ pi.piName }}</span>
            <el-tag :type="getAlignmentTagType(pi.alignmentStatus)">
              {{ pi.alignmentStatus }}
            </el-tag>
          </div>
        </template>

        <div class="pi-content">
          <div class="pi-section">
            <h4>⏱️ 时间范围</h4>
            <p>{{ pi.timeRange }}</p>
          </div>

          <div class="pi-section">
            <h4>🏁 里程碑对齐</h4>
            <p>{{ pi.milestone }} - Buffer: {{ pi.buffer }}天</p>
          </div>

          <div class="pi-section">
            <h4>📦 包含版本</h4>
            <el-tag v-for="version in pi.versions" :key="version" size="small" class="version-tag">
              {{ version }}
            </el-tag>
          </div>

          <div class="pi-section">
            <h4>🎯 范围统计</h4>
            <p>Epic: {{ pi.epicCount }}个 | SP: {{ pi.totalSP }}</p>
          </div>

          <div class="pi-actions">
            <el-button type="primary" size="small" @click="enterPIPlanning(pi.piId)">
              进入PI Planning
            </el-button>
            <el-button size="small">查看详情</el-button>
            <el-button size="small">导出报告</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const projectId = ref(route.params.projectId as string)

const mockPIs = ref([
  {
    piId: 'PI-001',
    piNumber: 'PI-1',
    piName: '🎯 PI-1：工程样车 PI (EP PI)',
    timeRange: '2025-02-01 ~ 2025-04-25 (迭代1-6, 12周)',
    milestone: '工程样车（EP）- 2025-06-30',
    buffer: 66,
    alignmentStatus: '🟢 良好',
    versions: ['ADAS V1.0', '座舱HMI V1.0', '网关 V1.0'],
    epicCount: 5,
    totalSP: 240
  },
  {
    piId: 'PI-002',
    piNumber: 'PI-2',
    piName: '🎯 PI-2：PP车 PI (PP PI)',
    timeRange: '2025-04-26 ~ 2025-07-18 (迭代7-12, 12周)',
    milestone: 'PP车（PP）- 2025-09-30',
    buffer: 74,
    alignmentStatus: '🟡 紧张',
    versions: ['ADAS V1.1', '座舱HMI V1.1', 'OTA V1.0', '云服务 V1.0'],
    epicCount: 8,
    totalSP: 374
  },
  {
    piId: 'PI-003',
    piNumber: 'PI-3',
    piName: '🎯 PI-3：量产车 PI (SOP PI)',
    timeRange: '2025-07-19 ~ 2025-12-27 (迭代13-24, 24周)',
    milestone: '量产车（SOP）- 2025-12-31',
    buffer: 4,
    alignmentStatus: '🟢 良好',
    versions: ['ADAS V2.0', '座舱HMI V2.0'],
    epicCount: 12,
    totalSP: 586
  }
])

const getAlignmentTagType = (status: string) => {
  if (status.includes('良好')) return 'success'
  if (status.includes('紧张')) return 'warning'
  return 'danger'
}

const refreshPICollection = () => {
  ElMessage.success('PI集合已刷新')
}

const enterPIPlanning = (piId: string) => {
  ElMessage.info(`进入PI Planning: ${piId}（功能待实现）`)
}

const goBack = () => {
  router.push(`/function/c0-project/timeline/${projectId.value}`)
}

onMounted(() => {
  console.log('PICollectionView mounted, projectId:', projectId.value)
})
</script>

<style scoped lang="scss">
.pi-collection-container {
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
  
  .el-alert {
    margin-bottom: 20px;
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin: 4px 0;
      }
    }
  }
  
  .statistics {
    margin-bottom: 30px;
  }
  
  .pi-cards {
    display: flex;
    flex-direction: column;
    gap: 24px;
    
    .pi-card {
      .pi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .pi-title {
          font-size: 18px;
          font-weight: 600;
        }
      }
      
      .pi-content {
        .pi-section {
          margin-bottom: 16px;
          
          h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #606266;
          }
          
          p {
            margin: 0;
            color: #303133;
          }
          
          .version-tag {
            margin-right: 8px;
            margin-bottom: 8px;
          }
        }
        
        .pi-actions {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #ebeef5;
          display: flex;
          gap: 12px;
        }
      }
    }
  }
}
</style>
