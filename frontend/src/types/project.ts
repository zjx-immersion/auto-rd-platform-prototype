/**
 * 项目管理相关类型定义
 */

// 项目状态
export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'paused'

// 里程碑
export interface Milestone {
  milestoneId: string
  milestoneName: string
  milestoneCode: string
  milestoneType: 'EP' | 'PP' | 'SOP' | 'Alpha' | 'Beta' | 'RC' | 'Release' | 'Other'
  targetDate: string
  iterationNumber?: number
  deliverableType?: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed' | 'delayed'
  createdAt: string
}

// 迭代
export interface Iteration {
  iterationNumber: number
  startDate: string
  endDate: string
  durationWeeks: number
}

// 项目统计
export interface ProjectStatistics {
  totalVersions: number
  totalEpics: number
  totalStoryPoints: number
  completedStoryPoints: number
  totalPIs: number
}

// 领域项目
export interface DomainProject {
  id: string
  name: string
  code: string
  domain: string
  vehicleModel?: string
  description?: string
  owner: string
  ownerName?: string
  startDate: string
  endDate: string
  status: ProjectStatus
  progress?: number
  
  // 迭代配置
  iterationWeeks: number
  totalIterations: number
  
  // 关联数据
  milestones: Milestone[]
  teamIds: string[]
  tags?: string[]
  
  // 统计信息
  statistics?: ProjectStatistics
  
  // 元数据
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 创建项目输入
export interface CreateProjectInput {
  name: string
  code: string
  domain: string
  vehicleModel?: string
  description?: string
  owner: string
  startDate: string
  endDate: string
  status?: ProjectStatus
  iterationWeeks?: number
  milestones?: Milestone[]
  teamIds?: string[]
  tags?: string[]
}

// 更新项目输入
export interface UpdateProjectInput {
  id: string
  name?: string
  description?: string
  owner?: string
  startDate?: string
  endDate?: string
  status?: ProjectStatus
  milestones?: Milestone[]
  teamIds?: string[]
  tags?: string[]
}

// 项目筛选条件
export interface ProjectFilter {
  status?: ProjectStatus
  domain?: string
  owner?: string
  keyword?: string
}

// 迭代轴配置
export interface IterationAxisConfig {
  projectId: string
  totalIterations: number
  iterationWeeks: number
  startDate: string
  iterations: Iteration[]
}
