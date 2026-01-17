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

  function resetCurrentPI() {
    currentPI.value = null
  }

  /**
   * 根据项目ID获取PI列表（便捷方法）
   */
  function getPIsByProject(projectId: string) {
    return piVersions.value.filter(pi => pi.projectIds.includes(projectId))
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
    resetCurrentPI,
    getPIsByProject,
  }
})
