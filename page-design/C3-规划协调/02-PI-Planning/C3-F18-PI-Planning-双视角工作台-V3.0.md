# C3-F18: PI Planning 双视角规划工作台

> **版本**: V3.0  
> **更新时间**: 2026-01-19  
> **状态**: ✅ 已实现  
> **实现路径**: `frontend/src/views/C3-Planning/`

---

## 📋 功能概述

PI Planning双视角工作台提供两个独立且可随时切换的规划视角，支持从全局到团队的多层次规划协调。

### 核心理念
- 🌐 **全局视角**：Feature/SSTS的宏观分配（产品+迭代维度）
- 👥 **团队视角**：模块需求的细粒度规划（团队+迭代维度）
- 🔄 **自由切换**：两个视角独立工作，可随时切换，无依赖关系

---

## 🎯 功能列表

### 1. PI Planning看板
**路径**: `/function/c3/planning/pi-planning-board`  
**文件**: `PIPlanningBoard.vue`

#### 功能特性
- ✅ PI迭代时间线展示（横向6个Sprint）
- ✅ 产品多选过滤（默认显示全部产品）
- ✅ Feature按产品分组显示
- ✅ 版本交付节点标识
- ✅ Feature分配结果展示
- ✅ 冲突检测入口

#### UI布局
```
┌─────────────────────────────────────────────────┐
│ PI迭代看板        [产品筛选▼] [检测冲突]        │
├─────────────────────────────────────────────────┤
│ Sprint 1  │ Sprint 2  │ Sprint 3  │ ...         │
├─────────────────────────────────────────────────┤
│ 产品A      │ 产品A      │ 产品B      │           │
│ ├─FEAT-001 │ ├─FEAT-003 │ ├─FEAT-005 │           │
│ └─FEAT-002 │ └─FEAT-004 │ └─FEAT-006 │           │
│            │            │            │           │
│ 产品B      │ 产品C      │ 产品C      │           │
│ └─FEAT-010 │ └─FEAT-012 │ └─FEAT-013 │           │
└─────────────────────────────────────────────────┘
```

---

### 2. 全局视角
**路径**: `/function/c3/planning/pi/:piId/stage1`  
**文件**: `PIPlanningStage1.vue`

#### 功能特性
- ✅ **Sprint管理**：动态添加/删除Sprint
- ✅ **Feature分配**：拖拽Feature到Team+Sprint
- ✅ **SSTS分配**：拖拽SSTS到Team+Sprint
- ✅ **跨迭代Feature**：支持Feature持续多个Sprint
- ✅ **里程碑设置**：为Sprint设置车型里程碑和版本目标
- ✅ **依赖检测**：检测Feature和SSTS的依赖冲突
- ✅ **草稿保存**：自动保存规划结果
- ✅ **视角切换**：一键切换到团队视角

#### UI布局
```
┌─────────────────────────────────────────────────────┐
│ 🔙 返回  PI Planning - 全局视角            [切换到团队视角] │
├─────────────────────────────────────────────────────┤
│ Sprint管理: [+ 添加Sprint] [- 删除最后Sprint]        │
├──────────────┬──────────────┬───────────────────────┤
│ Sprint 1     │ Sprint 2     │ 未分配Feature/SSTS    │
│ [团队A]      │ [团队A]      │                       │
│ ├─FEAT-001(2)│ ├─FEAT-003   │ 搜索: [          ]    │
│ └─SSTS-001   │ └─SSTS-003   │                       │
│              │              │ Feature列表:          │
│ [团队B]      │ [团队B]      │ □ FEAT-010            │
│ └─FEAT-002   │ └─SSTS-004   │ □ FEAT-011            │
│              │              │                       │
│ 里程碑: 🎯V1.0│              │ SSTS列表:             │
└──────────────┴──────────────┴───────────────────────┘
```

#### 关键功能

**Sprint管理**
- 添加Sprint：自动计算日期，默认14天
- 删除Sprint：检查是否有分配，需要确认
- Sprint显示：代码、名称、日期、容量、里程碑

**Feature跨迭代**
- 设置持续时间：选择Feature横跨的Sprint数量
- 可视化：跨迭代Feature显示黄色渐变背景
- 容量计算：按持续时间分摊Story Points

**依赖检测**
- 依赖关系可视化
- 时间冲突检测
- 跨团队依赖识别
- 循环依赖检测

---

### 3. 团队视角
**路径**: `/function/c3/planning/pi/:piId/stage2`  
**文件**: `PIPlanningStage2.vue`

#### 功能特性
- ✅ **团队选择**：选择单个团队进行规划
- ✅ **特性树展示**：Feature → SSTS → MR 三层树形结构
- ✅ **团队过滤**：只显示该团队管理的模块相关需求
- ✅ **MR拖拽分配**：从左侧树拖拽MR到右侧Sprint
- ✅ **容量管理**：实时显示Sprint容量和负载率
- ✅ **搜索过滤**：支持代码和标题搜索
- ✅ **树操作**：全部展开/收起
- ✅ **草稿保存**：自动保存分配结果
- ✅ **视角切换**：一键切换到全局视角

#### UI布局
```
┌───────────────────────────────────────────────────────┐
│ 🔙 返回  PI Planning - 团队视角          [切换到全局视角] │
├───────────────────────────────────────────────────────┤
│ 选择团队: ○ACC团队 ○APA团队 ○LKA团队                  │
├────────────────────────┬──────────────────────────────┤
│ ACC团队 - 特性需求树   │ ACC团队 - Sprint列表         │
│ [搜索] [全部展开]      │                              │
├────────────────────────┼──────────────────────────────┤
│ 📄 FEAT-001 ACC       │ ┌─ Sprint 1 ────────┐        │
│   📁 SSTS-001 (13SP)  │ │ 容量: 100 SP      │        │
│     📋 MR-001 (40h)   │ │ 已用: 120h (60%)  │        │
│     📋 MR-002 (60h) ✓ │ │ ────────────────  │        │
│   📁 SSTS-002 (8SP)   │ │ MR-002 (60h)      │        │
│     📋 MR-003 (50h)   │ │ MR-005 (40h)      │        │
│                        │ └───────────────────┘        │
│ 📄 FEAT-002 LKA       │                              │
│   📁 SSTS-003 (10SP)  │ ┌─ Sprint 2 ────────┐        │
│     📋 MR-004 (70h)   │ │ [+ 拖拽MR到此处]  │        │
│     📋 MR-005 (40h) ✓ │ └───────────────────┘        │
└────────────────────────┴──────────────────────────────┘
```

#### 关键交互

**拖拽分配**
1. 用户从左侧树拖拽MR节点
2. 移动到右侧Sprint卡片
3. Sprint高亮显示蓝色边框
4. 释放鼠标完成分配
5. MR节点显示"已分配"标签

**团队过滤**
1. 根据MR.teamId过滤团队MR
2. 反向查找MR关联的SSTS
3. 反向查找SSTS关联的Feature
4. 构建完整的特性树

---

## 📐 数据模型

### Feature
```typescript
interface Feature {
  id: string
  code: string
  name: string
  storyPoints: number
  targetPI: string       // PI分配
  targetSprint?: string  // Sprint分配
  productId: string      // 所属产品
  version: string        // 版本号
  duration?: number      // 跨迭代持续时间
}
```

### SSTS
```typescript
interface SSTS {
  id: string
  code: string
  name: string
  featureId: string      // 所属Feature
  storyPoints: number
  targetPI: string
  assignedTeam?: string  // 分配的团队
  dependencies: Dependency[]  // 依赖关系
}
```

### MR
```typescript
interface MR {
  id: string
  code: string
  title: string
  sstsId: string         // 所属SSTS
  teamId: string         // 负责团队
  teamName: string
  effortHours: number    // 工时估算
  storyPoints: number
  targetPI: string
  targetSprint?: string  // 分配的Sprint
  dependencies: string[]
}
```

### Sprint
```typescript
interface Sprint {
  id: string
  code: string
  name: string
  piId: string           // 所属PI
  startDate: string
  endDate: string
  capacity: number       // 容量（SP）
  milestone?: Milestone  // 里程碑
  goals: string[]        // 目标
}
```

---

## 🔄 数据流程

### 全局视角数据流
```
用户操作
  ↓
拖拽Feature/SSTS → 指定Team + Sprint
  ↓
更新stage1Allocations
  ↓
保存到localStorage (pi-planning-stage1-draft-${piId})
  ↓
团队视角可读取此分配结果
```

### 团队视角数据流
```
选择团队
  ↓
过滤teamId匹配的MR
  ↓
反向查找SSTS和Feature
  ↓
构建特性树
  ↓
拖拽MR → Sprint
  ↓
更新MR.targetSprint
  ↓
保存到localStorage (pi-planning-team-draft-${piId})
```

---

## 🎨 UI/UX设计

### 视觉层次

| 层级 | 元素 | 颜色 | 图标 |
|------|------|------|------|
| Feature | 特性需求 | 蓝色 (#409EFF) | 📄 Document |
| SSTS | 系统技术规格 | 黄色 (#E6A23C) | 📁 FolderOpened |
| MR | 模块需求 | 绿色 (#67C23A) | 📋 Files |

### 交互状态

| 状态 | 视觉反馈 | 触发条件 |
|------|----------|----------|
| 拖拽中 | 鼠标变为move图标 | 拖拽MR节点 |
| 可放置 | 蓝色高亮边框 | 悬停在Sprint上 |
| 已分配 | 灰色标签"已分配" | MR有targetSprint |
| 跨迭代 | 黄色渐变背景 | Feature设置duration>1 |
| 容量超载 | 红色进度条 | Sprint负载率>100% |

### 响应式布局
- **桌面端**：左右双栏布局（50%:50%）
- **移动端**：不支持（规划功能主要用于桌面）

---

## 🔧 技术实现

### 组件结构
```
PIPlanningBoard.vue          (PI看板)
  └─ Sprint时间线
     └─ 产品分组
        └─ Feature卡片

PIPlanningStage1.vue         (全局视角)
  ├─ Sprint管理区
  ├─ Team+Sprint矩阵（左）
  └─ 未分配列表（右）

PIPlanningStage2.vue         (团队视角)
  ├─ 团队选择
  ├─ 特性树（左）
  └─ Sprint列表（右）
```

### 关键技术点

**1. 拖拽实现**
```vue
<template>
  <!-- 可拖拽元素 -->
  <div 
    draggable="true"
    @dragstart="handleDragStart($event, item)"
    @dragend="handleDragEnd"
  >
  
  <!-- 放置目标 -->
  <div
    @dragover.prevent="handleDragOver($event, sprintId)"
    @drop="handleDrop($event, sprintId)"
    @dragleave="handleDragLeave"
  >
</template>
```

**2. 树形结构**
```vue
<el-tree
  :data="featureTreeData"
  :props="{ children: 'children', label: 'name' }"
  node-key="id"
  :filter-node-method="filterNode"
>
  <template #default="{ node, data }">
    <!-- 自定义节点内容 -->
  </template>
</el-tree>
```

**3. 数据持久化**
```typescript
// 保存
localStorage.setItem(`pi-planning-${view}-draft-${piId}`, JSON.stringify(data))

// 加载
const draft = localStorage.getItem(`pi-planning-${view}-draft-${piId}`)
if (draft) {
  const data = JSON.parse(draft)
  // 恢复数据
}
```

---

## 📊 测试数据

### 当前数据规模
| 类型 | 数量 | 说明 |
|------|------|------|
| Feature | 30 | 涵盖11个产品 |
| SSTS | 62 | 完整依赖关系 |
| MR | 186 | 分布在3个团队 |
| Sprint | 6 | PI-001的6个迭代 |
| Team | 3 | ACC/APA/LKA |

### 团队分布
| 团队 | MR数量 | 总工时 | 可规划Sprint |
|------|--------|--------|--------------|
| ACC团队 | 94 | ~3,760h | 9-10个 |
| APA团队 | 33 | ~1,450h | 3-4个 |
| LKA团队 | 59 | ~2,360h | 5-6个 |

---

## ✅ 验收标准

### 全局视角
- [ ] 默认显示6个Sprint
- [ ] 可以添加和删除Sprint
- [ ] 支持Feature/SSTS拖拽分配
- [ ] 支持Feature跨多个Sprint
- [ ] 可以为Sprint设置里程碑和版本目标
- [ ] 依赖关系可视化和检测
- [ ] 数据自动保存和恢复

### 团队视角
- [ ] 可选择不同团队
- [ ] 特性树正确展示三层结构
- [ ] 只显示该团队管理的模块
- [ ] MR可拖拽到Sprint
- [ ] Sprint显示容量和进度
- [ ] MR已分配状态正确显示
- [ ] 数据自动保存和恢复

### 视角切换
- [ ] 可随时在两个视角间切换
- [ ] 不需要完成检查
- [ ] 数据在两个视角间同步
- [ ] 切换后保持当前PI上下文

---

## 🐛 已知问题

### 已修复
- ✅ 路由参数名称不匹配（id vs piId）
- ✅ MR Store属性名不匹配（mrs vs mrList）
- ✅ piId不是响应式导致过滤失败
- ✅ 数据源null/undefined导致filter报错
- ✅ Element Plus Radio API警告（label vs value）

### 待优化
- ⏳ Sprint删除时的依赖检查可以更细致
- ⏳ MR依赖关系可视化
- ⏳ 批量操作功能
- ⏳ 导出规划结果

---

## 📈 后续优化

### 短期
1. **性能优化**：大数据量下的渲染优化
2. **用户体验**：拖拽动画效果增强
3. **数据校验**：容量超载警告和建议

### 中期
1. **智能建议**：基于依赖关系的分配建议
2. **冲突解决**：自动检测并提供解决方案
3. **历史记录**：规划版本管理和回退

### 长期
1. **实时协作**：多人同时规划
2. **AI辅助**：智能规划建议
3. **甘特图视图**：时间线可视化

---

## 📝 变更历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| V3.0 | 2026-01-19 | 团队视角重构为树形结构 |
| V2.0 | 2026-01-19 | 从"阶段"改为"视角"概念 |
| V1.0 | 2026-01-18 | 初始版本，2阶段工作台 |

---

**文档版本**: 3.0  
**最后更新**: 2026-01-19  
**维护人员**: 开发团队  
**审核状态**: ✅ 已审核
