/**
 * 数据分析API - C7能力域
 */

import request from '@/utils/request'
import type { 
  RequirementMetric, 
  QualityMetric, 
  DeliveryMetric, 
  TeamEfficiencyMetric 
} from '@/types'

const BASE_URL = '/api/v1'

/**
 * 需求度量API
 */
export const requirementMetricApi = {
  // 获取需求度量数据
  getRequirementMetrics: (params?: any) =>
    request.get<RequirementMetric>(`${BASE_URL}/metrics/requirement`, { params }),
}

/**
 * 质量度量API
 */
export const qualityMetricApi = {
  // 获取质量度量数据
  getQualityMetrics: (params?: any) =>
    request.get<QualityMetric>(`${BASE_URL}/metrics/quality`, { params }),
}

/**
 * 交付度量API
 */
export const deliveryMetricApi = {
  // 获取交付度量数据
  getDeliveryMetrics: (params?: any) =>
    request.get<DeliveryMetric>(`${BASE_URL}/metrics/delivery`, { params }),
}

/**
 * 团队效能度量API
 */
export const teamEfficiencyMetricApi = {
  // 获取团队效能度量数据
  getTeamEfficiencyMetrics: (params?: any) =>
    request.get<TeamEfficiencyMetric>(`${BASE_URL}/metrics/team-efficiency`, { params }),
}

/**
 * 综合报表API
 */
export const reportApi = {
  // 获取PI报表
  getPIReport: (piId: string) =>
    request.get(`${BASE_URL}/reports/pi/${piId}`),

  // 获取Sprint报表
  getSprintReport: (sprintId: string) =>
    request.get(`${BASE_URL}/reports/sprint/${sprintId}`),

  // 获取团队报表
  getTeamReport: (teamId: string, params?: any) =>
    request.get(`${BASE_URL}/reports/team/${teamId}`, { params }),

  // 获取项目报表
  getProjectReport: (projectId: string, params?: any) =>
    request.get(`${BASE_URL}/reports/project/${projectId}`, { params }),
}
