/**
 * JSON数据集初始化器
 * 从JSON文件加载数据到Pinia Stores
 */

import { dataLoader } from './loaders'
import {
  usersData,
  projectsData,
  versionsData,
  pisData,
  epicsData,
  featuresData,
  sstsData,
  sprintsData,
  tasksData
} from './datasets'

import { useUserStore } from '@/stores/modules/user'
import { useProjectStore } from '@/stores/modules/project'
import { useVersionStore } from '@/stores/modules/version'
import { usePIStore } from '@/stores/modules/pi'
import { useEpicStore } from '@/stores/modules/epic'
import { useFeatureStore } from '@/stores/modules/feature'
import { useSSTSStore } from '@/stores/modules/ssts'
import { useSprintStore } from '@/stores/modules/sprint'
import { useTaskStore } from '@/stores/modules/task'

/**
 * 初始化所有JSON数据集
 */
export async function initializeJSONDatasets() {
  console.log('🚀 开始加载JSON数据集...')

  try {
    // 1. 注册所有数据集到DataLoader
    dataLoader.registerDataset('users', usersData)
    dataLoader.registerDataset('projects', projectsData)
    dataLoader.registerDataset('versions', versionsData)
    dataLoader.registerDataset('pis', pisData)
    dataLoader.registerDataset('epics', epicsData)
    dataLoader.registerDataset('features', featuresData)
    dataLoader.registerDataset('ssts', sstsData)
    dataLoader.registerDataset('sprints', sprintsData)
    dataLoader.registerDataset('tasks', tasksData)

    // 2. 加载数据到各个Store
    await loadUsersToStore()
    await loadProjectsToStore()
    await loadVersionsToStore()
    await loadPIsToStore()
    await loadEpicsToStore()
    await loadFeaturesToStore()
    await loadSSTSToStore()
    await loadSprintsToStore()
    await loadTasksToStore()

    // 3. 建立数据关联
    await establishDataRelations()

    console.log('✅ JSON数据集加载完成')
    printDataSummary()

  } catch (error: any) {
    console.error('❌ JSON数据集加载失败:', error)
    throw error
  }
}

/**
 * 加载用户数据
 */
async function loadUsersToStore() {
  const userStore = useUserStore()
  const users = dataLoader.getDataset('users')
  userStore.users = users
  console.log(`✓ 加载了 ${users.length} 个用户`)
}

/**
 * 加载项目数据
 */
async function loadProjectsToStore() {
  const projectStore = useProjectStore()
  const projects = dataLoader.getDataset('projects')
  projectStore.projects = projects
  console.log(`✓ 加载了 ${projects.length} 个项目`)
}

/**
 * 加载版本数据
 */
async function loadVersionsToStore() {
  const versionStore = useVersionStore()
  const versions = dataLoader.getDataset('versions')
  versionStore.versions = versions
  console.log(`✓ 加载了 ${versions.length} 个版本`)
}

/**
 * 加载PI数据
 */
async function loadPIsToStore() {
  const piStore = usePIStore()
  const pis = dataLoader.getDataset('pis')
  piStore.piVersions = pis
  console.log(`✓ 加载了 ${pis.length} 个PI`)
}

/**
 * 加载Epic数据
 */
async function loadEpicsToStore() {
  const epicStore = useEpicStore()
  const epics = dataLoader.getDataset('epics')
  epicStore.epics = epics
  console.log(`✓ 加载了 ${epics.length} 个Epic`)
}

/**
 * 加载Feature数据
 */
async function loadFeaturesToStore() {
  const featureStore = useFeatureStore()
  const features = dataLoader.getDataset('features')
  // 映射name字段到title字段，以符合类型定义
  const mappedFeatures = features.map((f: any) => ({
    ...f,
    title: f.title || f.name || '', // 优先使用title，如果没有则使用name
  }))
  featureStore.features = mappedFeatures
  console.log(`✓ 加载了 ${mappedFeatures.length} 个Feature`)
}

/**
 * 加载SSTS数据
 */
async function loadSSTSToStore() {
  const sstsStore = useSSTSStore()
  const sstsList = dataLoader.getDataset('ssts')
  // 映射name字段到title字段，以符合类型定义
  const mappedSSTS = sstsList.map((s: any) => ({
    ...s,
    title: s.title || s.name || '', // 优先使用title，如果没有则使用name
  }))
  sstsStore.sstsList = mappedSSTS
  console.log(`✓ 加载了 ${mappedSSTS.length} 个SSTS`)
}

/**
 * 加载Sprint数据
 */
async function loadSprintsToStore() {
  const sprintStore = useSprintStore()
  const sprints = dataLoader.getDataset('sprints')
  sprintStore.sprints = sprints
  console.log(`✓ 加载了 ${sprints.length} 个Sprint`)
}

/**
 * 加载Task数据
 */
async function loadTasksToStore() {
  const taskStore = useTaskStore()
  const tasks = dataLoader.getDataset('tasks')
  taskStore.tasks = tasks
  console.log(`✓ 加载了 ${tasks.length} 个Task`)
}

/**
 * 建立数据关联关系
 * 自动填充关联字段
 */
async function establishDataRelations() {
  console.log('🔗 正在建立数据关联...')

  const projectStore = useProjectStore()
  const versionStore = useVersionStore()
  const piStore = usePIStore()
  const epicStore = useEpicStore()
  const featureStore = useFeatureStore()
  const sstsStore = useSSTSStore()
  const sprintStore = useSprintStore()
  const taskStore = useTaskStore()

  // 1. 关联项目 -> 版本
  projectStore.projects.forEach(project => {
    const projectVersions = versionStore.versions.filter(v => v.projectId === project.id)
    // 注意：项目使用piVersionIds字段存储版本ID（历史原因）
    project.piVersionIds = projectVersions.map(v => v.id)
  })

  // 2. 关联项目 -> PI
  piStore.piVersions.forEach(pi => {
    pi.projectIds.forEach(projectId => {
      const project = projectStore.projects.find(p => p.id === projectId)
      if (project && !project.piVersionIds.includes(pi.id)) {
        project.piVersionIds.push(pi.id)
      }
    })
  })

  // 3. 关联项目 -> Epic
  epicStore.epics.forEach(epic => {
    const project = projectStore.projects.find(p => p.id === epic.projectId)
    if (project && !project.epicIds.includes(epic.id)) {
      project.epicIds.push(epic.id)
    }
  })

  // 4. 关联Epic -> Feature
  featureStore.features.forEach(feature => {
    const epic = epicStore.epics.find(e => e.id === feature.epicId)
    if (epic && !epic.featureIds.includes(feature.id)) {
      epic.featureIds.push(feature.id)
    }
  })

  // 5. 关联Feature -> SSTS
  sstsStore.sstsList.forEach(ssts => {
    const feature = featureStore.features.find(f => f.id === ssts.featureId)
    if (feature && !feature.sstsIds.includes(ssts.id)) {
      feature.sstsIds.push(ssts.id)
    }
  })

  // 6. 关联PI -> Epic
  epicStore.epics.forEach(epic => {
    if (epic.targetPI) {
      const pi = piStore.piVersions.find(p => p.id === epic.targetPI)
      if (pi && !pi.epicIds.includes(epic.id)) {
        pi.epicIds.push(epic.id)
      }
    }
  })

  // 7. 关联PI -> Feature
  featureStore.features.forEach(feature => {
    if (feature.targetPI) {
      const pi = piStore.piVersions.find(p => p.id === feature.targetPI)
      if (pi && !pi.featureIds.includes(feature.id)) {
        pi.featureIds.push(feature.id)
      }
    }
  })

  // 8. 关联Version -> Feature
  featureStore.features.forEach(feature => {
    if (feature.targetVersion) {
      const version = versionStore.versions.find(v => v.id === feature.targetVersion)
      if (version && !version.featureIds.includes(feature.id)) {
        version.featureIds.push(feature.id)
      }
    }
  })

  // 9. 关联PI -> Sprint
  sprintStore.sprints.forEach(sprint => {
    const pi = piStore.piVersions.find(p => p.id === sprint.piId)
    if (pi) {
      // PI的sprintCount应该等于关联的Sprint数量
      const piSprints = sprintStore.sprints.filter(s => s.piId === pi.id)
      if (pi.sprintCount !== piSprints.length) {
        // 更新PI的sprintCount（如果需要）
      }
    }
  })

  // 10. 关联Sprint -> Task
  taskStore.tasks.forEach(task => {
    const sprint = sprintStore.sprints.find(s => s.id === task.sprintId)
    if (sprint && !sprint.taskIds.includes(task.id)) {
      sprint.taskIds.push(task.id)
    }
  })

  // 11. 关联MR -> Task
  taskStore.tasks.forEach(task => {
    if (task.mrId) {
      const mr = sstsStore.mrList.find(m => m.id === task.mrId)
      if (mr && !mr.taskIds.includes(task.id)) {
        mr.taskIds.push(task.id)
      }
    }
  })

  // 12. 关联Sprint -> MR
  sprintStore.sprints.forEach(sprint => {
    // 通过Task找到关联的MR
    const sprintTasks = taskStore.tasks.filter(t => t.sprintId === sprint.id)
    sprintTasks.forEach(task => {
      if (task.mrId && !sprint.mrIds.includes(task.mrId)) {
        sprint.mrIds.push(task.mrId)
      }
    })
  })

  console.log('✓ 数据关联建立完成')
}

/**
 * 打印数据摘要
 */
function printDataSummary() {
  console.log('\n📊 数据集统计:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const datasets = dataLoader.getDatasetNames()
  datasets.forEach(name => {
    const metadata = dataLoader.getMetadata(name)
    if (metadata) {
      console.log(`  ${name.padEnd(12)} : ${metadata.count} 条记录`)
    }
  })
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  总计: ${datasets.length} 个数据集\n`)
}
