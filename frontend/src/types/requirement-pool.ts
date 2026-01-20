/**
 * 需求池相关类型定义
 * C0能力域: 领域项目管理 - 需求池
 */

import type { Epic, Priority } from './domain-models'

/**
 * Epic分配状态
 */
export enum EpicAllocationStatus {
  UNALLOCATED = 'unallocated',   // 未分配
  ALLOCATED = 'allocated',       // 已分配
  COMPLETED = 'completed'        // 已完成
}

/**
 * Epic分配记录
 */
export interface EpicAllocationRecord {
  allocationId: string
  epicId: string
  projectId: string
  projectName: string
  allocatedAt: string
  allocatedBy: string
}

/**
 * 需求池Epic (扩展Epic类型)
 */
export interface PoolEpic extends Epic {
  // 分配状态
  allocationStatus: EpicAllocationStatus
  
  // 分配记录
  allocations: EpicAllocationRecord[]
  
  // 是否已分配到当前项目
  isAllocatedToCurrentProject?: boolean
}

/**
 * 需求池
 */
export interface RequirementPool {
  poolId: string
  poolName: string
  organizationId: string
  
  // Epic列表
  epics: PoolEpic[]
  
  // 统计
  stats: {
    totalEpics: number
    unallocated: number
    allocated: number
    completed: number
  }
  
  createdAt: string
  updatedAt: string
}

/**
 * 需求池筛选器
 */
export interface PoolFilter {
  status: EpicAllocationStatus[]
  priority: Priority[]
  domain: string[]
  searchText: string
}

/**
 * Epic分配到项目的输入
 */
export interface AllocateEpicToProjectInput {
  epicId: string
  projectId: string
  projectName: string
  allocatedBy: string
}

/**
 * 批量分配Epic到项目的输入
 */
export interface BatchAllocateEpicsInput {
  epicIds: string[]
  projectId: string
  projectName: string
  allocatedBy: string
}
