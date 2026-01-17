/**
 * 迭代执行和测试管理Mock数据生成器
 */

import type { Sprint, Task, TestCase, Defect } from '@/types'
import {
  generateId,
  generateCode,
  generateDate,
  randomChoice,
  randomInt,
  USERS
} from './helpers'

/**
 * 生成Sprint Mock数据
 */
export function generateMockSprint(piId: string, index: number): Sprint {
  const id = generateId()
  const code = generateCode('SPT')
  const name = `Sprint ${index + 1}`
  const duration = 10 // 2周
  const startDate = generateDate(index * 14, index * 14 + 1)
  const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000)
  
  const capacity = randomInt(40, 80)
  const plannedPoints = randomInt(30, Math.floor(capacity * 0.9))
  const completedPoints = randomInt(Math.floor(plannedPoints * 0.6), plannedPoints)

  return {
    id,
    code,
    name,
    piId,
    goal: `完成${randomInt(5, 10)}个高优先级功能的开发和测试`,
    duration,
    startDate,
    endDate,
    capacity,
    plannedStoryPoints: plannedPoints,
    completedStoryPoints: completedPoints,
    status: index === 0 ? 'active' : index < 2 ? 'planning' : 'completed',
    teamId: '',
    createdAt: generateDate(-30, -10),
    updatedAt: generateDate(-5, 0)
  }
}

/**
 * 批量生成Sprint
 */
export function generateMockSprints(piId: string, count: number = 5): Sprint[] {
  const sprints: Sprint[] = []
  for (let i = 0; i < count; i++) {
    sprints.push(generateMockSprint(piId, i))
  }
  return sprints
}

/**
 * 生成Task Mock数据
 */
export function generateMockTask(sprintId: string, mrId: string, index: number): Task {
  const id = generateId()
  const code = generateCode('TASK')
  
  const taskTitles = [
    '实现核心算法逻辑',
    '编写单元测试',
    '接口联调',
    '代码Review',
    '性能优化',
    '文档编写',
    'Bug修复',
    '集成测试',
    '代码重构',
    '配置管理'
  ]

  const title = `${taskTitles[index % taskTitles.length]} - ${code}`
  const status = randomChoice(['todo', 'in-progress', 'review', 'testing', 'done'])
  const estimateHours = randomInt(4, 24)
  const actualHours = status === 'done' ? randomInt(estimateHours, estimateHours + 8) : 0

  return {
    id,
    code,
    title,
    description: `${title}的详细描述和实现要求`,
    mrId,
    sprintId,
    assignee: randomChoice(USERS).id,
    status,
    priority: randomChoice(['P0', 'P1', 'P2', 'P3']),
    estimateHours,
    actualHours,
    storyPoints: Math.ceil(estimateHours / 8),
    blocked: randomInt(1, 20) === 1,
    blockReason: randomInt(1, 20) === 1 ? '等待依赖任务完成' : undefined,
    startDate: generateDate(-10, 0),
    dueDate: generateDate(1, 10),
    createdAt: generateDate(-15, -5),
    updatedAt: generateDate(-2, 0)
  }
}

/**
 * 批量生成Task
 */
export function generateMockTasks(sprintId: string, mrId: string, count: number = 5): Task[] {
  const tasks: Task[] = []
  for (let i = 0; i < count; i++) {
    tasks.push(generateMockTask(sprintId, mrId, i))
  }
  return tasks
}

/**
 * 生成TestCase Mock数据
 */
export function generateMockTestCase(index: number): TestCase {
  const id = generateId()
  const code = generateCode('TC')
  
  const modules = ['感知模块', '决策模块', '控制模块', 'HMI模块', '通信模块']
  const testTypes = ['功能测试', '性能测试', '安全测试', '兼容性测试']

  return {
    id,
    code,
    title: `${modules[index % modules.length]}${testTypes[index % testTypes.length]}用例${index + 1}`,
    module: modules[index % modules.length],
    type: testTypes[index % testTypes.length],
    priority: randomChoice(['P0', 'P1', 'P2', 'P3']),
    status: randomChoice(['not-run', 'passed', 'failed', 'blocked']),
    steps: [
      { step: 1, action: '启动系统', expected: '系统正常启动' },
      { step: 2, action: '执行测试操作', expected: '操作成功执行' },
      { step: 3, action: '验证结果', expected: '结果符合预期' }
    ],
    preconditions: '系统已初始化，测试环境就绪',
    author: randomChoice(USERS).id,
    lastExecutionDate: generateDate(-5, 0),
    createdAt: generateDate(-30, -10),
    updatedAt: generateDate(-3, 0)
  }
}

/**
 * 批量生成TestCase
 */
export function generateMockTestCases(count: number = 20): TestCase[] {
  const testCases: TestCase[] = []
  for (let i = 0; i < count; i++) {
    testCases.push(generateMockTestCase(i))
  }
  return testCases
}

/**
 * 生成Defect Mock数据
 */
export function generateMockDefect(index: number): Defect {
  const id = generateId()
  const code = generateCode('BUG')
  
  const defectTitles = [
    '页面加载缓慢',
    '按钮点击无响应',
    '数据显示不正确',
    '系统崩溃',
    '内存泄漏',
    '界面错位',
    '功能无法使用',
    '性能问题',
    '兼容性问题',
    '安全漏洞'
  ]

  return {
    id,
    code,
    title: `${defectTitles[index % defectTitles.length]} - ${code}`,
    description: `${defectTitles[index % defectTitles.length]}的详细描述和重现步骤`,
    severity: randomChoice(['critical', 'high', 'medium', 'low']),
    priority: randomChoice(['P0', 'P1', 'P2', 'P3']),
    status: randomChoice(['open', 'in-progress', 'resolved', 'closed', 'reopened']),
    type: randomChoice(['功能缺陷', '性能问题', '界面问题', '兼容性问题']),
    reporter: randomChoice(USERS).id,
    assignee: randomChoice(USERS).id,
    foundInVersion: `V1.${randomInt(0, 9)}.${randomInt(0, 9)}`,
    fixedInVersion: randomInt(1, 3) === 1 ? `V1.${randomInt(1, 9)}.${randomInt(0, 9)}` : undefined,
    createdAt: generateDate(-20, -5),
    updatedAt: generateDate(-3, 0)
  }
}

/**
 * 批量生成Defect
 */
export function generateMockDefects(count: number = 15): Defect[] {
  const defects: Defect[] = []
  for (let i = 0; i < count; i++) {
    defects.push(generateMockDefect(i))
  }
  return defects
}
