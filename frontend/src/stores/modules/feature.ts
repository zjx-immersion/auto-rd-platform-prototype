/**
 * Feature管理Store
 * C1能力域：需求管理 - Feature层
 * 覆盖价值流：S2-S3
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Feature } from '@/types'

export const useFeatureStore = defineStore('feature', () => {
  const features = ref<Feature[]>([])
  const currentFeature = ref<Feature | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const featuresByEpic = computed(() => (epicId: string) => {
    return features.value.filter(f => f.epicId === epicId)
  })

  const featuresByStatus = computed(() => (status: Feature['status']) => {
    return features.value.filter(f => f.status === status)
  })

  const featuresByPI = computed(() => (piId: string) => {
    return features.value.filter(f => f.targetPI === piId)
  })

  // Actions
  async function fetchFeatures() {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('Feature列表已加载')
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchFeaturesByEpicId(epicId: string) {
    loading.value = true
    try {
      // 实际项目中这里会调用API
      const filtered = features.value.filter(f => f.epicId === epicId)
      console.log(`Epic ${epicId} 的Feature已加载:`, filtered.length)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchFeatureById(id: string) {
    loading.value = true
    try {
      const feature = features.value.find(f => f.id === id)
      if (feature) {
        currentFeature.value = feature
        console.log(`Feature ${id} 已加载`)
      } else {
        error.value = `Feature ${id} 未找到`
        currentFeature.value = null
      }
    } catch (err: any) {
      error.value = err.message
      currentFeature.value = null
    } finally {
      loading.value = false
    }
  }

  async function createFeature(featureData: Partial<Feature>) {
    loading.value = true
    try {
      const newFeature: Feature = {
        id: `feat-${Date.now()}`,
        code: `FEAT-${Date.now()}`,
        title: featureData.title || '',
        epicId: featureData.epicId || '',
        productLine: featureData.productLine,
        product: featureData.product,
        featureAssetId: featureData.featureAssetId,
        prd: featureData.prd || {
          content: '',
          version: 'v1.0',
          status: 'draft',
          attachments: [],
        },
        acceptanceCriteria: featureData.acceptanceCriteria || [],
        sstsIds: [],
        targetPI: featureData.targetPI || '',
        status: 'backlog',
        owner: featureData.owner || '',
        storyPoints: featureData.storyPoints || 0,
        complexity: featureData.complexity || 'medium',
        tags: featureData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: featureData.owner || '',
        updatedBy: featureData.owner || '',
      }
      features.value.push(newFeature)
      currentFeature.value = newFeature
      return newFeature
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateFeature(id: string, updates: Partial<Feature>) {
    const index = features.value.findIndex(f => f.id === id)
    if (index !== -1) {
      features.value[index] = {
        ...features.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      if (currentFeature.value?.id === id) {
        currentFeature.value = features.value[index]
      }
    }
  }

  async function updatePRD(featureId: string, prdUpdates: Partial<Feature['prd']>) {
    const feature = features.value.find(f => f.id === featureId)
    if (feature) {
      const prd = { ...feature.prd, ...prdUpdates }
      await updateFeature(featureId, { prd })
    }
  }

  async function linkSSTS(featureId: string, sstsId: string) {
    const feature = features.value.find(f => f.id === featureId)
    if (feature) {
      const sstsIds = [...feature.sstsIds, sstsId]
      await updateFeature(featureId, { sstsIds })
    }
  }

  function resetCurrentFeature() {
    currentFeature.value = null
  }

  return {
    features,
    currentFeature,
    loading,
    error,
    featuresByEpic,
    featuresByStatus,
    featuresByPI,
    fetchFeatures,
    fetchFeaturesByEpicId,
    fetchFeatureById,
    createFeature,
    updateFeature,
    updatePRD,
    linkSSTS,
    resetCurrentFeature,
  }
})
