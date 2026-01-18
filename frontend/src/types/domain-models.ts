/**
 * 领域模型定义
 * 基于端到端研发价值流和能力域设计
 * 
 * 设计原则：
 * 1. 遵循三层需求模型：Epic → Feature/SSTS → Module/MR → Task
 * 2. 遵循三层资产模型：Product → FeatureAsset → ModuleAsset
 * 3. 覆盖九阶段价值流：S1市场洞察 → S9产品交付
 * 4. 清晰的能力域边界：C0-C7
 * 5. 完整的端到端追溯能力
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/** 唯一标识符 */
export type ID = string

/** ISO日期字符串 */
export type ISODate = string

/** 状态枚举基类 */
export type BaseStatus = 'active' | 'archived' | 'deleted'

/** 优先级 */
export type Priority = 'P0' | 'P1' | 'P2' | 'P3'

/** MoSCoW优先级 */
export type MoSCoW = 'Must' | 'Should' | 'Could' | 'Wont'

/** 用户信息 */
export interface User {
  id: ID
  name: string
  email: string
  avatar?: string
  role: string
  department?: string
}

/** 时间戳信息 */
export interface Timestamps {
  createdAt: ISODate
  updatedAt: ISODate
  createdBy: string
  updatedBy: string
}

// ============================================================================
// C0: 领域项目管理 - Domain Project Management
// ============================================================================

/**
 * 整车领域（Domain）
 * 对应五大领域
 */
export type Domain = 
  | 'intelligent-driving'    // 智能驾驶
  | 'smart-cockpit'          // 智能座舱
  | 'e-e-architecture'       // 电子电器架构
  | 'chassis-control'        // 底盘控制
  | 'new-energy'             // 新能源

/**
 * 里程碑/交付节点
 * 对应整车研发关键节点
 */
export interface Milestone {
  id: ID
  name: string                         // 节点名称（如：功能冻结、代码冻结、SOP）
  date: ISODate                        // 目标日期
  type: 'freeze' | 'release' | 'sop'  // 节点类型
  status: 'pending' | 'achieved' | 'delayed'
  deliverables: string[]               // 交付物清单
  description?: string
}

/**
 * 团队配置
 */
export interface TeamConfig {
  teamId: ID
  teamName: string
  domain: Domain
  lead: string                         // Team Leader
  members: string[]                    // 成员列表
  capacity: number                     // 团队容量（Story Points/Sprint）
  velocity?: number                    // 平均速率
}

/**
 * 领域项目（Domain Project）
 * C0能力域：整车项目管理
 * 覆盖价值流：S4-S9
 */
export interface DomainProject extends Timestamps {
  id: ID
  code: string                         // 项目编号（如：PRJ-2026-001）
  name: string                         // 项目名称（如：岚图梦想家Pro-智能驾驶）
  vehicleModel: string                 // 车型
  domain: Domain                       // 所属领域
  
  // 时间规划
  startDate: ISODate                   // 开始日期
  sopDate: ISODate                     // SOP日期（Start of Production）
  endDate?: ISODate                    // 结束日期
  milestones: Milestone[]              // 关键里程碑
  
  // 项目配置
  teams: TeamConfig[]                  // 团队配置
  budget?: number                      // 预算
  
  // 关联关系
  epicIds: ID[]                        // 关联Epic列表
  piVersionIds: ID[]                   // 关联PI版本列表
  
  // 状态
  status: 'planning' | 'executing' | 'closing' | 'completed' | 'cancelled'
  health: 'green' | 'yellow' | 'red'  // 项目健康度
  
  // 描述
  description: string
  objectives: string[]                 // 项目目标
  
  // 元数据
  owner: string                        // 项目经理（PM）
  sponsor?: string                     // 发起人
}

// ============================================================================
// C1: 需求管理 - Requirement Management
// ============================================================================

/**
 * Epic（业务需求）
 * 三层需求模型第一层
 * 覆盖价值流：S1-S2
 */
export interface Epic extends Timestamps {
  id: ID
  code: string                         // Epic编号（如：EPIC-2026-001）
  title: string                        // Epic标题
  
  // 需求内容
  description: string                  // 业务需求描述
  businessValue: string                // 业务价值
  source: 'user' | 'market' | 'regulation' | 'technology' | 'competitor'  // 需求来源
  
  // 优先级
  priority: Priority                   // P0/P1/P2/P3
  moscow: MoSCoW                       // Must/Should/Could/Won't
  
  // 关联关系
  projectId?: ID                       // 所属项目
  featureIds: ID[]                     // 拆解出的Feature列表
  
  // 版本规划
  targetPI?: string                    // 目标PI（如：PI-2026-Q2）
  targetVersion?: string               // 目标版本
  
  // 状态
  status: 'backlog' | 'approved' | 'in-progress' | 'completed' | 'cancelled'
  
  // 归属
  owner: string                        // PO - Product Owner
  stakeholders: string[]               // 干系人
  
  // 度量
  storyPoints?: number                 // 故事点估算
  
  // 标签
  tags: string[]
  domain?: Domain                      // 所属领域
}

/**
 * Feature（功能需求）
 * 三层需求模型第二层
 * 覆盖价值流：S2-S3
 */
export interface Feature extends Timestamps {
  id: ID
  code: string                         // Feature编号（如：FEAT-001-1）
  title: string                        // Feature标题
  
  // 归属
  epicId: ID                           // 所属Epic
  
  // 产品线映射（三层资产模型）
  productLine?: string                 // 产品线（如：智驾L2）
  product?: string                     // 产品（如：巡航控制）
  featureAssetId?: ID                  // 关联的Feature资产
  
  // PRD文档
  prd: {
    content: string                    // PRD内容（富文本/Markdown）
    version: string                    // PRD版本号
    status: 'draft' | 'review' | 'approved'
    url?: string                       // PRD文档链接
    attachments: PRDAttachment[]       // 附件列表
    versionHistory?: PRDVersion[]      // 版本历史
    reviewStatus?: 'pending' | 'in-review' | 'approved' | 'rejected' // 评审状态
    reviewComments?: ReviewComment[]   // 评审意见
  }
  
  // 验收标准
  acceptanceCriteria: AcceptanceCriteria[]
  
  // 关联关系
  sstsIds: ID[]                        // 拆解出的SSTS列表
  
  // 版本规划
  targetPI: string                     // 目标PI
  targetVersion?: string               // 目标版本
  
  // 状态
  status: 'backlog' | 'prd-writing' | 'prd-approved' | 'in-development' | 'testing' | 'completed'
  
  // 归属
  owner: string                        // FO - Feature Owner / 功能分析师
  
  // 度量
  storyPoints: number                  // 故事点
  complexity: 'low' | 'medium' | 'high'
  
  // 标签
  tags: string[]
}

/**
 * 验收标准（Given-When-Then格式）
 */
export interface AcceptanceCriteria {
  id: ID
  code: string                         // 编号（如：AC-001）
  description: string                  // 简化的描述（也支持Given-When-Then格式）
  given?: string                       // 前置条件（可选，完整格式）
  when?: string                        // 操作动作（可选，完整格式）
  then?: string                        // 预期结果（可选，完整格式）
  status: 'pending' | 'passed' | 'failed' // 验证状态
  priority: 'must' | 'should' | 'nice-to-have'
}

/**
 * PRD附件
 */
export interface PRDAttachment {
  id: ID
  name: string                         // 文件名
  url: string                          // 下载链接
  size: number                         // 文件大小（字节）
  type: string                         // MIME类型
  uploadedBy: string                   // 上传人
  uploadedAt: ISODate                  // 上传时间
}

/**
 * PRD版本历史
 */
export interface PRDVersion {
  version: string                      // 版本号（如：v1.0, v1.1）
  content: string                      // PRD内容快照
  createdAt: ISODate                   // 创建时间
  createdBy: string                    // 创建人
  changeSummary?: string               // 变更摘要
  status: 'draft' | 'review' | 'approved'
}

/**
 * 评审意见
 */
export interface ReviewComment {
  id: ID
  author: string                       // 评审人
  content: string                      // 评审意见
  type: 'approve' | 'reject' | 'comment' // 意见类型
  createdAt: ISODate                   // 创建时间
  resolved?: boolean                   // 是否已解决
}

/**
 * SSTS（System & Subsystem Technical Specification）
 * 系统/子系统技术规格
 * 三层需求模型第二层（与Feature平级，更技术化）
 * 覆盖价值流：S2-S3
 */
export interface SSTS extends Timestamps {
  id: ID
  code: string                         // SSTS编号（如：SSTS-2026-0001）
  title: string                        // SSTS标题
  
  // 归属
  featureId: ID                        // 所属Feature
  
  // 规格类型
  type: 'functional' | 'technical'     // 功能规格(FO) / 技术规格(SE)
  
  // 规格内容
  specification: {
    content: string                    // 规格详细内容
    scenarios?: string[]               // 功能场景（功能规格）
    performance?: PerformanceSpec      // 性能要求（技术规格）
    safety?: SafetySpec                // 安全要求（技术规格）
    interface?: InterfaceSpec          // 接口规格
  }
  
  // 关联关系
  mrIds: ID[]                          // 分配到的MR列表
  
  // 优先级
  priority: Priority
  complexity: 'low' | 'medium' | 'high'
  
  // 工作量
  estimate: number                     // 估算工作量（人天）
  
  // 状态
  status: 'draft' | 'review' | 'approved' | 'in-development' | 'completed'
  
  // 归属
  owner: string                        // FO或SE（System Engineer）
  
  // 依赖
  dependencies: ID[]                   // 依赖的其他SSTS
  
  // 目标
  targetPI?: string
  targetSprint?: string
  
  // 标签
  tags: string[]
}

/** 性能规格 */
export interface PerformanceSpec {
  latency?: string                     // 延迟要求（如：<100ms）
  throughput?: string                  // 吞吐量
  accuracy?: string                    // 精度要求
  reliability?: string                 // 可靠性
  [key: string]: string | undefined
}

/** 安全规格 */
export interface SafetySpec {
  asil?: 'A' | 'B' | 'C' | 'D'        // ASIL等级
  fti?: string                         // Fault Tolerant Time Interval
  safeguards?: string[]                // 安全防护措施
  [key: string]: any
}

/** 接口规格 */
export interface InterfaceSpec {
  protocol?: string                    // 通信协议
  dataFormat?: string                  // 数据格式
  api?: string                         // API规格
  dependency?: string[]                // 接口依赖
}

/**
 * MR（Module Requirement）
 * 模块需求
 * 三层需求模型第三层
 * 覆盖价值流：S3-S4
 */
export interface MR extends Timestamps {
  id: ID
  code: string                         // MR编号（如：MR-ACC-001）
  title: string                        // MR标题
  
  // 归属
  sstsId: ID                           // 所属SSTS
  
  // 模块信息
  moduleName: string                   // 模块名称
  moduleAssetId?: ID                   // 关联的Module资产
  
  // 团队分配
  teamId: ID                           // 负责Team
  teamName: string                     // Team名称
  
  // 技术规格
  interfaceSpec?: InterfaceSpec        // 接口规格
  designDoc?: string                   // 设计文档链接
  
  // 依赖关系
  dependencies: Dependency[]           // 依赖的其他MR
  
  // 工作量
  effortHours: number                  // 估算工时
  
  // 状态
  status: 'backlog' | 'ready' | 'in-development' | 'in-review' | 'in-test' | 'completed'
  
  // 归属
  owner: string                        // SO - Software Owner
  assignee?: string                    // 当前负责人
  
  // 关联关系
  taskIds: ID[]                        // 拆解出的Task列表
  
  // 目标
  targetPI?: string
  targetSprint?: string
  
  // 标签
  tags: string[]
}

/**
 * 依赖关系
 */
export interface Dependency {
  id: ID
  type: 'technical' | 'interface' | 'data' | 'resource'  // 依赖类型
  targetId: ID                         // 依赖目标ID
  targetType: 'MR' | 'SSTS' | 'Feature' | 'Team'  // 目标类型
  description: string                  // 依赖描述
  status: 'pending' | 'resolved' | 'blocking'
  priority: Priority
}

// ============================================================================
// C2: 产品管理（资产） - Product & Asset Management
// ============================================================================

/**
 * 资产成熟度等级
 * L1初始级 → L5卓越级
 */
export type MaturityLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

/**
 * 产品资产（Product Asset）
 * 三层资产模型第一层
 * 覆盖价值流：S3
 */
export interface ProductAsset extends Timestamps {
  id: ID
  code: string                         // 产品编号
  name: string                         // 产品名称
  domain: Domain                       // 所属领域
  
  // 版本管理
  version: string                      // 当前版本
  versions: VersionInfo[]              // 历史版本
  
  // 描述
  description: string
  roadmap?: string                     // 产品路线图
  
  // 关联关系
  featureAssetIds: ID[]                // 包含的Feature资产
  
  // 归属
  owner: string                        // 产品负责人
  
  // 状态
  status: 'planning' | 'active' | 'deprecated'
  
  // 标签
  tags: string[]
}

/**
 * Feature资产（Feature Asset）
 * 三层资产模型第二层
 * 覆盖价值流：S3
 */
export interface FeatureAsset extends Timestamps {
  id: ID
  code: string                         // Feature资产编号
  name: string                         // 资产名称
  
  // 归属
  productAssetId: ID                   // 所属产品资产
  
  // 成熟度
  maturityLevel: MaturityLevel         // L1-L5成熟度
  reuseCount: number                   // 复用次数
  
  // 技术信息
  techStack: string[]                  // 技术栈
  interfaceSpec: string                // 接口规格
  apiDoc?: string                      // API文档
  
  // 质量指标
  testCoverage: number                 // 测试覆盖率（%）
  codeQuality?: {
    complexity: number                 // 圈复杂度
    maintainability: number            // 可维护性指数
    reliability: string                // 可靠性等级
  }
  
  // 关联关系
  moduleAssetIds: ID[]                 // 包含的Module资产
  
  // 归属
  owner: string                        // 资产负责人
  maintainer: string[]                 // 维护者
  
  // 描述
  description: string
  usageGuide?: string                  // 使用指南
  
  // 版本
  version: string
  
  // 状态
  status: 'draft' | 'verified' | 'stable' | 'deprecated'
  
  // 标签
  tags: string[]
  domain?: Domain
}

/**
 * Module资产（Module Asset）
 * 三层资产模型第三层
 * 覆盖价值流：S3-S5
 */
export interface ModuleAsset extends Timestamps {
  id: ID
  code: string                         // Module资产编号
  name: string                         // 模块名称
  
  // 归属
  featureAssetId: ID                   // 所属Feature资产
  
  // 团队绑定
  teamId: ID                           // 绑定的Team
  teamName: string                     // Team名称
  
  // 代码仓库
  codeRepo: {
    url: string                        // 仓库地址
    branch: string                     // 主分支
    path?: string                      // 模块路径
  }
  
  // 技术规格
  apiSpec: string                      // API规格
  buildConfig: string                  // 构建配置
  
  // 依赖
  dependencies: string[]               // 依赖的其他模块
  
  // 归属
  owner: string                        // 模块负责人
  
  // 描述
  description: string
  
  // 版本
  version: string
  
  // 状态
  status: 'active' | 'deprecated'
}

/**
 * 版本信息
 */
export interface VersionInfo {
  version: string
  releaseDate: ISODate
  changelog: string
  deprecated?: boolean
}

// ============================================================================
// C3: 规划协调 - Planning & Coordination
// ============================================================================

/**
 * PI版本（Program Increment）
 * 覆盖价值流：S4
 */
export interface PIVersion extends Timestamps {
  id: ID
  code: string                         // PI编号（如：PI-2026-Q2）
  name: string                         // PI名称
  
  // 时间规划
  startDate: ISODate                   // 开始日期
  endDate: ISODate                     // 结束日期
  sprintCount: number                  // Sprint数量（通常6个）
  sprintDuration: number               // Sprint时长（天）
  
  // 关联项目
  projectIds: ID[]                     // 关联的领域项目
  
  // PI目标
  objectives: PIObjective[]            // PI目标列表
  
  // 需求范围
  epicIds: ID[]                        // 包含的Epic
  featureIds: ID[]                     // 包含的Feature
  
  // 团队配置
  teams: PITeamConfig[]                // 参与团队配置
  
  // 状态
  status: 'planning' | 'committed' | 'in-progress' | 'completed' | 'cancelled'
  
  // 承诺与完成
  committedStoryPoints: number         // 承诺的Story Points
  completedStoryPoints?: number        // 完成的Story Points
  commitmentRate?: number              // 承诺达成率（%）
  
  // 风险
  risks: Risk[]                        // 风险列表
  
  // 归属
  owner: string                        // PM - Project Manager
  
  // 备注
  notes?: string
}

/**
 * PI目标
 */
export interface PIObjective {
  id: ID
  description: string                  // 目标描述
  businessValue: number                // 业务价值（1-10）
  committed: boolean                   // 是否承诺
  status: 'pending' | 'in-progress' | 'completed' | 'at-risk'
  relatedFeatureIds: ID[]              // 关联的Feature
}

/**
 * PI团队配置
 */
export interface PITeamConfig {
  teamId: ID
  teamName: string
  domain: Domain
  
  // 容量规划
  capacity: number                     // 总容量（Story Points）
  availableDays: number                // 可用人天
  plannedStoryPoints: number           // 已规划Story Points
  loadPercentage: number               // 负载百分比
  
  // 分配的需求
  featureIds: ID[]                     // 分配的Feature
  
  // 速率
  velocity: number                     // 平均速率（SP/Sprint）
  velocityTrend?: 'up' | 'stable' | 'down'
}

/**
 * 风险
 */
export interface Risk {
  id: ID
  description: string                  // 风险描述
  type: 'technical' | 'resource' | 'dependency' | 'external'
  probability: 'low' | 'medium' | 'high'  // 发生概率
  impact: 'low' | 'medium' | 'high'    // 影响程度
  mitigation: string                   // 缓解措施
  owner: string                        // 负责人
  status: 'open' | 'mitigating' | 'resolved' | 'accepted'
  createdAt: ISODate
}

/**
 * PI Planning结果
 * 覆盖价值流：S4
 */
export interface PIPlanningResult extends Timestamps {
  id: ID
  piId: ID                             // 所属PI
  
  // 团队规划
  teamPlannings: TeamPlanning[]        // 各团队规划
  
  // Sprint规划
  sprintPlannings: SprintPlanning[]    // Sprint规划
  
  // 依赖关系
  dependencies: DependencyMatrix[]     // 依赖矩阵
  
  // 风险与问题
  risks: Risk[]                        // 风险列表
  issues: Issue[]                      // 问题列表
  
  // 置信度投票
  confidenceVote?: ConfidenceVote      // 置信度投票结果
  
  // 状态
  status: 'draft' | 'committed' | 'adjusted'
  
  // 备注
  notes?: string
}

/**
 * 团队规划
 */
export interface TeamPlanning {
  teamId: ID
  teamName: string
  
  // 分配的Feature
  features: FeatureAllocation[]
  
  // 负载分析
  totalLoad: number                    // 总负载（SP）
  capacity: number                     // 容量（SP）
  loadPercentage: number               // 负载率（%）
  
  // 风险
  risks: string[]                      // 团队风险
  
  // 依赖
  dependencies: string[]               // 依赖的其他团队
}

/**
 * Feature分配
 */
export interface FeatureAllocation {
  featureId: ID
  featureName: string
  storyPoints: number
  sprint: string                       // 分配的Sprint（如：Sprint 1）
  priority: Priority
  status: 'planned' | 'committed' | 'in-progress' | 'completed'
}

/**
 * Sprint规划
 */
export interface SprintPlanning {
  sprintId: ID
  sprintName: string                   // 如：Sprint 1
  startDate: ISODate
  endDate: ISODate
  
  // Sprint容量
  totalCapacity: number                // 总容量（SP）
  plannedStoryPoints: number           // 已规划（SP）
  
  // Feature分配
  featureIds: ID[]                     // 分配的Feature
  
  // Sprint目标
  goal?: string
}

/**
 * 依赖矩阵项
 */
export interface DependencyMatrix {
  id: ID
  fromFeatureId: ID                    // 依赖方Feature
  toFeatureId: ID                      // 被依赖方Feature
  fromTeam: string                     // 依赖方团队
  toTeam: string                       // 被依赖方团队
  type: Dependency['type']             // 依赖类型
  description: string
  status: 'identified' | 'resolved' | 'blocking'
  criticalPath: boolean                // 是否在关键路径上
}

/**
 * 问题
 */
export interface Issue {
  id: ID
  description: string
  type: 'technical' | 'process' | 'resource' | 'communication'
  severity: 'low' | 'medium' | 'high' | 'critical'
  owner: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdAt: ISODate
  resolvedAt?: ISODate
}

/**
 * 置信度投票
 */
export interface ConfidenceVote {
  voteDate: ISODate
  averageScore: number                 // 平均分（1-5）
  votes: {
    teamId: ID
    teamName: string
    score: number                      // 1-5分
    concerns?: string
  }[]
}

// ============================================================================
// 价值流阶段标记
// ============================================================================

/**
 * 九阶段价值流
 */
export type ValueStreamStage = 
  | 'S1_market_insight'        // S1: 市场洞察
  | 'S2_requirement_breakdown' // S2: 需求分解
  | 'S3_asset_planning'        // S3: 资产规划
  | 'S4_project_initiation'    // S4: 项目立项
  | 'S5_iteration_dev'         // S5: 迭代开发
  | 'S6_integration_test'      // S6: 集成验证
  | 'S7_acceptance_test'       // S7: 测试验收
  | 'S8_artifact_promotion'    // S8: 制品晋级
  | 'S9_product_delivery'      // S9: 产品交付

/**
 * 价值流追踪
 * 用于追踪需求在价值流中的流转
 */
export interface ValueStreamTrace {
  entityId: ID
  entityType: 'Epic' | 'Feature' | 'SSTS' | 'MR'
  currentStage: ValueStreamStage
  stageHistory: {
    stage: ValueStreamStage
    enterTime: ISODate
    exitTime?: ISODate
    duration?: number                  // 停留时长（天）
  }[]
  cycleTime?: number                   // 总周期时间（天）
}

// ============================================================================
// 能力域映射
// ============================================================================

/**
 * 能力域
 */
export type CapabilityDomain = 
  | 'C0_project_mgmt'          // C0: 领域项目管理
  | 'C1_requirement_mgmt'      // C1: 需求管理
  | 'C2_product_mgmt'          // C2: 产品管理（资产）
  | 'C3_planning_coord'        // C3: 规划协调
  | 'C4_iteration_exec'        // C4: 迭代执行
  | 'C5_test_acceptance'       // C5: 测试验收
  | 'C6_devops_delivery'       // C6: DevOps交付
  | 'C7_analytics_governance'  // C7: 分析与治理

/**
 * 能力域上下文
 * 标记实体所属的能力域，支持跨域协作
 */
export interface CapabilityContext {
  primaryDomain: CapabilityDomain      // 主能力域
  involvedDomains: CapabilityDomain[]  // 涉及的其他能力域
  boundedContext: string               // 限界上下文描述
}

// ============================================================================
// 端到端追溯
// ============================================================================

/**
 * 追溯链路
 * 支持需求→代码→测试的完整追溯
 */
export interface TraceabilityChain {
  epicId: ID
  featureIds: ID[]
  sstsIds: ID[]
  mrIds: ID[]
  taskIds?: ID[]
  testCaseIds?: ID[]
  codeCommits?: string[]               // Git commit hash
  buildIds?: ID[]                      // 构建ID
  releaseIds?: ID[]                    // 发布ID
}

// ============================================================================
// 导出所有类型
// ============================================================================

export type {
  // 基础类型
  User,
  Timestamps,
  
  // C0: 项目管理
  Milestone,
  TeamConfig,
  DomainProject,
  
  // C1: 需求管理
  Epic,
  Feature,
  AcceptanceCriteria,
  SSTS,
  PerformanceSpec,
  SafetySpec,
  InterfaceSpec,
  MR,
  Dependency,
  
  // C2: 资产管理
  ProductAsset,
  FeatureAsset,
  ModuleAsset,
  VersionInfo,
  
  // C3: 规划协调
  PIVersion,
  PIObjective,
  PITeamConfig,
  Risk,
  PIPlanningResult,
  TeamPlanning,
  FeatureAllocation,
  SprintPlanning,
  DependencyMatrix,
  Issue,
  ConfidenceVote,
  
  // 价值流
  ValueStreamTrace,
  
  // 能力域
  CapabilityContext,
  
  // 追溯
  TraceabilityChain,
}
