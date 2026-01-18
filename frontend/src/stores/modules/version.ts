/**
 * 版本管理Store
 * 管理项目版本（产品版本/软件版本）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Version } from '@/types'

export const useVersionStore = defineStore('version', () => {
  // ============================================================================
  // State
  // ============================================================================

  /** 版本列表 */
  const versions = ref<Version[]>([])

  /** 当前版本 */
  const currentVersion = ref<Version | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * 根据项目ID获取版本列表
   */
  const getVersionsByProject = computed(() => {
    return (projectId: string) => {
      return versions.value.filter(v => v.projectId === projectId)
    }
  })

  /**
   * 根据状态过滤版本
   */
  const getVersionsByStatus = computed(() => {
    return (status: string) => {
      return versions.value.filter(v => v.status === status)
    }
  })

  /**
   * 获取活跃版本
   */
  const activeVersions = computed(() => {
    return versions.value.filter(v => 
      v.status === 'in-progress' || v.status === 'planning'
    )
  })

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * 获取版本列表
   */
  async function fetchVersions() {
    loading.value = true
    error.value = null

    try {
      // TODO: 替换为实际API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('版本列表已加载')
    } catch (err: any) {
      error.value = err.message || '获取版本列表失败'
      console.error('获取版本列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取版本详情
   */
  async function fetchVersionById(id: string) {
    loading.value = true
    error.value = null

    try {
      const version = versions.value.find(v => v.id === id)
      if (version) {
        currentVersion.value = version
      } else {
        throw new Error('版本不存在')
      }
    } catch (err: any) {
      error.value = err.message || '获取版本详情失败'
      console.error('获取版本详情失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建版本
   */
  async function createVersion(versionData: Partial<Version>) {
    loading.value = true
    error.value = null

    try {
      const newVersion: Version = {
        id: versionData.id || `ver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        code: versionData.code || '',
        name: versionData.name || '',
        projectId: versionData.projectId || '',
        description: versionData.description || '',
        startDate: versionData.startDate || new Date().toISOString(),
        releaseDate: versionData.releaseDate || new Date().toISOString(),
        status: versionData.status || 'planning',
        featureIds: versionData.featureIds || [],
        metadata: versionData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: versionData.createdBy || '',
        updatedBy: versionData.updatedBy || '',
      }

      versions.value.push(newVersion)
      currentVersion.value = newVersion

      console.log(`✓ 创建版本: ${newVersion.code} - ${newVersion.name}`)
      return newVersion
    } catch (err: any) {
      error.value = err.message || '创建版本失败'
      console.error('创建版本失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新版本
   */
  async function updateVersion(id: string, updates: Partial<Version>) {
    loading.value = true
    error.value = null

    try {
      const index = versions.value.findIndex(v => v.id === id)
      if (index !== -1) {
        versions.value[index] = {
          ...versions.value[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }

        if (currentVersion.value?.id === id) {
          currentVersion.value = versions.value[index]
        }
      }
    } catch (err: any) {
      error.value = err.message || '更新版本失败'
      console.error('更新版本失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除版本
   */
  async function deleteVersion(id: string) {
    loading.value = true
    error.value = null

    try {
      const index = versions.value.findIndex(v => v.id === id)
      if (index !== -1) {
        versions.value.splice(index, 1)
      }

      if (currentVersion.value?.id === id) {
        currentVersion.value = null
      }
    } catch (err: any) {
      error.value = err.message || '删除版本失败'
      console.error('删除版本失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 关联Feature到版本
   */
  async function linkFeature(versionId: string, featureId: string) {
    const version = versions.value.find(v => v.id === versionId)
    if (version && !version.featureIds.includes(featureId)) {
      version.featureIds.push(featureId)
      version.updatedAt = new Date().toISOString()
    }
  }

  /**
   * 取消关联Feature
   */
  async function unlinkFeature(versionId: string, featureId: string) {
    const version = versions.value.find(v => v.id === versionId)
    if (version) {
      version.featureIds = version.featureIds.filter(id => id !== featureId)
      version.updatedAt = new Date().toISOString()
    }
  }

  /**
   * 批量关联Feature到版本
   */
  async function batchLinkFeatures(versionId: string, featureIds: string[]) {
    const version = versions.value.find(v => v.id === versionId)
    if (version) {
      featureIds.forEach(featureId => {
        if (!version.featureIds.includes(featureId)) {
          version.featureIds.push(featureId)
        }
      })
      version.updatedAt = new Date().toISOString()
    }
  }

  /**
   * 保存Feature分配到PI
   */
  async function saveFeatureAllocation(versionId: string, allocationMap: Record<string, string>) {
    const version = versions.value.find(v => v.id === versionId)
    if (version) {
      // 保存分配映射到version的metadata
      if (!version.metadata) {
        version.metadata = {}
      }
      version.metadata.featureAllocation = allocationMap
      version.updatedAt = new Date().toISOString()
      return true
    }
    return false
  }

  /**
   * 获取版本的Feature分配
   */
  function getFeatureAllocation(versionId: string): Record<string, string> {
    const version = versions.value.find(v => v.id === versionId)
    if (version?.metadata?.featureAllocation) {
      return version.metadata.featureAllocation as Record<string, string>
    }
    return {}
  }

  /**
   * 设置版本容量
   */
  async function setVersionCapacity(versionId: string, capacity: number) {
    const version = versions.value.find(v => v.id === versionId)
    if (version) {
      if (!version.metadata) {
        version.metadata = {}
      }
      version.metadata.capacity = capacity
      version.updatedAt = new Date().toISOString()
    }
  }

  /**
   * 获取版本容量
   */
  function getVersionCapacity(versionId: string): number {
    const version = versions.value.find(v => v.id === versionId)
    return (version?.metadata?.capacity as number) || 300 // 默认300SP
  }

  /**
   * 重置当前版本
   */
  function resetCurrentVersion() {
    currentVersion.value = null
  }

  /**
   * 清除错误
   */
  function clearError() {
    error.value = null
  }

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    versions,
    currentVersion,
    loading,
    error,

    // Getters
    getVersionsByProject,
    getVersionsByStatus,
    activeVersions,

    // Actions
    fetchVersions,
    fetchVersionById,
    createVersion,
    updateVersion,
    deleteVersion,
    linkFeature,
    unlinkFeature,
    batchLinkFeatures,
    saveFeatureAllocation,
    getFeatureAllocation,
    setVersionCapacity,
    getVersionCapacity,
    resetCurrentVersion,
    clearError,
  }
})
