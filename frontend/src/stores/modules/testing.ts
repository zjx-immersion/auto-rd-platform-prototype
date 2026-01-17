/**
 * 测试管理Store
 * C5能力域：测试验收
 * 覆盖价值流：S6-S7
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TestCase, Defect, TestPlan } from '@/types'

export const useTestingStore = defineStore('testing', () => {
  // ============================================================================
  // State
  // ============================================================================

  /** 测试用例列表 */
  const testCases = ref<TestCase[]>([])

  /** 缺陷列表 */
  const defects = ref<Defect[]>([])

  /** 测试计划列表 */
  const testPlans = ref<TestPlan[]>([])

  /** 当前测试用例 */
  const currentTestCase = ref<TestCase | null>(null)

  /** 当前缺陷 */
  const currentDefect = ref<Defect | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  // ============================================================================
  // Getters - TestCase
  // ============================================================================

  /**
   * 根据功能模块获取测试用例
   */
  const testCasesByModule = computed(() => {
    return (module: string) => {
      return testCases.value.filter(tc => tc.module === module)
    }
  })

  /**
   * 根据优先级获取测试用例
   */
  const testCasesByPriority = computed(() => {
    return (priority: string) => {
      return testCases.value.filter(tc => tc.priority === priority)
    }
  })

  /**
   * 测试用例统计
   */
  const testCaseStatistics = computed(() => {
    const total = testCases.value.length
    const passed = testCases.value.filter(tc => tc.status === 'passed').length
    const failed = testCases.value.filter(tc => tc.status === 'failed').length
    const blocked = testCases.value.filter(tc => tc.status === 'blocked').length
    const notRun = testCases.value.filter(tc => tc.status === 'not-run').length

    return {
      total,
      passed,
      failed,
      blocked,
      notRun,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0
    }
  })

  // ============================================================================
  // Getters - Defect
  // ============================================================================

  /**
   * 根据严重程度获取缺陷
   */
  const defectsBySeverity = computed(() => {
    return (severity: string) => {
      return defects.value.filter(d => d.severity === severity)
    }
  })

  /**
   * 根据状态获取缺陷
   */
  const defectsByStatus = computed(() => {
    return (status: string) => {
      return defects.value.filter(d => d.status === status)
    }
  })

  /**
   * 未解决的缺陷
   */
  const openDefects = computed(() => {
    return defects.value.filter(d => 
      d.status === 'open' || d.status === 'in-progress' || d.status === 'reopened'
    )
  })

  /**
   * 缺陷统计
   */
  const defectStatistics = computed(() => {
    const total = defects.value.length
    const open = defects.value.filter(d => d.status === 'open').length
    const inProgress = defects.value.filter(d => d.status === 'in-progress').length
    const resolved = defects.value.filter(d => d.status === 'resolved').length
    const closed = defects.value.filter(d => d.status === 'closed').length
    const critical = defects.value.filter(d => d.severity === 'critical').length
    const high = defects.value.filter(d => d.severity === 'high').length

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      critical,
      high,
      resolveRate: total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0
    }
  })

  // ============================================================================
  // Actions - TestCase Management
  // ============================================================================

  /**
   * 获取测试用例列表
   */
  async function fetchTestCases(params?: {
    module?: string
    priority?: string
    status?: string
  }) {
    loading.value = true
    error.value = null
    try {
      let result = testCases.value

      if (params?.module) {
        result = result.filter(tc => tc.module === params.module)
      }
      if (params?.priority) {
        result = result.filter(tc => tc.priority === params.priority)
      }
      if (params?.status) {
        result = result.filter(tc => tc.status === params.status)
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取测试用例列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取测试用例
   */
  async function fetchTestCaseById(id: string) {
    loading.value = true
    error.value = null
    try {
      const testCase = testCases.value.find(tc => tc.id === id)
      if (testCase) {
        currentTestCase.value = testCase
        return testCase
      }
      throw new Error('测试用例不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取测试用例失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建测试用例
   */
  async function createTestCase(testCase: TestCase) {
    loading.value = true
    error.value = null
    try {
      testCases.value.push(testCase)
      return testCase
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建测试用例失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新测试用例
   */
  async function updateTestCase(id: string, updates: Partial<TestCase>) {
    loading.value = true
    error.value = null
    try {
      const index = testCases.value.findIndex(tc => tc.id === id)
      if (index !== -1) {
        testCases.value[index] = {
          ...testCases.value[index],
          ...updates,
          updatedAt: new Date()
        }
        return testCases.value[index]
      }
      throw new Error('测试用例不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新测试用例失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除测试用例
   */
  async function deleteTestCase(id: string) {
    loading.value = true
    error.value = null
    try {
      const index = testCases.value.findIndex(tc => tc.id === id)
      if (index !== -1) {
        testCases.value.splice(index, 1)
        return true
      }
      throw new Error('测试用例不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除测试用例失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 执行测试用例
   */
  async function executeTestCase(id: string, result: 'passed' | 'failed' | 'blocked', comment?: string) {
    return updateTestCase(id, {
      status: result,
      lastExecutionDate: new Date(),
      executionComment: comment
    })
  }

  // ============================================================================
  // Actions - Defect Management
  // ============================================================================

  /**
   * 获取缺陷列表
   */
  async function fetchDefects(params?: {
    severity?: string
    status?: string
    assignee?: string
  }) {
    loading.value = true
    error.value = null
    try {
      let result = defects.value

      if (params?.severity) {
        result = result.filter(d => d.severity === params.severity)
      }
      if (params?.status) {
        result = result.filter(d => d.status === params.status)
      }
      if (params?.assignee) {
        result = result.filter(d => d.assignee === params.assignee)
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取缺陷列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取缺陷
   */
  async function fetchDefectById(id: string) {
    loading.value = true
    error.value = null
    try {
      const defect = defects.value.find(d => d.id === id)
      if (defect) {
        currentDefect.value = defect
        return defect
      }
      throw new Error('缺陷不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取缺陷失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建缺陷
   */
  async function createDefect(defect: Defect) {
    loading.value = true
    error.value = null
    try {
      defects.value.push(defect)
      return defect
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建缺陷失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新缺陷
   */
  async function updateDefect(id: string, updates: Partial<Defect>) {
    loading.value = true
    error.value = null
    try {
      const index = defects.value.findIndex(d => d.id === id)
      if (index !== -1) {
        defects.value[index] = {
          ...defects.value[index],
          ...updates,
          updatedAt: new Date()
        }
        return defects.value[index]
      }
      throw new Error('缺陷不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新缺陷失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除缺陷
   */
  async function deleteDefect(id: string) {
    loading.value = true
    error.value = null
    try {
      const index = defects.value.findIndex(d => d.id === id)
      if (index !== -1) {
        defects.value.splice(index, 1)
        return true
      }
      throw new Error('缺陷不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除缺陷失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新缺陷状态
   */
  async function updateDefectStatus(id: string, status: string) {
    const updates: any = { status }
    if (status === 'resolved') {
      updates.resolvedDate = new Date()
    } else if (status === 'closed') {
      updates.closedDate = new Date()
    }
    return updateDefect(id, updates)
  }

  /**
   * 分配缺陷
   */
  async function assignDefect(id: string, assigneeId: string) {
    return updateDefect(id, { assignee: assigneeId })
  }

  // ============================================================================
  // Reset
  // ============================================================================

  /**
   * 重置状态
   */
  function reset() {
    testCases.value = []
    defects.value = []
    testPlans.value = []
    currentTestCase.value = null
    currentDefect.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    testCases,
    defects,
    testPlans,
    currentTestCase,
    currentDefect,
    loading,
    error,
    
    // Getters - TestCase
    testCasesByModule,
    testCasesByPriority,
    testCaseStatistics,
    
    // Getters - Defect
    defectsBySeverity,
    defectsByStatus,
    openDefects,
    defectStatistics,
    
    // Actions - TestCase
    fetchTestCases,
    fetchTestCaseById,
    createTestCase,
    updateTestCase,
    deleteTestCase,
    executeTestCase,
    
    // Actions - Defect
    fetchDefects,
    fetchDefectById,
    createDefect,
    updateDefect,
    deleteDefect,
    updateDefectStatus,
    assignDefect,
    
    // Reset
    reset
  }
})
