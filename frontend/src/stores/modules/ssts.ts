/**
 * SSTS管理Store
 * C1能力域：需求管理 - SSTS层
 * 覆盖价值流：S2-S3
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SSTS, MR } from '@/types'

export const useSSTSStore = defineStore('ssts', () => {
  const sstsList = ref<SSTS[]>([])
  const mrList = ref<MR[]>([])
  const currentSSTS = ref<SSTS | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const sstsByFeature = computed(() => (featureId: string) => {
    return sstsList.value.filter(s => s.featureId === featureId)
  })

  const sstsByType = computed(() => (type: 'functional' | 'technical') => {
    return sstsList.value.filter(s => s.type === type)
  })

  const mrsBySSTS = computed(() => (sstsId: string) => {
    return mrList.value.filter(m => m.sstsId === sstsId)
  })

  const mrsByTeam = computed(() => (teamId: string) => {
    return mrList.value.filter(m => m.teamId === teamId)
  })

  // Actions
  async function fetchSSTSList() {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('SSTS列表已加载')
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchSSTSByFeatureId(featureId: string) {
    loading.value = true
    try {
      const filtered = sstsList.value.filter(s => s.featureId === featureId)
      console.log(`Feature ${featureId} 的SSTS已加载:`, filtered.length)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function createSSTS(sstsData: Partial<SSTS>) {
    loading.value = true
    try {
      const newSSTS: SSTS = {
        id: `ssts-${Date.now()}`,
        code: `SSTS-${Date.now()}`,
        title: sstsData.title || '',
        featureId: sstsData.featureId || '',
        type: sstsData.type || 'functional',
        specification: sstsData.specification || {
          content: '',
        },
        mrIds: [],
        priority: sstsData.priority || 'P2',
        complexity: sstsData.complexity || 'medium',
        estimate: sstsData.estimate || 0,
        status: 'draft',
        owner: sstsData.owner || '',
        dependencies: sstsData.dependencies || [],
        targetPI: sstsData.targetPI,
        targetSprint: sstsData.targetSprint,
        tags: sstsData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: sstsData.owner || '',
        updatedBy: sstsData.owner || '',
      }
      sstsList.value.push(newSSTS)
      currentSSTS.value = newSSTS
      return newSSTS
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function batchCreateSSTS(sstsDataList: Partial<SSTS>[]) {
    loading.value = true
    const created: SSTS[] = []
    try {
      for (const sstsData of sstsDataList) {
        const newSSTS = await createSSTS(sstsData)
        created.push(newSSTS)
      }
      return created
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createMR(mrData: Partial<MR>) {
    loading.value = true
    try {
      const newMR: MR = {
        id: `mr-${Date.now()}`,
        code: `MR-${Date.now()}`,
        title: mrData.title || '',
        sstsId: mrData.sstsId || '',
        moduleName: mrData.moduleName || '',
        moduleAssetId: mrData.moduleAssetId,
        teamId: mrData.teamId || '',
        teamName: mrData.teamName || '',
        interfaceSpec: mrData.interfaceSpec,
        designDoc: mrData.designDoc,
        dependencies: mrData.dependencies || [],
        effortHours: mrData.effortHours || 0,
        status: 'backlog',
        owner: mrData.owner || '',
        assignee: mrData.assignee,
        taskIds: [],
        targetPI: mrData.targetPI,
        targetSprint: mrData.targetSprint,
        tags: mrData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: mrData.owner || '',
        updatedBy: mrData.owner || '',
      }
      mrList.value.push(newMR)
      
      // 关联到SSTS
      if (newMR.sstsId) {
        await linkMRToSSTS(newMR.sstsId, newMR.id)
      }
      
      return newMR
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function linkMRToSSTS(sstsId: string, mrId: string) {
    const ssts = sstsList.value.find(s => s.id === sstsId)
    if (ssts) {
      const mrIds = [...ssts.mrIds, mrId]
      const index = sstsList.value.findIndex(s => s.id === sstsId)
      if (index !== -1) {
        sstsList.value[index] = {
          ...sstsList.value[index],
          mrIds,
          updatedAt: new Date().toISOString(),
        }
      }
    }
  }

  async function assignMRToTeam(mrId: string, teamId: string, teamName: string) {
    const index = mrList.value.findIndex(m => m.id === mrId)
    if (index !== -1) {
      mrList.value[index] = {
        ...mrList.value[index],
        teamId,
        teamName,
        status: 'ready',
        updatedAt: new Date().toISOString(),
      }
    }
  }

  function resetCurrentSSTS() {
    currentSSTS.value = null
  }

  return {
    sstsList,
    mrList,
    currentSSTS,
    loading,
    error,
    sstsByFeature,
    sstsByType,
    mrsBySSTS,
    mrsByTeam,
    fetchSSTSList,
    fetchSSTSByFeatureId,
    createSSTS,
    batchCreateSSTS,
    createMR,
    linkMRToSSTS,
    assignMRToTeam,
    resetCurrentSSTS,
  }
})
