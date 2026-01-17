/**
 * 查询引擎
 * 支持复杂的数据查询和筛选
 */

import { dataLoader } from './DataLoader'

export interface QueryOptions {
  filters?: Record<string, any>
  sort?: { field: string; order: 'asc' | 'desc' }
  pagination?: { page: number; pageSize: number }
  search?: { fields: string[]; keyword: string }
}

export interface QueryResult<T> {
  data: T[]
  total: number
  page?: number
  pageSize?: number
}

export class QueryEngine {
  /**
   * 通用查询方法
   */
  query<T = any>(datasetName: string, options: QueryOptions = {}): QueryResult<T> {
    let data = dataLoader.getDataset<T>(datasetName)

    // 应用筛选
    if (options.filters) {
      data = this.applyFilters(data, options.filters)
    }

    // 应用搜索
    if (options.search) {
      data = this.applySearch(data, options.search)
    }

    // 应用排序
    if (options.sort) {
      data = this.applySort(data, options.sort)
    }

    const total = data.length

    // 应用分页
    if (options.pagination) {
      data = this.applyPagination(data, options.pagination)
    }

    return {
      data,
      total,
      page: options.pagination?.page,
      pageSize: options.pagination?.pageSize
    }
  }

  /**
   * 应用筛选条件
   */
  private applyFilters<T>(data: T[], filters: Record<string, any>): T[] {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return true
        }
        
        const itemValue = (item as any)[key]
        
        // 支持数组包含查询
        if (Array.isArray(value)) {
          return value.includes(itemValue)
        }
        
        // 支持模糊查询（字符串）
        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase())
        }
        
        // 精确匹配
        return itemValue === value
      })
    })
  }

  /**
   * 应用搜索
   */
  private applySearch<T>(
    data: T[],
    search: { fields: string[]; keyword: string }
  ): T[] {
    if (!search.keyword) return data
    
    const keyword = search.keyword.toLowerCase()
    
    return data.filter(item => {
      return search.fields.some(field => {
        const value = (item as any)[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(keyword)
        }
        return false
      })
    })
  }

  /**
   * 应用排序
   */
  private applySort<T>(
    data: T[], 
    sort: { field: string; order: 'asc' | 'desc' }
  ): T[] {
    return [...data].sort((a, b) => {
      const aValue = (a as any)[sort.field]
      const bValue = (b as any)[sort.field]
      
      if (aValue < bValue) return sort.order === 'asc' ? -1 : 1
      if (aValue > bValue) return sort.order === 'asc' ? 1 : -1
      return 0
    })
  }

  /**
   * 应用分页
   */
  private applyPagination<T>(
    data: T[],
    pagination: { page: number; pageSize: number }
  ): T[] {
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return data.slice(start, end)
  }

  /**
   * 聚合查询 - 计数
   */
  count(datasetName: string, filters?: Record<string, any>): number {
    const result = this.query(datasetName, { filters })
    return result.total
  }

  /**
   * 聚合查询 - 分组
   */
  groupBy<T = any>(
    datasetName: string,
    groupByField: string,
    filters?: Record<string, any>
  ): Record<string, T[]> {
    const result = this.query<T>(datasetName, { filters })
    const groups: Record<string, T[]> = {}
    
    result.data.forEach(item => {
      const key = (item as any)[groupByField]
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
    })
    
    return groups
  }
}

// 单例
export const queryEngine = new QueryEngine()
