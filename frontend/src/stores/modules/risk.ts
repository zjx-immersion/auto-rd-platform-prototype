/**
 * Risk管理Store
 * C3能力域：规划协调 - 风险管理
 * Phase 6: 风险与进度管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Risk } from '@/types'

export const useRiskStore = defineStore('risk', () => {
  const risks = ref<Risk[]>([])
  const currentRisk = ref<Risk | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const risksByStatus = computed(() => (status: Risk['status']) => {
    return risks.value.filter(r => r.status === status)
  })

  const risksByType = computed(() => (type: Risk['type']) => {
    return risks.value.filter(r => r.type === type)
  })

  const risksByProbability = computed(() => (probability: Risk['probability']) => {
    return risks.value.filter(r => r.probability === probability)
  })

  const risksByImpact = computed(() => (impact: Risk['impact']) => {
    return risks.value.filter(r => r.impact === impact)
  })

  const highPriorityRisks = computed(() => {
    return risks.value.filter(r => 
      (r.probability === 'high' || r.impact === 'high') && 
      r.status !== 'resolved'
    )
  })

  const openRisks = computed(() => {
    return risks.value.filter(r => r.status === 'open' || r.status === 'mitigating')
  })

  // 风险评分计算
  const calculateRiskScore = (risk: Risk): number => {
    const probabilityScore = { low: 1, medium: 2, high: 3 }
    const impactScore = { low: 1, medium: 2, high: 3 }
    return probabilityScore[risk.probability] * impactScore[risk.impact]
  }

  const sortedRisksByPriority = computed(() => {
    return [...risks.value].sort((a, b) => {
      const scoreA = calculateRiskScore(a)
      const scoreB = calculateRiskScore(b)
      return scoreB - scoreA // 降序排列
    })
  })

  // Actions
  async function fetchRisks() {
    loading.value = true
    error.value = null
    try {
      // 模拟数据加载
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('Risk列表已加载')
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchRiskById(id: string) {
    loading.value = true
    try {
      const risk = risks.value.find(r => r.id === id)
      if (risk) {
        currentRisk.value = risk
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function createRisk(riskData: Partial<Risk>) {
    loading.value = true
    try {
      const newRisk: Risk = {
        id: `risk-${Date.now()}`,
        description: riskData.description || '',
        type: riskData.type || 'technical',
        probability: riskData.probability || 'medium',
        impact: riskData.impact || 'medium',
        mitigation: riskData.mitigation || '',
        owner: riskData.owner || '',
        status: 'open',
        createdAt: new Date().toISOString(),
      }
      risks.value.push(newRisk)
      currentRisk.value = newRisk
      return newRisk
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRisk(id: string, updates: Partial<Risk>) {
    const index = risks.value.findIndex(r => r.id === id)
    if (index !== -1) {
      risks.value[index] = {
        ...risks.value[index],
        ...updates,
      }
      if (currentRisk.value?.id === id) {
        currentRisk.value = risks.value[index]
      }
    }
  }

  async function deleteRisk(id: string) {
    const index = risks.value.findIndex(r => r.id === id)
    if (index !== -1) {
      risks.value.splice(index, 1)
      if (currentRisk.value?.id === id) {
        currentRisk.value = null
      }
    }
  }

  /**
   * 更新风险状态
   */
  async function updateRiskStatus(id: string, status: Risk['status']) {
    await updateRisk(id, { status })
  }

  /**
   * 添加缓解措施
   */
  async function addMitigationPlan(id: string, mitigation: string) {
    await updateRisk(id, { mitigation, status: 'mitigating' })
  }

  /**
   * 获取风险统计
   */
  function getRiskStatistics() {
    const total = risks.value.length
    const byStatus = {
      open: risksByStatus.value('open').length,
      mitigating: risksByStatus.value('mitigating').length,
      resolved: risksByStatus.value('resolved').length,
      accepted: risksByStatus.value('accepted').length,
    }
    const byProbability = {
      low: risksByProbability.value('low').length,
      medium: risksByProbability.value('medium').length,
      high: risksByProbability.value('high').length,
    }
    const byImpact = {
      low: risksByImpact.value('low').length,
      medium: risksByImpact.value('medium').length,
      high: risksByImpact.value('high').length,
    }
    const highPriority = highPriorityRisks.value.length

    return {
      total,
      byStatus,
      byProbability,
      byImpact,
      highPriority,
    }
  }

  function resetCurrentRisk() {
    currentRisk.value = null
  }

  return {
    risks,
    currentRisk,
    loading,
    error,
    risksByStatus,
    risksByType,
    risksByProbability,
    risksByImpact,
    highPriorityRisks,
    openRisks,
    sortedRisksByPriority,
    calculateRiskScore,
    fetchRisks,
    fetchRiskById,
    createRisk,
    updateRisk,
    deleteRisk,
    updateRiskStatus,
    addMitigationPlan,
    getRiskStatistics,
    resetCurrentRisk,
  }
})
