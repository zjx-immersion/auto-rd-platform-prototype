/**
 * PI版本管理Store
 * C3能力域：规划协调 - PI Version
 * 覆盖价值流：S4
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PIVersion, PIObjective, PITeamConfig, Risk } from '@/types'

export const usePIStore = defineStore('pi', () => {
  const piVersions = ref<PIVersion[]>([])
  const currentPI = ref<PIVersion | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activePIs = computed(() => {
    return piVersions.value.filter(pi => 
      pi.status === 'in-progress' || pi.status === 'committed'
    )
  })

  const pisByProject = computed(() => (projectId: string) => {
    return piVersions.value.filter(pi => 
      pi.projectIds.includes(projectId)
    )
  })

  const piCommitmentRate = computed(() => {
    if (!currentPI.value) return 0
    if (!currentPI.value.committedStoryPoints) return 0
    
    const completed = currentPI.value.completedStoryPoints || 0
    const committed = currentPI.value.committedStoryPoints
    return Math.round((completed / committed) * 100)
  })

  const currentPIRisks = computed(() => {
    if (!currentPI.value) return []
    return currentPI.value.risks.filter(r => r.status !== 'resolved')
  })

  // Actions
  async function fetchPIVersions() {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('PI版本列表已加载')
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // Phase 1: 里程碑对齐增强 ⭐⭐⭐⭐⭐
  // ============================================================================

  /**
   * 里程碑对齐检查 ⭐⭐⭐⭐⭐
   * @param piEndDate PI结束日期
   * @param milestones 里程碑列表
   * @returns 对齐结果
   */
  function checkMilestoneAlignment(
    piEndDate: string,
    milestones: Array<{ milestoneId: string, milestoneName: string, targetDate: string }>
  ) {
    const results = milestones.map(milestone => {
      // 计算日期差
      const piEnd = new Date(piEndDate)
      const milestoneTarget = new Date(milestone.targetDate)
      const diffTime = milestoneTarget.getTime() - piEnd.getTime()
      const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24))
      const absDiff = Math.abs(daysDiff)

      // 判断对齐程度
      let level: 'PERFECT' | 'ACCEPTABLE' | 'MISALIGNED'
      let recommendation: string

      if (absDiff <= 7) {
        level = 'PERFECT'
        recommendation = '✓ 完美对齐（≤7天），强烈建议关联'
      } else if (absDiff <= 14) {
        level = 'ACCEPTABLE'
        recommendation = '✓ 可接受对齐（8-14天），建议关联'
      } else {
        level = 'MISALIGNED'
        recommendation = '⚠️ 不对齐（>14天），建议作为中间PI或调整日期'
      }

      console.log(`里程碑 ${milestone.milestoneName}: 相差${daysDiff}天, 判断=${level}`)

      return {
        milestone,
        daysDiff,
        absDiff,
        level,
        recommendation,
        suggestions: generateSuggestions(daysDiff, piEndDate, milestone.targetDate)
      }
    })

    // 按对齐程度排序
    return results.sort((a, b) => a.absDiff - b.absDiff)
  }

  /**
   * 生成调整建议 ⭐
   * @param daysDiff 日期差
   * @param piEndDate PI结束日期
   * @param milestoneDate 里程碑日期
   * @returns 3种调整方案
   */
  function generateSuggestions(
    daysDiff: number,
    piEndDate: string,
    milestoneDate: string
  ) {
    const absDiff = Math.abs(daysDiff)

    return [
      {
        type: 'ADJUST_PI',
        description: `调整PI结束日期到${milestoneDate}`,
        impact: '失去固定12周节奏',
        risk: 'MEDIUM' as const,
        recommended: false,
        details: [
          `PI结束日期从${piEndDate}调整到${milestoneDate}`,
          `所有后续PI都需要调整`,
          `团队节奏被打乱`,
          `资源规划困难`
        ]
      },
      {
        type: 'ADJUST_MILESTONE',
        description: `调整里程碑日期到${piEndDate}`,
        impact: '需协调整车项目组',
        risk: 'HIGH' as const,
        recommended: false,
        details: [
          `需要整车项目经理批准`,
          `可能影响其他模块交付`,
          `需要重新评估资源`,
          `协调成本高`
        ]
      },
      {
        type: 'NO_LINK',
        description: '不关联，作为中间PI',
        impact: '无',
        risk: 'LOW' as const,
        recommended: absDiff > 14,
        details: [
          `保持固定12周节奏`,
          `${absDiff}天缓冲用于优化`,
          `PI结束时完成初步集成`,
          `里程碑日期前交付核心功能`
        ]
      }
    ]
  }

  /**
   * 计算团队负载率 ⭐
   * @param team 团队信息
   * @param allocatedSP 分配的Story Points
   * @param piDuration PI持续周数（默认12周）
   * @returns 负载计算结果
   */
  function calculateTeamLoad(
    team: { teamId: string, teamName: string, memberCount: number, velocity: number, workDaysPerWeek: number },
    allocatedSP: number,
    piDuration: number = 12
  ) {
    // 计算团队容量（人数 × 周数 × 工作日/周）
    const capacity = team.memberCount * piDuration * team.workDaysPerWeek

    // 计算负载率
    const loadRate = Math.round((allocatedSP / team.velocity) * 100)

    // 判断负载状态
    let status: 'LOW' | 'OPTIMAL' | 'HIGH' | 'OVERLOAD'
    let recommendation: string

    if (loadRate < 70) {
      status = 'LOW'
      recommendation = '负载偏低，可增加工作量'
    } else if (loadRate <= 85) {
      status = 'OPTIMAL'
      recommendation = '✓ 负载合理，处于最优范围（70%-85%）'
    } else if (loadRate <= 100) {
      status = 'HIGH'
      recommendation = '⚠️ 负载偏高，需关注风险'
    } else {
      status = 'OVERLOAD'
      recommendation = '❌ 严重超载，必须调整'
    }

    console.log(`团队 ${team.teamName} 负载率: ${loadRate}% (${status})`)

    return {
      teamId: team.teamId,
      teamName: team.teamName,
      capacity,
      velocity: team.velocity,
      allocatedSP,
      loadRate,
      status,
      recommendation
    }
  }

  async function fetchPIById(id: string) {
    loading.value = true
    try {
      const pi = piVersions.value.find(p => p.id === id)
      if (pi) {
        currentPI.value = pi
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function createPIVersion(piData: Partial<PIVersion>) {
    loading.value = true
    try {
      const newPI: PIVersion = {
        id: `pi-${Date.now()}`,
        code: piData.code || `PI-${Date.now()}`,
        name: piData.name || '',
        startDate: piData.startDate || new Date().toISOString(),
        endDate: piData.endDate || new Date().toISOString(),
        sprintCount: piData.sprintCount || 6,
        sprintDuration: piData.sprintDuration || 14,
        projectIds: piData.projectIds || [],
        objectives: piData.objectives || [],
        epicIds: piData.epicIds || [],
        featureIds: piData.featureIds || [],
        teams: piData.teams || [],
        status: 'planning',
        committedStoryPoints: 0,
        risks: piData.risks || [],
        owner: piData.owner || '',
        notes: piData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: piData.owner || '',
        updatedBy: piData.owner || '',
      }
      piVersions.value.push(newPI)
      currentPI.value = newPI
      return newPI
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePIVersion(id: string, updates: Partial<PIVersion>) {
    const index = piVersions.value.findIndex(p => p.id === id)
    if (index !== -1) {
      piVersions.value[index] = {
        ...piVersions.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      if (currentPI.value?.id === id) {
        currentPI.value = piVersions.value[index]
      }
    }
  }

  async function addPIObjective(piId: string, objective: PIObjective) {
    const pi = piVersions.value.find(p => p.id === piId)
    if (pi) {
      const objectives = [...pi.objectives, objective]
      await updatePIVersion(piId, { objectives })
    }
  }

  async function updateTeamConfig(piId: string, teamConfig: PITeamConfig[]) {
    await updatePIVersion(piId, { teams: teamConfig })
  }

  async function addRisk(piId: string, risk: Risk) {
    const pi = piVersions.value.find(p => p.id === piId)
    if (pi) {
      const risks = [...pi.risks, risk]
      await updatePIVersion(piId, { risks })
    }
  }

  async function updateRisk(piId: string, riskId: string, updates: Partial<Risk>) {
    const pi = piVersions.value.find(p => p.id === piId)
    if (pi) {
      const risks = pi.risks.map(r =>
        r.id === riskId ? { ...r, ...updates } : r
      )
      await updatePIVersion(piId, { risks })
    }
  }

  async function commitPI(piId: string) {
    await updatePIVersion(piId, { status: 'committed' })
  }

  async function startPI(piId: string) {
    await updatePIVersion(piId, { status: 'in-progress' })
  }

  async function completePI(piId: string, completedStoryPoints: number) {
    await updatePIVersion(piId, {
      status: 'completed',
      completedStoryPoints,
    })
    
    // 计算承诺达成率
    const pi = piVersions.value.find(p => p.id === piId)
    if (pi && pi.committedStoryPoints > 0) {
      const commitmentRate = Math.round(
        (completedStoryPoints / pi.committedStoryPoints) * 100
      )
      await updatePIVersion(piId, { commitmentRate })
    }
  }

  function calculateTotalCapacity(piId: string): number {
    const pi = piVersions.value.find(p => p.id === piId)
    if (!pi) return 0
    
    return pi.teams.reduce((sum, team) => sum + team.capacity, 0)
  }

  function calculatePlannedLoad(piId: string): number {
    const pi = piVersions.value.find(p => p.id === piId)
    if (!pi) return 0
    
    return pi.teams.reduce((sum, team) => sum + team.plannedStoryPoints, 0)
  }

  /**
   * 更新团队容量
   */
  async function updateTeamCapacity(piId: string, teamId: string, capacity: number, velocity?: number) {
    const pi = piVersions.value.find(p => p.id === piId)
    if (pi) {
      const teams = pi.teams.map(team => {
        if (team.teamId === teamId) {
          return {
            ...team,
            capacity,
            velocity: velocity || team.velocity || capacity / pi.sprintCount
          }
        }
        return team
      })
      await updatePIVersion(piId, { teams })
    }
  }

  /**
   * 批量更新所有团队容量
   */
  async function batchUpdateTeamCapacities(piId: string, capacities: Array<{ teamId: string; capacity: number; velocity?: number }>) {
    const pi = piVersions.value.find(p => p.id === piId)
    if (pi) {
      const teams = pi.teams.map(team => {
        const capacityUpdate = capacities.find(c => c.teamId === team.teamId)
        if (capacityUpdate) {
          return {
            ...team,
            capacity: capacityUpdate.capacity,
            velocity: capacityUpdate.velocity || team.velocity || capacityUpdate.capacity / pi.sprintCount
          }
        }
        return team
      })
      await updatePIVersion(piId, { teams })
      return true
    }
    return false
  }

  /**
   * 获取PI的容量利用率
   */
  function getCapacityUtilization(piId: string): number {
    const totalCapacity = calculateTotalCapacity(piId)
    const plannedLoad = calculatePlannedLoad(piId)
    if (totalCapacity === 0) return 0
    return Math.round((plannedLoad / totalCapacity) * 100)
  }

  /**
   * 获取团队负载信息
   */
  function getTeamLoadInfo(piId: string, teamId: string) {
    const pi = piVersions.value.find(p => p.id === piId)
    if (!pi) return null

    const team = pi.teams.find(t => t.teamId === teamId)
    if (!team) return null

    const utilization = team.capacity > 0 ? Math.round((team.plannedStoryPoints / team.capacity) * 100) : 0

    return {
      teamId: team.teamId,
      teamName: team.teamName,
      capacity: team.capacity,
      plannedStoryPoints: team.plannedStoryPoints,
      availableCapacity: team.capacity - team.plannedStoryPoints,
      utilization,
      isOverloaded: utilization > 100,
      velocity: team.velocity || 0
    }
  }

  /**
   * 获取所有团队负载信息
   */
  function getAllTeamsLoadInfo(piId: string) {
    const pi = piVersions.value.find(p => p.id === piId)
    if (!pi) return []

    return pi.teams.map(team => {
      const utilization = team.capacity > 0 ? Math.round((team.plannedStoryPoints / team.capacity) * 100) : 0
      return {
        teamId: team.teamId,
        teamName: team.teamName,
        capacity: team.capacity,
        plannedStoryPoints: team.plannedStoryPoints,
        availableCapacity: team.capacity - team.plannedStoryPoints,
        utilization,
        isOverloaded: utilization > 100,
        velocity: team.velocity || 0
      }
    })
  }

  /**
   * 检查是否可以分配Feature到团队
   */
  function canAllocateFeature(piId: string, teamId: string, storyPoints: number): { can: boolean; reason?: string } {
    const teamLoad = getTeamLoadInfo(piId, teamId)
    if (!teamLoad) {
      return { can: false, reason: '团队不存在' }
    }

    if (teamLoad.availableCapacity < storyPoints) {
      return { can: false, reason: `容量不足，剩余${teamLoad.availableCapacity}SP，需要${storyPoints}SP` }
    }

    return { can: true }
  }

  function resetCurrentPI() {
    currentPI.value = null
  }

  /**
   * 根据项目ID获取PI列表（便捷方法）
   */
  function getPIsByProject(projectId: string) {
    return piVersions.value.filter(pi => pi.projectIds.includes(projectId))
  }

  /**
   * 获取PI列表（fetchPIs别名，用于兼容性）
   */
  async function fetchPIs() {
    return fetchPIVersions()
  }

  return {
    piVersions,
    currentPI,
    loading,
    error,
    activePIs,
    pisByProject,
    piCommitmentRate,
    currentPIRisks,
    fetchPIVersions,
    fetchPIs, // 添加fetchPIs别名
    fetchPIById,
    createPIVersion,
    updatePIVersion,
    addPIObjective,
    updateTeamConfig,
    addRisk,
    updateRisk,
    commitPI,
    startPI,
    completePI,
    calculateTotalCapacity,
    calculatePlannedLoad,
    updateTeamCapacity,
    batchUpdateTeamCapacities,
    getCapacityUtilization,
    getTeamLoadInfo,
    getAllTeamsLoadInfo,
    canAllocateFeature,
    resetCurrentPI,
    getPIsByProject,

    // Phase 1: 里程碑对齐 ⭐⭐⭐⭐⭐
    checkMilestoneAlignment,
    generateSuggestions,
    calculateTeamLoad,
  }
})
