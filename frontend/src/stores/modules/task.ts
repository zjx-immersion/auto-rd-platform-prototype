/**
 * Task管理Store
 * C4能力域：迭代执行
 * 覆盖价值流：S5-迭代开发
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '@/types'

export const useTaskStore = defineStore('task', () => {
  // ============================================================================
  // State
  // ============================================================================

  /** Task列表 */
  const tasks = ref<Task[]>([])

  /** 当前Task */
  const currentTask = ref<Task | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * 根据Sprint ID获取Task列表
   */
  const tasksBySprint = computed(() => {
    return (sprintId: string) => {
      return tasks.value.filter(t => t.sprintId === sprintId)
    }
  })

  /**
   * 根据MR ID获取Task列表
   */
  const tasksByMR = computed(() => {
    return (mrId: string) => {
      return tasks.value.filter(t => t.mrId === mrId)
    }
  })

  /**
   * 根据负责人获取Task列表
   */
  const tasksByAssignee = computed(() => {
    return (assigneeId: string) => {
      return tasks.value.filter(t => t.assignee === assigneeId)
    }
  })

  /**
   * 根据状态获取Task列表
   */
  const tasksByStatus = computed(() => {
    return (status: string) => {
      return tasks.value.filter(t => t.status === status)
    }
  })

  /**
   * 看板数据（按状态分组）
   */
  const kanbanData = computed(() => {
    return {
      todo: tasks.value.filter(t => t.status === 'todo'),
      'in-progress': tasks.value.filter(t => t.status === 'in-progress'),
      review: tasks.value.filter(t => t.status === 'review'),
      testing: tasks.value.filter(t => t.status === 'testing'),
      done: tasks.value.filter(t => t.status === 'done')
    }
  })

  /**
   * 统计数据
   */
  const taskStatistics = computed(() => {
    const total = tasks.value.length
    const done = tasks.value.filter(t => t.status === 'done').length
    const inProgress = tasks.value.filter(t => t.status === 'in-progress').length
    const blocked = tasks.value.filter(t => t.blocked).length

    return {
      total,
      done,
      inProgress,
      blocked,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0
    }
  })

  // ============================================================================
  // Actions - Task Management
  // ============================================================================

  /**
   * 获取Task列表
   */
  async function fetchTasks(params?: {
    sprintId?: string
    mrId?: string
    assignee?: string
    status?: string
  }) {
    loading.value = true
    error.value = null
    try {
      let result = tasks.value

      if (params?.sprintId) {
        result = result.filter(t => t.sprintId === params.sprintId)
      }
      if (params?.mrId) {
        result = result.filter(t => t.mrId === params.mrId)
      }
      if (params?.assignee) {
        result = result.filter(t => t.assignee === params.assignee)
      }
      if (params?.status) {
        result = result.filter(t => t.status === params.status)
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取Task列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取Task
   */
  async function fetchTaskById(id: string) {
    loading.value = true
    error.value = null
    try {
      const task = tasks.value.find(t => t.id === id)
      if (task) {
        currentTask.value = task
        return task
      }
      throw new Error('Task不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取Task失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建Task
   */
  async function createTask(task: Task) {
    loading.value = true
    error.value = null
    try {
      tasks.value.push(task)
      return task
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建Task失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新Task
   */
  async function updateTask(id: string, updates: Partial<Task>) {
    loading.value = true
    error.value = null
    try {
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = {
          ...tasks.value[index],
          ...updates,
          updatedAt: new Date()
        }
        return tasks.value[index]
      }
      throw new Error('Task不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新Task失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除Task
   */
  async function deleteTask(id: string) {
    loading.value = true
    error.value = null
    try {
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value.splice(index, 1)
        return true
      }
      throw new Error('Task不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除Task失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新Task状态
   */
  async function updateTaskStatus(id: string, status: string) {
    return updateTask(id, { status })
  }

  /**
   * 分配Task
   */
  async function assignTask(id: string, assigneeId: string) {
    return updateTask(id, { assignee: assigneeId })
  }

  /**
   * 标记Task为阻塞
   */
  async function blockTask(id: string, reason: string) {
    return updateTask(id, {
      blocked: true,
      blockReason: reason
    })
  }

  /**
   * 解除Task阻塞
   */
  async function unblockTask(id: string) {
    return updateTask(id, {
      blocked: false,
      blockReason: undefined
    })
  }

  /**
   * 更新Task工时
   */
  async function updateTaskEffort(id: string, actualHours: number) {
    return updateTask(id, { actualHours })
  }

  /**
   * 批量更新Task状态（拖拽）
   */
  async function batchUpdateTaskStatus(taskIds: string[], status: string) {
    loading.value = true
    error.value = null
    try {
      for (const taskId of taskIds) {
        await updateTaskStatus(taskId, status)
      }
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '批量更新Task状态失败'
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
    tasks.value = []
    currentTask.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    tasks,
    currentTask,
    loading,
    error,
    
    // Getters
    tasksBySprint,
    tasksByMR,
    tasksByAssignee,
    tasksByStatus,
    kanbanData,
    taskStatistics,
    
    // Actions
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    blockTask,
    unblockTask,
    updateTaskEffort,
    batchUpdateTaskStatus,
    
    // Reset
    reset
  }
})
