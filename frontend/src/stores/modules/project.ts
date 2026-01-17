/**
 * 项目管理Store
 * C0能力域：领域项目管理
 * 覆盖价值流：S4-S9
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DomainProject, Milestone, TeamConfig } from '@/types'

export const useProjectStore = defineStore('project', () => {
  // ============================================================================
  // State
  // ============================================================================

  /** 项目列表 */
  const projects = ref<DomainProject[]>([])

  /** 当前项目 */
  const currentProject = ref<DomainProject | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * 根据领域过滤项目
   */
  const projectsByDomain = computed(() => {
    return (domain: string) => {
      return projects.value.filter(p => p.domain === domain)
    }
  })

  /**
   * 获取活跃项目
   */
  const activeProjects = computed(() => {
    return projects.value.filter(p => 
      p.status === 'executing' || p.status === 'planning'
    )
  })

  /**
   * 获取项目健康度统计
   */
  const projectHealthStats = computed(() => {
    const stats = {
      green: 0,
      yellow: 0,
      red: 0,
      total: projects.value.length
    }

    projects.value.forEach(p => {
      stats[p.health]++
    })

    return stats
  })

  /**
   * 获取即将到来的里程碑
   */
  const upcomingMilestones = computed(() => {
    if (!currentProject.value) return []

    const now = new Date()
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    return currentProject.value.milestones
      .filter(m => {
        const milestoneDate = new Date(m.date)
        return milestoneDate >= now && milestoneDate <= thirtyDaysLater
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * 获取项目列表
   */
  async function fetchProjects() {
    loading.value = true
    error.value = null

    try {
      // TODO: 替换为实际API调用
      // const response = await api.getProjects()
      // projects.value = response.data
      
      // 暂时使用mock数据
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('项目列表已加载')
    } catch (err: any) {
      error.value = err.message || '获取项目列表失败'
      console.error('获取项目列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取项目详情
   */
  async function fetchProjectById(id: string) {
    loading.value = true
    error.value = null

    try {
      // TODO: 替换为实际API调用
      // const response = await api.getProjectById(id)
      // currentProject.value = response.data
      
      // 暂时从列表中查找
      const project = projects.value.find(p => p.id === id)
      if (project) {
        currentProject.value = project
      } else {
        throw new Error('项目不存在')
      }
    } catch (err: any) {
      error.value = err.message || '获取项目详情失败'
      console.error('获取项目详情失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建项目
   */
  async function createProject(projectData: Partial<DomainProject>) {
    loading.value = true
    error.value = null

    try {
      // TODO: 替换为实际API调用
      // const response = await api.createProject(projectData)
      // const newProject = response.data
      
      // 暂时使用mock逻辑
      const newProject: DomainProject = {
        id: `proj-${Date.now()}`,
        code: projectData.code || `PRJ-${Date.now()}`,
        name: projectData.name || '',
        vehicleModel: projectData.vehicleModel || '',
        domain: projectData.domain || 'intelligent-driving',
        startDate: projectData.startDate || new Date().toISOString(),
        sopDate: projectData.sopDate || new Date().toISOString(),
        milestones: projectData.milestones || [],
        teams: projectData.teams || [],
        epicIds: [],
        piVersionIds: [],
        status: 'planning',
        health: 'green',
        description: projectData.description || '',
        objectives: projectData.objectives || [],
        owner: projectData.owner || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: projectData.owner || '',
        updatedBy: projectData.owner || '',
      }

      projects.value.push(newProject)
      currentProject.value = newProject

      return newProject
    } catch (err: any) {
      error.value = err.message || '创建项目失败'
      console.error('创建项目失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新项目
   */
  async function updateProject(id: string, updates: Partial<DomainProject>) {
    loading.value = true
    error.value = null

    try {
      // TODO: 替换为实际API调用
      // const response = await api.updateProject(id, updates)
      // const updatedProject = response.data
      
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = {
          ...projects.value[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }

        if (currentProject.value?.id === id) {
          currentProject.value = projects.value[index]
        }
      }
    } catch (err: any) {
      error.value = err.message || '更新项目失败'
      console.error('更新项目失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加里程碑
   */
  async function addMilestone(projectId: string, milestone: Milestone) {
    if (!currentProject.value || currentProject.value.id !== projectId) {
      await fetchProjectById(projectId)
    }

    if (currentProject.value) {
      const milestones = [...currentProject.value.milestones, milestone]
      await updateProject(projectId, { milestones })
    }
  }

  /**
   * 更新里程碑
   */
  async function updateMilestone(projectId: string, milestoneId: string, updates: Partial<Milestone>) {
    if (!currentProject.value || currentProject.value.id !== projectId) {
      await fetchProjectById(projectId)
    }

    if (currentProject.value) {
      const milestones = currentProject.value.milestones.map(m =>
        m.id === milestoneId ? { ...m, ...updates } : m
      )
      await updateProject(projectId, { milestones })
    }
  }

  /**
   * 更新团队配置
   */
  async function updateTeamConfig(projectId: string, teamConfig: TeamConfig[]) {
    await updateProject(projectId, { teams: teamConfig })
  }

  /**
   * 关联Epic到项目
   */
  async function linkEpic(projectId: string, epicId: string) {
    if (!currentProject.value || currentProject.value.id !== projectId) {
      await fetchProjectById(projectId)
    }

    if (currentProject.value) {
      const epicIds = [...currentProject.value.epicIds, epicId]
      await updateProject(projectId, { epicIds })
    }
  }

  /**
   * 关联PI版本到项目
   */
  async function linkPIVersion(projectId: string, piId: string) {
    if (!currentProject.value || currentProject.value.id !== projectId) {
      await fetchProjectById(projectId)
    }

    if (currentProject.value) {
      const piVersionIds = [...currentProject.value.piVersionIds, piId]
      await updateProject(projectId, { piVersionIds })
    }
  }

  /**
   * 计算项目进度
   */
  function calculateProjectProgress(projectId: string): number {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return 0

    // 简化的进度计算：基于里程碑完成情况
    const totalMilestones = project.milestones.length
    if (totalMilestones === 0) return 0

    const achievedMilestones = project.milestones.filter(m => m.status === 'achieved').length
    return Math.round((achievedMilestones / totalMilestones) * 100)
  }

  /**
   * 重置当前项目
   */
  function resetCurrentProject() {
    currentProject.value = null
  }

  /**
   * 清除错误
   */
  function clearError() {
    error.value = null
  }

  /**
   * 删除项目
   */
  async function deleteProject(id: string) {
    loading.value = true
    error.value = null

    try {
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value.splice(index, 1)
      }

      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
    } catch (err: any) {
      error.value = err.message || '删除项目失败'
      console.error('删除项目失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取项目的版本列表（临时方法，简化实现）
   */
  function getVersionsByProject(projectId: string) {
    // TODO: 从version store获取
    return []
  }

  /**
   * 获取项目的PI列表（临时方法，简化实现）
   */
  function getPIsByProject(projectId: string) {
    // TODO: 从pi store获取
    return []
  }

  /**
   * 创建版本（临时方法，简化实现）
   */
  async function createVersion(versionData: any) {
    // TODO: 实现版本创建逻辑
    console.log('createVersion called (not implemented yet)', versionData)
  }

  /**
   * 创建PI（临时方法，简化实现）
   */
  async function createPI(piData: any) {
    // TODO: 实现PI创建逻辑
    console.log('createPI called (not implemented yet)', piData)
  }

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    projects,
    currentProject,
    loading,
    error,

    // Getters
    projectsByDomain,
    activeProjects,
    projectHealthStats,
    upcomingMilestones,

    // Actions
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMilestone,
    updateMilestone,
    updateTeamConfig,
    linkEpic,
    linkPIVersion,
    calculateProjectProgress,
    resetCurrentProject,
    clearError,
    
    // Helper methods
    getVersionsByProject,
    getPIsByProject,
    createVersion,
    createPI,
  }
})
