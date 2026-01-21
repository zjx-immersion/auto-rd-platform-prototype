/**
 * 版本管理相关类型定义
 */

// 版本类型
export type VersionType = 'major' | 'minor' | 'patch'

// 版本状态
export type VersionStatus = 'planning' | 'in-progress' | 'completed' | 'released'

// 里程碑对齐状态
export type AlignmentStatus = 'good' | 'tight' | 'risk'

// Epic分配
export interface EpicAllocation {
  epicId: string
  epicName: string
  epicTotalSP: number
  completionPercentage: number
  allocatedSP: number
}

// 产品版本
export interface ProductVersion {
  versionId: string
  productId: string
  productName: string
  productCode: string
  productLine: string
  
  versionNumber: string
  versionName: string
  versionType: VersionType
  
  // 迭代映射
  startIterationNumber: number
  endIterationNumber: number
  iterationCount: number
  durationWeeks: number
  startDate: string
  endDate: string
  
  // 里程碑对齐
  alignedMilestoneId: string
  alignedMilestoneName: string
  milestoneDate: string
  milestoneGap: number  // 版本结束日期与里程碑目标日期之间的天数差
  alignmentStatus: AlignmentStatus
  
  // Epic分配
  epicAllocations: EpicAllocation[]
  totalStoryPoints: number
  
  // 状态
  status: VersionStatus
  
  // 元数据
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 创建版本输入
export interface CreateVersionInput {
  productId: string
  productName: string
  productCode: string
  productLine: string
  versionNumber: string
  versionName: string
  versionType: VersionType
  startIterationNumber: number
  endIterationNumber: number
  alignedMilestoneId: string
  epicAllocations?: EpicAllocation[]
}

// 更新版本输入
export interface UpdateVersionInput {
  versionId: string
  versionName?: string
  startIterationNumber?: number
  endIterationNumber?: number
  alignedMilestoneId?: string
  epicAllocations?: EpicAllocation[]
  status?: VersionStatus
}

// 版本筛选条件
export interface VersionFilter {
  projectId?: string
  productId?: string
  productLine?: string
  status?: VersionStatus
  alignedMilestoneId?: string
}
