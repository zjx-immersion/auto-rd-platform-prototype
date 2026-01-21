/**
 * PI管理 Store
 */

import { defineStore } from 'pinia'
import type { PI, CreatePIInput, UpdatePIInput, PIFilter, PIGenerateConfig, PIGenerateResult } from '@/types/pi'
import pisData from '@/mock/pis.json'

interface PIState {
  pis: PI[]
  currentPI: PI | null
  loading: boolean
  error: string | null
  filters: PIFilter
}

export const usePIStore = defineStore('pi', {
  state: (): PIState => ({
    pis: [],
    currentPI: null,
    loading: false,
    error: null,
    filters: {}
  }),

  getters: {
    /**
     * 根据ID获取PI
     */
    getPIById: (state) => (piId: string): PI | undefined => {
      // 兼容新旧ID字段：piId || id
      return state.pis.find((p: any) => 
        (p.piId === piId) || (p.id === piId)
      )
    },

    /**
     * 根据里程碑ID获取PI列表
     */
    getPIsByMilestoneId: (state) => (milestoneId: string): PI[] => {
      return state.pis.filter((p: any) => 
        p.alignedMilestone?.milestoneId === milestoneId
      )
    },

    /**
     * 根据迭代范围获取PI列表
     */
    getPIsByIterationRange: (state) => (startIter: number, endIter: number): PI[] => {
      return state.pis.filter((p: any) => {
        const start = p.startIterationNumber || 1
        const end = p.endIterationNumber || p.sprintCount || 1
        return start <= endIter && end >= startIter
      })
    },

    /**
     * 获取PI统计
     */
    piStatistics: (state) => {
      return {
        total: state.pis.length,
        draft: state.pis.filter((p: any) => (p.status?.planningStatus || p.status) === 'draft').length,
        confirmed: state.pis.filter((p: any) => (p.status?.planningStatus || p.status) === 'confirmed').length,
        finalized: state.pis.filter((p: any) => (p.status?.planningStatus || p.status) === 'finalized').length,
        totalStoryPoints: state.pis.reduce((sum, p: any) => sum + (p.totalStoryPoints || p.committedStoryPoints || 0), 0),
        totalVersions: state.pis.reduce((sum, p: any) => sum + (p.includedVersions?.length || 0), 0)
      }
    },

    /**
     * 兼容旧API：piVersions（映射到pis）
     */
    piVersions: (state) => {
      // 将新的PI格式转换为旧的piVersion格式
      return state.pis.map((pi: any) => ({
        id: pi.piId || pi.id,
        name: pi.piName || pi.name,
        number: pi.piNumber || pi.code,
        startDate: pi.startDate,
        endDate: pi.endDate,
        startIteration: pi.startIterationNumber || 1,
        endIteration: pi.endIterationNumber || pi.sprintCount || 1,
        sprintCount: pi.iterationCount || pi.sprintCount || pi.endIterationNumber || 1,
        status: pi.status?.planningStatus || pi.status || 'draft',
        milestone: pi.alignedMilestone?.milestoneName || '',
        // 保留原始对象的其他字段
        ...pi
      }))
    }
  },

  actions: {
    /**
     * 获取PI列表
     */
    async fetchPIs(projectId?: string) {
      this.loading = true
      this.error = null
      
      try {
        // 从Mock数据加载
        const allPIs = pisData.pis as PI[]
        
        if (projectId) {
          // 如果指定了项目ID，只加载该项目的PI
          this.pis = allPIs.filter(p => 
            pisData.projectId === projectId
          )
        } else {
          this.pis = allPIs
        }
        
        console.log('✅ PI Store: 已加载PI数据', this.pis.length)
        this.loading = false
      } catch (error) {
        this.error = '获取PI列表失败'
        this.loading = false
        console.error('❌ PI Store: 加载失败', error)
      }
    },

    /**
     * 根据ID获取PI详情
     */
    async fetchPIById(piId: string) {
      this.loading = true
      this.error = null
      
      try {
        // 兼容新旧ID字段：piId || id
        const pi = this.pis.find((p: any) => 
          (p.piId === piId) || (p.id === piId)
        )
        if (pi) {
          this.currentPI = pi
          console.log('✅ PI Store: 已设置currentPI', pi.piId || (pi as any).id)
        } else {
          this.error = 'PI不存在'
          console.error('❌ PI Store: 未找到PI', piId, '可用ID:', this.pis.map((p: any) => p.piId || p.id))
        }
        this.loading = false
      } catch (error) {
        this.error = '获取PI详情失败'
        this.loading = false
      }
    },

    /**
     * PI自动生成算法
     * 根据版本规划和里程碑自动生成PI
     */
    async generatePIs(config: PIGenerateConfig): Promise<PIGenerateResult> {
      this.loading = true
      this.error = null
      
      try {
        const generatedPIs: PI[] = []
        
        // 按里程碑分组版本
        for (const milestone of config.milestones) {
          // 找到对齐到该里程碑的所有版本
          const versionsForMilestone = config.versions.filter(v => 
            v.alignedMilestoneId === milestone.milestoneId
          )
          
          if (versionsForMilestone.length === 0) {
            continue
          }
          
          // 计算PI的迭代范围（所有版本的迭代区间的并集）
          const startIterationNumber = Math.min(...versionsForMilestone.map(v => v.startIterationNumber))
          const endIterationNumber = Math.max(...versionsForMilestone.map(v => v.endIterationNumber))
          const iterationCount = endIterationNumber - startIterationNumber + 1
          const durationWeeks = iterationCount * 2
          
          // 计算日期（简化版）
          const startDate = new Date()
          const endDate = new Date(startDate.getTime() + durationWeeks * 7 * 24 * 60 * 60 * 1000)
          
          // 计算里程碑gap
          const milestoneDate = new Date(milestone.targetDate)
          const milestoneGap = Math.ceil((milestoneDate.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000))
          
          // 判断对齐状态
          let alignmentStatus: 'good' | 'tight' | 'risk' = 'good'
          if (milestoneGap < 14) {
            alignmentStatus = 'risk'
          } else if (milestoneGap < 30) {
            alignmentStatus = 'tight'
          }
          
          // 计算总Story Points
          const totalStoryPoints = versionsForMilestone.reduce((sum, v) => sum + v.totalStoryPoints, 0)
          
          // 生成PI
          const pi: PI = {
            piId: `PI-${Date.now()}-${milestone.milestoneId}`,
            piNumber: `PI-${generatedPIs.length + 1}`,
            piName: `${milestone.milestoneName} PI`,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            startIterationNumber,
            endIterationNumber,
            iterationCount,
            durationWeeks,
            alignedMilestone: {
              milestoneId: milestone.milestoneId,
              milestoneName: milestone.milestoneName,
              targetDate: milestone.targetDate
            },
            milestoneGap,
            alignmentStatus,
            includedVersions: versionsForMilestone.map(v => ({
              versionId: v.versionId,
              productId: '',
              productName: v.productName,
              versionNumber: v.versionNumber,
              completionPercentage: 100,
              storyPoints: v.totalStoryPoints,
              iterationRange: `迭代${v.startIterationNumber}-${v.endIterationNumber}`
            })),
            epicIds: [],
            epicCount: versionsForMilestone.length * 2,  // 简化估算
            totalStoryPoints,
            estimatedFeatures: Math.ceil(totalStoryPoints / 20),  // 简化估算
            status: {
              planningStatus: 'draft',
              piPlanningStatus: 'not-started',
              executionProgress: 0
            },
            isAutoGenerated: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          generatedPIs.push(pi)
        }
        
        // 将生成的PI添加到Store
        this.pis = [...this.pis, ...generatedPIs]
        
        console.log('✅ PI Store: PI自动生成成功', generatedPIs.length)
        this.loading = false
        
        return {
          success: true,
          generatedPIs,
          message: `成功生成${generatedPIs.length}个PI`
        }
      } catch (error) {
        this.error = 'PI生成失败'
        this.loading = false
        console.error('❌ PI Store: 生成失败', error)
        return {
          success: false,
          generatedPIs: [],
          message: 'PI生成失败'
        }
      }
    },

    /**
     * 更新PI
     */
    async updatePI(piData: UpdatePIInput) {
      this.loading = true
      this.error = null
      
      try {
        const index = this.pis.findIndex(p => p.piId === piData.piId)
        if (index !== -1) {
          this.pis[index] = {
            ...this.pis[index],
            ...piData,
            updatedAt: new Date().toISOString()
          }
          console.log('✅ PI Store: PI更新成功', piData.piId)
        }
        this.loading = false
      } catch (error) {
        this.error = '更新PI失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 删除PI
     */
    async deletePI(piId: string) {
      this.loading = true
      this.error = null
      
      try {
        const index = this.pis.findIndex(p => p.piId === piId)
        if (index !== -1) {
          this.pis.splice(index, 1)
          console.log('✅ PI Store: PI删除成功', piId)
        }
        this.loading = false
      } catch (error) {
        this.error = '删除PI失败'
        this.loading = false
        throw error
      }
    },

    /**
     * 设置筛选条件
     */
    setFilters(filters: PIFilter) {
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
      this.pis = []
      this.currentPI = null
      this.loading = false
      this.error = null
      this.filters = {}
    },

    /**
     * 兼容旧API：fetchPIVersions（映射到fetchPIs）
     */
    async fetchPIVersions(projectId?: string) {
      console.log('⚠️ fetchPIVersions is deprecated, use fetchPIs instead')
      // 如果没有传projectId，尝试从pis.json中加载
      if (!projectId && this.pis.length === 0) {
        return await this.fetchPIs()
      }
      return await this.fetchPIs(projectId)
    }
  }
})
