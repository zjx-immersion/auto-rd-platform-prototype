/**
 * 类型定义统一导出
 * 
 * 组织结构：
 * - domain-models.ts：核心领域模型（C0-C3）
 * - execution-models.ts：执行与交付模型（C4-C6）
 * - analytics-models.ts：分析与治理模型（C7）
 * - entities.ts：UI组件相关的实体类型
 */

// 导出核心领域模型
export * from './domain-models'

// 导出执行与交付模型
export * from './execution-models'

// 导出分析与治理模型
export * from './analytics-models'

// 导出UI实体（如果存在）
export * from './entities'

// ============================================================================
// 类型守卫（Type Guards）
// ============================================================================

import type {
  Epic, Feature, SSTS, MR,
  DomainProject, PIVersion,
  Task, Sprint,
  TestCase, Defect,
  Build, Release
} from './domain-models'

/**
 * 检查是否为Epic
 */
export function isEpic(obj: any): obj is Epic {
  return obj && obj.code && obj.code.startsWith('EPIC-')
}

/**
 * 检查是否为Feature
 */
export function isFeature(obj: any): obj is Feature {
  return obj && obj.code && obj.code.startsWith('FEAT-')
}

/**
 * 检查是否为SSTS
 */
export function isSTS(obj: any): obj is SSTS {
  return obj && obj.code && obj.code.startsWith('SSTS-')
}

/**
 * 检查是否为MR
 */
export function isMR(obj: any): obj is MR {
  return obj && obj.code && obj.code.startsWith('MR-')
}

/**
 * 检查是否为Task
 */
export function isTask(obj: any): obj is Task {
  return obj && obj.code && obj.code.startsWith('TASK-')
}

// ============================================================================
// 常量定义
// ============================================================================

/**
 * 领域常量
 */
export const DOMAINS = {
  INTELLIGENT_DRIVING: 'intelligent-driving',
  SMART_COCKPIT: 'smart-cockpit',
  EE_ARCHITECTURE: 'e-e-architecture',
  CHASSIS_CONTROL: 'chassis-control',
  NEW_ENERGY: 'new-energy',
} as const

/**
 * 领域显示名称
 */
export const DOMAIN_LABELS: Record<string, string> = {
  [DOMAINS.INTELLIGENT_DRIVING]: '智能驾驶',
  [DOMAINS.SMART_COCKPIT]: '智能座舱',
  [DOMAINS.EE_ARCHITECTURE]: '电子电器架构',
  [DOMAINS.CHASSIS_CONTROL]: '底盘控制',
  [DOMAINS.NEW_ENERGY]: '新能源',
}

/**
 * 优先级常量
 */
export const PRIORITIES = {
  P0: 'P0',
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
} as const

/**
 * 优先级显示名称和颜色
 */
export const PRIORITY_CONFIG = {
  P0: { label: 'P0-紧急', color: '#f56c6c', level: 4 },
  P1: { label: 'P1-高', color: '#e6a23c', level: 3 },
  P2: { label: 'P2-中', color: '#409eff', level: 2 },
  P3: { label: 'P3-低', color: '#909399', level: 1 },
}

/**
 * MoSCoW优先级
 */
export const MOSCOW = {
  MUST: 'Must',
  SHOULD: 'Should',
  COULD: 'Could',
  WONT: 'Wont',
} as const

/**
 * 价值流阶段
 */
export const VALUE_STREAM_STAGES = {
  S1: 'S1_market_insight',
  S2: 'S2_requirement_breakdown',
  S3: 'S3_asset_planning',
  S4: 'S4_project_initiation',
  S5: 'S5_iteration_dev',
  S6: 'S6_integration_test',
  S7: 'S7_acceptance_test',
  S8: 'S8_artifact_promotion',
  S9: 'S9_product_delivery',
} as const

/**
 * 价值流阶段显示名称
 */
export const VALUE_STREAM_STAGE_LABELS: Record<string, string> = {
  [VALUE_STREAM_STAGES.S1]: 'S1: 市场洞察',
  [VALUE_STREAM_STAGES.S2]: 'S2: 需求分解',
  [VALUE_STREAM_STAGES.S3]: 'S3: 资产规划',
  [VALUE_STREAM_STAGES.S4]: 'S4: 项目立项',
  [VALUE_STREAM_STAGES.S5]: 'S5: 迭代开发',
  [VALUE_STREAM_STAGES.S6]: 'S6: 集成验证',
  [VALUE_STREAM_STAGES.S7]: 'S7: 测试验收',
  [VALUE_STREAM_STAGES.S8]: 'S8: 制品晋级',
  [VALUE_STREAM_STAGES.S9]: 'S9: 产品交付',
}

/**
 * 能力域
 */
export const CAPABILITY_DOMAINS = {
  C0: 'C0_project_mgmt',
  C1: 'C1_requirement_mgmt',
  C2: 'C2_product_mgmt',
  C3: 'C3_planning_coord',
  C4: 'C4_iteration_exec',
  C5: 'C5_test_acceptance',
  C6: 'C6_devops_delivery',
  C7: 'C7_analytics_governance',
} as const

/**
 * 能力域显示名称
 */
export const CAPABILITY_DOMAIN_LABELS: Record<string, string> = {
  [CAPABILITY_DOMAINS.C0]: 'C0: 领域项目管理',
  [CAPABILITY_DOMAINS.C1]: 'C1: 需求管理',
  [CAPABILITY_DOMAINS.C2]: 'C2: 产品管理（资产）',
  [CAPABILITY_DOMAINS.C3]: 'C3: 规划协调',
  [CAPABILITY_DOMAINS.C4]: 'C4: 迭代执行',
  [CAPABILITY_DOMAINS.C5]: 'C5: 测试验收',
  [CAPABILITY_DOMAINS.C6]: 'C6: DevOps交付',
  [CAPABILITY_DOMAINS.C7]: 'C7: 分析与治理',
}

/**
 * 资产成熟度等级
 */
export const MATURITY_LEVELS = {
  L1: 'L1',
  L2: 'L2',
  L3: 'L3',
  L4: 'L4',
  L5: 'L5',
} as const

/**
 * 成熟度等级配置
 */
export const MATURITY_LEVEL_CONFIG = {
  L1: { label: 'L1-初始级', color: '#f56c6c', reuseRate: 0 },
  L2: { label: 'L2-可用级', color: '#e6a23c', reuseRate: 20 },
  L3: { label: 'L3-稳定级', color: '#f9a825', reuseRate: 50 },
  L4: { label: 'L4-优化级', color: '#67c23a', reuseRate: 70 },
  L5: { label: 'L5-卓越级', color: '#409eff', reuseRate: 90 },
}

/**
 * Task状态
 */
export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  CODE_REVIEW: 'CODE_REVIEW',
  TESTING: 'TESTING',
  BLOCKED: 'BLOCKED',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
} as const

/**
 * Task状态显示配置
 */
export const TASK_STATUS_CONFIG = {
  TODO: { label: '待办', color: '#909399' },
  IN_PROGRESS: { label: '开发中', color: '#409eff' },
  CODE_REVIEW: { label: '代码评审', color: '#e6a23c' },
  TESTING: { label: '测试中', color: '#f9a825' },
  BLOCKED: { label: '阻塞', color: '#f56c6c' },
  DONE: { label: '完成', color: '#67c23a' },
  CANCELLED: { label: '取消', color: '#909399' },
}

/**
 * 状态流转规则
 * 定义Task状态的允许流转路径
 */
export const TASK_STATUS_TRANSITIONS: Record<string, string[]> = {
  TODO: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['CODE_REVIEW', 'BLOCKED', 'CANCELLED'],
  CODE_REVIEW: ['TESTING', 'IN_PROGRESS', 'BLOCKED'],
  TESTING: ['DONE', 'IN_PROGRESS', 'BLOCKED'],
  BLOCKED: ['IN_PROGRESS', 'CANCELLED'],
  DONE: [],                            // 完成状态不允许流转
  CANCELLED: [],                       // 取消状态不允许流转
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 获取需求层级
 */
export function getRequirementLevel(type: 'Epic' | 'Feature' | 'SSTS' | 'MR' | 'Task'): number {
  const levels = {
    Epic: 1,
    Feature: 2,
    SSTS: 2,
    MR: 3,
    Task: 4,
  }
  return levels[type]
}

/**
 * 检查Task状态流转是否允许
 */
export function isTaskStatusTransitionAllowed(from: string, to: string): boolean {
  const allowedTransitions = TASK_STATUS_TRANSITIONS[from] || []
  return allowedTransitions.includes(to)
}

/**
 * 计算周期时间（天）
 */
export function calculateCycleTime(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * 格式化日期为ISO字符串
 */
export function toISODate(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString()
  }
  return date.toISOString()
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 7)
  return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`
}
