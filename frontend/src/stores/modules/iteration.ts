/**
 * 迭代管理 Store
 */

import { defineStore } from 'pinia'
import type { Iteration } from '@/types/project'
import iterationsData from '@/mock/iterations.json'

interface IterationState {
  iterations: Iteration[]
  projectId: string
  loading: boolean
  error: string | null
}

export const useIterationStore = defineStore('iteration', {
  state: (): IterationState => ({
    iterations: [],
    projectId: '',
    loading: false,
    error: null
  }),

  getters: {
    /**
     * 根据迭代号获取迭代
     */
    getIterationByNumber: (state) => (iterationNumber: number): Iteration | undefined => {
      return state.iterations.find(i => i.iterationNumber === iterationNumber)
    },

    /**
     * 获取迭代区间
     */
    getIterationRange: (state) => (start: number, end: number): Iteration[] => {
      return state.iterations.filter(i => 
        i.iterationNumber >= start && i.iterationNumber <= end
      )
    },

    /**
     * 获取总迭代数
     */
    totalIterations: (state): number => {
      return state.iterations.length
    },

    /**
     * 获取项目开始日期
     */
    projectStartDate: (state): string => {
      return state.iterations.length > 0 ? state.iterations[0].startDate : ''
    },

    /**
     * 获取项目结束日期
     */
    projectEndDate: (state): string => {
      return state.iterations.length > 0 
        ? state.iterations[state.iterations.length - 1].endDate 
        : ''
    }
  },

  actions: {
    /**
     * 获取迭代列表
     */
    async fetchIterations(projectId: string) {
      this.loading = true
      this.error = null
      
      try {
        // 从Mock数据加载
        if (iterationsData.projectId === projectId) {
          this.iterations = iterationsData.iterations as Iteration[]
          this.projectId = projectId
          console.log('✅ Iteration Store: 已加载迭代数据', this.iterations.length)
        } else {
          this.iterations = []
          this.projectId = ''
          console.warn('⚠️ Iteration Store: 未找到项目的迭代数据', projectId)
        }
        this.loading = false
      } catch (error) {
        this.error = '获取迭代列表失败'
        this.loading = false
        console.error('❌ Iteration Store: 加载失败', error)
      }
    },

    /**
     * 计算日期范围对应的迭代范围
     */
    getIterationsByDateRange(startDate: string, endDate: string): Iteration[] {
      return this.iterations.filter(i => {
        const iterStart = new Date(i.startDate)
        const iterEnd = new Date(i.endDate)
        const start = new Date(startDate)
        const end = new Date(endDate)
        
        return (iterStart <= end && iterEnd >= start)
      })
    },

    /**
     * 根据迭代号计算日期
     */
    getDateByIterationNumber(iterationNumber: number): { startDate: string; endDate: string } | null {
      const iteration = this.getIterationByNumber(iterationNumber)
      return iteration ? {
        startDate: iteration.startDate,
        endDate: iteration.endDate
      } : null
    },

    /**
     * 重置Store
     */
    reset() {
      this.iterations = []
      this.projectId = ''
      this.loading = false
      this.error = null
    }
  }
})
