/**
 * 规划协调API - C3能力域
 */

import request from '@/utils/request'
import type { 
  PIPlanningResult, 
  TeamPlanning,
  DependencyMatrix,
  FeatureAllocation 
} from '@/types'

const BASE_URL = '/api/v1'

/**
 * PI Planning API
 */
export const planningApi = {
  // 获取PI Planning结果
  getPlanningResult: (piId: string) =>
    request.get<PIPlanningResult>(`${BASE_URL}/planning/${piId}`),

  // 创建PI Planning
  startPlanning: (piId: string) =>
    request.post<PIPlanningResult>(`${BASE_URL}/planning`, { piId }),

  // 分配Feature到团队
  allocateFeature: (
    planningId: string,
    teamId: string,
    allocation: FeatureAllocation
  ) =>
    request.post(`${BASE_URL}/planning/${planningId}/allocate`, {
      teamId,
      allocation,
    }),

  // 移除Feature分配
  removeFeature: (planningId: string, teamId: string, featureId: string) =>
    request.delete(
      `${BASE_URL}/planning/${planningId}/teams/${teamId}/features/${featureId}`
    ),

  // 添加依赖关系
  addDependency: (planningId: string, dependency: DependencyMatrix) =>
    request.post(`${BASE_URL}/planning/${planningId}/dependencies`, dependency),

  // 更新依赖关系
  updateDependency: (
    planningId: string,
    dependencyId: string,
    updates: Partial<DependencyMatrix>
  ) =>
    request.put(
      `${BASE_URL}/planning/${planningId}/dependencies/${dependencyId}`,
      updates
    ),

  // 删除依赖关系
  deleteDependency: (planningId: string, dependencyId: string) =>
    request.delete(
      `${BASE_URL}/planning/${planningId}/dependencies/${dependencyId}`
    ),

  // 识别依赖关系
  identifyDependencies: (planningId: string) =>
    request.post(`${BASE_URL}/planning/${planningId}/dependencies/identify`),

  // 检测冲突
  detectConflicts: (planningId: string) =>
    request.get(`${BASE_URL}/planning/${planningId}/conflicts`),

  // 保存草稿
  saveDraft: (planningId: string, data: Partial<PIPlanningResult>) =>
    request.put(`${BASE_URL}/planning/${planningId}/draft`, data),

  // 提交PI Planning
  commitPlanning: (planningId: string) =>
    request.post(`${BASE_URL}/planning/${planningId}/commit`),

  // 调整PI Planning
  adjustPlanning: (planningId: string, data: Partial<PIPlanningResult>) =>
    request.put(`${BASE_URL}/planning/${planningId}/adjust`, data),

  // 获取团队负载分析
  getTeamLoadAnalysis: (planningId: string) =>
    request.get(`${BASE_URL}/planning/${planningId}/team-load`),

  // 获取关键依赖
  getCriticalDependencies: (planningId: string) =>
    request.get(`${BASE_URL}/planning/${planningId}/dependencies/critical`),
}

/**
 * 依赖管理API
 */
export const dependencyApi = {
  // 获取依赖矩阵
  getDependencyMatrix: (piId: string) =>
    request.get<DependencyMatrix[]>(`${BASE_URL}/dependencies/matrix/${piId}`),

  // 获取关键路径
  getCriticalPath: (piId: string) =>
    request.get(`${BASE_URL}/dependencies/critical-path/${piId}`),

  // 获取阻塞依赖
  getBlockingDependencies: (piId: string) =>
    request.get(`${BASE_URL}/dependencies/blocking/${piId}`),
}
