/**
 * 版本管理 Store
 */

import { defineStore } from 'pinia'
import type { ProductVersion, CreateVersionInput, UpdateVersionInput, VersionFilter } from '@/types/version'
import versionsData from '@/mock/versions.json'

interface VersionState {
  versions: ProductVersion[]
  currentVersion: ProductVersion | null
  loading: boolean
  error: string | null
  filters: VersionFilter
}

export const useVersionStore = defineStore('version', {
  state: (): VersionState => ({
    versions: [],
    currentVersion: null,
    loading: false,
    error: null,
    filters: {}
  }),

  getters: {
    /**
     * 根据ID获取版本
     */
    getVersionById: (state) => (versionId: string): ProductVersion | undefined => {
      return state.versions.find(v => v.versionId === versionId)
    },

    /**
     * 根据产品ID获取版本列表
     */
    getVersionsByProductId: (state) => (productId: string): ProductVersion[] => {
      return state.versions.filter(v => v.productId === productId)
    },

    /**
     * 根据产品线获取版本列表
     */
    getVersionsByProductLine: (state) => (productLine: string): ProductVersion[] => {
      return state.versions.filter(v => v.productLine === productLine)
    },

    /**
     * 根据里程碑ID获取版本列表
     */
    getVersionsByMilestoneId: (state) => (milestoneId: string): ProductVersion[] => {
      return state.versions.filter(v => v.alignedMilestoneId === milestoneId)
    },

    /**
     * 根据迭代范围获取版本列表
     */
    getVersionsByIterationRange: (state) => (startIter: number, endIter: number): ProductVersion[] => {
      return state.versions.filter(v => 
        v.startIterationNumber <= endIter && v.endIterationNumber >= startIter
      )
    },

    /**
     * 获取版本统计
     */
    versionStatistics: (state) => {
      return {
        total: state.versions.length,
        planning: state.versions.filter(v => v.status === 'planning').length,
        inProgress: state.versions.filter(v => v.status === 'in-progress').length,
        completed: state.versions.filter(v => v.status === 'completed').length,
        released: state.versions.filter(v => v.status === 'released').length,
        totalStoryPoints: state.versions.reduce((sum, v) => sum + v.totalStoryPoints, 0)
      }
    }
  },

  actions: {
    /**
     * 获取版本列表
     */
    async fetchVersions(projectId?: string) {
      this.loading = true
      this.error = null
      
      try {
        // 从Mock数据加载
        const allVersions = versionsData.versions as ProductVersion[]
        
        if (projectId) {
          // 如果指定了项目ID，只加载该项目的版本
          this.versions = allVersions.filter(v => 
            versionsData.projectId === projectId
          )
        } else {
          this.versions = allVersions
        }
        
        console.log('✅ Version Store: 已加载版本数据', this.versions.length)
        this.loading = false
      } catch (error) {
        this.error = '获取版本列表失败'
        this.loading = false
        console.error('❌ Version Store: 加载失败', error)
      }
    },

    /**
     * 根据ID获取版本详情
     */
    async fetchVersionById(versionId: string) {
      this.loading = true
      this.error = null
      
      try {
        const version = this.versions.find(v => v.versionId === versionId)
        if (version) {
          this.currentVersion = version
        } else {
          this.error = '版本不存在'
        }
        this.loading = false
      } catch (error) {
        this.error = '获取版本详情失败'
        this.loading = false
      }
    },

    /**
     * 创建版本
     */
    async createVersion(versionData: CreateVersionInput) {
      this.loading = true
      this.error = null
      
      try {
        // 计算迭代数量和持续周期
        const iterationCount = versionData.endIterationNumber - versionData.startIterationNumber + 1
        const durationWeeks = iterationCount * 2  // 假设每个迭代2周
        
        // 计算日期（简化版，实际应根据迭代轴计算）
        const startDate = new Date()
        const endDate = new Date(startDate.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000)
        
        // 计算总Story Points
        const totalStoryPoints = (versionData.epicAllocations || []).reduce(
          (sum, epic) => sum + epic.allocatedSP, 0
        )
        
        const newVersion: ProductVersion = {
          versionId: `VER-${Date.now()}`,
          ...versionData,
          iterationCount,
          durationWeeks,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          alignedMilestoneName: '',  // 需要从milestone数据获取
          milestoneDate: '',
          milestoneGap: 0,
          alignmentStatus: 'good',
          epicAllocations: versionData.epicAllocations || [],
          totalStoryPoints,
          status: 'planning',
          createdBy: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        this.versions.push(newVersion)
        console.log('✅ Version Store: 版本创建成功', newVersion.versionId)
        this.loading = false
        return newVersion
      } catch (error) {
        this.error = '创建版本失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 更新版本
     */
    async updateVersion(versionData: UpdateVersionInput) {
      this.loading = true
      this.error = null
      
      try {
        const index = this.versions.findIndex(v => v.versionId === versionData.versionId)
        if (index !== -1) {
          // 重新计算迭代数量和Story Points
          let updates: any = { ...versionData }
          
          if (versionData.startIterationNumber || versionData.endIterationNumber) {
            const startIter = versionData.startIterationNumber || this.versions[index].startIterationNumber
            const endIter = versionData.endIterationNumber || this.versions[index].endIterationNumber
            updates.iterationCount = endIter - startIter + 1
            updates.durationWeeks = updates.iterationCount * 2
          }
          
          if (versionData.epicAllocations) {
            updates.totalStoryPoints = versionData.epicAllocations.reduce(
              (sum, epic) => sum + epic.allocatedSP, 0
            )
          }
          
          this.versions[index] = {
            ...this.versions[index],
            ...updates,
            updatedAt: new Date().toISOString()
          }
          console.log('✅ Version Store: 版本更新成功', versionData.versionId)
        }
        this.loading = false
      } catch (error) {
        this.error = '更新版本失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 删除版本
     */
    async deleteVersion(versionId: string) {
      this.loading = true
      this.error = null
      
      try {
        const index = this.versions.findIndex(v => v.versionId === versionId)
        if (index !== -1) {
          this.versions.splice(index, 1)
          console.log('✅ Version Store: 版本删除成功', versionId)
        }
        this.loading = false
      } catch (error) {
        this.error = '删除版本失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 设置筛选条件
     */
    setFilters(filters: VersionFilter) {
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
      this.versions = []
      this.currentVersion = null
      this.loading = false
      this.error = null
      this.filters = {}
    }
  }
})
