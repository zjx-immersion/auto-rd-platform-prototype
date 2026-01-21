<template>
  <div class="version-planning-workspace">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/function/c0-project/list' }">项目列表</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/function/c0-project/timeline/${projectId}` }">
          项目Timeline
        </el-breadcrumb-item>
        <el-breadcrumb-item>多产品版本规划工作台</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button type="primary" @click="generatePICollection">
          🎯 生成PI集合
        </el-button>
        <el-button type="success" @click="saveWorkspace">
          💾 保存规划
        </el-button>
        <el-button @click="refresh">🔄 刷新</el-button>
        <el-button @click="goBack">返回Timeline</el-button>
      </div>
    </div>

    <el-card class="project-info-card">
      <el-descriptions :column="4" border>
        <el-descriptions-item label="项目周期">2025-02-01 ~ 2026-01-31 (52周)</el-descriptions-item>
        <el-descriptions-item label="迭代配置">2周/迭代，共26个迭代</el-descriptions-item>
        <el-descriptions-item label="里程碑">EP(迭代12) | PP(迭代18) | SOP(迭代26)</el-descriptions-item>
        <el-descriptions-item label="已规划版本">8个版本 | 1200 SP</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="workspace-card">
      <template #header>
        <div class="workspace-header">
          <span>📐 统一迭代轴 + 版本映射甘特图</span>
          <el-button type="primary" size="small" @click="createVersion">
            + 添加产品版本
          </el-button>
        </div>
      </template>

      <div class="workspace-content">
        <div class="iteration-axis">
          <div class="axis-header">
            <span>统一迭代轴（26个迭代）</span>
          </div>
          <div class="axis-content">
            <div 
              v-for="i in 26" 
              :key="i" 
              class="iteration-cell"
              :class="{ 'milestone': isMilestone(i) }"
            >
              <span>迭{{ i }}</span>
              <span v-if="getMilestone(i)" class="milestone-label">
                {{ getMilestone(i) }}
              </span>
            </div>
          </div>
        </div>

        <div class="version-gantt-area">
          <VersionGantt
            v-if="versions.length > 0 && iterations.length > 0"
            :versions="versions"
            :milestones="milestones"
            :total-iterations="iterations.length"
            @version-select="handleVersionSelect"
          />
          <el-empty 
            v-else
            description="暂无版本数据，请先创建产品版本"
            :image-size="120"
          >
            <el-button type="primary" @click="createVersion">创建版本</el-button>
          </el-empty>
        </div>
        
        <!-- 版本创建向导 -->
        <VersionCreateWizard
          v-model:visible="showVersionWizard"
          :products="[]"
          :milestones="milestones"
          :iterations="iterations"
          :epics="[]"
          @submit="handleVersionCreate"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataLine } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/modules/project'
import { useVersionStore } from '@/stores/modules/version'
import { useIterationStore } from '@/stores/modules/iteration'
import { usePIStore } from '@/stores/modules/pi'
import VersionGantt from '@/components/VersionGantt.vue'
import VersionCreateWizard from '@/components/VersionCreateWizard.vue'
import type { ProductVersion } from '@/types/version'
import type { DomainProject } from '@/types/project'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const versionStore = useVersionStore()
const iterationStore = useIterationStore()
const piStore = usePIStore()

const projectId = ref(route.params.projectId as string)
const showVersionWizard = ref(false)
const loading = ref(false)

const project = computed<DomainProject | undefined>(() => projectStore.getProjectById(projectId.value))
const versions = computed(() => versionStore.versions || [])
const iterations = computed(() => iterationStore.iterations || [])
const milestones = computed(() => projectStore.getMilestonesByProjectId(projectId.value) || [])

const milestones = [
  { iteration: 12, name: 'EP' },
  { iteration: 18, name: 'PP' },
  { iteration: 26, name: 'SOP' }
]

const isMilestone = (iteration: number) => {
  return milestones.some(m => m.iteration === iteration)
}

const getMilestone = (iteration: number) => {
  const milestone = milestones.find(m => m.iteration === iteration)
  return milestone ? milestone.name : ''
}

const createVersion = () => {
  showVersionWizard.value = true
}

const handleVersionCreate = async (versionData: any) => {
  try {
    await versionStore.createVersion(versionData)
    ElMessage.success('版本创建成功')
    showVersionWizard.value = false
    // 重新加载版本数据
    await versionStore.fetchVersions(projectId.value)
  } catch (error) {
    ElMessage.error('版本创建失败')
  }
}

const handleVersionSelect = (version: ProductVersion) => {
  ElMessage.info(`选中版本: ${version.versionNumber}`)
  // TODO: 显示版本详情面板
}

const generatePICollection = async () => {
  try {
    await ElMessageBox.confirm(
      'PI集合将基于当前版本规划自动生成，是否继续？',
      '生成PI集合',
      {
        confirmButtonText: '确认生成',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    
    // 调用PI Store的生成算法
    const result = await piStore.generatePIs({
      projectId: projectId.value,
      milestones: milestones.value.map(m => ({
        milestoneId: m.milestoneId,
        milestoneName: m.milestoneName,
        targetDate: m.targetDate,
        iterationNumber: m.iterationNumber || 0
      })),
      versions: versions.value.map(v => ({
        versionId: v.versionId,
        productName: v.productName,
        versionNumber: v.versionNumber,
        startIterationNumber: v.startIterationNumber,
        endIterationNumber: v.endIterationNumber,
        alignedMilestoneId: v.alignedMilestoneId,
        totalStoryPoints: v.totalStoryPoints
      }))
    })
    
    loading.value = false
    
    if (result.success) {
      ElMessage.success(`PI集合生成成功！共生成${result.generatedPIs.length}个PI`)
      router.push(`/function/c0-project/pi-collection/${projectId.value}`)
    } else {
      ElMessage.error(result.message)
    }
  } catch (error: any) {
    loading.value = false
    if (error !== 'cancel') {
      ElMessage.error('PI生成失败')
    }
  }
}

const saveWorkspace = () => {
  ElMessage.success('版本规划已保存')
}

const refresh = () => {
  ElMessage.success('工作台已刷新')
}

const goBack = () => {
  router.push(`/function/c0-project/timeline/${projectId.value}`)
}

onMounted(async () => {
  console.log('VersionPlanningWorkspace mounted, projectId:', projectId.value)
  
  loading.value = true
  try {
    // 并行加载所有需要的数据
    await Promise.all([
      projectStore.fetchProjectById(projectId.value),
      versionStore.fetchVersions(projectId.value),
      iterationStore.fetchIterations(projectId.value)
    ])
    console.log('✅ VersionPlanningWorkspace: 数据加载完成')
    console.log('  - 项目:', project.value?.name)
    console.log('  - 版本数:', versions.value.length)
    console.log('  - 迭代数:', iterations.value.length)
    console.log('  - 里程碑数:', milestones.value.length)
  } catch (error) {
    console.error('❌ VersionPlanningWorkspace: 数据加载失败', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.version-planning-workspace {
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
  }
  
  .workspace-card {
    min-height: 600px;
    
    .workspace-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .workspace-content {
      .iteration-axis {
        margin-bottom: 20px;
        
        .axis-header {
          padding: 12px;
          background: #f5f7fa;
          border-radius: 4px 4px 0 0;
          font-weight: 600;
        }
        
        .axis-content {
          display: flex;
          overflow-x: auto;
          border: 1px solid #dcdfe6;
          border-top: none;
          
          .iteration-cell {
            min-width: 60px;
            padding: 12px 8px;
            text-align: center;
            border-right: 1px solid #dcdfe6;
            background: white;
            position: relative;
            
            &:last-child {
              border-right: none;
            }
            
            &.milestone {
              background: #fff3e0;
              
              .milestone-label {
                display: block;
                margin-top: 4px;
                font-size: 12px;
                color: #ff9800;
                font-weight: 600;
              }
            }
          }
        }
      }
      
      .version-gantt-area {
        min-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
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
}
</style>
