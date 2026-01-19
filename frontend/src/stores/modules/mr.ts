/**
 * MR管理Store
 * C1能力域：需求管理 - MR层
 * 覆盖价值流：S3-S4
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MR } from '@/types'

export const useMRStore = defineStore('mr', () => {
  const mrList = ref<MR[]>([])
  const currentMR = ref<MR | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const mrsBySSTS = computed(() => (sstsId: string) => {
    return mrList.value.filter(mr => mr.sstsId === sstsId)
  })

  const mrsByStatus = computed(() => (status: MR['status']) => {
    return mrList.value.filter(mr => mr.status === status)
  })

  const mrsByTeam = computed(() => (teamId: string) => {
    return mrList.value.filter(mr => mr.teamId === teamId)
  })

  const mrsBySprint = computed(() => (sprintId: string) => {
    return mrList.value.filter(mr => mr.targetSprint === sprintId)
  })

  // Actions
  async function fetchMRs() {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('MR列表已加载')
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchMRById(mrId: string) {
    loading.value = true
    try {
      const mr = mrList.value.find(m => m.id === mrId)
      if (mr) {
        currentMR.value = mr
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchMRsBySSTSId(sstsId: string) {
    loading.value = true
    try {
      const filtered = mrList.value.filter(mr => mr.sstsId === sstsId)
      console.log(`SSTS ${sstsId} 的MR已加载:`, filtered.length)
      return filtered
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  function getMRById(mrId: string): MR | undefined {
    return mrList.value.find(mr => mr.id === mrId)
  }

  function addMR(mr: MR) {
    mrList.value.push(mr)
  }

  function updateMR(mrId: string, updates: Partial<MR>) {
    const index = mrList.value.findIndex(mr => mr.id === mrId)
    if (index !== -1) {
      mrList.value[index] = { ...mrList.value[index], ...updates }
    }
  }

  function deleteMR(mrId: string) {
    const index = mrList.value.findIndex(mr => mr.id === mrId)
    if (index !== -1) {
      mrList.value.splice(index, 1)
    }
  }

  return {
    mrList,
    currentMR,
    loading,
    error,
    mrsBySSTS,
    mrsByStatus,
    mrsByTeam,
    mrsBySprint,
    fetchMRs,
    fetchMRById,
    fetchMRsBySSTSId,
    getMRById,
    addMR,
    updateMR,
    deleteMR
  }
})
