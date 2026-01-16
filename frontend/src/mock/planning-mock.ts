/**
 * 规划协调相关Mock数据生成器 - C3能力域
 */

import type { 
  PIPlanningResult, 
  TeamPlanning,
  SprintPlanning,
  DependencyMatrix,
  FeatureAllocation,
  Risk 
} from '@/types'
import {
  generateId,
  generateCode,
  generateDate,
  randomChoice,
  randomChoices,
  randomInt,
  MOCK_USER_IDS,
  MOCK_TEAM_IDS,
  MOCK_TEAM_NAMES,
  STATUS_OPTIONS,
} from './helpers'

/**
 * 生成Mock Feature分配
 */
export function generateMockFeatureAllocation(featureId: string): FeatureAllocation {
  return {
    featureId,
    featureName: `Feature-${featureId.substring(0, 8)}`,
    storyPoints: randomInt(5, 21),
    sprintIds: [],
    status: randomChoice(STATUS_OPTIONS.requirement),
  }
}

/**
 * 生成Mock团队规划
 */
export function generateMockTeamPlanning(teamId: string): TeamPlanning {
  const capacity = randomInt(60, 100)
  const featureCount = randomInt(2, 5)
  const features: FeatureAllocation[] = []
  let totalLoad = 0
  
  for (let i = 0; i < featureCount; i++) {
    const allocation = generateMockFeatureAllocation(generateId('feat'))
    features.push(allocation)
    totalLoad += allocation.storyPoints
  }
  
  const loadPercentage = Math.round((totalLoad / capacity) * 100)
  
  return {
    teamId,
    teamName: MOCK_TEAM_NAMES[MOCK_TEAM_IDS.indexOf(teamId)] || `团队-${teamId}`,
    features,
    totalLoad,
    capacity,
    loadPercentage,
    risks: [],
    dependencies: [],
  }
}

/**
 * 生成Mock Sprint规划
 */
export function generateMockSprintPlanning(piId: string, sprintNumber: number): SprintPlanning {
  const { startDate, endDate } = {
    startDate: generateDate((sprintNumber - 1) * 14),
    endDate: generateDate(sprintNumber * 14 - 1),
  }
  
  return {
    id: generateId('sprint'),
    piId,
    sprintNumber,
    startDate,
    endDate,
    goal: `Sprint ${sprintNumber} - ${randomChoice(['核心功能开发', '性能优化', '缺陷修复', '集成测试'])}`,
    capacity: randomInt(50, 80),
    plannedStoryPoints: randomInt(40, 75),
    teamAllocations: MOCK_TEAM_IDS.slice(0, 3).map(teamId => ({
      teamId,
      featureIds: [],
      storyPoints: randomInt(10, 25),
    })),
  }
}

/**
 * 生成Mock依赖关系
 */
export function generateMockDependency(index: number = 1): DependencyMatrix {
  const sourceTeamId = randomChoice(MOCK_TEAM_IDS)
  const targetTeamId = randomChoice(MOCK_TEAM_IDS.filter(id => id !== sourceTeamId))
  
  return {
    id: generateId('dep'),
    code: `DEP-${String(index).padStart(3, '0')}`,
    sourceFeatureId: generateId('feat'),
    sourceFeatureName: `Feature-Source-${index}`,
    sourceTeamId,
    sourceTeamName: MOCK_TEAM_NAMES[MOCK_TEAM_IDS.indexOf(sourceTeamId)],
    targetFeatureId: generateId('feat'),
    targetFeatureName: `Feature-Target-${index}`,
    targetTeamId,
    targetTeamName: MOCK_TEAM_NAMES[MOCK_TEAM_IDS.indexOf(targetTeamId)],
    dependencyType: randomChoice(['interface', 'data', 'timing', 'resource']),
    description: `${randomChoice(['接口依赖', '数据依赖', '时序依赖', '资源依赖'])}说明`,
    status: randomChoice(['identified', 'resolved', 'blocking', 'at-risk']),
    criticalPath: Math.random() > 0.7,
    resolveBy: generateDate(randomInt(7, 30)),
    owner: randomChoice(MOCK_USER_IDS),
    notes: '依赖关系备注说明',
  }
}

/**
 * 生成Mock风险
 */
export function generateMockRisk(index: number = 1): Risk {
  return {
    id: generateId('risk'),
    title: `风险-${index}: ${randomChoice(['人力短缺', '技术难点', '外部依赖', '需求变更', '质量问题'])}`,
    description: '风险的详细描述说明',
    type: randomChoice(['resource', 'technical', 'dependency', 'schedule']),
    impact: randomChoice(['high', 'medium', 'low']),
    probability: randomChoice(['high', 'medium', 'low']),
    status: randomChoice(['identified', 'mitigating', 'resolved']),
    owner: randomChoice(MOCK_USER_IDS),
    mitigationPlan: '风险缓解措施计划',
    createdAt: generateDate(-10),
    updatedAt: generateDate(-1),
  }
}

/**
 * 生成Mock PI Planning结果
 */
export function generateMockPIPlanningResult(piId: string): PIPlanningResult {
  const owner = randomChoice(MOCK_USER_IDS)
  
  // 生成团队规划
  const teamPlannings: TeamPlanning[] = MOCK_TEAM_IDS.slice(0, 3).map(teamId => 
    generateMockTeamPlanning(teamId)
  )
  
  // 生成Sprint规划（6个Sprint）
  const sprintPlannings: SprintPlanning[] = Array.from({ length: 6 }, (_, i) => 
    generateMockSprintPlanning(piId, i + 1)
  )
  
  // 生成依赖关系
  const dependencies: DependencyMatrix[] = Array.from({ length: randomInt(3, 8) }, (_, i) => 
    generateMockDependency(i + 1)
  )
  
  // 生成风险
  const risks: Risk[] = Array.from({ length: randomInt(2, 5) }, (_, i) => 
    generateMockRisk(i + 1)
  )
  
  return {
    id: generateId('planning'),
    piId,
    teamPlannings,
    sprintPlannings,
    dependencies,
    risks,
    issues: [],
    status: randomChoice(STATUS_OPTIONS.planning),
    createdAt: generateDate(-15),
    updatedAt: generateDate(-2),
    createdBy: owner,
    updatedBy: owner,
  }
}

/**
 * 生成依赖矩阵
 */
export function generateMockDependencyMatrix(piId: string, teamCount: number = 5): DependencyMatrix[] {
  const dependencies: DependencyMatrix[] = []
  const dependencyCount = randomInt(teamCount, teamCount * 2)
  
  for (let i = 1; i <= dependencyCount; i++) {
    dependencies.push(generateMockDependency(i))
  }
  
  return dependencies
}

/**
 * 批量生成团队规划
 */
export function generateMockTeamPlannings(teamIds: string[]): TeamPlanning[] {
  return teamIds.map(teamId => generateMockTeamPlanning(teamId))
}

/**
 * 批量生成Sprint规划
 */
export function generateMockSprintPlannings(piId: string, sprintCount: number = 6): SprintPlanning[] {
  return Array.from({ length: sprintCount }, (_, i) => 
    generateMockSprintPlanning(piId, i + 1)
  )
}
