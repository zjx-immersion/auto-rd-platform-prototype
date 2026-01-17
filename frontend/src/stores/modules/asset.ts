/**
 * 资产管理Store
 * C2能力域：产品管理(资产)
 * 覆盖价值流：S3-S9
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Asset, ProductLine, Product } from '@/types'

export const useAssetStore = defineStore('asset', () => {
  // ============================================================================
  // State
  // ============================================================================

  /** 资产列表 */
  const assets = ref<Asset[]>([])

  /** 产品线列表 */
  const productLines = ref<ProductLine[]>([])

  /** 产品列表 */
  const products = ref<Product[]>([])

  /** 当前资产 */
  const currentAsset = ref<Asset | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * 根据产品ID获取资产
   */
  const assetsByProduct = computed(() => {
    return (productId: string) => {
      return assets.value.filter(a => a.productId === productId)
    }
  })

  /**
   * 根据成熟度过滤资产
   */
  const assetsByMaturity = computed(() => {
    return (maturityLevel: string) => {
      return assets.value.filter(a => a.maturityLevel === maturityLevel)
    }
  })

  /**
   * 根据类型过滤资产
   */
  const assetsByType = computed(() => {
    return (type: string) => {
      return assets.value.filter(a => a.type === type)
    }
  })

  /**
   * 高成熟度资产（L3+）
   */
  const highMaturityAssets = computed(() => {
    return assets.value.filter(a => {
      const level = parseInt(a.maturityLevel?.replace('L', '') || '0')
      return level >= 3
    })
  })

  /**
   * 根据产品线ID获取产品
   */
  const productsByProductLine = computed(() => {
    return (productLineId: string) => {
      return products.value.filter(p => p.productLineId === productLineId)
    }
  })

  // ============================================================================
  // Actions - ProductLine Management
  // ============================================================================

  /**
   * 获取产品线列表
   */
  async function fetchProductLines() {
    loading.value = true
    error.value = null
    try {
      // 这里应该调用API，目前返回Store中的数据
      return productLines.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取产品线列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建产品线
   */
  async function createProductLine(productLine: ProductLine) {
    loading.value = true
    error.value = null
    try {
      productLines.value.push(productLine)
      return productLine
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建产品线失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新产品线
   */
  async function updateProductLine(id: string, updates: Partial<ProductLine>) {
    loading.value = true
    error.value = null
    try {
      const index = productLines.value.findIndex(p => p.id === id)
      if (index !== -1) {
        productLines.value[index] = {
          ...productLines.value[index],
          ...updates,
          updatedAt: new Date()
        }
        return productLines.value[index]
      }
      throw new Error('产品线不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新产品线失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // Actions - Product Management
  // ============================================================================

  /**
   * 获取产品列表
   */
  async function fetchProducts(productLineId?: string) {
    loading.value = true
    error.value = null
    try {
      if (productLineId) {
        return products.value.filter(p => p.productLineId === productLineId)
      }
      return products.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取产品列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建产品
   */
  async function createProduct(product: Product) {
    loading.value = true
    error.value = null
    try {
      products.value.push(product)
      return product
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建产品失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新产品
   */
  async function updateProduct(id: string, updates: Partial<Product>) {
    loading.value = true
    error.value = null
    try {
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = {
          ...products.value[index],
          ...updates,
          updatedAt: new Date()
        }
        return products.value[index]
      }
      throw new Error('产品不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新产品失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // Actions - Asset Management
  // ============================================================================

  /**
   * 获取资产列表
   */
  async function fetchAssets(params?: {
    productId?: string
    type?: string
    maturityLevel?: string
    keyword?: string
  }) {
    loading.value = true
    error.value = null
    try {
      let result = assets.value

      // 按产品过滤
      if (params?.productId) {
        result = result.filter(a => a.productId === params.productId)
      }

      // 按类型过滤
      if (params?.type) {
        result = result.filter(a => a.type === params.type)
      }

      // 按成熟度过滤
      if (params?.maturityLevel) {
        result = result.filter(a => a.maturityLevel === params.maturityLevel)
      }

      // 按关键词搜索
      if (params?.keyword) {
        const keyword = params.keyword.toLowerCase()
        result = result.filter(a => 
          a.name.toLowerCase().includes(keyword) ||
          a.description?.toLowerCase().includes(keyword)
        )
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取资产列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取资产
   */
  async function fetchAssetById(id: string) {
    loading.value = true
    error.value = null
    try {
      const asset = assets.value.find(a => a.id === id)
      if (asset) {
        currentAsset.value = asset
        return asset
      }
      throw new Error('资产不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取资产失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建资产
   */
  async function createAsset(asset: Asset) {
    loading.value = true
    error.value = null
    try {
      assets.value.push(asset)
      return asset
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建资产失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新资产
   */
  async function updateAsset(id: string, updates: Partial<Asset>) {
    loading.value = true
    error.value = null
    try {
      const index = assets.value.findIndex(a => a.id === id)
      if (index !== -1) {
        assets.value[index] = {
          ...assets.value[index],
          ...updates,
          updatedAt: new Date()
        }
        return assets.value[index]
      }
      throw new Error('资产不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新资产失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除资产
   */
  async function deleteAsset(id: string) {
    loading.value = true
    error.value = null
    try {
      const index = assets.value.findIndex(a => a.id === id)
      if (index !== -1) {
        assets.value.splice(index, 1)
        return true
      }
      throw new Error('资产不存在')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除资产失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索资产（高级搜索）
   */
  async function searchAssets(query: {
    keyword?: string
    productLineId?: string
    productId?: string
    type?: string[]
    maturityLevel?: string[]
    tags?: string[]
  }) {
    loading.value = true
    error.value = null
    try {
      let result = assets.value

      // 关键词搜索
      if (query.keyword) {
        const keyword = query.keyword.toLowerCase()
        result = result.filter(a => 
          a.name.toLowerCase().includes(keyword) ||
          a.description?.toLowerCase().includes(keyword) ||
          a.tags?.some(t => t.toLowerCase().includes(keyword))
        )
      }

      // 产品线过滤
      if (query.productLineId) {
        const productsInLine = products.value
          .filter(p => p.productLineId === query.productLineId)
          .map(p => p.id)
        result = result.filter(a => productsInLine.includes(a.productId))
      }

      // 产品过滤
      if (query.productId) {
        result = result.filter(a => a.productId === query.productId)
      }

      // 类型过滤
      if (query.type && query.type.length > 0) {
        result = result.filter(a => query.type!.includes(a.type))
      }

      // 成熟度过滤
      if (query.maturityLevel && query.maturityLevel.length > 0) {
        result = result.filter(a => query.maturityLevel!.includes(a.maturityLevel || ''))
      }

      // 标签过滤
      if (query.tags && query.tags.length > 0) {
        result = result.filter(a => 
          query.tags!.some(tag => a.tags?.includes(tag))
        )
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '搜索资产失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 资产智能推荐
   * 根据MR的需求特征，推荐合适的资产
   */
  async function recommendAssets(mrId: string, context?: {
    featureId?: string
    sstsId?: string
    description?: string
    tags?: string[]
  }) {
    loading.value = true
    error.value = null
    try {
      // 简单的推荐算法：
      // 1. 高成熟度资产优先（L3+）
      // 2. 标签匹配
      // 3. 描述相似度

      let candidates = highMaturityAssets.value

      // 标签匹配
      if (context?.tags && context.tags.length > 0) {
        candidates = candidates.filter(asset => 
          context.tags!.some(tag => asset.tags?.includes(tag))
        )
      }

      // 按成熟度降序排序
      candidates.sort((a, b) => {
        const levelA = parseInt(a.maturityLevel?.replace('L', '') || '0')
        const levelB = parseInt(b.maturityLevel?.replace('L', '') || '0')
        return levelB - levelA
      })

      // 返回前10个
      return candidates.slice(0, 10)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '资产推荐失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量导入资产
   */
  async function bulkImportAssets(assets: Asset[]) {
    loading.value = true
    error.value = null
    try {
      for (const asset of assets) {
        await createAsset(asset)
      }
      return assets.length
    } catch (err) {
      error.value = err instanceof Error ? err.message : '批量导入资产失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新资产成熟度
   */
  async function updateAssetMaturity(id: string, maturityLevel: string, validationReport?: string) {
    return updateAsset(id, {
      maturityLevel,
      metadata: {
        ...(assets.value.find(a => a.id === id)?.metadata || {}),
        validationReport,
        lastMaturityUpdate: new Date()
      }
    })
  }

  // ============================================================================
  // Reset
  // ============================================================================

  /**
   * 重置状态
   */
  function reset() {
    assets.value = []
    productLines.value = []
    products.value = []
    currentAsset.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    assets,
    productLines,
    products,
    currentAsset,
    loading,
    error,
    
    // Getters
    assetsByProduct,
    assetsByMaturity,
    assetsByType,
    highMaturityAssets,
    productsByProductLine,
    
    // Actions - ProductLine
    fetchProductLines,
    createProductLine,
    updateProductLine,
    
    // Actions - Product
    fetchProducts,
    createProduct,
    updateProduct,
    
    // Actions - Asset
    fetchAssets,
    fetchAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    searchAssets,
    recommendAssets,
    bulkImportAssets,
    updateAssetMaturity,
    
    // Reset
    reset
  }
})
