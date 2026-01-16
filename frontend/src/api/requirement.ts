/**
 * 需求管理API - C1能力域
 */

import request from '@/utils/request'
import type { Epic, Feature, SSTS, MR } from '@/types'

const BASE_URL = '/api/v1'

/**
 * Epic管理API
 */
export const epicApi = {
  // 获取Epic列表
  getEpics: (params?: any) =>
    request.get<Epic[]>(`${BASE_URL}/epics`, { params }),

  // 获取Epic详情
  getEpicById: (id: string) =>
    request.get<Epic>(`${BASE_URL}/epics/${id}`),

  // 创建Epic
  createEpic: (data: Partial<Epic>) =>
    request.post<Epic>(`${BASE_URL}/epics`, data),

  // 更新Epic
  updateEpic: (id: string, data: Partial<Epic>) =>
    request.put<Epic>(`${BASE_URL}/epics/${id}`, data),

  // 删除Epic
  deleteEpic: (id: string) =>
    request.delete(`${BASE_URL}/epics/${id}`),

  // 分解Epic到Feature
  decomposeToFeatures: (id: string, features: Partial<Feature>[]) =>
    request.post(`${BASE_URL}/epics/${id}/decompose`, { features }),
}

/**
 * Feature管理API
 */
export const featureApi = {
  // 获取Feature列表
  getFeatures: (params?: any) =>
    request.get<Feature[]>(`${BASE_URL}/features`, { params }),

  // 根据Epic获取Feature列表
  getFeaturesByEpic: (epicId: string) =>
    request.get<Feature[]>(`${BASE_URL}/features`, { params: { epicId } }),

  // 获取Feature详情
  getFeatureById: (id: string) =>
    request.get<Feature>(`${BASE_URL}/features/${id}`),

  // 创建Feature
  createFeature: (data: Partial<Feature>) =>
    request.post<Feature>(`${BASE_URL}/features`, data),

  // 更新Feature
  updateFeature: (id: string, data: Partial<Feature>) =>
    request.put<Feature>(`${BASE_URL}/features/${id}`, data),

  // 更新PRD
  updatePRD: (id: string, prd: any) =>
    request.put(`${BASE_URL}/features/${id}/prd`, prd),

  // 删除Feature
  deleteFeature: (id: string) =>
    request.delete(`${BASE_URL}/features/${id}`),

  // 分解Feature到SSTS
  decomposeToSSTS: (id: string, sstsList: Partial<SSTS>[]) =>
    request.post(`${BASE_URL}/features/${id}/decompose`, { sstsList }),
}

/**
 * SSTS管理API
 */
export const sstsApi = {
  // 获取SSTS列表
  getSSTSList: (params?: any) =>
    request.get<SSTS[]>(`${BASE_URL}/ssts`, { params }),

  // 根据Feature获取SSTS列表
  getSSTSByFeature: (featureId: string) =>
    request.get<SSTS[]>(`${BASE_URL}/ssts`, { params: { featureId } }),

  // 获取SSTS详情
  getSSTSById: (id: string) =>
    request.get<SSTS>(`${BASE_URL}/ssts/${id}`),

  // 创建SSTS
  createSSTS: (data: Partial<SSTS>) =>
    request.post<SSTS>(`${BASE_URL}/ssts`, data),

  // 批量创建SSTS
  batchCreateSSTS: (dataList: Partial<SSTS>[]) =>
    request.post<SSTS[]>(`${BASE_URL}/ssts/batch`, { items: dataList }),

  // 更新SSTS
  updateSSTS: (id: string, data: Partial<SSTS>) =>
    request.put<SSTS>(`${BASE_URL}/ssts/${id}`, data),

  // 删除SSTS
  deleteSSTS: (id: string) =>
    request.delete(`${BASE_URL}/ssts/${id}`),

  // 分解SSTS到MR
  decomposeToMRs: (id: string, mrList: Partial<MR>[]) =>
    request.post(`${BASE_URL}/ssts/${id}/decompose`, { mrList }),
}

/**
 * MR管理API
 */
export const mrApi = {
  // 获取MR列表
  getMRs: (params?: any) =>
    request.get<MR[]>(`${BASE_URL}/mrs`, { params }),

  // 根据SSTS获取MR列表
  getMRsBySSTS: (sstsId: string) =>
    request.get<MR[]>(`${BASE_URL}/mrs`, { params: { sstsId } }),

  // 根据团队获取MR列表
  getMRsByTeam: (teamId: string) =>
    request.get<MR[]>(`${BASE_URL}/mrs`, { params: { teamId } }),

  // 获取MR详情
  getMRById: (id: string) =>
    request.get<MR>(`${BASE_URL}/mrs/${id}`),

  // 创建MR
  createMR: (data: Partial<MR>) =>
    request.post<MR>(`${BASE_URL}/mrs`, data),

  // 更新MR
  updateMR: (id: string, data: Partial<MR>) =>
    request.put<MR>(`${BASE_URL}/mrs/${id}`, data),

  // 分配MR到团队
  assignToTeam: (id: string, teamId: string, teamName: string) =>
    request.post(`${BASE_URL}/mrs/${id}/assign`, { teamId, teamName }),

  // 删除MR
  deleteMR: (id: string) =>
    request.delete(`${BASE_URL}/mrs/${id}`),
}
