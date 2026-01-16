/**
 * PI Planning管理Store
 * C3能力域：规划协调 - PI Planning
 * 覆盖价值流：S4
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  PIPlanningResult, 
  TeamPlanning, 
  SprintPlanning,
  DependencyMatrix,
  FeatureAllocation 
} from '@/types'

export const usePlanningStore = defineStore('planning', () => {
  const planningResults = ref<PIPlanningResult[]>([])
  const currentPlanning = ref<PIPlanningResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 临时规划状态（PI Planning进行中的临时数据）
  const draftTeamPlannings = ref<TeamPlanning[]>([])
  const draftSprintPlannings = ref<SprintPlanning[]>([])
  const draftDependencies = ref<DependencyMatrix[]>([])

  // Getters
  const planningByPI = computed(() => (piId: string) => {
    return planningResults.value.find(p => p.piId === piId)
  })

  const teamLoadAnalysis = computed(() => {
    return draftTeamPlannings.value.map(team => ({
      teamId: team.teamId,
      teamName: team.teamName,
      totalLoad: team.totalLoad,
      capacity: team.capacity,
      loadPercentage: team.loadPercentage,
      isOverloaded: team.loadPercentage > 100,
      isUnderUtilized: team.loadPercentage < 70,
    }))
  })

  const criticalDependencies = computed(() => {
    return draftDependencies.value.filter(d => 
      d.criticalPath || d.status === 'blocking'
    )
  })

  // Actions
  async function fetchPlanningResult(piId: string) {
    loading.value = true
    error.value = null
    try {
      const planning = planningResults.value.find(p => p.piId === piId)
      if (planning) {
        currentPlanning.value = planning
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function startPlanning(piId: string) {
    loading.value = true
    try {
      // 初始化临时规划数据
      draftTeamPlannings.value = []
      draftSprintPlannings.value = []
      draftDependencies.value = []
      
      // 创建新的Planning Result
      const newPlanning: PIPlanningResult = {
        id: `planning-${Date.now()}`,
        piId,
        teamPlannings: [],
        sprintPlannings: [],
        dependencies: [],
        risks: [],
        issues: [],
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: '',
        updatedBy: '',
      }
      
      currentPlanning.value = newPlanning
      return newPlanning
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function allocateFeatureToTeam(
    teamId: string,
    featureAllocation: FeatureAllocation
  ) {
    const teamIndex = draftTeamPlannings.value.findIndex(t => t.teamId === teamId)
    
    if (teamIndex === -1) {
      // 创建新的团队规划
      draftTeamPlannings.value.push({
        teamId,
        teamName: '', // 需要从团队数据中获取
        features: [featureAllocation],
        totalLoad: featureAllocation.storyPoints,
        capacity: 0, // 需要从团队配置中获取
        loadPercentage: 0,
        risks: [],
        dependencies: [],
      })
    } else {
      // 更新现有团队规划
      const team = draftTeamPlannings.value[teamIndex]
      team.features.push(featureAllocation)
      team.totalLoad += featureAllocation.storyPoints
      
      if (team.capacity > 0) {
        team.loadPercentage = Math.round((team.totalLoad / team.capacity) * 100)
      }
    }
  }

  async function removeFeatureFromTeam(teamId: string, featureId: string) {
    const teamIndex = draftTeamPlannings.value.findIndex(t => t.teamId === teamId)
    
    if (teamIndex !== -1) {
      const team = draftTeamPlannings.value[teamIndex]
      const featureIndex = team.features.findIndex(f => f.featureId === featureId)
      
      if (featureIndex !== -1) {
        const feature = team.features[featureIndex]
        team.totalLoad -= feature.storyPoints
        team.features.splice(featureIndex, 1)
        
        if (team.capacity > 0) {
          team.loadPercentage = Math.round((team.totalLoad / team.capacity) * 100)
        }
      }
    }
  }

  async function addDependency(dependency: DependencyMatrix) {
    draftDependencies.value.push(dependency)
  }

  async function updateDependency(dependencyId: string, updates: Partial<DependencyMatrix>) {
    const index = draftDependencies.value.findIndex(d => d.id === dependencyId)
    if (index !== -1) {
      draftDependencies.value[index] = {
        ...draftDependencies.value[index],
        ...updates,
      }
    }
  }

  async function identifyDependencies() {
    // 自动识别Feature之间的依赖关系
    // 这里是简化版本，实际需要根据Feature的依赖关系进行分析
    console.log('识别依赖关系...')
    
    // TODO: 实现依赖识别逻辑
    // 1. 分析Feature之间的接口依赖
    // 2. 分析跨团队的协作依赖
    // 3. 识别关键路径
  }

  async function detectConflicts() {
    const conflicts = []
    
    // 检测负载冲突
    for (const team of draftTeamPlannings.value) {
      if (team.loadPercentage > 120) {
        conflicts.push({
          type: 'overload',
          teamId: team.teamId,
          message: `${team.teamName} 负载过高: ${team.loadPercentage}%`,
        })
      }
    }
    
    // 检测依赖冲突
    for (const dep of draftDependencies.value) {
      if (dep.status === 'blocking') {
        conflicts.push({
          type: 'dependency',
          dependencyId: dep.id,
          message: `依赖阻塞: ${dep.description}`,
        })
      }
    }
    
    return conflicts
  }

  async function saveDraft() {
    if (!currentPlanning.value) return
    
    currentPlanning.value.teamPlannings = [...draftTeamPlannings.value]
    currentPlanning.value.sprintPlannings = [...draftSprintPlannings.value]
    currentPlanning.value.dependencies = [...draftDependencies.value]
    currentPlanning.value.updatedAt = new Date().toISOString()
  }

  async function commitPlanning() {
    if (!currentPlanning.value) return
    
    await saveDraft()
    
    // 检测冲突
    const conflicts = await detectConflicts()
    if (conflicts.length > 0) {
      console.warn('发现冲突:', conflicts)
      // 可以选择是否允许带冲突提交
    }
    
    currentPlanning.value.status = 'committed'
    currentPlanning.value.updatedAt = new Date().toISOString()
    
    // 保存到结果列表
    const index = planningResults.value.findIndex(
      p => p.id === currentPlanning.value!.id
    )
    if (index === -1) {
      planningResults.value.push(currentPlanning.value)
    } else {
      planningResults.value[index] = currentPlanning.value
    }
  }

  async function adjustPlanning() {
    if (!currentPlanning.value) return
    
    currentPlanning.value.status = 'adjusted'
    await saveDraft()
  }

  function resetDraft() {
    draftTeamPlannings.value = []
    draftSprintPlannings.value = []
    draftDependencies.value = []
  }

  function resetCurrentPlanning() {
    currentPlanning.value = null
    resetDraft()
  }

  return {
    planningResults,
    currentPlanning,
    loading,
    error,
    draftTeamPlannings,
    draftSprintPlannings,
    draftDependencies,
    planningByPI,
    teamLoadAnalysis,
    criticalDependencies,
    fetchPlanningResult,
    startPlanning,
    allocateFeatureToTeam,
    removeFeatureFromTeam,
    addDependency,
    updateDependency,
    identifyDependencies,
    detectConflicts,
    saveDraft,
    commitPlanning,
    adjustPlanning,
    resetDraft,
    resetCurrentPlanning,
  }
})
