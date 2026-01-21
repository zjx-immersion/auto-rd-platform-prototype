<template>
  <div class="project-create-container">
    <PageContainer>
      <!-- 步骤条 -->
      <el-card class="steps-card" shadow="never">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="基本信息" description="项目名称、领域等" />
          <el-step title="交付节点" description="关键里程碑" />
          <el-step title="团队配置" description="团队和成员" />
          <el-step title="完成创建" description="确认信息" />
        </el-steps>
      </el-card>

      <!-- 步骤内容 -->
      <el-card class="content-card" shadow="never">
        <!-- 步骤1：基本信息 -->
        <div v-show="currentStep === 0" class="step-content">
          <h3 class="step-title">基本信息</h3>
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicFormRules"
            label-width="120px"
            style="max-width: 600px"
          >
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="basicForm.name" placeholder="例如：岚图梦想家Pro智能驾驶项目" />
            </el-form-item>
            <el-form-item label="项目编码" prop="code">
              <el-input v-model="basicForm.code" placeholder="自动生成或手动输入">
                <template #append>
                  <el-button :icon="Refresh" @click="generateCode">生成</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="领域" prop="domain">
              <el-select v-model="basicForm.domain" placeholder="请选择领域" style="width: 100%">
                <el-option label="智能驾驶" value="智能驾驶" />
                <el-option label="智能座舱" value="智能座舱" />
                <el-option label="电子电器" value="电子电器" />
                <el-option label="底盘域" value="底盘域" />
                <el-option label="新能源" value="新能源" />
              </el-select>
            </el-form-item>
            <el-form-item label="车型名称" prop="vehicleModel">
              <el-input v-model="basicForm.vehicleModel" placeholder="例如：岚图梦想家Pro" />
            </el-form-item>
            <el-form-item label="项目描述" prop="description">
              <el-input
                v-model="basicForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入项目描述"
              />
            </el-form-item>
            <el-form-item label="负责人" prop="owner">
              <el-select v-model="basicForm.owner" placeholder="请选择负责人" style="width: 100%">
                <el-option
                  v-for="user in allUsers"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="项目周期" prop="dateRange">
              <el-date-picker
                v-model="basicForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤2：交付节点 -->
        <div v-show="currentStep === 1" class="step-content">
          <h3 class="step-title">交付节点</h3>
          <p class="step-description">定义项目的关键里程碑和交付节点</p>
          
          <div class="milestone-actions">
            <el-button type="primary" :icon="Plus" @click="addMilestone">添加节点</el-button>
            <el-button :icon="DocumentCopy" @click="useTemplate">使用模板</el-button>
          </div>

          <el-table :data="milestones" style="width: 100%; margin-top: 20px">
            <el-table-column label="序号" type="index" width="60" />
            <el-table-column label="节点名称" prop="name" width="200">
              <template #default="{ row }">
                <el-input v-model="row.name" placeholder="例如：SOP" />
              </template>
            </el-table-column>
            <el-table-column label="计划日期" prop="date" width="180">
              <template #default="{ row }">
                <el-date-picker v-model="row.date" type="date" placeholder="选择日期" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="描述" prop="description">
              <template #default="{ row }">
                <el-input v-model="row.description" placeholder="节点描述" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="removeMilestone($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 步骤3：团队配置 -->
        <div v-show="currentStep === 2" class="step-content">
          <h3 class="step-title">团队配置</h3>
          <p class="step-description">选择参与项目的团队和成员</p>

          <div class="team-actions">
            <el-button type="primary" :icon="Plus" @click="addTeam">添加团队</el-button>
          </div>

          <el-table :data="teams" style="width: 100%; margin-top: 20px">
            <el-table-column label="团队名称" prop="name" width="250">
              <template #default="{ row }">
                <el-select v-model="row.id" placeholder="选择团队" style="width: 100%">
                  <el-option
                    v-for="team in allTeams"
                    :key="team.teamId"
                    :label="`${team.teamName} (${team.domain})`"
                    :value="team.teamId"
                  >
                    <div style="display: flex; justify-content: space-between;">
                      <span>{{ team.teamName }}</span>
                      <span style="color: #8492a6; font-size: 13px;">{{ team.capacityPerIteration }} SP/迭代</span>
                    </div>
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="团队负责人" prop="leader">
              <template #default="{ row }">
                {{ getTeamLeader(row.id) }}
              </template>
            </el-table-column>
            <el-table-column label="团队规模" prop="size">
              <template #default="{ row }">
                <el-tag size="small">{{ getTeamSize(row.id) }}人</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="角色" prop="role" width="150">
              <template #default="{ row }">
                <el-select v-model="row.role" placeholder="选择角色" style="width: 100%">
                  <el-option label="开发团队" value="development" />
                  <el-option label="测试团队" value="testing" />
                  <el-option label="集成团队" value="integration" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="removeTeam($index)">
                  删除
                </el-button>
        </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 步骤4：确认信息 -->
        <div v-show="currentStep === 3" class="step-content">
          <h3 class="step-title">确认信息</h3>
          <p class="step-description">请确认以下项目信息</p>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="项目名称">{{ basicForm.name }}</el-descriptions-item>
            <el-descriptions-item label="项目编码">{{ basicForm.code }}</el-descriptions-item>
            <el-descriptions-item label="领域">{{ basicForm.domain }}</el-descriptions-item>
            <el-descriptions-item label="车型">{{ basicForm.vehicleModel }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ getUserName(basicForm.owner) }}</el-descriptions-item>
            <el-descriptions-item label="项目周期">
              {{ formatDateRange(basicForm.dateRange) }}
            </el-descriptions-item>
            <el-descriptions-item label="交付节点" :span="2">
              <el-tag v-for="(m, i) in milestones" :key="i" style="margin-right: 8px">
                {{ m.name }} ({{ m.date }})
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="团队配置" :span="2">
              <el-tag v-for="(t, i) in teams" :key="i" type="success" style="margin-right: 8px">
                {{ getTeamName(t.id) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="项目描述" :span="2">
              {{ basicForm.description }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 步骤按钮 -->
        <div class="step-actions">
          <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</el-button>
          <el-button v-if="currentStep === 3" type="primary" :loading="submitting" @click="submitForm">
            创建项目
          </el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </el-card>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, DocumentCopy } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useProjectStore } from '@/stores/modules/project'
import { useUserStore } from '@/stores/modules/user'
import { useTeamStore } from '@/stores/modules/team'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const projectStore = useProjectStore()
const userStore = useUserStore()
const teamStore = useTeamStore()

// 当前步骤
const currentStep = ref(0)
const submitting = ref(false)

// 表单引用
const basicFormRef = ref<FormInstance>()

// 基本信息表单
const basicForm = ref({
  name: '',
  code: '',
  domain: '',
  vehicleModel: '',
  description: '',
  owner: '',
  dateRange: [] as any[]
})

const basicFormRules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入项目编码', trigger: 'blur' }],
  domain: [{ required: true, message: '请选择领域', trigger: 'change' }],
  vehicleModel: [{ required: true, message: '请输入车型名称', trigger: 'blur' }],
  owner: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择项目周期', trigger: 'change' }]
}

// 交付节点
const milestones = ref<any[]>([
  { name: 'SOP', date: '', description: '量产启动' },
  { name: 'MP', date: '', description: '量产' }
])

// 团队配置
const teams = ref<any[]>([])

// 计算属性
const allUsers = computed(() => userStore.users || [])
const allTeams = computed(() => teamStore.activeTeams || [])

// 辅助函数
const generateCode = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  basicForm.value.code = `PROJ-${timestamp}-${random}`
}

const getUserName = (userId: string) => {
  const user = allUsers.value.find(u => u.id === userId)
  return user ? user.name : userId
}

const getTeamName = (teamId: string) => {
  const team = teamStore.getTeamById(teamId)
  return team ? team.teamName : teamId
}

const getTeamLeader = (teamId: string) => {
  const team = teamStore.getTeamById(teamId)
  return team ? team.teamLeadName : '-'
}

const getTeamSize = (teamId: string) => {
  const team = teamStore.getTeamById(teamId)
  return team ? team.statistics.totalMembers : 0
}

const formatDateRange = (dateRange: any[]) => {
  if (!dateRange || dateRange.length !== 2) return '-'
  return `${dateRange[0]} 至 ${dateRange[1]}`
}

// 节点操作
const addMilestone = () => {
  milestones.value.push({ name: '', date: '', description: '' })
}

const removeMilestone = (index: number) => {
  milestones.value.splice(index, 1)
}

const useTemplate = () => {
  milestones.value = [
    { name: 'Kickoff', date: '', description: '项目启动' },
    { name: 'Alpha', date: '', description: 'Alpha版本' },
    { name: 'Beta', date: '', description: 'Beta版本' },
    { name: 'RC', date: '', description: '候选发布版本' },
    { name: 'SOP', date: '', description: '量产启动' },
    { name: 'MP', date: '', description: '量产' }
  ]
  ElMessage.success('已应用标准模板')
}

// 团队操作
const addTeam = () => {
  teams.value.push({ id: '', role: 'development' })
}

const removeTeam = (index: number) => {
  teams.value.splice(index, 1)
}

// 步骤操作
const nextStep = async () => {
  if (currentStep.value === 0) {
    // 验证基本信息
    if (!basicFormRef.value) return
    const valid = await basicFormRef.value.validate().catch(() => false)
    if (!valid) return
  }
  
  if (currentStep.value === 1) {
    // 验证交付节点
    if (milestones.value.length === 0) {
      ElMessage.warning('请至少添加一个交付节点')
      return
    }
    const invalidMilestones = milestones.value.filter(m => !m.name || !m.date)
    if (invalidMilestones.length > 0) {
      ElMessage.warning('请完善交付节点信息')
      return
    }
  }
  
  if (currentStep.value === 2) {
    // 验证团队配置
    if (teams.value.length === 0) {
      ElMessage.warning('请至少添加一个团队')
      return
    }
    const invalidTeams = teams.value.filter(t => !t.id || !t.role)
    if (invalidTeams.length > 0) {
      ElMessage.warning('请完善团队配置信息')
      return
    }
  }
  
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const cancel = () => {
  router.back()
}

const submitForm = async () => {
  submitting.value = true
  try {
    // 构建项目数据
    const projectData = {
      name: basicForm.value.name,
      code: basicForm.value.code,
      domain: basicForm.value.domain,
      description: basicForm.value.description,
      owner: basicForm.value.owner,
      startDate: basicForm.value.dateRange[0],
      endDate: basicForm.value.dateRange[1],
      status: 'planning',
      vehicleModel: basicForm.value.vehicleModel,
      milestones: milestones.value,
      teamIds: teams.value.map(t => t.id),
      tags: [basicForm.value.domain],
      metadata: {
        milestones: milestones.value,
        teams: teams.value
      }
    }

    const project = await projectStore.createProject(projectData as any)
    ElMessage.success('项目创建成功！')
    
    // 创建成功后显示引导对话框
    ElMessageBox.confirm(
      '项目创建成功！下一步操作：',
      '下一步',
      {
        confirmButtonText: '进入Timeline',
        cancelButtonText: '返回项目列表',
        type: 'success',
        distinguishCancelAndClose: true,
        closeOnClickModal: false
      }
    ).then(() => {
      // 进入项目Timeline
      router.push(`/function/c0-project/timeline/${project.id}`)
    }).catch((action: string) => {
      if (action === 'cancel') {
        // 返回项目列表
        router.push('/function/c0-project/list')
      }
    })
  } catch (error) {
    ElMessage.error('项目创建失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  generateCode()
  // 加载团队数据
  await teamStore.fetchTeams()
  console.log('✅ 已加载团队数据，可用团队数:', teamStore.activeTeams.length)
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.project-create-container {
  height: 100%;
}

.steps-card {
  margin-bottom: 20px;
}

.content-card {
  min-height: 500px;
}

.step-content {
  padding: 20px 0;

  .step-title {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    color: $text-color-primary;
  }

  .step-description {
    margin: 0 0 20px 0;
    font-size: 14px;
    color: $text-color-secondary;
  }
}

.milestone-actions,
.team-actions {
  margin-bottom: 16px;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid $border-color-base;
}
</style>
