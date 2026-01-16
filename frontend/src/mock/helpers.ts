/**
 * Mock数据生成辅助函数
 */

/**
 * 生成随机ID
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 生成随机编码
 */
export function generateCode(prefix: string, index?: number): string {
  if (index !== undefined) {
    return `${prefix}-${String(index).padStart(4, '0')}`
  }
  return `${prefix}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
}

/**
 * 生成随机日期
 */
export function generateDate(daysOffset: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString()
}

/**
 * 生成随机日期范围
 */
export function generateDateRange(startDaysOffset: number, endDaysOffset: number): { startDate: string; endDate: string } {
  return {
    startDate: generateDate(startDaysOffset),
    endDate: generateDate(endDaysOffset),
  }
}

/**
 * 从数组中随机选择一个元素
 */
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * 从数组中随机选择多个元素
 */
export function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, array.length))
}

/**
 * 生成随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成随机字符串
 */
export function randomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, 2 + length)
}

/**
 * 模拟用户ID列表
 */
export const MOCK_USER_IDS = [
  'user-001',
  'user-002',
  'user-003',
  'user-004',
  'user-005',
  'user-006',
  'user-007',
  'user-008',
  'user-009',
  'user-010',
]

/**
 * 模拟用户名列表
 */
export const MOCK_USER_NAMES = [
  '张三',
  '李四',
  '王五',
  '赵六',
  '钱七',
  '孙八',
  '周九',
  '吴十',
  '郑十一',
  '王十二',
]

/**
 * 模拟团队ID列表
 */
export const MOCK_TEAM_IDS = [
  'team-001',
  'team-002',
  'team-003',
  'team-004',
  'team-005',
]

/**
 * 模拟团队名称列表
 */
export const MOCK_TEAM_NAMES = [
  '智能驾驶团队',
  '智能座舱团队',
  'EE架构团队',
  '底盘团队',
  '新能源团队',
]

/**
 * 状态选项
 */
export const STATUS_OPTIONS = {
  project: ['planning', 'active', 'on-hold', 'completed', 'cancelled'] as const,
  requirement: ['backlog', 'analysis', 'ready', 'in-progress', 'done', 'cancelled'] as const,
  task: ['todo', 'in-progress', 'review', 'done', 'blocked'] as const,
  pi: ['planning', 'committed', 'in-progress', 'completed', 'cancelled'] as const,
  planning: ['draft', 'committed', 'adjusted', 'locked'] as const,
}

/**
 * 优先级选项
 */
export const PRIORITY_OPTIONS = ['P0', 'P1', 'P2', 'P3', 'P4'] as const

/**
 * 复杂度选项
 */
export const COMPLEXITY_OPTIONS = ['low', 'medium', 'high', 'very-high'] as const

/**
 * 领域选项
 */
export const DOMAIN_OPTIONS = [
  '智能驾驶',
  '智能座舱',
  'EE架构',
  '底盘',
  '新能源',
] as const

/**
 * 产品线选项
 */
export const PRODUCT_LINE_OPTIONS = [
  '自动驾驶产品线',
  '座舱产品线',
  '域控产品线',
  '底盘电控产品线',
  '电池管理产品线',
] as const
