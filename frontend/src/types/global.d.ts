export {}

declare global {
  // 导航模式类型
  type NavigationMode = 'process' | 'function' | 'workspace'
  
  // 页面类型
  type PageType = 'list' | 'detail' | 'form' | 'wizard' | 'dashboard'
  
  // 面包屑项
  interface BreadcrumbItem {
    label: string
    path?: string
  }
  
  // 路由元信息
  interface RouteMeta {
    title?: string
    icon?: string
    breadcrumb?: string[]
    permissions?: string[]
    pageType?: PageType
    hideInMenu?: boolean
    keepAlive?: boolean
  }
  
  // 菜单项
  interface MenuItem {
    id: string
    label: string
    icon?: string
    path?: string
    permission?: string[]
    children?: MenuItem[]
    meta?: Record<string, any>
    badge?: number | string
  }
  
  // 用户信息
  interface UserProfile {
    id: string
    username: string
    realName: string
    avatar?: string
    email?: string
    phone?: string
    role: string
    department?: string
  }
  
  // 权限
  interface Permission {
    id: string
    code: string
    name: string
    type: 'menu' | 'button' | 'api'
  }
  
  // 分页参数
  interface PaginationParams {
    page: number
    pageSize: number
    total: number
  }
  
  // API响应
  interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
    success: boolean
  }
  
  // 列表响应
  interface ListResponse<T = any> {
    data: T[]
    total: number
    page: number
    pageSize: number
  }
}
