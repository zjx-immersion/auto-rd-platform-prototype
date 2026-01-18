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

  async function savePRDDraft(featureId: string, content: string) {
    const feature = features.value.find(f => f.id === featureId)
    if (feature) {
      const prd = { 
        ...feature.prd, 
        content,
        status: 'draft' as const
      }
      await updateFeature(featureId, { prd })
      return true
    }
    return false
  }

  async function publishPRD(featureId: string, content: string, changeSummary?: string) {
    const feature = features.value.find(f => f.id === featureId)
    if (feature) {
      // 生成新版本号
      const currentVersion = feature.prd.version || 'v1.0'
      const versionNumber = parseFloat(currentVersion.substring(1))
      const newVersion = `v${(versionNumber + 0.1).toFixed(1)}`
      
      // 保存当前版本到历史
      const versionHistory = feature.prd.versionHistory || []
      versionHistory.unshift({
        version: currentVersion,
        content: feature.prd.content,
        createdAt: new Date().toISOString(),
        createdBy: feature.owner,
        changeSummary: changeSummary || `更新到 ${newVersion}`,
        status: feature.prd.status
      })
      
      const prd = {
        ...feature.prd,
        content,
        version: newVersion,
        status: 'draft' as const,
        versionHistory
      }
      
      await updateFeature(featureId, { prd })
      return newVersion
    }
    return null
  }

  async function rollbackPRDVersion(featureId: string, targetVersion: string) {
    const feature = features.value.find(f => f.id === featureId)
    if (!feature || !feature.prd.versionHistory) return false

    const targetVersionData = feature.prd.versionHistory.find(v => v.version === targetVersion)
    if (!targetVersionData) return false

    // 创建新版本（回滚）
    const currentVersion = feature.prd.version || 'v1.0'
    const versionNumber = parseFloat(currentVersion.substring(1))
    const newVersion = `v${(versionNumber + 0.1).toFixed(1)}`

    // 保存当前版本到历史
    const versionHistory = [...feature.prd.versionHistory]
    versionHistory.unshift({
      version: currentVersion,
      content: feature.prd.content,
      createdAt: new Date().toISOString(),
      createdBy: feature.owner,
      changeSummary: `回滚自 ${targetVersion}`,
      status: feature.prd.status
    })

    const prd = {
      ...feature.prd,
      content: targetVersionData.content,
      version: newVersion,
      status: 'draft' as const,
      versionHistory
    }

    await updateFeature(featureId, { prd })
    return true
  }

  async function submitPRDReview(featureId: string) {
    const feature = features.value.find(f => f.id === featureId)
    if (feature) {
      const prd = {
        ...feature.prd,
        status: 'review' as const,
        reviewStatus: 'pending' as const
      }
      await updateFeature(featureId, { prd })
      return true
    }
    return false
  }

  async function addPRDReviewComment(featureId: string, comment: {
    author: string
    content: string
    type: 'approve' | 'reject' | 'comment'
  }) {
    const feature = features.value.find(f => f.id === featureId)
    if (feature) {
      const reviewComments = feature.prd.reviewComments || []
      reviewComments.push({
        id: `review-${Date.now()}`,
        author: comment.author,
        content: comment.content,
        type: comment.type,
        createdAt: new Date().toISOString(),
        resolved: false
      })

      const prd = {
        ...feature.prd,
        reviewComments,
        reviewStatus: comment.type === 'approve' ? 'approved' as const : 
                      comment.type === 'reject' ? 'rejected' as const : 
                      'in-review' as const
      }

      if (comment.type === 'approve') {
        prd.status = 'approved' as const
      }

      await updateFeature(featureId, { prd })
      return true
    }
    return false
  }

  async function updateAcceptanceCriteria(featureId: string, criteria: any[]) {
    const feature = features.value.find(f => f.id === featureId)
    if (feature) {
      await updateFeature(featureId, { acceptanceCriteria: criteria })
      return true
    }
    return false
  }

  async function addPRDAttachment(featureId: string, attachment: {
    name: string
    url: string
    size: number
    type: string
    uploadedBy: string
  }) {
    const feature = features.value.find(f => f.id === featureId)
    if (feature) {
      const attachments = feature.prd.attachments || []
      attachments.push({
        id: `attach-${Date.now()}`,
        name: attachment.name,
        url: attachment.url,
        size: attachment.size,
        type: attachment.type,
        uploadedBy: attachment.uploadedBy,
        uploadedAt: new Date().toISOString()
      })

      const prd = {
        ...feature.prd,
        attachments
      }

      await updateFeature(featureId, { prd })
      return true
    }
    return false
  }

  async function removePRDAttachment(featureId: string, attachmentId: string) {
    const feature = features.value.find(f => f.id === featureId)
    if (feature && feature.prd.attachments) {
      const attachments = feature.prd.attachments.filter(a => a.id !== attachmentId)
      const prd = {
        ...feature.prd,
        attachments
      }
      await updateFeature(featureId, { prd })
      return true
    }
    return false
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
    savePRDDraft,
    publishPRD,
    rollbackPRDVersion,
    submitPRDReview,
    addPRDReviewComment,
    updateAcceptanceCriteria,
    addPRDAttachment,
    removePRDAttachment,
    linkSSTS,
    resetCurrentFeature,
  }
})
