/**
 * 测试管理API - C5能力域
 */

import request from '@/utils/request'
import type { TestCase, Defect } from '@/types'

const BASE_URL = '/api/v1'

/**
 * 测试用例API
 */
export const testCaseApi = {
  // 获取测试用例列表
  getTestCases: (params?: any) =>
    request.get<TestCase[]>(`${BASE_URL}/test-cases`, { params }),

  // 获取测试用例详情
  getTestCaseById: (id: string) =>
    request.get<TestCase>(`${BASE_URL}/test-cases/${id}`),

  // 创建测试用例
  createTestCase: (data: Partial<TestCase>) =>
    request.post<TestCase>(`${BASE_URL}/test-cases`, data),

  // 更新测试用例
  updateTestCase: (id: string, data: Partial<TestCase>) =>
    request.put<TestCase>(`${BASE_URL}/test-cases/${id}`, data),

  // 删除测试用例
  deleteTestCase: (id: string) =>
    request.delete(`${BASE_URL}/test-cases/${id}`),

  // 执行测试用例
  executeTestCase: (id: string, result: 'passed' | 'failed' | 'blocked') =>
    request.post(`${BASE_URL}/test-cases/${id}/execute`, { result }),
}

/**
 * 缺陷管理API
 */
export const defectApi = {
  // 获取缺陷列表
  getDefects: (params?: any) =>
    request.get<Defect[]>(`${BASE_URL}/defects`, { params }),

  // 获取缺陷详情
  getDefectById: (id: string) =>
    request.get<Defect>(`${BASE_URL}/defects/${id}`),

  // 创建缺陷
  createDefect: (data: Partial<Defect>) =>
    request.post<Defect>(`${BASE_URL}/defects`, data),

  // 更新缺陷
  updateDefect: (id: string, data: Partial<Defect>) =>
    request.put<Defect>(`${BASE_URL}/defects/${id}`, data),

  // 删除缺陷
  deleteDefect: (id: string) =>
    request.delete(`${BASE_URL}/defects/${id}`),

  // 分配缺陷
  assignDefect: (id: string, assignee: string) =>
    request.post(`${BASE_URL}/defects/${id}/assign`, { assignee }),

  // 更新缺陷状态
  updateDefectStatus: (id: string, status: Defect['status']) =>
    request.put(`${BASE_URL}/defects/${id}/status`, { status }),
}
