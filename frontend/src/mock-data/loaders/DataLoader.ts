/**
 * 统一数据加载器
 * 负责从JSON文件加载数据到Store
 */

export interface DatasetMetadata {
  version: string
  updatedAt: string
  description?: string
  data: any[]
}

export class DataLoader {
  private datasets: Map<string, DatasetMetadata> = new Map()

  /**
   * 注册数据集
   */
  registerDataset(name: string, dataset: DatasetMetadata) {
    this.datasets.set(name, dataset)
    console.log(`📦 已加载数据集: ${name} (${dataset.data.length}条记录)`)
  }

  /**
   * 获取数据集
   */
  getDataset<T = any>(name: string): T[] {
    const dataset = this.datasets.get(name)
    if (!dataset) {
      console.warn(`⚠️ 数据集 "${name}" 不存在`)
      return []
    }
    return dataset.data as T[]
  }

  /**
   * 根据ID查询单个实体
   */
  findById<T = any>(datasetName: string, id: string): T | undefined {
    const data = this.getDataset<T>(datasetName)
    return data.find((item: any) => item.id === id)
  }

  /**
   * 根据条件查询
   */
  findBy<T = any>(
    datasetName: string, 
    predicate: (item: T) => boolean
  ): T[] {
    const data = this.getDataset<T>(datasetName)
    return data.filter(predicate)
  }

  /**
   * 获取关联数据（一对多）
   * @example
   * // 获取项目的所有版本
   * loader.getRelated('versions', 'projectId', 'proj-001')
   */
  getRelated<T = any>(
    datasetName: string,
    foreignKey: string,
    foreignValue: string
  ): T[] {
    const data = this.getDataset<T>(datasetName)
    return data.filter((item: any) => item[foreignKey] === foreignValue)
  }

  /**
   * 获取关联数据（多对多）
   * @example
   * // 获取PI关联的所有项目
   * loader.getRelatedByArray('pis', 'projectIds', 'proj-001')
   */
  getRelatedByArray<T = any>(
    datasetName: string,
    arrayField: string,
    value: string
  ): T[] {
    const data = this.getDataset<T>(datasetName)
    return data.filter((item: any) => {
      const arr = item[arrayField]
      return Array.isArray(arr) && arr.includes(value)
    })
  }

  /**
   * 批量查询关联数据
   */
  getRelatedMany<T = any>(
    datasetName: string,
    foreignKey: string,
    foreignValues: string[]
  ): T[] {
    const data = this.getDataset<T>(datasetName)
    return data.filter((item: any) => 
      foreignValues.includes(item[foreignKey])
    )
  }

  /**
   * 获取数据集元信息
   */
  getMetadata(datasetName: string) {
    const dataset = this.datasets.get(datasetName)
    if (!dataset) return null
    
    return {
      version: dataset.version,
      updatedAt: dataset.updatedAt,
      description: dataset.description,
      count: dataset.data.length
    }
  }

  /**
   * 获取所有已加载的数据集名称
   */
  getDatasetNames(): string[] {
    return Array.from(this.datasets.keys())
  }

  /**
   * 清空所有数据集
   */
  clear() {
    this.datasets.clear()
  }
}

// 单例
export const dataLoader = new DataLoader()
