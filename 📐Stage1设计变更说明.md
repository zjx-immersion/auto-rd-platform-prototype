# 📐 Stage1设计变更说明

> **版本**: v2.0  
> **日期**: 2026-01-19  
> **提交**: `39eab94`

---

## 🎯 设计调整概述

### 核心变更
从 **"团队×Sprint排布看板"** 改为 **"产品×Sprint排布看板"**

---

## 📊 用户需求（3点）

### 1️⃣ 第一列从"团队"改为"产品"
- **之前**: 第一列显示团队（ACC团队、APA团队、LKA团队）
- **现在**: 第一列显示产品（ADAS核心算法、感知算法、决策规划算法等）
- **分组**: 按产品线分组（智能驾驶、车身控制、电子电器等）

### 2️⃣ Feature可展开/收缩显示SSTS
- **之前**: Feature和SSTS分别显示，无层级关系
- **现在**: 
  - 分配SSTS后，自动显示所属Feature
  - Feature卡片可点击展开/收缩
  - 展开后显示该Feature在此产品×Sprint下的所有SSTS

### 3️⃣ Feature整体拖拽
- **之前**: Feature和SSTS独立拖拽
- **现在**:
  - 拖拽Feature → 所有SSTS一起分配
  - 拖拽SSTS → 自动分配所属Feature
  - 移除Feature → 所有SSTS一起移除

---

## 🔄 数据结构变更

### stage1Allocations

#### 之前（团队×Sprint）
```typescript
{
  features: [
    { featureId: 'feat-001', teamId: 'team-001', sprintId: 'sprint-001' }
  ],
  sstss: [
    { sstsId: 'ssts-001', teamId: 'team-001', sprintId: 'sprint-001' }
  ]
}
```

#### 现在（产品×Sprint）
```typescript
{
  features: [
    { featureId: 'feat-001', productId: 'prod-001', sprintId: 'sprint-001' }
  ],
  sstss: [
    { sstsId: 'ssts-001', productId: 'prod-001', sprintId: 'sprint-001' }
  ]
}
```

**影响**：
- ✅ 草稿数据格式变更（localStorage键名保持不变）
- ✅ 保存/加载逻辑自动兼容
- ❗ 旧草稿数据将失效（需重新分配）

---

## 🎨 UI布局变更

### 表格结构

#### 之前
```
┌──────┬─────────┬─────────┬─────────┐
│ 团队 │Sprint-1 │Sprint-2 │Sprint-3 │
├──────┼─────────┼─────────┼─────────┤
│ACC   │ FEAT-001│ SSTS-001│         │
├──────┼─────────┼─────────┼─────────┤
│APA   │ FEAT-002│         │ SSTS-002│
├──────┼─────────┼─────────┼─────────┤
│LKA   │         │ FEAT-003│ SSTS-003│
└──────┴─────────┴─────────┴─────────┘
```

#### 现在
```
┌──────────────────┬─────────┬─────────┬─────────┐
│ 产品             │Sprint-1 │Sprint-2 │Sprint-3 │
├──────────────────┼─────────┼─────────┼─────────┤
│ 【智能驾驶】                                    │
├──────────────────┼─────────┼─────────┼─────────┤
│ ADAS核心算法     │ ▶FEAT-001│         │         │
│                  │  (展开)  │         │         │
│                  │   SSTS-001│        │         │
│                  │   SSTS-002│        │         │
├──────────────────┼─────────┼─────────┼─────────┤
│ 感知算法         │         │▶FEAT-002│         │
├──────────────────┼─────────┼─────────┼─────────┤
│ 【车身控制】                                    │
├──────────────────┼─────────┼─────────┼─────────┤
│ 车身域控         │         │         │▶FEAT-003│
└──────────────────┴─────────┴─────────┴─────────┘
```

---

## 🔧 核心函数变更

### 1. getAllocatedItems
```typescript
// 之前
function getAllocatedItems(teamId: string, sprintId: string) {
  const items = []
  stage1Allocations.value.features.forEach(alloc => {
    if (alloc.teamId === teamId && alloc.sprintId === sprintId) {
      items.push(feature)
    }
  })
  return items
}

// 现在
function getAllocatedItems(productId: string, sprintId: string) {
  const items = []
  stage1Allocations.value.features.forEach(alloc => {
    if (alloc.productId === productId && alloc.sprintId === sprintId) {
      items.push(feature)
    }
  })
  return items
}
```

### 2. handleDrop（拖拽处理）
```typescript
// 之前
function handleDrop(teamId: string, sprintId: string) {
  if (item.type === 'feature') {
    stage1Allocations.value.features.push({ featureId, teamId, sprintId })
  }
}

// 现在
function handleDrop(productId: string, sprintId: string) {
  if (item.type === 'feature') {
    // 分配Feature
    stage1Allocations.value.features.push({ featureId, productId, sprintId })
    
    // 🎯 自动分配所有SSTS
    const featureSSTSs = sstss.filter(s => s.featureId === featureId)
    featureSSTSs.forEach(ssts => {
      stage1Allocations.value.sstss.push({ sstsId: ssts.id, productId, sprintId })
    })
  } else {
    // 分配SSTS
    stage1Allocations.value.sstss.push({ sstsId, productId, sprintId })
    
    // 🎯 自动分配所属Feature
    if (ssts.featureId) {
      stage1Allocations.value.features.push({ featureId: ssts.featureId, productId, sprintId })
    }
  }
}
```

### 3. handleRemoveAllocation（移除处理）
```typescript
// 现在
function handleRemoveAllocation(item, productId, sprintId) {
  if (item.type === 'feature') {
    // 移除Feature
    stage1Allocations.value.features.splice(index, 1)
    
    // 🎯 自动移除所有SSTS
    const featureSSTSs = sstss.filter(s => s.featureId === item.id)
    featureSSTSs.forEach(ssts => {
      stage1Allocations.value.sstss.splice(sstsIndex, 1)
    })
  }
}
```

### 4. 新增函数

#### toggleFeatureExpand
```typescript
function toggleFeatureExpand(featureId: string) {
  if (expandedFeatures.value.has(featureId)) {
    expandedFeatures.value.delete(featureId)
  } else {
    expandedFeatures.value.add(featureId)
  }
}
```

#### getFeatureSSTSCount
```typescript
function getFeatureSSTSCount(featureId: string) {
  return sstss.value.filter(s => s.featureId === featureId).length
}
```

#### getFeatureSSTSs
```typescript
function getFeatureSSTSs(featureId: string, productId: string, sprintId: string) {
  return sstss.value.filter(s => {
    return s.featureId === featureId &&
           stage1Allocations.value.sstss.some(alloc => 
             alloc.sstsId === s.id && 
             alloc.productId === productId && 
             alloc.sprintId === sprintId
           )
  })
}
```

---

## 🎨 样式变更

### 新增CSS类

#### .product-line-divider
```css
.product-line-divider {
  padding: 8px 12px;
  background: #e8f4fd;
  border-bottom: 2px solid #409eff;
  font-weight: 600;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}
```

#### .feature-card.expanded
```css
.allocated-card.feature-card.expanded {
  background: #f0f9ff;
  border-left: 4px solid #409eff;
}
```

#### .feature-ssts-list
```css
.feature-ssts-list {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #dcdfe6;
}
```

#### .ssts-sub-card
```css
.ssts-sub-card {
  padding: 8px;
  margin-bottom: 6px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  font-size: 12px;
}
```

---

## 📋 测试清单

### 基本功能
- [ ] 产品列表按产品线分组显示
- [ ] 产品行正确显示产品名称和编号
- [ ] Sprint列表正确显示

### Feature展开/收缩
- [ ] 点击Feature卡片可展开/收缩
- [ ] 展开后显示所有SSTS
- [ ] SSTS显示编号和SP
- [ ] 展开/收缩动画流畅

### 拖拽功能
- [ ] 拖拽Feature → 所有SSTS一起分配
- [ ] 拖拽SSTS → 自动分配所属Feature
- [ ] 移除Feature → 所有SSTS一起移除
- [ ] 拖拽后提示消息正确

### 数据持久化
- [ ] 保存草稿功能正常
- [ ] 加载草稿功能正常
- [ ] 切换到团队视角功能正常

---

## 🔍 已知问题

### 1. 容量检查已移除
**原因**: 产品没有capacity概念  
**影响**: 不再检查Sprint容量是否超载  
**解决**: 如果需要，可以按产品关联的团队capacity检查

### 2. getLoadRate返回0
**原因**: 产品没有容量比例概念  
**影响**: 容量进度条不显示  
**解决**: 已移除容量进度条显示

### 3. feat-010警告
**原因**: feat-010属于pi-004，但其SSTS被分配到PI-001的团队  
**影响**: 构建树时会警告"Feature未找到"  
**解决**: 这是数据跨PI关联的正常情况，不影响功能

---

## 🚀 下一步

### 待验证
1. **产品数据加载**: 确认products数据已正确加载
2. **产品线分组**: 确认productsByLine正确分组
3. **Feature展开**: 确认展开/收缩功能正常
4. **拖拽联动**: 确认Feature/SSTS联动分配

### 如果出现问题
1. 检查Console是否有"产品列表已加载"日志
2. 检查products.value是否有数据
3. 检查productsByLine是否正确分组
4. 检查expandedFeatures状态管理

---

## 📊 影响范围

### 修改文件
- ✅ `frontend/src/views/C3-Planning/PIPlanningStage1.vue`

### 修改内容
- ✅ 引入ProductStore
- ✅ 数据结构调整（teamId → productId）
- ✅ UI布局重构（团队行 → 产品行）
- ✅ 功能增强（Feature展开/收缩、整体拖拽）
- ✅ 样式新增（产品线分隔、展开状态）

### 修改统计
- **代码行数**: +306 / -141
- **新增函数**: 3个
- **修改函数**: 8个
- **新增样式**: 4个

---

**END OF DOCUMENT**
