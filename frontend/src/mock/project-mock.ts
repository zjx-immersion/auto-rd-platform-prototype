/**
 * 项目相关Mock数据生成器 - C0能力域
 */

import type { Project, Version, PI, PIVersion, Team, User } from '@/types'
import {
  generateId,
  generateCode,
  generateDate,
  generateDateRange,
  randomChoice,
  randomChoices,
  randomInt,
  MOCK_USER_IDS,
  MOCK_USER_NAMES,
  MOCK_TEAM_IDS,
  MOCK_TEAM_NAMES,
  STATUS_OPTIONS,
  DOMAIN_OPTIONS,
} from './helpers'

/**
 * 生成Mock项目数据
 */
export function generateMockProject(index: number = 1): Project {
  const domain = randomChoice(DOMAIN_OPTIONS)
  const { startDate, endDate } = generateDateRange(-30, 365)
  const owner = randomChoice(MOCK_USER_IDS)
  
  return {
    id: generateId('proj'),
    code: generateCode('PROJ', index),
    name: `${domain}领域项目 ${index}`,
    domain,
    description: `${domain}领域的端到端研发协同项目，覆盖从需求到交付的全流程`,
    type: 'domain',
    vehicleModels: [
      {
        modelName: `车型${String.fromCharCode(64 + index)}`,
        planDate: generateDate(30),
        deliveryNodes: [
          { nodeName: 'SOP', date: generateDate(180) },
          { nodeName: 'MP', date: generateDate(365) },
        ],
      },
    ],
    stakeholders: randomChoices(MOCK_USER_IDS, 3),
    startDate,
    endDate,
    status: randomChoice(STATUS_OPTIONS.project),
    owner,
    teamIds: randomChoices(MOCK_TEAM_IDS, 2),
    versionIds: [],
    piIds: [],
    tags: [domain, '高优先级'],
    createdAt: generateDate(-90),
    updatedAt: generateDate(-10),
    createdBy: owner,
    updatedBy: owner,
  }
}

/**
 * 生成Mock版本数据
 */
export function generateMockVersion(projectId: string, index: number = 1): Version {
  const { startDate, endDate } = generateDateRange(0, 180)
  const owner = randomChoice(MOCK_USER_IDS)
  
  return {
    id: generateId('ver'),
    code: `V${index}.0`,
    name: `版本 ${index}.0`,
    projectId,
    description: `产品版本 ${index}.0，包含多个重要特性`,
    targetDate: endDate,
    milestones: [
      { name: '需求评审', date: generateDate(30), status: 'completed' },
      { name: '设计完成', date: generateDate(60), status: 'in-progress' },
      { name: '开发完成', date: generateDate(120), status: 'pending' },
      { name: '测试完成', date: generateDate(150), status: 'pending' },
      { name: '发布', date: generateDate(180), status: 'pending' },
    ],
    epics: [],
    features: [],
    status: 'planning',
    progress: randomInt(10, 40),
    owner,
    tags: ['主版本', 'Q1交付'],
    createdAt: generateDate(-60),
    updatedAt: generateDate(-5),
    createdBy: owner,
    updatedBy: owner,
  }
}

/**
 * 生成Mock PI数据
 */
export function generateMockPI(projectId: string, index: number = 1): PIVersion {
  const { startDate, endDate } = generateDateRange(0, 84) // 12周 = 84天
  const owner = randomChoice(MOCK_USER_IDS)
  const sprintCount = 6
  const committedStoryPoints = randomInt(100, 200)
  const completedStoryPoints = randomInt(80, committedStoryPoints)
  
  return {
    id: generateId('pi'),
    code: `PI-${index}`,
    name: `PI ${index}`,
    startDate,
    endDate,
    sprintCount,
    sprintDuration: 14,
    projectIds: [projectId],
    objectives: [
      {
        id: generateId('obj'),
        description: `完成${randomChoice(['自动泊车', 'NOA', 'HWP', 'APA'])}核心功能`,
        businessValue: randomInt(5, 10),
        status: randomChoice(['committed', 'in-progress', 'at-risk', 'achieved']),
        owner,
      },
      {
        id: generateId('obj'),
        description: `优化系统性能，提升${randomInt(20, 50)}%`,
        businessValue: randomInt(3, 8),
        status: randomChoice(['committed', 'in-progress', 'achieved']),
        owner,
      },
    ],
    epicIds: [],
    featureIds: [],
    teams: randomChoices(MOCK_TEAM_IDS, 3).map((teamId, idx) => ({
      teamId,
      teamName: MOCK_TEAM_NAMES[MOCK_TEAM_IDS.indexOf(teamId)],
      capacity: randomInt(60, 100),
      plannedStoryPoints: randomInt(50, 90),
    })),
    status: randomChoice(STATUS_OPTIONS.pi),
    committedStoryPoints,
    completedStoryPoints: index < 3 ? completedStoryPoints : undefined,
    commitmentRate: index < 3 ? Math.round((completedStoryPoints / committedStoryPoints) * 100) : undefined,
    risks: [
      {
        id: generateId('risk'),
        title: `${randomChoice(['人力', '技术', '依赖', '质量'])}风险`,
        description: '风险描述说明',
        type: randomChoice(['resource', 'technical', 'dependency', 'schedule']),
        impact: randomChoice(['high', 'medium', 'low']),
        probability: randomChoice(['high', 'medium', 'low']),
        status: randomChoice(['identified', 'mitigating', 'resolved']),
        owner,
        mitigationPlan: '缓解措施计划',
      },
    ],
    owner,
    notes: `PI ${index} 的规划说明和备注`,
    createdAt: generateDate(-70),
    updatedAt: generateDate(-3),
    createdBy: owner,
    updatedBy: owner,
  }
}

/**
 * 生成Mock团队数据
 */
export function generateMockTeam(index: number = 1): Team {
  return {
    id: MOCK_TEAM_IDS[index - 1] || generateId('team'),
    name: MOCK_TEAM_NAMES[index - 1] || `团队${index}`,
    type: randomChoice(['feature', 'component', 'platform']),
    domain: randomChoice(DOMAIN_OPTIONS),
    members: randomChoices(MOCK_USER_IDS, randomInt(5, 8)),
    lead: randomChoice(MOCK_USER_IDS),
    capacity: randomInt(60, 100),
    skills: randomChoices(['C++', 'Python', 'Java', 'Rust', 'Autosar', 'ROS', 'Qt'], 3),
    tags: [randomChoice(DOMAIN_OPTIONS), '敏捷团队'],
  }
}

/**
 * 生成Mock用户数据
 */
export function generateMockUser(index: number = 1): User {
  const userId = MOCK_USER_IDS[index - 1] || generateId('user')
  const userName = MOCK_USER_NAMES[index - 1] || `用户${index}`
  
  return {
    id: userId,
    username: userName,
    name: userName,
    email: `${userId}@example.com`,
    role: randomChoice(['admin', 'pm', 'developer', 'tester', 'po']),
    teamIds: randomChoices(MOCK_TEAM_IDS, 2),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`,
    createdAt: generateDate(-180),
    updatedAt: generateDate(-10),
  }
}

/**
 * 批量生成项目数据
 */
export function generateMockProjects(count: number = 5): Project[] {
  return Array.from({ length: count }, (_, i) => generateMockProject(i + 1))
}

/**
 * 批量生成版本数据
 */
export function generateMockVersions(projectId: string, count: number = 3): Version[] {
  return Array.from({ length: count }, (_, i) => generateMockVersion(projectId, i + 1))
}

/**
 * 批量生成PI数据
 */
export function generateMockPIs(projectId: string, count: number = 4): PIVersion[] {
  return Array.from({ length: count }, (_, i) => generateMockPI(projectId, i + 1))
}

/**
 * 批量生成团队数据
 */
export function generateMockTeams(count: number = 5): Team[] {
  return Array.from({ length: count }, (_, i) => generateMockTeam(i + 1))
}

/**
 * 批量生成用户数据
 */
export function generateMockUsers(count: number = 10): User[] {
  return Array.from({ length: count }, (_, i) => generateMockUser(i + 1))
}
