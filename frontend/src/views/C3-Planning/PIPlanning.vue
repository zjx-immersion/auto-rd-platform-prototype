<template>
  <PageContainer>
    <template #header>
      <PageHeader
        title="PI Planning"
        description="Program Increment 规划会议 - 团队协同规划"
      >
        <template #actions>
          <el-button @click="handleSave">
            <el-icon><Document /></el-icon>
            保存规划
          </el-button>
          <el-button type="primary" @click="handleComplete">
            <el-icon><Check /></el-icon>
            完成Planning
          </el-button>
        </template>
      </PageHeader>
    </template>

    <!-- PI 基本信息 -->
    <el-card class="pi-info-card">
      <template #header>
        <div class="card-header-content">
          <span class="card-title">PI-2026-Q2 规划会议</span>
          <el-tag type="warning">进行中</el-tag>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="PI周期">2026-04-01 至 2026-06-26</el-descriptions-item>
        <el-descriptions-item label="Sprint数量">6 个Sprint</el-descriptions-item>
        <el-descriptions-item label="参与团队">5 个团队</el-descriptions-item>
        <el-descriptions-item label="PI目标">完成主要功能模块开发，提升系统稳定性</el-descriptions-item>
        <el-descriptions-item label="规划进度">
          <el-progress :percentage="60" status="warning" />
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 团队规划看板 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header-content">
          <span class="card-title">团队规划看板</span>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="team">按团队</el-radio-button>
            <el-radio-button value="sprint">按Sprint</el-radio-button>
            <el-radio-button value="feature">按Feature</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 按团队视图 -->
      <div v-if="viewMode === 'team'" class="team-planning-view">
        <el-row :gutter="20">
          <el-col :span="8" v-for="team in teams" :key="team.id">
            <el-card class="team-card" shadow="hover">
              <template #header>
                <div class="team-header">
                  <el-icon><UserFilled /></el-icon>
                  <span>{{ team.name }}</span>
                  <el-tag size="small">{{ team.memberCount }}人</el-tag>
                </div>
              </template>
              
              <div class="team-capacity">
                <div class="capacity-item">
                  <span class="label">可用人天:</span>
                  <span class="value">{{ team.availableDays }}</span>
                </div>
                <div class="capacity-item">
                  <span class="label">已规划:</span>
                  <span class="value">{{ team.plannedDays }}</span>
                </div>
                <div class="capacity-item">
                  <span class="label">负载:</span>
                  <el-progress 
                    :percentage="team.loadPercentage" 
                    :status="team.loadPercentage > 100 ? 'exception' : 'success'"
                  />
                </div>
              </div>

              <el-divider />

              <div class="team-features">
                <div class="features-header">
                  <span>规划Feature ({{ team.features.length }})</span>
                  <el-button link type="primary" size="small" @click="handleAddFeature(team)">
                    <el-icon><Plus /></el-icon>
                    添加
                  </el-button>
                </div>
                <div class="feature-list">
                  <div 
                    v-for="feature in team.features" 
                    :key="feature.id"
                    class="feature-item"
                    draggable="true"
                  >
                    <el-icon><Document /></el-icon>
                    <span class="feature-name">{{ feature.name }}</span>
                    <el-tag size="small">{{ feature.estimate }}天</el-tag>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 按Sprint视图 -->
      <div v-else-if="viewMode === 'sprint'" class="sprint-planning-view">
        <el-timeline>
          <el-timeline-item 
            v-for="sprint in sprints" 
            :key="sprint.id"
            :timestamp="sprint.dateRange"
            placement="top"
          >
            <el-card>
              <template #header>
                <div class="sprint-header">
                  <span class="sprint-name">{{ sprint.name }}</span>
                  <el-tag :type="sprint.status === 'planned' ? 'success' : 'info'">
                    {{ sprint.status === 'planned' ? '已规划' : '待规划' }}
                  </el-tag>
                </div>
              </template>
              <div class="sprint-content">
                <el-tag 
                  v-for="feature in sprint.features" 
                  :key="feature"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ feature }}
                </el-tag>
                <el-button link type="primary" @click="handlePlanSprint(sprint)">
                  规划此Sprint
                </el-button>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 按Feature视图 -->
      <div v-else class="feature-planning-view">
        <el-table :data="allFeatures">
          <el-table-column prop="name" label="Feature名称" width="250" />
          <el-table-column prop="assignedTeam" label="负责团队" width="150" />
          <el-table-column prop="sprint" label="计划Sprint" width="120" />
          <el-table-column prop="estimate" label="预估工作量" width="120" align="center" />
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)" size="small">
                {{ row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="dependencies" label="依赖项" min-width="200">
            <template #default="{ row }">
              <el-tag 
                v-for="dep in row.dependencies" 
                :key="dep"
                size="small"
                type="warning"
                style="margin-right: 5px"
              >
                {{ dep }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEditFeature(row)">
                调整
              </el-button>
              <el-button link type="danger" @click="handleRemoveFeature(row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 依赖关系图 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <span class="card-title">依赖关系</span>
      </template>
      <div class="dependency-graph">
        <el-alert
          title="依赖关系可视化"
          type="info"
          description="此处将展示Feature之间的依赖关系图，帮助团队识别关键路径和潜在风险"
          :closable="false"
          show-icon
        />
      </div>
    </el-card>

    <!-- 风险识别 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <span class="card-title">风险与问题</span>
      </template>
      <el-table :data="risks">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="description" label="风险描述" min-width="300" />
        <el-table-column prop="level" label="风险等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getRiskType(row.level)" size="small">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="120" />
        <el-table-column prop="mitigation" label="缓解措施" min-width="250" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditRisk(row)">
              编辑
            </el-button>
            <el-button link type="success" @click="handleResolveRisk(row)">
              解决
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Document, Check, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const viewMode = ref('team')

const teams = ref([
  {
    id: 't1',
    name: 'VCU团队',
    memberCount: 8,
    availableDays: 240,
    plannedDays: 200,
    loadPercentage: 83,
    features: [
      { id: 'f1', name: 'ACC功能增强', estimate: 60 },
      { id: 'f2', name: 'AEB优化', estimate: 80 },
      { id: 'f3', name: '诊断功能', estimate: 60 }
    ]
  },
  {
    id: 't2',
    name: '座舱团队',
    memberCount: 6,
    availableDays: 180,
    plannedDays: 195,
    loadPercentage: 108,
    features: [
      { id: 'f4', name: '语音助手2.0', estimate: 100 },
      { id: 'f5', name: '多屏互动', estimate: 95 }
    ]
  },
  {
    id: 't3',
    name: '网关团队',
    memberCount: 5,
    availableDays: 150,
    plannedDays: 120,
    loadPercentage: 80,
    features: [
      { id: 'f6', name: '网关安全升级', estimate: 70 },
      { id: 'f7', name: 'OTA支持', estimate: 50 }
    ]
  }
])

const sprints = ref([
  {
    id: 's1',
    name: 'Sprint 1',
    dateRange: '2026-04-01 ~ 2026-04-14',
    status: 'planned',
    features: ['ACC功能增强', '网关安全升级']
  },
  {
    id: 's2',
    name: 'Sprint 2',
    dateRange: '2026-04-15 ~ 2026-04-28',
    status: 'planned',
    features: ['AEB优化', '语音助手2.0']
  },
  {
    id: 's3',
    name: 'Sprint 3',
    dateRange: '2026-04-29 ~ 2026-05-12',
    status: 'pending',
    features: []
  }
])

const allFeatures = ref([
  {
    id: 'f1',
    name: 'ACC功能增强',
    assignedTeam: 'VCU团队',
    sprint: 'Sprint 1',
    estimate: '60人天',
    priority: '高',
    dependencies: []
  },
  {
    id: 'f2',
    name: 'AEB优化',
    assignedTeam: 'VCU团队',
    sprint: 'Sprint 2',
    estimate: '80人天',
    priority: '高',
    dependencies: ['ACC功能增强']
  },
  {
    id: 'f4',
    name: '语音助手2.0',
    assignedTeam: '座舱团队',
    sprint: 'Sprint 2',
    estimate: '100人天',
    priority: '中',
    dependencies: ['网关安全升级']
  }
])

const risks = ref([
  {
    id: 'r1',
    description: '座舱团队工作负载超标，可能影响交付质量',
    level: '高',
    owner: '张经理',
    mitigation: '从其他团队调配1-2名成员支援'
  },
  {
    id: 'r2',
    description: 'AEB优化依赖ACC功能，存在延期风险',
    level: '中',
    owner: '李工',
    mitigation: '提前准备测试环境，并行开展部分工作'
  }
])

function getPriorityType(priority: string) {
  const map: Record<string, any> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return map[priority] || 'info'
}

function getRiskType(level: string) {
  const map: Record<string, any> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return map[level] || 'info'
}

function handleAddFeature(team: any) {
  ElMessage.info(`为 ${team.name} 添加Feature`)
}

function handlePlanSprint(sprint: any) {
  ElMessage.info(`规划 ${sprint.name}`)
}

function handleEditFeature(row: any) {
  ElMessage.info(`编辑Feature: ${row.name}`)
}

function handleRemoveFeature(row: any) {
  ElMessage.warning(`移除Feature: ${row.name}`)
}

function handleEditRisk(row: any) {
  ElMessage.info('编辑风险')
}

function handleResolveRisk(row: any) {
  ElMessage.success('风险已解决')
}

function handleSave() {
  ElMessage.success('规划已保存')
}

function handleComplete() {
  ElMessage.success('PI Planning已完成')
}
</script>

<style scoped lang="scss">
.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .card-title {
    font-size: 16px;
    font-weight: 500;
  }
}

.pi-info-card {
  :deep(.el-descriptions__label) {
    width: 120px;
  }
}

.team-planning-view {
  .team-card {
    .team-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
    
    .team-capacity {
      .capacity-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        
        .label {
          color: #909399;
          font-size: 14px;
        }
        
        .value {
          font-weight: 500;
        }
      }
    }
    
    .team-features {
      .features-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 500;
      }
      
      .feature-list {
        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          margin-bottom: 8px;
          background: #F5F7FA;
          border-radius: 4px;
          cursor: move;
          
          &:hover {
            background: #E4E7ED;
          }
          
          .feature-name {
            flex: 1;
            font-size: 13px;
          }
        }
      }
    }
  }
}

.sprint-planning-view {
  .sprint-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .sprint-name {
      font-weight: 500;
    }
  }
  
  .sprint-content {
    min-height: 60px;
  }
}

.dependency-graph {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
