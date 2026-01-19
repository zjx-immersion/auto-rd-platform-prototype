<template>
  <div class="my-process">
    <page-header title="我的流程" description="查看和管理我参与的流程" />

    <div class="content">
      <el-row :gutter="16">
        <el-col 
          v-for="process in processList" 
          :key="process.id"
          :span="8"
        >
          <el-card class="process-card" shadow="hover" @click="handleProcessClick(process)">
            <div class="process-icon">
              <el-icon :size="48"><component :is="process.icon" /></el-icon>
            </div>
            <h3 class="process-title">{{ process.title }}</h3>
            <p class="process-description">{{ process.description }}</p>
            <div class="process-footer">
              <el-button type="primary" size="small">开始流程</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider content-position="left">进行中的流程</el-divider>
      
      <el-table :data="ongoingProcesses">
        <el-table-column prop="title" label="流程名称" />
        <el-table-column prop="step" label="当前步骤" />
        <el-table-column prop="progress" label="进度">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最后更新" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="text" @click="continueProcess(row)">继续</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { TrendCharts, List, Document, Refresh, CircleCheck, Upload } from '@element-plus/icons-vue'
import PageHeader from '@/components/Common/PageHeader.vue'

const router = useRouter()

const processList = [
  {
    id: 'p1',
    title: 'P1: 战略规划流程',
    description: 'Epic创建、优先级排序、版本规划',
    icon: TrendCharts,
    path: '/process/p1-strategic'
  },
  {
    id: 'p2',
    title: 'P2: 特性设计流程',
    description: 'Feature拆解、PRD编写、评审',
    icon: List,
    path: '/process/p2-feature'
  },
  {
    id: 'p3',
    title: 'P3: 方案设计流程',
    description: 'SSTS拆解、架构设计、接口设计',
    icon: Document,
    path: '/process/p3-solution'
  },
  {
    id: 'p4',
    title: 'P4: 团队迭代流程',
    description: 'Sprint规划、迭代执行、评审',
    icon: Refresh,
    path: '/process/p4-iteration'
  },
  {
    id: 'p5',
    title: 'P5: 测试验证流程',
    description: '测试计划、用例执行、缺陷管理',
    icon: CircleCheck,
    path: '/process/p5-testing'
  },
  {
    id: 'p6',
    title: 'P6: 发布交付流程',
    description: '发布计划、部署管理、回滚',
    icon: Upload,
    path: '/process/p6-release'
  }
]

const ongoingProcesses = ref([
  {
    id: '1',
    title: 'P1: 战略规划流程 - ADAS功能规划',
    step: '步骤3: MoSCoW分类',
    progress: 60,
    updatedAt: '2024-01-16 14:30'
  }
])

function handleProcessClick(process: any) {
  router.push(process.path)
}

function continueProcess(process: any) {
  // 继续未完成的流程
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.my-process {
  height: 100%;
  background: #fff;
}

.content {
  padding: 24px;
}

.process-card {
  cursor: pointer;
  text-align: center;
  transition: transform 0.3s;
  margin-bottom: 16px;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  .process-icon {
    color: $primary-color;
    margin-bottom: 16px;
  }
  
  .process-title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .process-description {
    margin: 0 0 16px;
    font-size: 14px;
    color: $text-color-secondary;
    min-height: 40px;
  }
  
  .process-footer {
    display: flex;
    justify-content: center;
  }
}
</style>
