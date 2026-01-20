/**
 * 领域项目管理 - 产品相关类型定义
 * C0能力域: 领域项目管理 - 产品管理
 */

import type { User, Version, ProductLine } from './domain-models'

/**
 * 领域产品 (Domain Product)
 * 注意: 这是领域项目管理中的"产品"概念,不是资产管理的Product
 */
export interface DomainProduct {
  productId: string
  productName: string
  productCode: string
  productLine: ProductLine
  
  // 所属项目
  projectId: string
  projectName: string
  
  // Epic分配(从项目Epic池中选择)
  allocatedEpicIds: string[]
  
  // 版本列表
  versions: Version[]
  
  // 产品负责人
  productOwner: User
  
  // 描述
  description: string
  
  // 统计
  stats: {
    totalEpics: number
    totalSP: number
    totalVersions: number
  }
  
  createdAt: string
  updatedAt: string
}

/**
 * 创建产品输入
 */
export interface CreateDomainProductInput {
  productName: string
  productCode: string
  productLine: ProductLine
  projectId: string
  productOwnerId: string
  description: string
  allocatedEpicIds: string[]
}

/**
 * 更新产品输入
 */
export interface UpdateDomainProductInput {
  productName?: string
  productCode?: string
  productLine?: ProductLine
  productOwnerId?: string
  description?: string
  allocatedEpicIds?: string[]
}

/**
 * 分配Epic到产品输入
 */
export interface AllocateEpicToProductInput {
  productId: string
  epicId: string
}

/**
 * 批量分配Epic到产品输入
 */
export interface BatchAllocateEpicsToProductInput {
  productId: string
  epicIds: string[]
}
