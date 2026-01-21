/**
 * 项目管理 Store
 */

import { defineStore } from 'pinia'
import type { DomainProject, CreateProjectInput, UpdateProjectInput, ProjectFilter, Milestone } from '@/types/project'
import projectsData from '@/mock/projects.json'
import milestonesData from '@/mock/milestones.json'

interface ProjectState {
  projects: DomainProject[]
  currentProject: DomainProject | null
  milestones: Milestone[]
  loading: boolean
  error: string | null
  filters: ProjectFilter
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projects: [],
    currentProject: null,
    milestones: [],
    loading: false,
    error: null,
    filters: {}
  }),

  getters: {
    /**
     * 根据ID获取项目
     */
    getProjectById: (state) => (projectId: string): DomainProject | undefined => {
      return state.projects.find(p => p.id === projectId)
    },

    /**
     * 根据领域获取项目
     */
    getProjectsByDomain: (state) => (domain: string): DomainProject[] => {
      return state.projects.filter(p => p.domain === domain)
    },

    /**
     * 根据状态获取项目
     */
    getProjectsByStatus: (state) => (status: string): DomainProject[] => {
      return state.projects.filter(p => p.status === status)
    },

    /**
     * 获取项目统计
     */
    projectStatistics: (state) => {
      return {
        total: state.projects.length,
        planning: state.projects.filter(p => p.status === 'planning').length,
        inProgress: state.projects.filter(p => p.status === 'in-progress').length,
        completed: state.projects.filter(p => p.status === 'completed').length,
        paused: state.projects.filter(p => p.status === 'paused').length
      }
    },

    /**
     * 根据项目ID获取里程碑
     */
    getMilestonesByProjectId: (state) => (projectId: string): Milestone[] => {
      return state.milestones.filter(m => m.milestoneId.includes(projectId))
    }
  },

  actions: {
    /**
     * 获取项目列表
     */
    async fetchProjects() {
      this.loading = true
      this.error = null
      
      try {
        // 从Mock数据加载
        this.projects = projectsData.projects as DomainProject[]
        console.log('✅ Project Store: 已加载项目数据', this.projects.length)
        this.loading = false
      } catch (error) {
        this.error = '获取项目列表失败'
        this.loading = false
        console.error('❌ Project Store: 加载失败', error)
      }
    },

    /**
     * 根据ID获取项目详情
     */
    async fetchProjectById(projectId: string) {
      this.loading = true
      this.error = null
      
      try {
        const project = this.projects.find(p => p.id === projectId)
        if (project) {
          this.currentProject = project
          // 同时加载该项目的里程碑
          await this.fetchMilestones(projectId)
        } else {
          this.error = '项目不存在'
        }
        this.loading = false
      } catch (error) {
        this.error = '获取项目详情失败'
        this.loading = false
      }
    },

    /**
     * 获取里程碑数据
     */
    async fetchMilestones(projectId?: string) {
      try {
        // 从Mock数据加载里程碑
        const allMilestones = milestonesData.milestones as Milestone[]
        
        if (projectId) {
          // 如果指定了项目ID，只加载该项目的里程碑
          this.milestones = allMilestones.filter(m => 
            milestonesData.projectId === projectId
          )
        } else {
          this.milestones = allMilestones
        }
        
        console.log('✅ Project Store: 已加载里程碑数据', this.milestones.length)
      } catch (error) {
        console.error('❌ Project Store: 加载里程碑失败', error)
      }
    },

    /**
     * 创建项目
     */
    async createProject(projectData: CreateProjectInput) {
      this.loading = true
      this.error = null
      
      try {
        const newProject: DomainProject = {
          id: `PROJ-${Date.now()}`,
          ...projectData,
          status: projectData.status || 'planning',
          progress: 0,
          iterationWeeks: projectData.iterationWeeks || 2,
          totalIterations: Math.ceil(
            (new Date(projectData.endDate).getTime() - new Date(projectData.startDate).getTime()) /
            (7 * 24 * 60 * 60 * 1000) /
            (projectData.iterationWeeks || 2)
          ),
          milestones: projectData.milestones || [],
          teamIds: projectData.teamIds || [],
          tags: projectData.tags || [],
          statistics: {
            totalVersions: 0,
            totalEpics: 0,
            totalStoryPoints: 0,
            completedStoryPoints: 0,
            totalPIs: 0
          },
          createdBy: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        this.projects.push(newProject)
        console.log('✅ Project Store: 项目创建成功', newProject.id)
        this.loading = false
        return newProject
      } catch (error) {
        this.error = '创建项目失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 更新项目
     */
    async updateProject(projectData: UpdateProjectInput) {
      this.loading = true
      this.error = null
      
      try {
        const index = this.projects.findIndex(p => p.id === projectData.id)
        if (index !== -1) {
          this.projects[index] = {
            ...this.projects[index],
            ...projectData,
            updatedAt: new Date().toISOString()
          }
          console.log('✅ Project Store: 项目更新成功', projectData.id)
        }
        this.loading = false
      } catch (error) {
        this.error = '更新项目失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 删除项目
     */
    async deleteProject(projectId: string) {
      this.loading = true
      this.error = null
      
      try {
        const index = this.projects.findIndex(p => p.id === projectId)
        if (index !== -1) {
          this.projects.splice(index, 1)
          console.log('✅ Project Store: 项目删除成功', projectId)
        }
        this.loading = false
      } catch (error) {
        this.error = '删除项目失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 设置筛选条件
     */
    setFilters(filters: ProjectFilter) {
      this.filters = { ...this.filters, ...filters }
    },

    /**
     * 清除筛选条件
     */
    clearFilters() {
      this.filters = {}
    },

    /**
     * 重置Store
     */
    reset() {
      this.projects = []
      this.currentProject = null
      this.milestones = []
      this.loading = false
      this.error = null
      this.filters = {}
    }
  }
})
