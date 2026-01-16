/**
 * 迭代执行API - C4能力域
 */

import request from '@/utils/request'
import type { Sprint, Task } from '@/types'

const BASE_URL = '/api/v1'

/**
 * Sprint管理API
 */
export const sprintApi = {
  // 获取Sprint列表
  getSprints: (params?: any) =>
    request.get<Sprint[]>(`${BASE_URL}/sprints`, { params }),

  // 获取Sprint详情
  getSprintById: (id: string) =>
    request.get<Sprint>(`${BASE_URL}/sprints/${id}`),

  // 创建Sprint
  createSprint: (data: Partial<Sprint>) =>
    request.post<Sprint>(`${BASE_URL}/sprints`, data),

  // 更新Sprint
  updateSprint: (id: string, data: Partial<Sprint>) =>
    request.put<Sprint>(`${BASE_URL}/sprints/${id}`, data),

  // 删除Sprint
  deleteSprint: (id: string) =>
    request.delete(`${BASE_URL}/sprints/${id}`),

  // 启动Sprint
  startSprint: (id: string) =>
    request.post(`${BASE_URL}/sprints/${id}/start`),

  // 完成Sprint
  completeSprint: (id: string) =>
    request.post(`${BASE_URL}/sprints/${id}/complete`),
}

/**
 * Task管理API
 */
export const taskApi = {
  // 获取Task列表
  getTasks: (params?: any) =>
    request.get<Task[]>(`${BASE_URL}/tasks`, { params }),

  // 获取Task详情
  getTaskById: (id: string) =>
    request.get<Task>(`${BASE_URL}/tasks/${id}`),

  // 创建Task
  createTask: (data: Partial<Task>) =>
    request.post<Task>(`${BASE_URL}/tasks`, data),

  // 更新Task
  updateTask: (id: string, data: Partial<Task>) =>
    request.put<Task>(`${BASE_URL}/tasks/${id}`, data),

  // 删除Task
  deleteTask: (id: string) =>
    request.delete(`${BASE_URL}/tasks/${id}`),

  // 分配Task
  assignTask: (id: string, assignee: string) =>
    request.post(`${BASE_URL}/tasks/${id}/assign`, { assignee }),

  // 更新Task状态
  updateTaskStatus: (id: string, status: Task['status']) =>
    request.put(`${BASE_URL}/tasks/${id}/status`, { status }),
}
