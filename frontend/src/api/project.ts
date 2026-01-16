/**
 * 项目管理API - C0能力域
 */

import request from '@/utils/request'
import type { Project, Version, PI } from '@/types'

const BASE_URL = '/api/v1'

/**
 * 项目管理API
 */
export const projectApi = {
  // 获取项目列表
  getProjects: (params?: any) => 
    request.get<Project[]>(`${BASE_URL}/projects`, { params }),

  // 获取项目详情
  getProjectById: (id: string) =>
    request.get<Project>(`${BASE_URL}/projects/${id}`),

  // 创建项目
  createProject: (data: Partial<Project>) =>
    request.post<Project>(`${BASE_URL}/projects`, data),

  // 更新项目
  updateProject: (id: string, data: Partial<Project>) =>
    request.put<Project>(`${BASE_URL}/projects/${id}`, data),

  // 删除项目
  deleteProject: (id: string) =>
    request.delete(`${BASE_URL}/projects/${id}`),

  // 获取项目成员
  getProjectMembers: (projectId: string) =>
    request.get(`${BASE_URL}/projects/${projectId}/members`),

  // 添加项目成员
  addProjectMember: (projectId: string, userId: string, role: string) =>
    request.post(`${BASE_URL}/projects/${projectId}/members`, { userId, role }),
}

/**
 * 版本管理API
 */
export const versionApi = {
  // 获取版本列表
  getVersions: (projectId?: string) =>
    request.get<Version[]>(`${BASE_URL}/versions`, { params: { projectId } }),

  // 获取版本详情
  getVersionById: (id: string) =>
    request.get<Version>(`${BASE_URL}/versions/${id}`),

  // 创建版本
  createVersion: (data: Partial<Version>) =>
    request.post<Version>(`${BASE_URL}/versions`, data),

  // 更新版本
  updateVersion: (id: string, data: Partial<Version>) =>
    request.put<Version>(`${BASE_URL}/versions/${id}`, data),

  // 删除版本
  deleteVersion: (id: string) =>
    request.delete(`${BASE_URL}/versions/${id}`),
}

/**
 * PI版本API
 */
export const piApi = {
  // 获取PI列表
  getPIs: (params?: any) =>
    request.get<PI[]>(`${BASE_URL}/pis`, { params }),

  // 获取PI详情
  getPIById: (id: string) =>
    request.get<PI>(`${BASE_URL}/pis/${id}`),

  // 创建PI
  createPI: (data: Partial<PI>) =>
    request.post<PI>(`${BASE_URL}/pis`, data),

  // 更新PI
  updatePI: (id: string, data: Partial<PI>) =>
    request.put<PI>(`${BASE_URL}/pis/${id}`, data),

  // 删除PI
  deletePI: (id: string) =>
    request.delete(`${BASE_URL}/pis/${id}`),

  // 提交PI
  commitPI: (id: string) =>
    request.post(`${BASE_URL}/pis/${id}/commit`),

  // 启动PI
  startPI: (id: string) =>
    request.post(`${BASE_URL}/pis/${id}/start`),

  // 完成PI
  completePI: (id: string, completedStoryPoints: number) =>
    request.post(`${BASE_URL}/pis/${id}/complete`, { completedStoryPoints }),
}
