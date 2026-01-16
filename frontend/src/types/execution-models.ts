/**
 * 迭代执行、测试验收、DevOps交付模型
 * 覆盖价值流 S5-S9
 * 能力域 C4、C5、C6
 */

import type { ID, ISODate, Priority, Timestamps, MR } from './domain-models'

// ============================================================================
// C4: 迭代执行 - Iteration Execution
// ============================================================================

/**
 * Sprint（冲刺）
 * 覆盖价值流：S5
 */
export interface Sprint extends Timestamps {
  id: ID
  code: string                         // Sprint编号（如：SPT-001）
  name: string                         // Sprint名称（如：Sprint 1）
  
  // 归属
  piId: ID                             // 所属PI
  teamId: ID                           // 所属Team
  
  // 时间规划
  startDate: ISODate                   // 开始日期
  endDate: ISODate                     // 结束日期
  duration: number                     // 持续天数
  
  // Sprint目标
  goal: string                         // Sprint目标
  
  // 容量规划
  capacity: number                     // 团队容量（Story Points）
  committedStoryPoints: number         // 承诺的Story Points
  completedStoryPoints?: number        // 完成的Story Points
  
  // Backlog
  taskIds: ID[]                        // Task列表
  mrIds: ID[]                          // MR列表
  
  // 状态
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  
  // 度量
  velocity?: number                    // 实际速率
  burndownData?: BurndownPoint[]       // 燃尽图数据
  
  // Sprint事件
  events: SprintEvent[]                // Sprint Planning/Review/Retro记录
  
  // 归属
  scrumMaster?: string
  productOwner?: string
}

/**
 * 燃尽图数据点
 */
export interface BurndownPoint {
  date: ISODate
  remainingStoryPoints: number         // 剩余Story Points
  idealRemainingStoryPoints: number    // 理想剩余
  completed: number                    // 当日完成
}

/**
 * Sprint事件
 */
export interface SprintEvent {
  id: ID
  type: 'planning' | 'daily-standup' | 'review' | 'retrospective'
  date: ISODate
  duration: number                     // 时长（分钟）
  attendees: string[]                  // 参与者
  notes?: string                       // 会议记录
  actionItems?: ActionItem[]           // 行动项
}

/**
 * 行动项
 */
export interface ActionItem {
  id: ID
  description: string
  owner: string
  dueDate?: ISODate
  status: 'open' | 'in-progress' | 'completed'
}

/**
 * Task（任务）
 * 三层需求模型最底层
 * 覆盖价值流：S5
 */
export interface Task extends Timestamps {
  id: ID
  code: string                         // Task编号（如：TASK-001）
  title: string                        // Task标题
  
  // 归属
  mrId: ID                             // 所属MR
  sprintId: ID                         // 所属Sprint
  
  // 描述
  description: string                  // 任务描述
  acceptanceCriteria?: string          // 验收标准
  
  // 分配
  assignee: string                     // 分配给（DEV）
  reviewer?: string                    // Code Reviewer
  
  // 工作量
  estimateHours: number                // 估算工时
  actualHours?: number                 // 实际工时
  remainingHours?: number              // 剩余工时
  
  // 状态流转
  status: TaskStatus
  statusHistory: StatusChange[]        // 状态变更历史
  
  // 优先级
  priority: Priority
  
  // 时间
  startDate?: ISODate
  endDate?: ISODate
  blockedDate?: ISODate                // 阻塞开始时间
  
  // 阻塞信息
  blocked: boolean
  blockers?: Blocker[]                 // 阻塞原因
  
  // 关联
  parentTaskId?: ID                    // 父任务
  subTaskIds?: ID[]                    // 子任务
  dependencies: ID[]                   // 依赖的其他Task
  
  // 代码关联
  codeRepoUrl?: string
  branchName?: string
  pullRequestUrl?: string
  commits?: string[]                   // Git commit hash
  
  // 标签
  tags: string[]
  type?: 'feature' | 'bug' | 'tech-debt' | 'refactor'
}

/**
 * Task状态
 */
export type TaskStatus = 
  | 'TODO'                             // 待办
  | 'IN_PROGRESS'                      // 开发中
  | 'CODE_REVIEW'                      // 代码评审
  | 'TESTING'                          // 测试中
  | 'BLOCKED'                          // 阻塞
  | 'DONE'                             // 完成
  | 'CANCELLED'                        // 取消

/**
 * 状态变更记录
 */
export interface StatusChange {
  from: TaskStatus
  to: TaskStatus
  timestamp: ISODate
  operator: string
  reason?: string
}

/**
 * 阻塞信息
 */
export interface Blocker {
  id: ID
  description: string                  // 阻塞原因
  type: 'technical' | 'dependency' | 'resource' | 'external'
  reportedBy: string
  reportedAt: ISODate
  resolvedBy?: string
  resolvedAt?: ISODate
  status: 'active' | 'resolved'
}

/**
 * 每日站会记录
 */
export interface DailyStandup {
  id: ID
  sprintId: ID
  date: ISODate
  
  // 参与情况
  attendees: string[]
  absent: string[]
  
  // 团队成员汇报
  reports: StandupReport[]
  
  // 识别的问题
  issues: string[]
  
  // 行动项
  actionItems: ActionItem[]
  
  // 会议时长
  duration: number                     // 分钟
}

/**
 * 站会汇报
 */
export interface StandupReport {
  member: string
  yesterday: string[]                  // 昨日完成
  today: string[]                      // 今日计划
  blockers: string[]                   // 遇到的阻碍
}

// ============================================================================
// C5: 测试验收 - Test & Acceptance
// ============================================================================

/**
 * 测试计划
 * 覆盖价值流：S6-S7
 */
export interface TestPlan extends Timestamps {
  id: ID
  code: string                         // 测试计划编号
  name: string                         // 测试计划名称
  
  // 关联
  featureId?: ID                       // 关联Feature
  sprintId?: ID                        // 关联Sprint
  piId?: ID                            // 关联PI
  
  // 测试范围
  scope: string                        // 测试范围描述
  objectives: string[]                 // 测试目标
  
  // 测试策略
  strategy: {
    unitTest: boolean                  // 单元测试
    integrationTest: boolean           // 集成测试
    systemTest: boolean                // 系统测试
    acceptanceTest: boolean            // 验收测试
    mil: boolean                       // MIL验证
    sil: boolean                       // SIL验证
    hil: boolean                       // HIL验证
    vehicleTest: boolean               // 实车测试
  }
  
  // 时间规划
  startDate: ISODate
  endDate: ISODate
  
  // 测试用例
  testCaseIds: ID[]                    // 测试用例列表
  
  // 状态
  status: 'draft' | 'approved' | 'in-progress' | 'completed'
  
  // 进度
  progress: {
    totalCases: number
    passedCases: number
    failedCases: number
    blockedCases: number
    passRate: number                   // 通过率（%）
  }
  
  // 资源
  testEnv: string                      // 测试环境
  testData?: string                    // 测试数据
  
  // 归属
  owner: string                        // 测试负责人（QA）
  testers: string[]                    // 测试人员
  
  // 备注
  notes?: string
}

/**
 * 测试用例
 * 覆盖价值流：S6-S7
 */
export interface TestCase extends Timestamps {
  id: ID
  code: string                         // 测试用例编号
  title: string                        // 用例标题
  
  // 关联
  testPlanId: ID                       // 所属测试计划
  featureId?: ID                       // 关联Feature
  sstsId?: ID                          // 关联SSTS
  mrId?: ID                            // 关联MR
  
  // 用例类型
  type: 'functional' | 'performance' | 'security' | 'compatibility' | 'usability'
  level: 'unit' | 'integration' | 'system' | 'acceptance'
  
  // 测试级别（XiL）
  xilLevel?: 'MIL' | 'SIL' | 'HIL' | 'VIL'
  
  // 用例内容
  preconditions: string                // 前置条件
  steps: TestStep[]                    // 测试步骤
  expectedResult: string               // 预期结果
  
  // 优先级
  priority: Priority
  
  // 执行信息
  executions: TestExecution[]          // 执行历史
  
  // 状态
  status: 'draft' | 'ready' | 'in-progress' | 'passed' | 'failed' | 'blocked'
  
  // 自动化
  automated: boolean
  automationScript?: string            // 自动化脚本路径
  
  // 归属
  owner: string                        // 用例创建者
  assignee?: string                    // 当前负责人
  
  // 标签
  tags: string[]
}

/**
 * 测试步骤
 */
export interface TestStep {
  stepNumber: number
  action: string                       // 操作
  expectedResult: string               // 预期结果
  data?: string                        // 测试数据
}

/**
 * 测试执行
 */
export interface TestExecution {
  id: ID
  executionDate: ISODate
  executor: string
  
  // 执行结果
  result: 'passed' | 'failed' | 'blocked' | 'skipped'
  
  // 详细结果
  actualResult?: string
  screenshots?: string[]               // 截图
  logs?: string[]                      // 日志
  
  // 失败原因
  failureReason?: string
  defectId?: ID                        // 关联缺陷
  
  // 环境信息
  testEnv: string
  buildVersion: string
  
  // 耗时
  duration: number                     // 执行时长（秒）
}

/**
 * 缺陷（Defect/Bug）
 * 覆盖价值流：S6-S7
 */
export interface Defect extends Timestamps {
  id: ID
  code: string                         // 缺陷编号（如：BUG-001）
  title: string                        // 缺陷标题
  
  // 描述
  description: string                  // 缺陷描述
  stepsToReproduce: string             // 复现步骤
  expectedBehavior: string             // 期望行为
  actualBehavior: string               // 实际行为
  
  // 关联
  testCaseId?: ID                      // 关联测试用例
  mrId?: ID                            // 关联MR
  featureId?: ID                       // 关联Feature
  
  // 严重程度
  severity: 'critical' | 'major' | 'minor' | 'trivial'  // 严重程度
  priority: Priority                   // 优先级
  
  // 分类
  type: 'functional' | 'performance' | 'security' | 'ui' | 'compatibility'
  category?: string                    // 缺陷分类
  
  // 状态流转
  status: 'new' | 'assigned' | 'in-progress' | 'fixed' | 'verified' | 'closed' | 'reopen'
  resolution?: 'fixed' | 'wont-fix' | 'duplicate' | 'cannot-reproduce' | 'by-design'
  
  // 归属
  reportedBy: string                   // 报告人（QA）
  assignee?: string                    // 分配给（DEV）
  verifiedBy?: string                  // 验证人（QA）
  
  // 环境
  environment: string                  // 发现环境
  buildVersion: string                 // 构建版本
  
  // 修复信息
  fixVersion?: string                  // 修复版本
  rootCause?: string                   // 根因分析
  solution?: string                    // 解决方案
  
  // 附件
  attachments: string[]                // 附件（截图、日志等）
  
  // 时间追踪
  detectedDate: ISODate                // 发现日期
  fixedDate?: ISODate                  // 修复日期
  verifiedDate?: ISODate               // 验证日期
  closedDate?: ISODate                 // 关闭日期
  
  // 度量
  ageInDays?: number                   // 缺陷年龄（天）
  fixDuration?: number                 // 修复耗时（小时）
  
  // 标签
  tags: string[]
}

// ============================================================================
// C6: DevOps交付 - DevOps & Delivery
// ============================================================================

/**
 * 构建（Build）
 * 覆盖价值流：S6
 */
export interface Build extends Timestamps {
  id: ID
  buildNumber: string                  // 构建编号
  
  // 构建信息
  projectId: ID                        // 项目ID
  branch: string                       // 分支名
  commit: string                       // Git commit hash
  
  // 触发方式
  trigger: 'manual' | 'auto' | 'schedule' | 'webhook'
  triggeredBy: string
  
  // 构建结果
  status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled'
  result?: 'passed' | 'failed' | 'unstable'
  
  // 时间信息
  startTime: ISODate
  endTime?: ISODate
  duration?: number                    // 构建时长（秒）
  
  // 构建产物
  artifacts: Artifact[]                // 制品列表
  
  // 质量门禁
  qualityGate: QualityGateResult       // 质量门禁结果
  
  // 测试结果
  testResults?: {
    totalTests: number
    passedTests: number
    failedTests: number
    skippedTests: number
    passRate: number
  }
  
  // 代码质量
  codeQuality?: {
    coverage: number                   // 代码覆盖率（%）
    complexity: number                 // 圈复杂度
    duplications: number               // 重复率（%）
    violations: number                 // 违规数
  }
  
  // 构建日志
  logUrl?: string
  
  // 环境
  buildEnv: string                     // 构建环境
}

/**
 * 制品（Artifact）
 */
export interface Artifact {
  id: ID
  name: string                         // 制品名称
  type: 'binary' | 'library' | 'docker-image' | 'package'
  version: string                      // 版本号
  path: string                         // 存储路径
  size: number                         // 文件大小（字节）
  checksum: string                     // 校验和（MD5/SHA256）
  downloadUrl?: string
  createdAt: ISODate
}

/**
 * 质量门禁结果
 */
export interface QualityGateResult {
  passed: boolean                      // 是否通过
  level: 'L1' | 'L2' | 'L3'           // 门禁级别
  checks: QualityCheck[]               // 检查项
  overallScore?: number                // 总分
}

/**
 * 质量检查项
 */
export interface QualityCheck {
  name: string                         // 检查项名称
  type: 'coverage' | 'complexity' | 'duplication' | 'security' | 'performance'
  threshold: number                    // 阈值
  actualValue: number                  // 实际值
  passed: boolean                      // 是否通过
  severity: 'blocker' | 'critical' | 'major' | 'minor'
}

/**
 * 发布（Release）
 * 覆盖价值流：S9
 */
export interface Release extends Timestamps {
  id: ID
  code: string                         // 发布编号
  name: string                         // 发布名称
  version: string                      // 版本号（如：v1.2.0）
  
  // 关联
  projectId: ID                        // 项目ID
  piId?: ID                            // 所属PI
  buildId: ID                          // 构建ID
  
  // 发布内容
  features: ID[]                       // 包含的Feature
  artifacts: ID[]                      // 发布制品
  
  // 发布策略
  strategy: 'direct' | 'canary' | 'blue-green' | 'rolling'
  canaryPercentage?: number            // 灰度百分比
  
  // 审批流程
  approvals: Approval[]                // 审批记录
  
  // 发布时间
  scheduledDate?: ISODate              // 计划发布时间
  releaseDate?: ISODate                // 实际发布时间
  
  // 状态
  status: 'draft' | 'pending-approval' | 'approved' | 'in-progress' | 'completed' | 'failed' | 'rollback'
  
  // 发布环境
  targetEnv: 'dev' | 'test' | 'staging' | 'production'
  
  // 回滚信息
  rollbackable: boolean
  rollbackVersion?: string
  
  // 发布说明
  releaseNotes: string
  changelog: string[]
  
  // 验证结果
  verificationResult?: {
    smokeTested: boolean
    regressionTested: boolean
    performanceTested: boolean
    passed: boolean
  }
  
  // 归属
  owner: string                        // 发布负责人
  releasedBy?: string                  // 发布执行人
}

/**
 * 审批记录
 */
export interface Approval {
  id: ID
  approver: string                     // 审批人
  role: string                         // 角色
  decision: 'approved' | 'rejected' | 'pending'
  comment?: string
  timestamp?: ISODate
}

/**
 * 部署（Deployment）
 * 覆盖价值流：S9
 */
export interface Deployment extends Timestamps {
  id: ID
  releaseId: ID                        // 关联发布
  
  // 部署信息
  environment: 'dev' | 'test' | 'staging' | 'production'
  region?: string                      // 部署区域
  
  // 部署状态
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'rollback'
  
  // 时间信息
  startTime: ISODate
  endTime?: ISODate
  duration?: number                    // 部署时长（秒）
  
  // 部署结果
  result?: {
    deployed: number                   // 成功部署实例数
    failed: number                     // 失败实例数
    total: number                      // 总实例数
  }
  
  // 健康检查
  healthCheck?: {
    passed: boolean
    endpoint: string
    statusCode: number
    responseTime: number               // 响应时间（ms）
  }
  
  // 部署日志
  logUrl?: string
  
  // 执行者
  deployedBy: string
}

// ============================================================================
// 导出所有类型
// ============================================================================

export type {
  // C4: 迭代执行
  Sprint,
  BurndownPoint,
  SprintEvent,
  ActionItem,
  Task,
  TaskStatus,
  StatusChange,
  Blocker,
  DailyStandup,
  StandupReport,
  
  // C5: 测试验收
  TestPlan,
  TestCase,
  TestStep,
  TestExecution,
  Defect,
  
  // C6: DevOps交付
  Build,
  Artifact,
  QualityGateResult,
  QualityCheck,
  Release,
  Approval,
  Deployment,
}
