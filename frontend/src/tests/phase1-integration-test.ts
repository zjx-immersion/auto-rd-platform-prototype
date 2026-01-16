/**
 * Phase 1 集成测试
 * 测试数据模型、Store和Mock数据的集成
 */

import { createPinia, setActivePinia } from 'pinia'
import { useProjectStore, useEpicStore, useFeatureStore, useSSTSStore, usePIStore, usePlanningStore } from '@/stores'
import {
  generateMockProject,
  generateMockEpic,
  generateMockFeature,
  generateMockSSTS,
  generateMockMR,
  generateMockPI,
  generateMockPIPlanningResult,
  generateMockRequirementHierarchy,
} from '@/mock'

/**
 * 测试环境初始化
 */
function setupTest() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * 测试1: 项目Store基本功能
 */
async function testProjectStore() {
  console.log('\n=== 测试1: 项目Store基本功能 ===')
  
  setupTest()
  const projectStore = useProjectStore()
  
  // 创建项目
  const mockProject = generateMockProject(1)
  const project = await projectStore.createProject(mockProject)
  console.log('✓ 创建项目成功:', project.code, project.name)
  
  // 获取项目
  projectStore.setCurrentProject(project)
  console.log('✓ 设置当前项目成功:', projectStore.currentProject?.name)
  
  // 创建版本
  const version = await projectStore.createVersion({
    projectId: project.id,
    code: 'V1.0',
    name: '版本 1.0',
    description: '测试版本',
  })
  console.log('✓ 创建版本成功:', version.code)
  
  // 创建PI
  const pi = await projectStore.createPI({
    projectId: project.id,
    code: 'PI-1',
    name: 'PI 1',
    sprintCount: 6,
  })
  console.log('✓ 创建PI成功:', pi.code)
  
  console.log('✓ 项目Store测试通过')
}

/**
 * 测试2: 需求层次结构
 */
async function testRequirementHierarchy() {
  console.log('\n=== 测试2: 需求层次结构 ===')
  
  setupTest()
  const projectStore = useProjectStore()
  const epicStore = useEpicStore()
  const featureStore = useFeatureStore()
  const sstsStore = useSSTSStore()
  
  // 创建项目
  const project = await projectStore.createProject(generateMockProject(1))
  console.log('✓ 创建项目:', project.name)
  
  // 创建Epic
  const epic = await epicStore.createEpic({
    projectId: project.id,
    title: '自动泊车功能',
    description: '完整的自动泊车功能实现',
  })
  console.log('✓ 创建Epic:', epic.code, epic.title)
  
  // 创建Feature
  const feature = await featureStore.createFeature({
    epicId: epic.id,
    title: '垂直泊车入位',
    productLine: '自动驾驶产品线',
  })
  console.log('✓ 创建Feature:', feature.code, feature.title)
  
  // 更新PRD
  await featureStore.updatePRD(feature.id, {
    content: '# PRD\n\n## 功能描述\n垂直泊车入位功能',
    status: 'approved',
  })
  console.log('✓ 更新PRD成功')
  
  // 创建SSTS
  const ssts = await sstsStore.createSSTS({
    featureId: feature.id,
    title: '泊车控制算法',
    type: 'functional',
  })
  console.log('✓ 创建SSTS:', ssts.code, ssts.title)
  
  // 关联SSTS到Feature
  await featureStore.linkSSTS(feature.id, ssts.id)
  console.log('✓ 关联SSTS到Feature成功')
  
  // 创建MR
  const mr = await sstsStore.createMR({
    sstsId: ssts.id,
    title: '路径规划模块',
    moduleName: 'PathPlanning',
    teamId: 'team-001',
    teamName: '智能驾驶团队',
  })
  console.log('✓ 创建MR:', mr.code, mr.title)
  
  console.log('✓ 需求层次结构测试通过')
}

/**
 * 测试3: PI Planning流程
 */
async function testPIPlanning() {
  console.log('\n=== 测试3: PI Planning流程 ===')
  
  setupTest()
  const projectStore = useProjectStore()
  const piStore = usePIStore()
  const planningStore = usePlanningStore()
  
  // 创建项目和PI
  const project = await projectStore.createProject(generateMockProject(1))
  const pi = await piStore.createPIVersion({
    code: 'PI-1',
    name: 'PI 1',
    projectIds: [project.id],
    sprintCount: 6,
    sprintDuration: 14,
  })
  console.log('✓ 创建PI:', pi.code)
  
  // 开始PI Planning
  const planning = await planningStore.startPlanning(pi.id)
  console.log('✓ 启动PI Planning:', planning.id)
  
  // 添加PI目标
  await piStore.addPIObjective(pi.id, {
    id: 'obj-1',
    description: '完成自动泊车核心功能',
    businessValue: 10,
    status: 'committed',
    owner: 'user-001',
  })
  console.log('✓ 添加PI目标成功')
  
  // 配置团队
  await piStore.updateTeamConfig(pi.id, [
    { teamId: 'team-001', teamName: '智能驾驶团队', capacity: 80, plannedStoryPoints: 75 },
    { teamId: 'team-002', teamName: '智能座舱团队', capacity: 60, plannedStoryPoints: 55 },
  ])
  console.log('✓ 配置团队成功')
  
  // 分配Feature到团队
  await planningStore.allocateFeatureToTeam('team-001', {
    featureId: 'feat-001',
    featureName: '垂直泊车入位',
    storyPoints: 21,
    sprintIds: [],
    status: 'ready',
  })
  console.log('✓ 分配Feature到团队成功')
  
  // 添加依赖关系
  await planningStore.addDependency({
    id: 'dep-001',
    code: 'DEP-001',
    sourceFeatureId: 'feat-001',
    sourceFeatureName: 'Feature A',
    sourceTeamId: 'team-001',
    sourceTeamName: '智能驾驶团队',
    targetFeatureId: 'feat-002',
    targetFeatureName: 'Feature B',
    targetTeamId: 'team-002',
    targetTeamName: '智能座舱团队',
    dependencyType: 'interface',
    description: '接口依赖',
    status: 'identified',
    criticalPath: false,
    resolveBy: new Date().toISOString(),
    owner: 'user-001',
  })
  console.log('✓ 添加依赖关系成功')
  
  // 添加风险
  await piStore.addRisk(pi.id, {
    id: 'risk-001',
    title: '技术风险',
    description: '算法实现难度高',
    type: 'technical',
    impact: 'high',
    probability: 'medium',
    status: 'identified',
    owner: 'user-001',
    mitigationPlan: '提前进行技术攻关',
  })
  console.log('✓ 添加风险成功')
  
  // 检测冲突
  const conflicts = await planningStore.detectConflicts()
  console.log('✓ 检测冲突完成，发现', conflicts.length, '个冲突')
  
  // 保存草稿
  await planningStore.saveDraft()
  console.log('✓ 保存草稿成功')
  
  // 提交PI Planning
  await planningStore.commitPlanning()
  console.log('✓ 提交PI Planning成功')
  
  // 提交PI
  await piStore.commitPI(pi.id)
  console.log('✓ 提交PI成功')
  
  console.log('✓ PI Planning流程测试通过')
}

/**
 * 测试4: Mock数据生成器
 */
function testMockDataGeneration() {
  console.log('\n=== 测试4: Mock数据生成器 ===')
  
  // 生成项目数据
  const project = generateMockProject(1)
  console.log('✓ 生成项目:', project.code, project.name)
  
  // 生成Epic
  const epic = generateMockEpic(project.id, 1)
  console.log('✓ 生成Epic:', epic.code, epic.title)
  
  // 生成Feature
  const feature = generateMockFeature(epic.id, 1)
  console.log('✓ 生成Feature:', feature.code, feature.title)
  
  // 生成SSTS
  const ssts = generateMockSSTS(feature.id, 1)
  console.log('✓ 生成SSTS:', ssts.code, ssts.title)
  
  // 生成MR
  const mr = generateMockMR(ssts.id, 1)
  console.log('✓ 生成MR:', mr.code, mr.title)
  
  // 生成PI
  const pi = generateMockPI(project.id, 1)
  console.log('✓ 生成PI:', pi.code, pi.name)
  
  // 生成PI Planning结果
  const planning = generateMockPIPlanningResult(pi.id)
  console.log('✓ 生成PI Planning结果:', planning.id)
  console.log('  - 团队规划数:', planning.teamPlannings.length)
  console.log('  - Sprint规划数:', planning.sprintPlannings.length)
  console.log('  - 依赖关系数:', planning.dependencies.length)
  console.log('  - 风险数:', planning.risks.length)
  
  // 生成完整需求层次结构
  const hierarchy = generateMockRequirementHierarchy(project.id)
  console.log('✓ 生成完整需求层次结构:')
  console.log('  - Epics:', hierarchy.epics.length)
  console.log('  - Features:', hierarchy.features.length)
  console.log('  - SSTS:', hierarchy.sstsList.length)
  console.log('  - MRs:', hierarchy.mrList.length)
  
  console.log('✓ Mock数据生成器测试通过')
}

/**
 * 测试5: Store数据查询
 */
async function testStoreQueries() {
  console.log('\n=== 测试5: Store数据查询 ===')
  
  setupTest()
  const epicStore = useEpicStore()
  const featureStore = useFeatureStore()
  const sstsStore = useSSTSStore()
  
  // 创建测试数据
  const epic1 = await epicStore.createEpic({
    projectId: 'proj-1',
    title: 'Epic 1',
    status: 'in-progress',
  })
  
  const epic2 = await epicStore.createEpic({
    projectId: 'proj-1',
    title: 'Epic 2',
    status: 'done',
  })
  
  const feature1 = await featureStore.createFeature({
    epicId: epic1.id,
    title: 'Feature 1',
    targetPI: 'pi-1',
  })
  
  const feature2 = await featureStore.createFeature({
    epicId: epic1.id,
    title: 'Feature 2',
    targetPI: 'pi-1',
  })
  
  // 测试查询
  const epicsByStatus = epicStore.epicsByStatus('in-progress')
  console.log('✓ 按状态查询Epic:', epicsByStatus.length, '个in-progress Epic')
  
  const featuresByEpic = featureStore.featuresByEpic(epic1.id)
  console.log('✓ 按Epic查询Feature:', featuresByEpic.length, '个Feature')
  
  const featuresByPI = featureStore.featuresByPI('pi-1')
  console.log('✓ 按PI查询Feature:', featuresByPI.length, '个Feature')
  
  console.log('✓ Store数据查询测试通过')
}

/**
 * 运行所有测试
 */
export async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║   Phase 1 集成测试 - 数据流和Store集成        ║')
  console.log('╚════════════════════════════════════════════════╝')
  
  try {
    await testProjectStore()
    await testRequirementHierarchy()
    await testPIPlanning()
    testMockDataGeneration()
    await testStoreQueries()
    
    console.log('\n╔════════════════════════════════════════════════╗')
    console.log('║          ✓ 所有测试通过！                      ║')
    console.log('╚════════════════════════════════════════════════╝')
    
    return true
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════╗')
    console.error('║          ✗ 测试失败！                          ║')
    console.error('╚════════════════════════════════════════════════╝')
    console.error(error)
    return false
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1)
  })
}
