/**
 * Epic管理Store
 * C1能力域：需求管理 - Epic层
 * 覆盖价值流：S1-S2
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Epic } from '@/types'

export const useEpicStore = defineStore('epic', () => {
  const epics = ref<Epic[]>([])
  const currentEpic = ref<Epic | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const epicsByProject = computed(() => (projectId: string) => {
    return epics.value.filter(e => e.projectId === projectId)
  })

  const epicsByStatus = computed(() => (status: Epic['status']) => {
    return epics.value.filter(e => e.status === status)
  })

  const epicsByPriority = computed(() => (priority: string) => {
    return epics.value.filter(e => e.priority === priority)
  })

  // Actions
  async function fetchEpics() {
    loading.value = true
    error.value = null
    try {
      // 数据已经在应用启动时通过initializeJSONDatasets加载
      // 这里只需要确保数据已加载，不需要重新加载
      await new Promise(resolve => setTimeout(resolve, 100))
      console.log(`Epic列表已加载，共 ${epics.value.length} 个Epic`)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchEpicById(id: string) {
    loading.value = true
    try {
      const epic = epics.value.find(e => e.id === id)
      if (epic) {
        currentEpic.value = epic
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function createEpic(epicData: Partial<Epic>) {
    loading.value = true
    try {
      const newEpic: Epic = {
        id: `epic-${Date.now()}`,
        code: `EPIC-${Date.now()}`,
        title: epicData.title || '',
        description: epicData.description || '',
        businessValue: epicData.businessValue || '',
        source: epicData.source || 'user',
        priority: epicData.priority || 'P2',
        moscow: epicData.moscow || 'Should',
        projectId: epicData.projectId,
        featureIds: [],
        status: 'backlog',
        owner: epicData.owner || '',
        stakeholders: epicData.stakeholders || [],
        tags: epicData.tags || [],
        domain: epicData.domain,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: epicData.owner || '',
        updatedBy: epicData.owner || '',
      }
      epics.value.push(newEpic)
      currentEpic.value = newEpic
      return newEpic
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEpic(id: string, updates: Partial<Epic>) {
    const index = epics.value.findIndex(e => e.id === id)
    if (index !== -1) {
      epics.value[index] = {
        ...epics.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      if (currentEpic.value?.id === id) {
        currentEpic.value = epics.value[index]
      }
    }
  }

  async function linkFeature(epicId: string, featureId: string) {
    const epic = epics.value.find(e => e.id === epicId)
    if (epic) {
      const featureIds = [...epic.featureIds, featureId]
      await updateEpic(epicId, { featureIds })
    }
  }

  function resetCurrentEpic() {
    currentEpic.value = null
  }

  return {
    epics,
    currentEpic,
    loading,
    error,
    epicsByProject,
    epicsByStatus,
    epicsByPriority,
    fetchEpics,
    fetchEpicById,
    createEpic,
    updateEpic,
    linkFeature,
    resetCurrentEpic,
  }
})
