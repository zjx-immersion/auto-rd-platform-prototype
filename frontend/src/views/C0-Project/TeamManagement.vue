<template>
  <div class="team-management-container">
    <div class="page-header">
      <h2>团队管理</h2>
      <div class="header-actions">
        <el-button type="primary" icon="Plus" @click="createTeam">
          新建团队
        </el-button>
        <el-button icon="Refresh" @click="refresh">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="20" class="statistics">
      <el-col :span="6">
        <el-statistic title="总团队" :value="teams.length" suffix="个" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="活跃团队" :value="activeTeamCount" suffix="个" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="总成员" :value="totalMembers" suffix="人" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="平均容量" :value="averageCapacity" suffix="SP/迭代" />
      </el-col>
    </el-row>

    <el-card>
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索团队名称..."
          clearable
          style="width: 300px"
          prefix-icon="Search"
        />
        <el-select v-model="domainFilter" placeholder="按领域筛选" clearable style="width: 200px">
          <el-option label="全部" value="" />
          <el-option label="智能驾驶" value="智能驾驶" />
          <el-option label="智能座舱" value="智能座舱" />
          <el-option label="电子电器架构" value="电子电器架构" />
          <el-option label="云服务" value="云服务" />
        </el-select>
      </div>

      <el-table :data="filteredTeams" stripe style="width: 100%">
        <el-table-column prop="teamName" label="团队名称" width="200" />
        <el-table-column prop="domain" label="领域" width="150" />
        <el-table-column prop="teamLeadName" label="负责人" width="120" />
        <el-table-column prop="teamSize" label="成员" width="100">
          <template #default="{ row }">
            {{ row.statistics.totalMembers }}人
          </template>
        </el-table-column>
        <el-table-column prop="capacityPerIteration" label="容量（SP/迭代）" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="viewTeam(row)">
              详情
            </el-button>
            <el-button size="small" type="primary" link @click="editTeam(row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" link @click="deleteTeam(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import teamsData from '@/mock/teams.json'

interface Team {
  teamId: string
  teamName: string
  teamCode: string
  domain: string
  description?: string
  teamLeadId: string
  teamLeadName: string
  capacityPerIteration: number
  teamSize: number
  status: string
  statistics: {
    totalMembers: number
    activeProjects: number
    currentLoad: number
    averageCapacityPerPerson: number
  }
}

const teams = ref<Team[]>([])
const searchKeyword = ref('')
const domainFilter = ref('')

const filteredTeams = computed(() => {
  let result = teams.value

  if (searchKeyword.value) {
    result = result.filter(team =>
      team.teamName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      team.teamCode.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (domainFilter.value) {
    result = result.filter(team => team.domain === domainFilter.value)
  }

  return result
})

const activeTeamCount = computed(() => {
  return teams.value.filter(t => t.status === 'active').length
})

const totalMembers = computed(() => {
  return teams.value.reduce((sum, t) => sum + t.statistics.totalMembers, 0)
})

const averageCapacity = computed(() => {
  if (teams.value.length === 0) return 0
  const total = teams.value.reduce((sum, t) => sum + t.capacityPerIteration, 0)
  return Math.round(total / teams.value.length)
})

const loadTeams = () => {
  teams.value = teamsData.teams as Team[]
  console.log('Loaded teams:', teams.value.length)
}

const createTeam = () => {
  ElMessage.info('创建团队对话框（待实现）')
}

const viewTeam = (team: Team) => {
  ElMessage.info(`查看团队详情: ${team.teamName}（待实现）`)
}

const editTeam = (team: Team) => {
  ElMessage.info(`编辑团队: ${team.teamName}（待实现）`)
}

const deleteTeam = (team: Team) => {
  ElMessageBox.confirm(
    `确定要删除团队"${team.teamName}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    // TODO: 实际删除逻辑
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const refresh = () => {
  loadTeams()
  ElMessage.success('团队列表已刷新')
}

onMounted(() => {
  loadTeams()
})
</script>

<style scoped lang="scss">
.team-management-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 24px;
      color: #303133;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .statistics {
    margin-bottom: 20px;
  }
  
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }
}
</style>
