/**
 * 团队管理相关类型定义
 */

// 团队成员角色
export type TeamMemberRole = 'Team Lead' | 'Developer' | 'QA' | 'Architect' | 'UI/UX' | 'Other'

// 团队状态
export type TeamStatus = 'active' | 'inactive' | 'disbanded'

// 团队成员
export interface TeamMember {
  userId: string
  userName: string
  email: string
  role: TeamMemberRole
  joinedAt: string
}

// 团队统计信息
export interface TeamStatistics {
  totalMembers: number
  activeProjects: number
  currentLoad: number  // 当前负载百分比
  averageCapacityPerPerson: number
}

// 团队
export interface Team {
  teamId: string
  teamName: string
  teamCode: string  // 如: TEAM-ADAS
  domain: string    // 所属领域：智能驾驶、智能座舱、EEA等
  description?: string
  
  // 负责人
  teamLeadId: string
  teamLeadName: string
  
  // 容量
  capacityPerIteration: number  // SP/迭代
  teamSize: number
  
  // 成员
  members: TeamMember[]
  
  // 状态
  status: TeamStatus
  
  // 统计
  statistics: TeamStatistics
  
  // 元数据
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 创建团队输入
export interface CreateTeamInput {
  teamName: string
  teamCode: string
  domain: string
  teamLeadId: string
  teamLeadName: string
  capacityPerIteration: number
  teamSize?: number
  description?: string
}

// 更新团队输入
export interface UpdateTeamInput {
  teamId: string
  teamName?: string
  teamLeadId?: string
  teamLeadName?: string
  capacityPerIteration?: number
  teamSize?: number
  description?: string
}

// 添加成员输入
export interface AddMemberInput {
  teamId: string
  userId: string
  userName: string
  email: string
  role: TeamMemberRole
}

// 团队筛选条件
export interface TeamFilter {
  domain?: string
  status?: TeamStatus
  search?: string
}
