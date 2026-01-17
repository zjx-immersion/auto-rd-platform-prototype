# Phase 5 实施计划：流程增强（关键缺失功能补充）

> **版本**: V1.0  
> **创建日期**: 2026-01-17  
> **预计工期**: 3-4天  
> **优先级**: P0（高优先级）  
> **目标**: 补充PRD编辑器、Feature分配工具、评审流程、产品线/产品管理

---

## 📋 Phase 5 目标

根据 `Phase1-4全面分析与检查报告` 和 `domain-prog-to-pi-plan-v2.md`，Phase 5需要补充以下关键缺失功能：

### 核心问题
1. 🔴 **PRD编辑器缺失** - Feature无法在线编写PRD
2. 🔴 **Feature分配工具缺失** - PI规划效率低
3. 🟡 **评审流程缺失** - Epic/Feature/SSTS无法评审
4. 🔴 **产品线/产品页面缺失** - 资产管理不完整

### 完成标准
- ✅ PRD可以在线编辑、保存、版本管理
- ✅ Feature可以批量分配到版本/PI
- ✅ Epic/Feature/SSTS支持评审流程
- ✅ 产品线/产品可以CRUD管理

---

## 📝 任务列表

### 5.1 PRD在线编辑器（P0） - 1天

#### 任务描述
实现Feature PRD的在线编辑功能，支持富文本、Markdown、模板、版本管理。

#### 技术栈
- **编辑器**: TipTap（基于ProseMirror）
- **UI**: Element Plus
- **状态管理**: Pinia (featureStore)
- **自动保存**: 使用debounce，2秒自动保存

#### 页面设计
```
路由: /function/c1-requirement/feature/prd/:id

布局:
┌─────────────────────────────────────────────────────────────┐
│ 返回 | Feature PRD编辑器 - FEAT-001                          │
├─────────────────────────────────────────────────────────────┤
│ [模板▼] [保存草稿] [版本历史] [预览] [保存并发布]         │
├───────────────────────────────────────┬─────────────────────┤
│                                       │ 目录                │
│  # 产品需求文档                        │  - 1. 功能概述      │
│                                       │  - 2. 用户场景      │
│  ## 1. 功能概述                        │  - 3. 技术要求      │
│  [富文本编辑区域]                      │  - 4. 验收标准      │
│  - 支持加粗、斜体、列表                 │  - 5. 风险分析      │
│  - 支持标题、引用、代码块               │                     │
│  - 支持图片、表格、链接                 │ 历史版本            │
│  - 支持Markdown快捷键                 │  □ v1.0 (当前)     │
│                                       │  □ v0.3 (昨天)     │
│  ## 2. 用户场景                        │  □ v0.2 (2天前)   │
│  [编辑区域...]                         │  □ v0.1 (3天前)   │
│                                       │                     │
│  ## 3. 验收标准                        │ 自动保存            │
│  - [ ] AC-001: 基础功能                │  最后保存:          │
│  - [ ] AC-002: 性能要求                │  2分钟前            │
│  - [ ] AC-003: 兼容性                  │                     │
│                                       │ 协作者              │
│  [附件上传区域]                        │  Zhang San (在线)  │
│                                       │  Li Si (离线)      │
└───────────────────────────────────────┴─────────────────────┘
```

#### 功能清单
- [ ] **编辑器初始化**
  - TipTap编辑器配置
  - 工具栏（格式化按钮）
  - 快捷键支持
  
- [ ] **PRD模板**
  - 10+标准PRD模板
  - 模板选择下拉菜单
  - 应用模板到编辑器
  - 自定义模板（保存为模板）
  
- [ ] **自动保存和草稿**
  - 2秒debounce自动保存
  - 草稿状态显示
  - 手动保存按钮
  - 恢复草稿功能
  
- [ ] **版本管理**
  - 版本列表（右侧栏）
  - 版本对比（diff视图）
  - 版本回滚
  - 版本标签（v1.0, v1.1...）
  
- [ ] **验收标准管理**
  - AC列表（Checkbox列表）
  - AC新增/编辑/删除
  - AC状态管理
  
- [ ] **附件管理**
  - 附件上传（拖拽/点击）
  - 附件列表展示
  - 附件下载/删除
  
- [ ] **协作功能**
  - 在线协作者显示
  - 编辑冲突检测
  - 评论标注（在编辑器中）

#### 数据模型
```typescript
interface PRD {
  id: string
  featureId: string
  content: string               // 富文本内容（HTML）
  version: string               // 版本号（v1.0）
  status: 'draft' | 'published' | 'archived'
  acceptanceCriteria: AcceptanceCriteria[]
  attachments: Attachment[]
  createdBy: string
  updatedAt: string
  history: PRDVersion[]         // 历史版本
}

interface AcceptanceCriteria {
  id: string
  code: string                  // AC-001
  description: string
  status: 'pending' | 'passed' | 'failed'
}

interface PRDVersion {
  version: string
  content: string
  createdAt: string
  createdBy: string
  changeSummary: string
}
```

#### TipTap配置示例
```typescript
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'

const editor = useEditor({
  extensions: [
    StarterKit,
    Image,
    Link,
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({
      placeholder: '开始编写PRD...'
    })
  ],
  content: prdContent.value,
  onUpdate: ({ editor }) => {
    autoSave(editor.getHTML())
  }
})

// 自动保存
const autoSave = debounce((content: string) => {
  featureStore.savePRDDraft(featureId, content)
}, 2000)
```

#### 预计代码量
- PRDEditor.vue: ~600行
- featureStore增强: ~100行
- 总计: ~700行

---

### 5.2 Feature分配工具（P0） - 1天

#### 任务描述
实现Feature到版本/PI的批量分配工具，支持拖拽、容量可视化、冲突检测。

#### 页面设计
```
路由: /function/c0-project/version/feature-allocation

布局:
┌─────────────────────────────────────────────────────────────┐
│ 版本规划 - Feature分配工作台                                 │
├─────────────────────────────────────────────────────────────┤
│ 项目: [岚图梦想家Pro-智驾▼] 版本: [V2.0 2026Q2▼]           │
├───────────────────────────┬─────────────────────────────────┤
│ 待分配Feature (32个)      │ V2.0 2026Q2 (12个已分配)        │
│ ┌─────────────────────┐   │ ┌─────────────────────────────┐ │
│ │ 🔍 搜索筛选         │   │ │ 容量: 240SP / 300SP (80%)   │ │
│ │ Epic: [全部▼]      │   │ │ ████████████████░░░░        │ │
│ │ 产品: [全部▼]      │   │ └─────────────────────────────┘ │
│ │ 优先级: [全部▼]    │   │                                 │
│ └─────────────────────┘   │ ┌─────────────────────────────┐ │
│                           │ │ PI 2026-Q2 (120SP)         │ │
│ ┌─────────────────────┐   │ │ - FEAT-001: ACC基础 (30SP) │ │
│ │ FEAT-015: LKA增强   │   │ │ - FEAT-002: LKA Pro (40SP) │ │
│ │ Epic: EPIC-002      │   │ │ - FEAT-003: AEB增强 (50SP) │ │
│ │ 优先级: P0         │   │ ├─────────────────────────────┤ │
│ │ 工作量: 25SP       │   │ │ PI 2026-Q3 (120SP)         │ │
│ │ [拖动到版本/PI]    │   │ │ - FEAT-004: ...            │ │
│ └─────────────────────┘   │ └─────────────────────────────┘ │
│                           │                                 │
│ ┌─────────────────────┐   │ [批量分配] [清空版本] [保存]   │
│ │ FEAT-016: ...      │   │                                 │
│ └─────────────────────┘   │                                 │
└───────────────────────────┴─────────────────────────────────┘
```

#### 功能清单
- [ ] **双栏布局**
  - 左栏：待分配Feature列表
  - 右栏：版本/PI容量展示
  
- [ ] **Feature筛选**
  - 按Epic筛选
  - 按产品线/产品筛选
  - 按优先级筛选
  - 按工作量排序
  
- [ ] **拖拽分配**
  - Feature卡片拖拽（@dnd-kit/core）
  - 拖拽到版本/PI
  - 拖拽到不同Sprint
  - 拖拽取消分配
  
- [ ] **容量可视化**
  - 版本容量进度条
  - PI容量分配饼图
  - 团队负载条形图
  - 超载预警（红色高亮）
  
- [ ] **冲突检测**
  - 依赖冲突（依赖的Feature未分配）
  - 容量冲突（超过版本容量）
  - 时间冲突（Feature时间重叠）
  - 冲突提示弹窗
  
- [ ] **批量操作**
  - 批量选择Feature
  - 批量分配到版本/PI
  - 批量取消分配
  - 批量优先级调整

#### 技术实现
```typescript
// 拖拽实现
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'

const { attributes, listeners, setNodeRef } = useDraggable({
  id: feature.id,
  data: { feature }
})

const { setNodeRef: setDropRef, isOver } = useDroppable({
  id: versionId,
  data: { type: 'version', id: versionId }
})

// 冲突检测
function detectConflict(feature: Feature, targetVersion: Version) {
  const conflicts = []
  
  // 依赖冲突
  const dependencies = getDependencies(feature)
  const unassignedDeps = dependencies.filter(dep => 
    !targetVersion.features.includes(dep.id)
  )
  if (unassignedDeps.length > 0) {
    conflicts.push({
      type: 'dependency',
      message: `依赖的Feature未分配: ${unassignedDeps.map(d => d.code).join(', ')}`
    })
  }
  
  // 容量冲突
  const currentLoad = calculateLoad(targetVersion.features)
  const capacity = targetVersion.capacity || 300
  if (currentLoad + feature.estimate > capacity) {
    conflicts.push({
      type: 'capacity',
      message: `容量超载: ${currentLoad + feature.estimate}SP > ${capacity}SP`
    })
  }
  
  return conflicts
}

// 容量计算
function calculateLoad(features: Feature[]) {
  return features.reduce((sum, f) => sum + (f.estimate || 0), 0)
}
```

#### 预计代码量
- FeatureAllocation.vue: ~500行
- DragDropContext: ~100行
- versionStore增强: ~100行
- 总计: ~700行

---

### 5.3 评审流程（P1） - 1天

#### 任务描述
为Epic、Feature、SSTS增加评审流程，支持评审状态管理、评审意见、评审操作。

#### 功能清单
- [ ] **评审状态管理**
  - 状态: 草稿 → 待评审 → 评审中 → 已通过/已拒绝
  - 状态流转规则
  - 状态显示（标签、颜色）
  
- [ ] **评审意见**
  - 评审意见列表
  - 评审意见新增（富文本）
  - 评审意见回复
  - 评审意见标签（问题/建议/认可）
  
- [ ] **评审操作**
  - 提交评审按钮
  - 通过按钮（评审人权限）
  - 拒绝按钮（评审人权限，需填写原因）
  - 撤回评审按钮
  
- [ ] **评审通知**
  - 评审提交通知（邮件/站内信）
  - 评审结果通知
  - @提及通知
  
- [ ] **评审历史**
  - 评审记录列表
  - 评审时间线
  - 评审统计（通过率、平均时长）

#### 页面增强
```
在 EpicDetail.vue / FeatureDetail.vue / SSTSDetail.vue 中增加:

┌─────────────────────────────────────────────────────────────┐
│ Epic详情 - EPIC-001                [草稿] [提交评审]        │
├─────────────────────────────────────────────────────────────┤
│ [基本信息] [关联Feature] [评审] [历史]                      │
├─────────────────────────────────────────────────────────────┤
│ 评审状态                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ● 待评审 → 评审中 → 已通过                              │ │
│ │   (2026-01-15)  (2026-01-16)  (2026-01-17)             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 评审意见 (3条)                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Zhang San (架构师) - 2026-01-16 10:30            [问题] │ │
│ │ 技术方案需要补充性能指标，建议增加QPS要求               │ │
│ │   └─ Li Si (作者) 回复: 已补充，请查看PRD v1.1        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Wang Wu (PO) - 2026-01-16 14:20                 [建议] │ │
│ │ 建议增加用户反馈收集机制                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [通过] [拒绝] [添加意见]                                    │
└─────────────────────────────────────────────────────────────┘
```

#### 数据模型
```typescript
// 在 Epic/Feature/SSTS 中增加
interface ReviewableEntity {
  reviewStatus: 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected'
  reviewComments: ReviewComment[]
  reviewHistory: ReviewRecord[]
}

interface ReviewComment {
  id: string
  author: string
  content: string
  type: 'issue' | 'suggestion' | 'approval'
  createdAt: string
  replies: ReviewReply[]
}

interface ReviewRecord {
  id: string
  action: 'submit' | 'approve' | 'reject' | 'withdraw'
  reviewer: string
  reason?: string
  timestamp: string
}
```

#### 预计代码量
- ReviewPanel组件: ~300行
- epicStore/featureStore/sstsStore增强: ~150行（每个50行）
- 总计: ~450行

---

### 5.4 产品线/产品管理（P0） - 0.5天

#### 任务描述
实现产品线和产品的CRUD管理页面，支持产品与Feature的关联展示。

#### 页面设计
```
路由: /function/c2/productline/list
      /function/c2/product/list

ProductLineList.vue:
┌─────────────────────────────────────────────────────────────┐
│ 产品线管理                            [创建产品线]          │
├─────────────────────────────────────────────────────────────┤
│ 编号         │ 名称              │ 产品数 │ 负责人 │ 操作   │
├──────────────┼──────────────────┼────────┼────────┼────────┤
│ PL-AD        │ 智能驾驶产品线     │ 6个    │ Zhang  │ 查看  │
│ PL-IC        │ 智能座舱产品线     │ 4个    │ Li     │ 编辑  │
│ PL-EE        │ 电子电器产品线     │ 8个    │ Wang   │ 删除  │
└─────────────────────────────────────────────────────────────┘

ProductList.vue:
┌─────────────────────────────────────────────────────────────┐
│ 产品管理                              [创建产品]            │
├─────────────────────────────────────────────────────────────┤
│ 产品线: [智驾▼] 状态: [全部▼]                              │
├─────────────────────────────────────────────────────────────┤
│ 编号     │ 名称        │ 产品线      │ Feature数 │ 操作    │
├──────────┼────────────┼────────────┼───────────┼─────────┤
│ P-HAP    │ 高速领航    │ 智驾        │ 12个      │ 查看   │
│ P-CAP    │ 城市领航    │ 智驾        │ 8个       │ 编辑   │
│ P-VIS    │ 语音交互    │ 智能座舱     │ 15个      │ 删除   │
└─────────────────────────────────────────────────────────────┘
```

#### 功能清单
- [ ] **产品线管理**
  - 产品线列表（CRUD）
  - 产品线详情（产品列表、统计）
  - 产品线负责人管理
  
- [ ] **产品管理**
  - 产品列表（CRUD，按产品线筛选）
  - 产品详情（Feature列表、资产列表）
  - 产品状态管理（规划/开发/发布/废弃）
  
- [ ] **关联展示**
  - 产品-Feature关联列表
  - 产品-资产关联列表
  - 产品线层次结构树

#### 预计代码量
- ProductLineList.vue: ~200行
- ProductList.vue: ~200行
- assetStore增强: ~100行
- 总计: ~500行

**注**: 已有AssetSearch和AssetList（P0优化完成），本任务仅需补充产品线/产品页面

---

## 📊 Phase 5 汇总

### 任务优先级

| 任务 | 优先级 | 工期 | 依赖 | 状态 |
|------|--------|------|------|------|
| 5.1 PRD编辑器 | P0 | 1天 | featureStore | ⏳ 待开始 |
| 5.2 Feature分配工具 | P0 | 1天 | versionStore | ⏳ 待开始 |
| 5.3 评审流程 | P1 | 1天 | epicStore等 | ⏳ 待开始 |
| 5.4 产品线/产品管理 | P0 | 0.5天 | assetStore | ⏳ 待开始 |
| **总计** | - | **3.5天** | - | - |

### 代码量估算

| 任务 | 预计代码量 | 主要文件 |
|------|----------|----------|
| 5.1 PRD编辑器 | ~700行 | PRDEditor.vue, featureStore |
| 5.2 Feature分配工具 | ~700行 | FeatureAllocation.vue, versionStore |
| 5.3 评审流程 | ~450行 | ReviewPanel.vue, stores |
| 5.4 产品线/产品管理 | ~500行 | ProductLineList/ProductList |
| **总计** | **~2,350行** | **7个新文件 + Store增强** |

### 依赖包新增

```json
{
  "@tiptap/vue-3": "^2.1.0",
  "@tiptap/starter-kit": "^2.1.0",
  "@tiptap/extension-image": "^2.1.0",
  "@tiptap/extension-link": "^2.1.0",
  "@tiptap/extension-table": "^2.1.0",
  "@tiptap/extension-task-list": "^2.1.0",
  "@tiptap/extension-placeholder": "^2.1.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "@dnd-kit/utilities": "^3.2.0"
}
```

---

## ✅ 验收标准

### 5.1 PRD编辑器
- [ ] 富文本编辑器正常工作（格式化、快捷键）
- [ ] 模板功能正常（选择、应用、保存模板）
- [ ] 自动保存功能正常（2秒debounce）
- [ ] 版本管理功能正常（历史、对比、回滚）
- [ ] 验收标准管理正常（新增、编辑、删除、状态）
- [ ] 附件上传/下载正常

### 5.2 Feature分配工具
- [ ] 拖拽功能正常（Feature卡片拖拽到版本/PI）
- [ ] 容量可视化正常（进度条、图表更新）
- [ ] 冲突检测正常（依赖、容量、时间冲突）
- [ ] 批量操作正常（选择、分配、取消）
- [ ] 筛选功能正常（Epic、产品、优先级）

### 5.3 评审流程
- [ ] 评审状态流转正常（草稿→待评审→评审中→通过/拒绝）
- [ ] 评审意见功能正常（新增、回复、标签）
- [ ] 评审操作正常（提交、通过、拒绝、撤回）
- [ ] 评审通知正常（邮件/站内信）
- [ ] 评审历史正常（记录、时间线、统计）

### 5.4 产品线/产品管理
- [ ] 产品线CRUD正常
- [ ] 产品CRUD正常（关联产品线）
- [ ] 产品-Feature关联展示正常
- [ ] 产品-资产关联展示正常

---

## 📅 实施时间表

| 日期 | 任务 | 交付物 | 状态 |
|------|------|--------|------|
| Day 1 | 5.1 PRD编辑器 | PRDEditor.vue (700行) | ⏳ |
| Day 2 | 5.2 Feature分配工具 | FeatureAllocation.vue (700行) | ⏳ |
| Day 3 | 5.3 评审流程 | ReviewPanel.vue (450行) | ⏳ |
| Day 3.5 | 5.4 产品线/产品管理 | ProductLine/ProductList (500行) | ⏳ |
| Day 4 | 集成测试和优化 | Phase 5完成报告 | ⏳ |

**预计开始日期**: 2026-01-18  
**预计完成日期**: 2026-01-21

---

## 💡 实施建议

### 并行开发策略
- **Day 1-2**: PRD编辑器和Feature分配工具可以并行开发（不同模块）
- **Day 3**: 评审流程需要在PRD编辑器之后（依赖featureStore）
- **Day 3.5**: 产品线/产品管理可以独立开发

### 技术难点预判
1. **TipTap编辑器集成**
   - 学习曲线：1-2小时
   - 配置复杂度：中等
   - 建议：先实现基础功能，再增强（模板、版本）

2. **拖拽性能优化**
   - 大量Feature卡片（100+）时性能
   - 建议：使用虚拟滚动（useVirtualList）

3. **冲突检测算法**
   - 依赖关系复杂度
   - 建议：预先构建依赖图，查询时O(1)

---

## 🔄 与Phase 6衔接

Phase 5完成后，可以立即开始Phase 6（风险与进度管理），因为：
1. ✅ PRD编辑器提供了需求细节（风险识别依据）
2. ✅ Feature分配工具提供了规划数据（进度跟踪依据）
3. ✅ 评审流程提供了质量保障（风险缓解依据）

---

**文档版本**: V1.0  
**创建日期**: 2026-01-17  
**状态**: 规划中，待开始实施  
**下一步**: 安装依赖包，开始5.1 PRD编辑器开发
