// 实体类型定义

// ===== 通用 =====
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

// ===== C0: 项目管理 =====
export interface Project extends BaseEntity {
  name: string
  code: string
  description: string
  status: 'planning' | 'active' | 'paused' | 'completed'
  startDate: string
  endDate: string
  owner: string
  team: string[]
}

// ===== C1: 需求管理 =====
export interface Epic extends BaseEntity {
  title: string
  description: string
  status: 'todo' | 'inprogress' | 'done'
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  projectId: string
  owner: string
  features: string[]
}

export interface Feature extends BaseEntity {
  title: string
  description: string
  epicId: string
  status: 'todo' | 'design' | 'development' | 'testing' | 'done'
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  owner: string
  ssts: string[]
}

export interface SSTS extends BaseEntity {
  title: string
  description: string
  featureId: string
  status: 'todo' | 'inprogress' | 'done'
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  owner: string
  mrs: string[]
}

export interface MR extends BaseEntity {
  title: string
  description: string
  ssts Id: string
  status: 'todo' | 'inprogress' | 'done'
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  team: string
  owner: string
}

// ===== C3: 规划协调 =====
export interface Sprint extends BaseEntity {
  name: string
  goal: string
  status: 'planning' | 'active' | 'completed'
  startDate: string
  endDate: string
  capacity: number
  teamId: string
  tasks: string[]
}

export interface PI extends BaseEntity {
  name: string
  goal: string
  status: 'planning' | 'active' | 'completed'
  startDate: string
  endDate: string
  sprints: string[]
}

// ===== C4: 迭代执行 =====
export interface Task extends BaseEntity {
  title: string
  description: string
  type: 'feature' | 'bug' | 'tech' | 'test'
  status: 'todo' | 'inprogress' | 'review' | 'testing' | 'done'
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  sprintId: string
  assignee: string
  estimatedHours: number
  actualHours: number
}

// ===== C5: 测试验收 =====
export interface TestCase extends BaseEntity {
  title: string
  description: string
  type: 'unit' | 'integration' | 'system' | 'acceptance'
  status: 'draft' | 'ready' | 'passed' | 'failed'
  featureId: string
  owner: string
}

export interface Defect extends BaseEntity {
  title: string
  description: string
  severity: 'critical' | 'major' | 'minor' | 'trivial'
  status: 'open' | 'assigned' | 'fixed' | 'verified' | 'closed'
  featureId: string
  assignee: string
}

// ===== C6: DevOps交付 =====
export interface Build extends BaseEntity {
  buildNumber: string
  branch: string
  status: 'pending' | 'running' | 'success' | 'failed'
  commitId: string
  triggerBy: string
}

export interface Deployment extends BaseEntity {
  environment: 'dev' | 'test' | 'staging' | 'production'
  version: string
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'rollback'
  deployBy: string
}

// ===== C2: 资产管理 =====
export interface Asset extends BaseEntity {
  name: string
  type: 'component' | 'module' | 'library' | 'service'
  version: string
  description: string
  owner: string
  status: 'draft' | 'published' | 'deprecated'
  reusedCount: number
}
