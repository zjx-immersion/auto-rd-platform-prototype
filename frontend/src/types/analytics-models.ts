/**
 * 分析与治理模型
 * C7能力域：覆盖全价值流的度量分析
 */

import type { ID, ISODate, Priority, Domain, CapabilityDomain, ValueStreamStage } from './domain-models'

// ============================================================================
// C7: 分析与治理 - Analytics & Governance
// ============================================================================

/**
 * 度量指标基类
 */
export interface MetricBase {
  id: ID
  name: string                         // 指标名称
  category: string                     // 指标类别
  value: number                        // 指标值
  unit: string                         // 单位
  timestamp: ISODate                   // 采集时间
  target?: number                      // 目标值
  threshold?: {
    warning: number                    // 警告阈值
    critical: number                   // 严重阈值
  }
}

/**
 * 效能度量
 * 覆盖价值流：全程
 */
export interface EfficiencyMetrics {
  // 交付周期
  deliveryCycle: {
    avgCycleTime: number               // 平均周期时间（天）
    leadTime: number                   // 前置时间（天）
    deploymentFrequency: number        // 部署频率（次/月）
    trend: 'up' | 'stable' | 'down'
    breakdown: {
      stage: ValueStreamStage
      duration: number                 // 该阶段平均时长（天）
      percentage: number               // 占总周期百分比
    }[]
  }
  
  // 吞吐量
  throughput: {
    completedFeatures: number          // 完成Feature数
    completedStoryPoints: number       // 完成Story Points
    velocity: number                   // 速率（SP/Sprint）
    trend: 'up' | 'stable' | 'down'
    teamBreakdown: {
      teamId: ID
      teamName: string
      velocity: number
      completedSP: number
    }[]
  }
  
  // 阻塞时间
  blockTime: {
    totalBlockedDays: number           // 总阻塞天数
    avgBlockedTime: number             // 平均阻塞时间（小时）
    blockageRate: number               // 阻塞率（%）
    topBlockers: {
      reason: string
      count: number
      avgDuration: number
    }[]
  }
  
  // 资源利用率
  resourceUtilization: {
    avgTeamLoad: number                // 平均团队负载（%）
    overloadedTeams: number            // 超载团队数
    underutilizedTeams: number         // 低效团队数
    teamUtilization: {
      teamId: ID
      teamName: string
      utilization: number              // 利用率（%）
      capacity: number
      allocated: number
    }[]
  }
  
  // 时间范围
  period: {
    start: ISODate
    end: ISODate
  }
}

/**
 * 质量度量
 * 覆盖价值流：S6-S7
 */
export interface QualityMetrics {
  // 缺陷密度
  defectDensity: {
    defectsPerKLOC: number             // 每千行代码缺陷数
    totalDefects: number               // 总缺陷数
    totalLOC: number                   // 总代码行数
    trend: 'up' | 'stable' | 'down'
    severityBreakdown: {
      severity: 'critical' | 'major' | 'minor' | 'trivial'
      count: number
      percentage: number
    }[]
  }
  
  // 测试覆盖率
  testCoverage: {
    overall: number                    // 总覆盖率（%）
    unit: number                       // 单元测试覆盖率
    integration: number                // 集成测试覆盖率
    system: number                     // 系统测试覆盖率
    trend: 'up' | 'stable' | 'down'
    moduleBreakdown: {
      moduleName: string
      coverage: number
      uncoveredLines: number
    }[]
  }
  
  // 缺陷逃逸率
  defectEscapeRate: {
    escapeRate: number                 // 逃逸率（%）
    foundInProduction: number          // 生产环境发现
    foundInTest: number                // 测试环境发现
    foundInDev: number                 // 开发环境发现
    stageBreakdown: {
      stage: string
      defects: number
      percentage: number
    }[]
  }
  
  // 代码质量
  codeQuality: {
    complexity: number                 // 平均圈复杂度
    maintainability: number            // 可维护性指数
    technicalDebt: number              // 技术债务（天）
    duplications: number               // 重复率（%）
    codeSmells: number                 // 代码异味数量
    securityVulnerabilities: number    // 安全漏洞数
  }
  
  // 时间范围
  period: {
    start: ISODate
    end: ISODate
  }
}

/**
 * 追溯分析
 * 覆盖价值流：全程
 */
export interface TraceabilityAnalytics {
  // 需求追溯覆盖率
  traceabilityCoverage: {
    totalRequirements: number          // 总需求数
    tracedRequirements: number         // 已追溯需求数
    coverageRate: number               // 覆盖率（%）
    
    // 各层级覆盖率
    epicCoverage: number               // Epic追溯覆盖率
    featureCoverage: number            // Feature追溯覆盖率
    sstsCoverage: number               // SSTS追溯覆盖率
    mrCoverage: number                 // MR追溯覆盖率
  }
  
  // 需求→代码追溯
  requirementToCode: {
    requirementId: ID
    requirementType: 'Epic' | 'Feature' | 'SSTS' | 'MR'
    requirementTitle: string
    codeFiles: string[]                // 关联代码文件
    commits: string[]                  // 关联提交
    coverage: number                   // 代码覆盖率
    lastModified: ISODate
  }[]
  
  // 代码→测试追溯
  codeToTest: {
    codeFile: string
    testCases: ID[]                    // 关联测试用例
    testCoverage: number               // 测试覆盖率
    lastTested: ISODate
  }[]
  
  // 变更影响分析
  changeImpact: {
    changeId: ID
    changeType: 'code' | 'requirement' | 'test'
    impactedRequirements: ID[]         // 影响的需求
    impactedCode: string[]             // 影响的代码
    impactedTests: ID[]                // 影响的测试
    riskLevel: 'low' | 'medium' | 'high'
  }[]
  
  // 缺陷根因分析
  defectRootCause: {
    defectId: ID
    rootRequirement: ID                // 根因需求
    rootCause: string                  // 根因描述
    category: 'requirement' | 'design' | 'implementation' | 'test'
    fixedIn: string                    // 修复版本
  }[]
}

/**
 * 复用分析
 * 覆盖价值流：S3
 */
export interface ReuseAnalytics {
  // 资产复用率
  reuseRate: {
    overall: number                    // 总复用率（%）
    target: number                     // 目标复用率
    improvement: number                // 相比上期提升
    
    // 按资产层级
    productAssetReuseRate: number      // 产品资产复用率
    featureAssetReuseRate: number      // Feature资产复用率
    moduleAssetReuseRate: number       // Module资产复用率
    
    // 按领域
    domainBreakdown: {
      domain: Domain
      reuseRate: number
      newAssets: number
      reusedAssets: number
    }[]
  }
  
  // 资产成熟度分布
  maturityDistribution: {
    total: number                      // 总资产数
    distribution: {
      level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
      count: number
      percentage: number
    }[]
    avgMaturityLevel: number           // 平均成熟度
    l3PlusPercentage: number           // L3+占比（%）
  }
  
  // 复用收益分析
  reuseBenefit: {
    costSaved: number                  // 节省成本（人天）
    timeSaved: number                  // 节省时间（天）
    roi: number                        // 投资回报率
    avoidedDuplication: number         // 避免的重复开发
    
    // TOP复用资产
    topReusedAssets: {
      assetId: ID
      assetName: string
      reuseCount: number
      maturityLevel: string
      costSaved: number
    }[]
  }
  
  // 资产健康度
  assetHealth: {
    totalAssets: number
    healthyAssets: number              // 健康资产（L3+）
    unhealthyAssets: number            // 不健康资产（L1-L2）
    deprecatedAssets: number           // 废弃资产
    
    // 需要关注的资产
    assetsNeedAttention: {
      assetId: ID
      assetName: string
      issue: string                    // 问题描述
      recommendation: string           // 建议措施
    }[]
  }
}

/**
 * 仪表板配置
 */
export interface Dashboard {
  id: ID
  name: string                         // 仪表板名称
  type: 'management' | 'pm' | 'team' | 'custom'
  owner: string                        // 所有者
  
  // 布局配置
  layout: DashboardLayout
  
  // 权限
  visibility: 'private' | 'team' | 'organization'
  sharedWith?: string[]                // 共享给
  
  // 刷新频率
  refreshInterval?: number             // 刷新间隔（秒）
  
  // 创建时间
  createdAt: ISODate
  updatedAt: ISODate
}

/**
 * 仪表板布局
 */
export interface DashboardLayout {
  rows: DashboardRow[]
}

/**
 * 仪表板行
 */
export interface DashboardRow {
  id: ID
  widgets: DashboardWidget[]
}

/**
 * 仪表板小部件
 */
export interface DashboardWidget {
  id: ID
  type: 'chart' | 'metric' | 'table' | 'timeline' | 'heatmap' | 'gauge'
  title: string
  
  // 数据源
  dataSource: {
    metricType: 'efficiency' | 'quality' | 'traceability' | 'reuse'
    metricName: string
    filters?: Record<string, any>
    aggregation?: 'sum' | 'avg' | 'max' | 'min' | 'count'
    timeRange?: {
      start: ISODate
      end: ISODate
    }
  }
  
  // 显示配置
  displayConfig: {
    chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'area'
    xAxis?: string
    yAxis?: string
    groupBy?: string
    colors?: string[]
    showLegend?: boolean
    showDataLabels?: boolean
  }
  
  // 尺寸
  size: {
    width: number                      // 占据列数（1-12）
    height: number                     // 像素高度
  }
  
  // 告警配置
  alerts?: {
    enabled: boolean
    condition: 'above' | 'below' | 'equals'
    threshold: number
    notifyUsers: string[]
  }
}

/**
 * 度量报告
 */
export interface MetricReport {
  id: ID
  title: string                        // 报告标题
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom'
  
  // 时间范围
  period: {
    start: ISODate
    end: ISODate
  }
  
  // 报告内容
  sections: ReportSection[]
  
  // 总结
  summary: {
    keyMetrics: {
      name: string
      value: number
      change: number                   // 变化（%）
      trend: 'up' | 'stable' | 'down'
    }[]
    highlights: string[]               // 亮点
    concerns: string[]                 // 关注点
    recommendations: string[]          // 建议
  }
  
  // 生成信息
  generatedBy: string
  generatedAt: ISODate
  
  // 分发
  recipients: string[]
  
  // 附件
  attachments?: string[]
}

/**
 * 报告章节
 */
export interface ReportSection {
  id: ID
  title: string                        // 章节标题
  type: 'efficiency' | 'quality' | 'traceability' | 'reuse' | 'custom'
  
  // 章节内容
  content: {
    text?: string                      // 文本描述
    charts?: ChartData[]               // 图表数据
    tables?: TableData[]               // 表格数据
    insights?: string[]                // 洞察
  }
  
  // 排序
  order: number
}

/**
 * 图表数据
 */
export interface ChartData {
  id: ID
  title: string
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'heatmap'
  data: any                            // 图表数据（格式根据type而定）
  options?: any                        // 图表选项
}

/**
 * 表格数据
 */
export interface TableData {
  id: ID
  title: string
  headers: string[]                    // 表头
  rows: any[][]                        // 行数据
  summary?: any[]                      // 汇总行
}

/**
 * 趋势数据点
 */
export interface TrendPoint {
  timestamp: ISODate
  value: number
  label?: string
}

/**
 * 对比数据
 */
export interface ComparisonData {
  label: string
  current: number
  previous: number
  change: number                       // 变化值
  changePercent: number                // 变化百分比
  trend: 'up' | 'stable' | 'down'
}

// ============================================================================
// 导出所有类型
// ============================================================================

export type {
  // 基础度量
  MetricBase,
  
  // 效能度量
  EfficiencyMetrics,
  
  // 质量度量
  QualityMetrics,
  
  // 追溯分析
  TraceabilityAnalytics,
  
  // 复用分析
  ReuseAnalytics,
  
  // 仪表板
  Dashboard,
  DashboardLayout,
  DashboardRow,
  DashboardWidget,
  
  // 报告
  MetricReport,
  ReportSection,
  ChartData,
  TableData,
  
  // 通用
  TrendPoint,
  ComparisonData,
}
