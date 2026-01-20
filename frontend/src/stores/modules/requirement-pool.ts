/**
 * 需求池Store
 * C0能力域: 领域项目管理 - 需求池管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  RequirementPool,
  PoolEpic,
  PoolFilter,
  AllocateEpicToProjectInput,
  BatchAllocateEpicsInput,
  EpicAllocationStatus
} from '@/types/requirement-pool'
import type { Priority } from '@/types/domain-models'

// Mock数据导入
import mockPoolData from '@/mock/requirement-pool.json'

export const useRequirementPoolStore = defineStore('requirementPool', () => {
  // ============================================================================
  // State
  // ============================================================================

  /** 需求池数据 */
  const pool = ref<RequirementPool | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  /** 筛选器 */
  const filters = ref<PoolFilter>({
    status: [],
    priority: [],
    domain: [],
    searchText: ''
  })

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * 未分配的Epic列表
   */
  const unallocatedEpics = computed((): PoolEpic[] => {
    if (!pool.value) return []
    return pool.value.epics.filter(epic => epic.allocationStatus === 'unallocated')
  })

  /**
   * 已分配的Epic列表
   */
  const allocatedEpics = computed((): PoolEpic[] => {
    if (!pool.value) return []
    return pool.value.epics.filter(epic => epic.allocationStatus === 'allocated')
  })

  /**
   * 已完成的Epic列表
   */
  const completedEpics = computed((): PoolEpic[] => {
    if (!pool.value) return []
    return pool.value.epics.filter(epic => epic.allocationStatus === 'completed')
  })

  /**
   * 过滤后的Epic列表
   */
  const filteredEpics = computed((): PoolEpic[] => {
    if (!pool.value) return []
    
    let result = pool.value.epics

    // 按分配状态过滤
    if (filters.value.status.length > 0) {
      result = result.filter(epic => filters.value.status.includes(epic.allocationStatus))
    }

    // 按优先级过滤
    if (filters.value.priority.length > 0) {
      result = result.filter(epic => filters.value.priority.includes(epic.priority))
    }

    // 按领域过滤
    if (filters.value.domain.length > 0) {
      result = result.filter(epic => filters.value.domain.includes(epic.domain))
    }

    // 按搜索文本过滤
    if (filters.value.searchText) {
      const searchLower = filters.value.searchText.toLowerCase()
      result = result.filter(epic =>
        epic.name.toLowerCase().includes(searchLower) ||
        epic.code.toLowerCase().includes(searchLower) ||
        epic.description.toLowerCase().includes(searchLower)
      )
    }

    return result
  })

  /**
   * 按领域分组的Epic
   */
  const epicsByDomain = computed(() => {
    if (!pool.value) return {}
    
    const grouped: Record<string, PoolEpic[]> = {}
    pool.value.epics.forEach(epic => {
      if (!grouped[epic.domain]) {
        grouped[epic.domain] = []
      }
      grouped[epic.domain].push(epic)
    })
    
    return grouped
  })

  /**
   * 统计信息
   */
  const statistics = computed(() => {
    if (!pool.value) {
      return {
        totalEpics: 0,
        unallocated: 0,
        allocated: 0,
        completed: 0
      }
    }
    return pool.value.stats
  })

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * 加载需求池
   */
  async function fetchPool() {
    loading.value = true
    error.value = null

    try {
      // TODO: 替换为实际API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      pool.value = mockPoolData as RequirementPool
      
      console.log('✓ 需求池加载成功:', pool.value.stats)
    } catch (err: any) {
      error.value = err.message || '加载需求池失败'
      console.error('加载需求池失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加Epic到池
   */
  async function addEpicToPool(epic: PoolEpic) {
    if (!pool.value) return

    try {
      // TODO: API调用
      pool.value.epics.unshift(epic)
      pool.value.stats.totalEpics++
      pool.value.stats.unallocated++

      console.log('✓ Epic已添加到需求池:', epic.code)
    } catch (err: any) {
      console.error('添加Epic失败:', err)
      throw err
    }
  }

  /**
   * 分配Epic到项目
   */
  async function allocateEpicToProject(input: AllocateEpicToProjectInput) {
    if (!pool.value) return

    try {
      // TODO: API调用
      const epic = pool.value.epics.find(e => e.id === input.epicId)
      if (!epic) {
        throw new Error('Epic不存在')
      }

      // 创建分配记录
      const allocationRecord = {
        allocationId: `ALLOC-${Date.now()}`,
        epicId: input.epicId,
        projectId: input.projectId,
        projectName: input.projectName,
        allocatedAt: new Date().toISOString(),
        allocatedBy: input.allocatedBy
      }

      epic.allocations.push(allocationRecord)
      epic.allocationStatus = 'allocated'

      // 更新统计
      pool.value.stats.unallocated--
      pool.value.stats.allocated++

      console.log('✓ Epic已分配到项目:', input.epicId, '→', input.projectName)
      
      return allocationRecord
    } catch (err: any) {
      console.error('分配Epic失败:', err)
      throw err
    }
  }

  /**
   * 批量分配Epic到项目
   */
  async function batchAllocateEpics(input: BatchAllocateEpicsInput) {
    if (!pool.value) return

    try {
      const results = []
      
      for (const epicId of input.epicIds) {
        const result = await allocateEpicToProject({
          epicId,
          projectId: input.projectId,
          projectName: input.projectName,
          allocatedBy: input.allocatedBy
        })
        results.push(result)
      }

      console.log('✓ 批量分配完成:', results.length, '个Epic')
      
      return results
    } catch (err: any) {
      console.error('批量分配失败:', err)
      throw err
    }
  }

  /**
   * 设置筛选器
   */
  function setFilters(newFilters: Partial<PoolFilter>) {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
  }

  /**
   * 清除筛选器
   */
  function clearFilters() {
    filters.value = {
      status: [],
      priority: [],
      domain: [],
      searchText: ''
    }
  }

  /**
   * 重置Store
   */
  function reset() {
    pool.value = null
    loading.value = false
    error.value = null
    clearFilters()
  }

  return {
    // State
    pool,
    loading,
    error,
    filters,

    // Getters
    unallocatedEpics,
    allocatedEpics,
    completedEpics,
    filteredEpics,
    epicsByDomain,
    statistics,

    // Actions
    fetchPool,
    addEpicToPool,
    allocateEpicToProject,
    batchAllocateEpics,
    setFilters,
    clearFilters,
    reset
  }
})
