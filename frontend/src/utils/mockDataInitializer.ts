/**
 * Mock数据初始化器
 * 在应用启动时初始化Mock数据到各个Store中
 */

import { useProjectStore } from '@/stores/modules/project'
import { useEpicStore } from '@/stores/modules/epic'
import { useFeatureStore } from '@/stores/modules/feature'
import { useSSTSStore } from '@/stores/modules/ssts'
import { usePIStore } from '@/stores/modules/pi'
import { usePlanningStore } from '@/stores/modules/planning'
import { useAssetStore } from '@/stores/modules/asset'
import { useSprintStore } from '@/stores/modules/sprint'
import { useTaskStore } from '@/stores/modules/task'
import { useTestingStore } from '@/stores/modules/testing'

import {
  generateMockProjects,
  generateMockVersions,
  generateMockPIs,
  generateMockTeams,
  generateMockUsers,
} from '@/mock/project-mock'

import {
  generateMockRequirementHierarchy,
} from '@/mock/requirement-mock'

import {
  generateMockPIPlanningResult,
} from '@/mock/planning-mock'

import {
  generateMockSprints,
  generateMockTasks,
  generateMockTestCases,
  generateMockDefects,
} from '@/mock/iteration-mock'

import {
  generateMockAssetHierarchy,
} from '@/mock/asset-mock'

/**
 * 初始化所有Mock数据
 */
export async function initializeMockData() {
  console.log('🚀 开始初始化Mock数据...')

  try {
    // 1. 初始化项目数据
    await initializeProjectData()

    // 2. 初始化需求数据
    await initializeRequirementData()

    // 3. 初始化PI和Planning数据
    await initializePIPlanningData()

        // 4. 初始化资产数据
        await initializeAssetData()

        // 5. 初始化Sprint和Task数据
        await initializeIterationData()

        // 6. 初始化测试数据
        await initializeTestingData()

        console.log('✅ Mock数据初始化完成')
        return true
  } catch (error) {
    console.error('❌ Mock数据初始化失败:', error)
    return false
  }
}

/**
 * 初始化项目数据
 */
async function initializeProjectData() {
  const projectStore = useProjectStore()

  // 生成3个项目
  const projects = generateMockProjects(3)
  
  for (const project of projects) {
    await projectStore.createProject(project)

    // 为每个项目生成2个版本
    const versions = generateMockVersions(project.id, 2)
    for (const version of versions) {
      await projectStore.createVersion(version)
    }

    // 为每个项目生成3个PI
    const pis = generateMockPIs(project.id, 3)
    for (const pi of pis) {
      await projectStore.createPI(pi)
    }
  }

  console.log(`✓ 创建了 ${projects.length} 个项目`)
}

/**
 * 初始化需求数据
 */
async function initializeRequirementData() {
  const projectStore = useProjectStore()
  const epicStore = useEpicStore()
  const featureStore = useFeatureStore()
  const sstsStore = useSSTSStore()

  const projects = projectStore.projects

  if (projects.length === 0) {
    console.warn('⚠️ 没有项目数据，跳过需求数据初始化')
    return
  }

  // 为前2个项目生成需求层次结构
  for (let i = 0; i < Math.min(2, projects.length); i++) {
    const project = projects[i]
    const hierarchy = generateMockRequirementHierarchy(project.id)

    // 创建Epics
    for (const epic of hierarchy.epics) {
      await epicStore.createEpic(epic)
    }

    // 创建Features
    for (const feature of hierarchy.features) {
      await featureStore.createFeature(feature)
    }

    // 创建SSTS
    for (const ssts of hierarchy.sstsList) {
      await sstsStore.createSSTS(ssts)
    }

    // 创建MRs
    for (const mr of hierarchy.mrList) {
      await sstsStore.createMR(mr)
    }

    console.log(`✓ 为项目 "${project.name}" 创建了需求层次结构:`)
    console.log(`  - ${hierarchy.epics.length} 个Epic`)
    console.log(`  - ${hierarchy.features.length} 个Feature`)
    console.log(`  - ${hierarchy.sstsList.length} 个SSTS`)
    console.log(`  - ${hierarchy.mrList.length} 个MR`)
  }
}

/**
 * 初始化PI Planning数据
 */
async function initializePIPlanningData() {
  const piStore = usePIStore()
  const planningStore = usePlanningStore()

  const pis = piStore.piVersions

  if (pis.length === 0) {
    console.warn('⚠️ 没有PI数据，跳过PI Planning数据初始化')
    return
  }

  // 为第一个PI生成Planning数据
  const firstPI = pis[0]
  const planningResult = generateMockPIPlanningResult(firstPI.id)

  // 启动Planning
  await planningStore.startPlanning(firstPI.id)

  // 加载Planning数据
  planningStore.draftTeamPlannings = planningResult.teamPlannings
  planningStore.draftSprintPlannings = planningResult.sprintPlannings
  planningStore.draftDependencies = planningResult.dependencies

  console.log(`✓ 为PI "${firstPI.name}" 创建了Planning数据:`)
  console.log(`  - ${planningResult.teamPlannings.length} 个团队规划`)
  console.log(`  - ${planningResult.sprintPlannings.length} 个Sprint规划`)
  console.log(`  - ${planningResult.dependencies.length} 个依赖关系`)
  console.log(`  - ${planningResult.risks.length} 个风险`)
}

/**
 * 初始化资产数据
 */
async function initializeAssetData() {
  const assetStore = useAssetStore()

  // 生成资产层次结构：3个产品线，每个产品线3个产品，每个产品3-8个资产
  const hierarchy = generateMockAssetHierarchy(3)

  // 初始化产品线
  for (const productLine of hierarchy.productLines) {
    await assetStore.createProductLine(productLine)
  }

  // 初始化产品
  for (const product of hierarchy.products) {
    await assetStore.createProduct(product)
  }

  // 初始化资产
  for (const asset of hierarchy.assets) {
    await assetStore.createAsset(asset)
  }

  console.log(`✓ 创建了 ${hierarchy.productLines.length} 个产品线`)
  console.log(`✓ 创建了 ${hierarchy.products.length} 个产品`)
  console.log(`✓ 创建了 ${hierarchy.assets.length} 个资产`)
}

/**
 * 清空所有Mock数据
 */
export function clearMockData() {
  const projectStore = useProjectStore()
  const epicStore = useEpicStore()
  const featureStore = useFeatureStore()
  const sstsStore = useSSTSStore()
  const piStore = usePIStore()
  const planningStore = usePlanningStore()
  const assetStore = useAssetStore()
  const sprintStore = useSprintStore()
  const taskStore = useTaskStore()
  const testingStore = useTestingStore()

  projectStore.$reset()
  epicStore.$reset()
  featureStore.$reset()
  sstsStore.$reset()
  piStore.$reset()
  planningStore.$reset()
  assetStore.$reset()
  sprintStore.reset()
  taskStore.reset()
  testingStore.reset()

  console.log('🧹 Mock数据已清空')
}

/**
 * 重新初始化Mock数据
 */
export async function reinitializeMockData() {
  clearMockData()
  await initializeMockData()
}
