import { defineStore } from 'pinia'
import type { Product } from '@/types/asset'

interface ProductState {
  products: Product[]
  currentProduct: Product | null
  loading: boolean
  error: string | null
}

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    currentProduct: null,
    loading: false,
    error: null
  }),

  getters: {
    // 根据ID获取产品
    productById: (state) => {
      return (id: string) => state.products.find(p => p.id === id)
    },

    // 按状态筛选
    productsByStatus: (state) => {
      return (status: string) => state.products.filter(p => p.status === status)
    },

    // 按类型筛选
    productsByType: (state) => {
      return (type: string) => state.products.filter(p => p.type === type)
    },

    // 获取所有有效产品
    activeProducts: (state) => {
      return state.products.filter(p => p.status !== 'archived')
    }
  },

  actions: {
    // 获取所有产品
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        // 在实际应用中，这里会调用API
        // 现在从mock数据中加载
        // 数据已经通过initializer加载
        this.loading = false
      } catch (error: any) {
        this.error = error.message || '获取产品列表失败'
        this.loading = false
        throw error
      }
    },

    // 根据ID获取产品详情
    async fetchProductById(id: string) {
      this.loading = true
      this.error = null
      try {
        const product = this.products.find(p => p.id === id)
        if (product) {
          this.currentProduct = product
        } else {
          throw new Error('产品不存在')
        }
        this.loading = false
      } catch (error: any) {
        this.error = error.message || '获取产品详情失败'
        this.loading = false
        throw error
      }
    },

    // 设置产品列表（用于从mock数据加载）
    setProducts(products: Product[]) {
      this.products = products
    },

    // 添加产品
    async addProduct(product: Omit<Product, 'id'>) {
      this.loading = true
      this.error = null
      try {
        const newProduct: Product = {
          ...product,
          id: `prod-${Date.now()}`
        }
        this.products.push(newProduct)
        this.loading = false
        return newProduct
      } catch (error: any) {
        this.error = error.message || '添加产品失败'
        this.loading = false
        throw error
      }
    },

    // 更新产品
    async updateProduct(id: string, updates: Partial<Product>) {
      this.loading = true
      this.error = null
      try {
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updates }
          if (this.currentProduct?.id === id) {
            this.currentProduct = this.products[index]
          }
        } else {
          throw new Error('产品不存在')
        }
        this.loading = false
      } catch (error: any) {
        this.error = error.message || '更新产品失败'
        this.loading = false
        throw error
      }
    },

    // 删除产品
    async deleteProduct(id: string) {
      this.loading = true
      this.error = null
      try {
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products.splice(index, 1)
          if (this.currentProduct?.id === id) {
            this.currentProduct = null
          }
        } else {
          throw new Error('产品不存在')
        }
        this.loading = false
      } catch (error: any) {
        this.error = error.message || '删除产品失败'
        this.loading = false
        throw error
      }
    }
  }
})
