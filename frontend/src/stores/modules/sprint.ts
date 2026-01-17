/**
 * Sprint管理Store
 * C4能力域：迭代执行
 * 覆盖价值流：S5-迭代开发
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Sprint, Task, Standup, BurndownData } from '@/types'

export const useSprintStore = defineStore('sprint', () => {
  // ============================================================================
  // State
  // ============================================================================

  /** Sprint列表 */
  const sprints = ref<Sprint[]>([])

  /** 当前Sprint */
  const currentSprint = ref<Sprint | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * 根据PI ID获取Sprint列表
   */
  const sprintsByPI = computed(() => {
    return (piId: string) => {
      return sprints.value.filter(s => s.piId === piId)
    }
  })

  /**
   * 根据状态获取Sprint列表
   */
  const sprintsByStatus = computed(() => {
    return (status: string) => {
      return sprints.value.filter(s => s.status === status)
    }
  })

  /**
   * 当前活跃的Sprint
   */
  const activeSprints = computed(() => {
    return sprints.value.filter(s => s.status === 'active')
  })

  /**
   * 计划中的Sprint
   */
  const planningSprints = computed(() => {
    return sprints.value.filter(s => s.status === 'planning')
  })

  /**
   * 已完成的Sprint
   */
  const completedSprints = computed(() => {
    return sprints.value.filter(s => s.status === 'completed')
  })

  /**
   * 计算Sprint容量和负载
   */
  const sprintMetrics = computed(() => {
    return (sprintId: string) => {
      const sprint = sprints.value.find(s => s.id === sprintId)
      if (!sprint) return null

      const totalCapacity = sprint.capacity || 0
      const totalPlanned = sprint.plannedStoryPoints || 0
      const totalCompleted = sprint.completedStoryPoints || 0
      const loadRate = totalCapacity > 0 ? (totalPlanned / totalCapacity) * 100 : 0
      const completionRate = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0

      return {
        capacity: totalCapacity,
        planned: totalPlanned,
        completed: totalCompleted,
        remaining: totalPlanned - totalCompleted,
        loadRate: Math.round(loadRate),
        completionRate: Math.round(completionRate)
      }
    }
  })

  // ============================================================================
  // Actions - Sprint Management
  // ============================================================================

  /**
   * 获取Sprint列表
   */
  async function fetchSprints(piId?: string) {
    loading.value = true
    error.value = null
    try {
      if (piId) {
        return sprints.value.filter(s => s.piId === piId)
      }
      return sprints.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取Sprint列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取Sprint
   */
  async function fetchSprintById(id: string) {
    loading.value = true
    error.value = null
    try {
      const sprint = sprints.value.find(s => s.id === id)
      if (sprint) {
        currentSprint.value = sprint
        return sprint
      }
      throw new Error('Sprint不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取Sprint失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建Sprint
   */
  async function createSprint(sprint: Sprint) {
    loading.value = true
    error.value = null
    try {
      sprints.value.push(sprint)
      return sprint
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建Sprint失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新Sprint
   */
  async function updateSprint(id: string, updates: Partial<Sprint>) {
    loading.value = true
    error.value = null
    try {
      const index = sprints.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sprints.value[index] = {
          ...sprints.value[index],
          ...updates,
          updatedAt: new Date()
        }
        return sprints.value[index]
      }
      throw new Error('Sprint不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新Sprint失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除Sprint
   */
  async function deleteSprint(id: string) {
    loading.value = true
    error.value = null
    try {
      const index = sprints.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sprints.value.splice(index, 1)
        return true
      }
      throw new Error('Sprint不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除Sprint失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 启动Sprint
   */
  async function startSprint(id: string) {
    return updateSprint(id, {
      status: 'active',
      startDate: new Date()
    })
  }

  /**
   * 完成Sprint
   */
  async function completeSprint(id: string) {
    return updateSprint(id, {
      status: 'completed',
      endDate: new Date()
    })
  }

  /**
   * 取消Sprint
   */
  async function cancelSprint(id: string) {
    return updateSprint(id, {
      status: 'cancelled'
    })
  }

  /**
   * 更新Sprint容量
   */
  async function updateSprintCapacity(id: string, capacity: number) {
    return updateSprint(id, { capacity })
  }

  /**
   * 更新Sprint目标
   */
  async function updateSprintGoal(id: string, goal: string) {
    return updateSprint(id, { goal })
  }

  /**
   * 获取Sprint燃尽图数据
   */
  async function fetchBurndownData(sprintId: string): Promise<BurndownData[]> {
    loading.value = true
    error.value = null
    try {
      const sprint = sprints.value.find(s => s.id === sprintId)
      if (!sprint) throw new Error('Sprint不存在')

      // 生成燃尽图数据（简化版）
      const burndownData: BurndownData[] = []
      const totalDays = sprint.duration || 10
      const totalPoints = sprint.plannedStoryPoints || 0
      const completedPoints = sprint.completedStoryPoints || 0
      const burnRate = totalPoints / totalDays

      for (let day = 0; day <= totalDays; day++) {
        const idealRemaining = Math.max(0, totalPoints - (burnRate * day))
        const actualRemaining = day === totalDays 
          ? (totalPoints - completedPoints)
          : Math.max(0, totalPoints - (burnRate * day * (Math.random() * 0.5 + 0.75)))

        burndownData.push({
          date: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
          idealRemaining: Math.round(idealRemaining),
          actualRemaining: Math.round(actualRemaining),
          completed: Math.round(totalPoints - actualRemaining)
        })
      }

      return burndownData
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取燃尽图数据失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // Reset
  // ============================================================================

  /**
   * 重置状态
   */
  function reset() {
    sprints.value = []
    currentSprint.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    sprints,
    currentSprint,
    loading,
    error,
    
    // Getters
    sprintsByPI,
    sprintsByStatus,
    activeSprints,
    planningSprints,
    completedSprints,
    sprintMetrics,
    
    // Actions
    fetchSprints,
    fetchSprintById,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    cancelSprint,
    updateSprintCapacity,
    updateSprintGoal,
    fetchBurndownData,
    
    // Reset
    reset
  }
})
