/**
 * DevOps管理API - C6能力域
 */

import request from '@/utils/request'
import type { Build, Deployment, Environment } from '@/types'

const BASE_URL = '/api/v1'

/**
 * 构建管理API
 */
export const buildApi = {
  // 获取构建列表
  getBuilds: (params?: any) =>
    request.get<Build[]>(`${BASE_URL}/builds`, { params }),

  // 获取构建详情
  getBuildById: (id: string) =>
    request.get<Build>(`${BASE_URL}/builds/${id}`),

  // 触发构建
  triggerBuild: (data: Partial<Build>) =>
    request.post<Build>(`${BASE_URL}/builds`, data),

  // 取消构建
  cancelBuild: (id: string) =>
    request.post(`${BASE_URL}/builds/${id}/cancel`),

  // 重新构建
  rebuildBuild: (id: string) =>
    request.post(`${BASE_URL}/builds/${id}/rebuild`),
}

/**
 * 部署管理API
 */
export const deploymentApi = {
  // 获取部署列表
  getDeployments: (params?: any) =>
    request.get<Deployment[]>(`${BASE_URL}/deployments`, { params }),

  // 获取部署详情
  getDeploymentById: (id: string) =>
    request.get<Deployment>(`${BASE_URL}/deployments/${id}`),

  // 创建部署
  createDeployment: (data: Partial<Deployment>) =>
    request.post<Deployment>(`${BASE_URL}/deployments`, data),

  // 回滚部署
  rollbackDeployment: (id: string) =>
    request.post(`${BASE_URL}/deployments/${id}/rollback`),
}

/**
 * 环境管理API
 */
export const environmentApi = {
  // 获取环境列表
  getEnvironments: () =>
    request.get<Environment[]>(`${BASE_URL}/environments`),

  // 获取环境详情
  getEnvironmentById: (id: string) =>
    request.get<Environment>(`${BASE_URL}/environments/${id}`),

  // 创建环境
  createEnvironment: (data: Partial<Environment>) =>
    request.post<Environment>(`${BASE_URL}/environments`, data),

  // 更新环境
  updateEnvironment: (id: string, data: Partial<Environment>) =>
    request.put<Environment>(`${BASE_URL}/environments/${id}`, data),

  // 删除环境
  deleteEnvironment: (id: string) =>
    request.delete(`${BASE_URL}/environments/${id}`),
}
