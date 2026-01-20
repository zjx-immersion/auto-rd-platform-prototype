/**
 * 领域产品Store
 * C0能力域: 领域项目管理 - 产品管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  DomainProduct,
  CreateDomainProductInput,
  UpdateDomainProductInput,
  AllocateEpicToProductInput,
  BatchAllocateEpicsToProductInput
} from '@/types/domain-product'
import type { ProductLine } from '@/types/domain-models'

// Mock数据导入
import mockProductsData from '@/mock/domain-products.json'

export const useDomainProductStore = defineStore('domainProduct', () => {
  // ============================================================================
  // State
  // ============================================================================

  /** 产品列表 */
  const products = ref<DomainProduct[]>([])

  /** 当前产品 */
  const currentProduct = ref<DomainProduct | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * 按项目ID获取产品列表
   */
  const getProductsByProjectId = computed(() => {
    return (projectId: string) => {
      return products.value.filter(p => p.projectId === projectId)
    }
  })

  /**
   * 按产品线分组
   */
  const productsByLine = computed(() => {
    const grouped: Record<ProductLine, DomainProduct[]> = {} as any
    products.value.forEach(product => {
      if (!grouped[product.productLine]) {
        grouped[product.productLine] = []
      }
      grouped[product.productLine].push(product)
    })
    return grouped
  })

  /**
   * 根据ID获取产品
   */
  const getProductById = computed(() => {
    return (productId: string) => {
      return products.value.find(p => p.productId === productId)
    }
  })

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * 获取项目的产品列表
   */
  async function fetchProductsByProject(projectId: string) {
    loading.value = true
    error.value = null

    try {
      // TODO: API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockData = mockProductsData as { products: DomainProduct[] }
      const projectProducts = mockData.products.filter(p => p.projectId === projectId)
      
      // 合并到products
      projectProducts.forEach(product => {
        const index = products.value.findIndex(p => p.productId === product.productId)
        if (index === -1) {
          products.value.push(product)
        } else {
          products.value[index] = product
        }
      })

      console.log('✓ 加载项目产品列表:', projectProducts.length, '个产品')
      
      return projectProducts
    } catch (err: any) {
      error.value = err.message || '加载产品列表失败'
      console.error('加载产品列表失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取所有产品
   */
  async function fetchAllProducts() {
    loading.value = true
    error.value = null

    try {
      // TODO: API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockData = mockProductsData as { products: DomainProduct[] }
      products.value = mockData.products

      console.log('✓ 加载所有产品:', products.value.length, '个')
    } catch (err: any) {
      error.value = err.message || '加载产品失败'
      console.error('加载产品失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取产品详情
   */
  async function fetchProductById(productId: string) {
    loading.value = true
    error.value = null

    try {
      // TODO: API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const product = products.value.find(p => p.productId === productId)
      if (product) {
        currentProduct.value = product
        return product
      }
      
      throw new Error('产品不存在')
    } catch (err: any) {
      error.value = err.message || '加载产品详情失败'
      console.error('加载产品详情失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建产品
   */
  async function createProduct(input: CreateDomainProductInput) {
    loading.value = true
    error.value = null

    try {
      // TODO: API调用
      const newProduct: DomainProduct = {
        productId: `PROD-${Date.now()}`,
        productName: input.productName,
        productCode: input.productCode,
        productLine: input.productLine,
        projectId: input.projectId,
        projectName: '', // 需要从projectStore获取
        allocatedEpicIds: input.allocatedEpicIds,
        versions: [],
        productOwner: {} as any, // 需要从userStore获取
        description: input.description,
        stats: {
          totalEpics: input.allocatedEpicIds.length,
          totalSP: 0, // 需要计算
          totalVersions: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      products.value.unshift(newProduct)

      console.log('✓ 创建产品成功:', newProduct.productCode)
      
      return newProduct
    } catch (err: any) {
      error.value = err.message || '创建产品失败'
      console.error('创建产品失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新产品
   */
  async function updateProduct(productId: string, input: UpdateDomainProductInput) {
    loading.value = true
    error.value = null

    try {
      // TODO: API调用
      const product = products.value.find(p => p.productId === productId)
      if (!product) {
        throw new Error('产品不存在')
      }

      Object.assign(product, input, { updatedAt: new Date().toISOString() })

      if (currentProduct.value?.productId === productId) {
        currentProduct.value = product
      }

      console.log('✓ 更新产品成功:', productId)
      
      return product
    } catch (err: any) {
      error.value = err.message || '更新产品失败'
      console.error('更新产品失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 分配Epic到产品
   */
  async function allocateEpicToProduct(input: AllocateEpicToProductInput) {
    try {
      const product = products.value.find(p => p.productId === input.productId)
      if (!product) {
        throw new Error('产品不存在')
      }

      if (!product.allocatedEpicIds.includes(input.epicId)) {
        product.allocatedEpicIds.push(input.epicId)
        product.stats.totalEpics++
        product.updatedAt = new Date().toISOString()
      }

      console.log('✓ Epic已分配到产品:', input.epicId, '→', product.productName)
    } catch (err: any) {
      console.error('分配Epic到产品失败:', err)
      throw err
    }
  }

  /**
   * 批量分配Epic到产品
   */
  async function batchAllocateEpicsToProduct(input: BatchAllocateEpicsToProductInput) {
    try {
      const product = products.value.find(p => p.productId === input.productId)
      if (!product) {
        throw new Error('产品不存在')
      }

      let addedCount = 0
      input.epicIds.forEach(epicId => {
        if (!product.allocatedEpicIds.includes(epicId)) {
          product.allocatedEpicIds.push(epicId)
          addedCount++
        }
      })

      product.stats.totalEpics = product.allocatedEpicIds.length
      product.updatedAt = new Date().toISOString()

      console.log('✓ 批量分配Epic到产品:', addedCount, '个Epic')
      
      return addedCount
    } catch (err: any) {
      console.error('批量分配Epic到产品失败:', err)
      throw err
    }
  }

  /**
   * 删除产品
   */
  async function deleteProduct(productId: string) {
    loading.value = true
    error.value = null

    try {
      // TODO: API调用
      const index = products.value.findIndex(p => p.productId === productId)
      if (index === -1) {
        throw new Error('产品不存在')
      }

      products.value.splice(index, 1)

      if (currentProduct.value?.productId === productId) {
        currentProduct.value = null
      }

      console.log('✓ 删除产品成功:', productId)
    } catch (err: any) {
      error.value = err.message || '删除产品失败'
      console.error('删除产品失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置Store
   */
  function reset() {
    products.value = []
    currentProduct.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    products,
    currentProduct,
    loading,
    error,

    // Getters
    getProductsByProjectId,
    productsByLine,
    getProductById,

    // Actions
    fetchProductsByProject,
    fetchAllProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    allocateEpicToProduct,
    batchAllocateEpicsToProduct,
    deleteProduct,
    reset
  }
})
