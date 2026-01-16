<template>
  <PageContainer>
    <template #header>
      <PageHeader
        title="依赖管理"
        description="管理跨团队、跨模块的依赖关系"
      >
        <template #actions>
          <el-button type="primary" @click="handleAddDependency">
            <el-icon><Plus /></el-icon>
            添加依赖
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </template>
      </PageHeader>
    </template>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总依赖数" :value="statistics.total">
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="待解决" :value="statistics.pending">
            <template #prefix>
              <el-icon color="#E6A23C"><Clock /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="阻塞中" :value="statistics.blocking">
            <template #prefix>
              <el-icon color="#F56C6C"><WarningFilled /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="已解决" :value="statistics.resolved">
            <template #prefix>
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="filters" :inline="true">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="待解决" value="pending" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="阻塞中" value="blocking" />
            <el-option label="已解决" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filters.type" placeholder="全部" clearable>
            <el-option label="技术依赖" value="technical" />
            <el-option label="接口依赖" value="interface" />
            <el-option label="数据依赖" value="data" />
            <el-option label="资源依赖" value="resource" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filters.priority" placeholder="全部" clearable>
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责团队">
          <el-select v-model="filters.team" placeholder="全部" clearable>
            <el-option label="VCU团队" value="vcu" />
            <el-option label="座舱团队" value="cockpit" />
            <el-option label="网关团队" value="gateway" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 依赖列表 -->
    <el-card v-loading="loading" style="margin-top: 20px">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="dependency-detail">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="详细描述">
                  {{ row.description }}
                </el-descriptions-item>
                <el-descriptions-item label="影响范围">
                  {{ row.impact }}
                </el-descriptions-item>
                <el-descriptions-item label="解决方案">
                  {{ row.solution }}
                </el-descriptions-item>
                <el-descriptions-item label="备注">
                  {{ row.notes || '无' }}
                </el-descriptions-item>
              </el-descriptions>
              
              <div class="timeline-section">
                <h4>处理历史</h4>
                <el-timeline>
                  <el-timeline-item 
                    v-for="event in row.timeline" 
                    :key="event.id"
                    :timestamp="event.time"
                    :type="event.type"
                  >
                    {{ event.description }}
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="from" label="依赖方" width="200">
          <template #default="{ row }">
            <div class="dependency-item">
              <el-tag size="small">{{ row.fromTeam }}</el-tag>
              <div class="item-name">{{ row.from }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="" width="60" align="center">
          <template>
            <el-icon color="#409EFF"><Right /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="to" label="被依赖方" width="200">
          <template #default="{ row }">
            <div class="dependency-item">
              <el-tag size="small" type="success">{{ row.toTeam }}</el-tag>
              <div class="item-name">{{ row.to }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="110">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="90">
          <template #default="{ row }">
            <el-tag :type="getPriorityColor(row.priority)" size="small">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="期望完成" width="110" />
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleUpdate(row)">
              更新
            </el-button>
            <el-button link type="warning" @click="handleTrack(row)">
              跟踪
            </el-button>
            <el-button link type="success" @click="handleResolve(row)">
              解决
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
import { 
  Plus, Download, Link, Clock, WarningFilled, CircleCheck, Right 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)

const statistics = ref({
  total: 24,
  pending: 8,
  blocking: 3,
  resolved: 13
})

const filters = ref({
  status: '',
  type: '',
  priority: '',
  team: ''
})

const tableData = ref([
  {
    id: 'DEP-001',
    from: 'ACC功能模块',
    fromTeam: 'VCU团队',
    to: '雷达数据接口',
    toTeam: '感知团队',
    type: 'interface',
    priority: '高',
    status: 'blocking',
    deadline: '2026-04-15',
    owner: '张工',
    description: 'ACC模块需要感知团队提供雷达数据接口，当前接口版本不满足需求',
    impact: '影响ACC功能开发进度，可能导致Sprint 1延期',
    solution: '感知团队优先升级接口版本，提供v2.0接口文档',
    notes: '已在例会中讨论，感知团队承诺本周五前完成',
    timeline: [
      { id: 1, time: '2026-04-01', type: 'primary', description: '依赖创建' },
      { id: 2, time: '2026-04-05', type: 'warning', description: '状态更新为阻塞' }
    ]
  },
  {
    id: 'DEP-002',
    from: '语音助手模块',
    fromTeam: '座舱团队',
    to: '网关通信协议',
    toTeam: '网关团队',
    type: 'technical',
    priority: '中',
    status: 'in-progress',
    deadline: '2026-04-20',
    owner: '李工',
    description: '语音助手需要通过网关与车辆控制系统通信',
    impact: '影响语音控制车辆功能的实现',
    solution: '网关团队提供REST API接口',
    notes: '',
    timeline: [
      { id: 1, time: '2026-04-02', type: 'primary', description: '依赖创建' },
      { id: 2, time: '2026-04-08', type: 'success', description: '网关团队开始开发' }
    ]
  },
  {
    id: 'DEP-003',
    from: 'OTA升级模块',
    fromTeam: '网关团队',
    to: '测试车辆资源',
    toTeam: '测试团队',
    type: 'resource',
    priority: '高',
    status: 'pending',
    deadline: '2026-04-18',
    owner: '王经理',
    description: 'OTA功能需要2台测试车进行验证',
    impact: '无法进行实车OTA测试',
    solution: '协调测试团队分配测试车辆',
    notes: '等待测试团队排期',
    timeline: [
      { id: 1, time: '2026-04-03', type: 'primary', description: '依赖创建' }
    ]
  }
])

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 3
})

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    'technical': '技术依赖',
    'interface': '接口依赖',
    'data': '数据依赖',
    'resource': '资源依赖'
  }
  return map[type] || type
}

function getTypeColor(type: string) {
  const map: Record<string, any> = {
    'technical': '',
    'interface': 'success',
    'data': 'warning',
    'resource': 'info'
  }
  return map[type] || ''
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    'pending': '待解决',
    'in-progress': '进行中',
    'blocking': '阻塞中',
    'resolved': '已解决'
  }
  return map[status] || status
}

function getStatusColor(status: string) {
  const map: Record<string, any> = {
    'pending': 'info',
    'in-progress': 'warning',
    'blocking': 'danger',
    'resolved': 'success'
  }
  return map[status] || ''
}

function getPriorityColor(priority: string) {
  const map: Record<string, any> = {
    '紧急': 'danger',
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return map[priority] || ''
}

async function fetchData() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  fetchData()
}

function handleReset() {
  filters.value = {
    status: '',
    type: '',
    priority: '',
    team: ''
  }
  fetchData()
}

function handleAddDependency() {
  ElMessage.info('添加依赖')
}

function handleExport() {
  ElMessage.info('导出依赖数据')
}

function handleUpdate(row: any) {
  ElMessage.info(`更新依赖: ${row.id}`)
}

function handleTrack(row: any) {
  ElMessage.info(`跟踪依赖: ${row.id}`)
}

function handleResolve(row: any) {
  ElMessage.success(`解决依赖: ${row.id}`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.stats-row {
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.dependency-item {
  .item-name {
    margin-top: 4px;
    font-size: 13px;
  }
}

.dependency-detail {
  padding: 20px;
  background: #F5F7FA;
  
  .timeline-section {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 12px;
      font-size: 14px;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
