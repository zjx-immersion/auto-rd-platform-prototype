/**
 * 团队管理 Store
 */

import { defineStore } from 'pinia'
import type { Team, CreateTeamInput, UpdateTeamInput, TeamFilter } from '@/types/team'
import teamsData from '@/mock/teams.json'

interface TeamState {
  teams: Team[]
  currentTeam: Team | null
  loading: boolean
  error: string | null
  filters: TeamFilter
}

export const useTeamStore = defineStore('team', {
  state: (): TeamState => ({
    teams: [],
    currentTeam: null,
    loading: false,
    error: null,
    filters: {}
  }),

  getters: {
    /**
     * 获取活跃团队
     */
    activeTeams: (state): Team[] => {
      return state.teams.filter(team => team.status === 'active')
    },

    /**
     * 根据ID获取团队
     */
    getTeamById: (state) => (teamId: string): Team | undefined => {
      return state.teams.find(team => team.teamId === teamId)
    },

    /**
     * 根据领域获取团队
     */
    getTeamsByDomain: (state) => (domain: string): Team[] => {
      return state.teams.filter(team => team.domain === domain)
    },

    /**
     * 获取团队总数统计
     */
    teamStatistics: (state) => {
      return {
        total: state.teams.length,
        active: state.teams.filter(t => t.status === 'active').length,
        totalMembers: state.teams.reduce((sum, t) => sum + t.statistics.totalMembers, 0),
        averageCapacity: state.teams.length > 0
          ? Math.round(state.teams.reduce((sum, t) => sum + t.capacityPerIteration, 0) / state.teams.length)
          : 0
      }
    }
  },

  actions: {
    /**
     * 获取团队列表
     */
    async fetchTeams() {
      this.loading = true
      this.error = null
      
      try {
        // ⚠️ 数据已经在initializer中加载，这里只是确认
        // 不再重新加载，避免覆盖initializer加载的数据
        if (this.teams.length === 0) {
          console.warn('⚠️ Team Store: teams为空，可能initializer未执行')
        } else {
          console.log('✅ Team Store: 已有团队数据', this.teams.length)
        }
        this.loading = false
      } catch (error) {
        this.error = '获取团队列表失败'
        this.loading = false
        console.error('❌ Team Store: 加载失败', error)
      }
    },

    /**
     * 根据ID获取团队详情
     */
    async fetchTeamById(teamId: string) {
      this.loading = true
      this.error = null
      
      try {
        const team = this.teams.find(t => t.teamId === teamId)
        if (team) {
          this.currentTeam = team
        } else {
          this.error = '团队不存在'
        }
        this.loading = false
      } catch (error) {
        this.error = '获取团队详情失败'
        this.loading = false
      }
    },

    /**
     * 创建团队
     */
    async createTeam(teamData: CreateTeamInput) {
      this.loading = true
      this.error = null
      
      try {
        const newTeam: Team = {
          teamId: `TEAM-${Date.now()}`,
          ...teamData,
          members: [],
          status: 'active',
          statistics: {
            totalMembers: 0,
            activeProjects: 0,
            currentLoad: 0,
            averageCapacityPerPerson: 0
          },
          createdBy: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        this.teams.push(newTeam)
        console.log('✅ Team Store: 团队创建成功', newTeam.teamId)
        this.loading = false
        return newTeam
      } catch (error) {
        this.error = '创建团队失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 更新团队
     */
    async updateTeam(teamData: UpdateTeamInput) {
      this.loading = true
      this.error = null
      
      try {
        const index = this.teams.findIndex(t => t.teamId === teamData.teamId)
        if (index !== -1) {
          this.teams[index] = {
            ...this.teams[index],
            ...teamData,
            updatedAt: new Date().toISOString()
          }
          console.log('✅ Team Store: 团队更新成功', teamData.teamId)
        }
        this.loading = false
      } catch (error) {
        this.error = '更新团队失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 删除团队
     */
    async deleteTeam(teamId: string) {
      this.loading = true
      this.error = null
      
      try {
        const index = this.teams.findIndex(t => t.teamId === teamId)
        if (index !== -1) {
          this.teams.splice(index, 1)
          console.log('✅ Team Store: 团队删除成功', teamId)
        }
        this.loading = false
      } catch (error) {
        this.error = '删除团队失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 设置筛选条件
     */
    setFilters(filters: TeamFilter) {
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
      this.teams = []
      this.currentTeam = null
      this.loading = false
      this.error = null
      this.filters = {}
    }
  }
})
