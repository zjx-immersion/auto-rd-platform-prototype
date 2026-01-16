/**
 * 需求相关Mock数据生成器 - C1能力域
 */

import type { Epic, Feature, SSTS, MR } from '@/types'
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
  PRIORITY_OPTIONS,
  COMPLEXITY_OPTIONS,
  PRODUCT_LINE_OPTIONS,
} from './helpers'

/**
 * Epic标题模板
 */
const EPIC_TITLES = [
  '自动泊车功能完善',
  'NOA高速自动驾驶',
  '智能座舱语音助手升级',
  '车辆健康管理系统',
  '电池热管理优化',
  '底盘域控制器集成',
  'OTA升级能力建设',
  '网络安全防护加固',
]

/**
 * Feature标题模板
 */
const FEATURE_TITLES = [
  '垂直泊车入位',
  '平行泊车入位',
  '记忆泊车',
  '遥控泊车',
  '高速巡航',
  '自动变道',
  '匝道汇入',
  '语音唤醒',
  '多轮对话',
  '场景推荐',
]

/**
 * 生成Mock Epic数据
 */
export function generateMockEpic(projectId: string, index: number = 1): Epic {
  const owner = randomChoice(MOCK_USER_IDS)
  const storyPoints = randomInt(50, 200)
  const completedStoryPoints = randomInt(0, storyPoints)
  
  return {
    id: generateId('epic'),
    code: generateCode('EPIC', index),
    title: randomChoice(EPIC_TITLES),
    projectId,
    description: '这是一个重要的Epic，包含多个Feature和价值交付',
    businessValue: `为用户提供${randomChoice(['更好的', '更智能的', '更安全的', '更便捷的'])}体验`,
    acceptanceCriteria: [
      '功能验收标准1：符合产品需求规格',
      '功能验收标准2：通过所有测试用例',
      '功能验收标准3：性能达标',
    ],
    featureIds: [],
    priority: randomChoice(PRIORITY_OPTIONS),
    storyPoints,
    completedStoryPoints,
    progress: Math.round((completedStoryPoints / storyPoints) * 100),
    status: randomChoice(STATUS_OPTIONS.requirement),
    targetVersion: '',
    targetPI: '',
    owner,
    stakeholders: randomChoices(MOCK_USER_IDS, 2),
    tags: ['高价值', randomChoice(['Q1', 'Q2', 'Q3', 'Q4'])],
    createdAt: generateDate(-60),
    updatedAt: generateDate(-5),
    createdBy: owner,
    updatedBy: owner,
  }
}

/**
 * 生成Mock Feature数据
 */
export function generateMockFeature(epicId: string, index: number = 1): Feature {
  const owner = randomChoice(MOCK_USER_IDS)
  const storyPoints = randomInt(8, 34)
  
  return {
    id: generateId('feat'),
    code: generateCode('FEAT', index),
    title: randomChoice(FEATURE_TITLES),
    epicId,
    productLine: randomChoice(PRODUCT_LINE_OPTIONS),
    product: `产品${randomInt(1, 5)}`,
    featureAssetId: Math.random() > 0.7 ? generateId('asset') : undefined,
    prd: {
      content: '# PRD文档\n\n## 背景\n\n## 目标\n\n## 功能描述\n\n## 验收标准',
      version: 'v1.0',
      status: randomChoice(['draft', 'review', 'approved']),
      attachments: [],
    },
    acceptanceCriteria: [
      '验收标准1：功能完整',
      '验收标准2：性能达标',
      '验收标准3：通过测试',
    ],
    sstsIds: [],
    targetPI: '',
    status: randomChoice(STATUS_OPTIONS.requirement),
    owner,
    storyPoints,
    complexity: randomChoice(COMPLEXITY_OPTIONS),
    tags: [randomChoice(['核心功能', '优化', '新增', '重构'])],
    createdAt: generateDate(-45),
    updatedAt: generateDate(-3),
    createdBy: owner,
    updatedBy: owner,
  }
}

/**
 * 生成Mock SSTS数据
 */
export function generateMockSSTS(featureId: string, index: number = 1): SSTS {
  const owner = randomChoice(MOCK_USER_IDS)
  
  return {
    id: generateId('ssts'),
    code: generateCode('SSTS', index),
    title: `软硬件规格需求-${index}`,
    featureId,
    type: randomChoice(['functional', 'technical']),
    specification: {
      content: '## 规格说明\n\n### 功能描述\n\n### 技术要求\n\n### 接口定义',
      version: 'v1.0',
      attachments: [],
    },
    mrIds: [],
    priority: randomChoice(PRIORITY_OPTIONS),
    complexity: randomChoice(COMPLEXITY_OPTIONS),
    estimate: randomInt(2, 16),
    status: randomChoice(STATUS_OPTIONS.requirement),
    owner,
    dependencies: [],
    targetPI: '',
    targetSprint: '',
    tags: [randomChoice(['算法', '控制', '感知', '决策', '执行'])],
    createdAt: generateDate(-30),
    updatedAt: generateDate(-2),
    createdBy: owner,
    updatedBy: owner,
  }
}

/**
 * 生成Mock MR数据
 */
export function generateMockMR(sstsId: string, index: number = 1): MR {
  const owner = randomChoice(MOCK_USER_IDS)
  const teamId = randomChoice(MOCK_TEAM_IDS)
  
  return {
    id: generateId('mr'),
    code: generateCode('MR', index),
    title: `模块需求-${index}`,
    sstsId,
    moduleName: `模块${randomChoice(['A', 'B', 'C', 'D'])}`,
    moduleAssetId: Math.random() > 0.6 ? generateId('asset') : undefined,
    teamId,
    teamName: MOCK_TEAM_NAMES[MOCK_TEAM_IDS.indexOf(teamId)],
    interfaceSpec: {
      inputs: ['输入参数1', '输入参数2'],
      outputs: ['输出参数1'],
      protocol: 'DDS/CAN/Ethernet',
    },
    designDoc: {
      content: '## 设计文档\n\n### 架构设计\n\n### 详细设计',
      version: 'v1.0',
      attachments: [],
    },
    dependencies: [],
    effortHours: randomInt(8, 80),
    status: randomChoice(STATUS_OPTIONS.requirement),
    owner,
    assignee: randomChoice(MOCK_USER_IDS),
    taskIds: [],
    targetPI: '',
    targetSprint: '',
    tags: [randomChoice(['前端', '后端', '算法', '测试'])],
    createdAt: generateDate(-20),
    updatedAt: generateDate(-1),
    createdBy: owner,
    updatedBy: owner,
  }
}

/**
 * 批量生成Epic数据
 */
export function generateMockEpics(projectId: string, count: number = 5): Epic[] {
  return Array.from({ length: count }, (_, i) => generateMockEpic(projectId, i + 1))
}

/**
 * 批量生成Feature数据
 */
export function generateMockFeatures(epicId: string, count: number = 3): Feature[] {
  return Array.from({ length: count }, (_, i) => generateMockFeature(epicId, i + 1))
}

/**
 * 批量生成SSTS数据
 */
export function generateMockSSTSList(featureId: string, count: number = 4): SSTS[] {
  return Array.from({ length: count }, (_, i) => generateMockSSTS(featureId, i + 1))
}

/**
 * 批量生成MR数据
 */
export function generateMockMRs(sstsId: string, count: number = 2): MR[] {
  return Array.from({ length: count }, (_, i) => generateMockMR(sstsId, i + 1))
}

/**
 * 生成完整的需求层次结构
 * Epic -> Features -> SSTS -> MRs
 */
export function generateMockRequirementHierarchy(projectId: string) {
  const epics: Epic[] = []
  const features: Feature[] = []
  const sstsList: SSTS[] = []
  const mrList: MR[] = []
  
  // 生成3个Epic
  for (let i = 1; i <= 3; i++) {
    const epic = generateMockEpic(projectId, i)
    
    // 每个Epic生成2-3个Feature
    const featureCount = randomInt(2, 3)
    for (let j = 1; j <= featureCount; j++) {
      const feature = generateMockFeature(epic.id, features.length + 1)
      epic.featureIds.push(feature.id)
      
      // 每个Feature生成3-5个SSTS
      const sstsCount = randomInt(3, 5)
      for (let k = 1; k <= sstsCount; k++) {
        const ssts = generateMockSSTS(feature.id, sstsList.length + 1)
        feature.sstsIds.push(ssts.id)
        
        // 每个SSTS生成1-2个MR
        const mrCount = randomInt(1, 2)
        for (let m = 1; m <= mrCount; m++) {
          const mr = generateMockMR(ssts.id, mrList.length + 1)
          ssts.mrIds.push(mr.id)
          mrList.push(mr)
        }
        
        sstsList.push(ssts)
      }
      
      features.push(feature)
    }
    
    epics.push(epic)
  }
  
  return {
    epics,
    features,
    sstsList,
    mrList,
  }
}
