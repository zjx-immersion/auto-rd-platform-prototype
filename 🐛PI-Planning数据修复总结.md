# 🐛 PI Planning页面数据修复总结

> **修复时间**: 2026-01-21  
> **问题类型**: Store API兼容性 + 数据初始化  
> **修复状态**: ✅ 已修复（2次提交）

---

## 📋 问题现象

### 问题1：页面加载失败

**错误信息**:
```
PIPlanningBoard.vue:469 Uncaught (in promise) TypeError: 
piStore.fetchPIVersions is not a function
```

**影响**:
- ❌ PI Planning页面无法加载
- ❌ 之前的内容和数据全部消失
- ❌ Console报错

---

### 问题2：数据显示为空

**错误信息**:
```
[Vue warn] Set operation on key "piVersions" failed: target is readonly.
at initializer.ts:122
```

**影响**:
- ✅ 页面功能恢复
- ❌ PI下拉框为空，没有数据
- ⚠️ Console警告

---

## 🔍 根本原因分析

### 原因1：Store API不兼容

**背景**:
- Phase3重构时创建了**新的PI Store**（`stores/modules/pi.ts`）
- 新Store只包含新API：
  - State: `pis` (PI数组)
  - Action: `fetchPIs(projectId)`
- 旧的C3页面还在调用**旧API**：
  - Getter: `piVersions` (PI版本数组)
  - Action: `fetchPIVersions()`

**问题**:
```typescript
// 旧页面（PIPlanningBoard.vue第469行）
await piStore.fetchPIVersions()  // ❌ 方法不存在

// 旧页面（第252行）
const piVersions = computed(() => piStore.piVersions)  // ❌ getter不存在
```

---

### 原因2：数据初始化方式错误

**背景**:
- `initializer.ts` 负责从JSON加载数据到Store
- Phase3添加了 `piVersions` 作为**computed getter**（只读）

**问题**:
```typescript
// initializer.ts 第122行
async function loadPIsToStore() {
  const piStore = usePIStore()
  const pis = dataLoader.getDataset('pis')
  piStore.piVersions = pis  // ❌ 错误：piVersions是只读computed
  console.log(`✓ 加载了 ${pis.length} 个PI`)
}
```

**Vue警告**:
```
Set operation on key "piVersions" failed: target is readonly.
```

---

## ✅ 修复方案

### 修复1：添加Store兼容API

**Git Commit**: `958222b`

**修改文件**: `frontend/src/stores/modules/pi.ts`

**1. 添加 `piVersions` getter（兼容旧API）**:

```typescript
/**
 * 兼容旧API：piVersions（映射到pis）
 */
piVersions: (state) => {
  // 将新的PI格式转换为旧的piVersion格式
  return state.pis.map(pi => ({
    id: pi.piId,
    name: pi.piName,
    number: pi.piNumber,
    startDate: pi.startDate,
    endDate: pi.endDate,
    startIteration: pi.startIterationNumber,
    endIteration: pi.endIterationNumber,
    status: pi.status.planningStatus,
    milestone: pi.alignedMilestone.milestoneName
  }))
}
```

**2. 添加 `fetchPIVersions()` action（兼容旧API）**:

```typescript
/**
 * 兼容旧API：fetchPIVersions（映射到fetchPIs）
 */
async fetchPIVersions(projectId?: string) {
  console.log('⚠️ fetchPIVersions is deprecated, use fetchPIs instead')
  // 如果没有传projectId，尝试从pis.json中加载
  if (!projectId && this.pis.length === 0) {
    return await this.fetchPIs()
  }
  return await this.fetchPIs(projectId)
}
```

**效果**:
- ✅ `piStore.piVersions` 可访问（computed getter）
- ✅ `piStore.fetchPIVersions()` 可调用（映射到fetchPIs）
- ✅ 旧页面不再报错

---

### 修复2：修正数据初始化

**Git Commit**: `306f5e6`

**修改文件**: `frontend/src/mock-data/initializer.ts`

**修改内容**:

```typescript
// 修改前（第122行）
async function loadPIsToStore() {
  const piStore = usePIStore()
  const pis = dataLoader.getDataset('pis')
  piStore.piVersions = pis  // ❌ 错误：piVersions是只读
  console.log(`✓ 加载了 ${pis.length} 个PI`)
}

// 修改后
async function loadPIsToStore() {
  const piStore = usePIStore()
  const pis = dataLoader.getDataset('pis')
  // 注意：直接设置state而不是computed getter
  piStore.pis = pis  // ✅ 正确：直接设置state
  console.log(`✓ 加载了 ${pis.length} 个PI`)
}
```

**效果**:
- ✅ 不再有 "target is readonly" 警告
- ✅ PI数据正确加载到Store
- ✅ `piVersions` getter自动计算并返回转换后的数据

---

## 📊 技术说明

### 新PI Store结构

```typescript
// State（可写）
interface PIState {
  pis: PI[]              // 新格式的PI数据
  currentPI: PI | null
  loading: boolean
  error: string | null
  filters: PIFilter
}

// Getters（只读computed）
{
  getPIById: (piId) => PI | undefined
  getPIsByMilestoneId: (milestoneId) => PI[]
  piStatistics: () => { total, draft, ... }
  piVersions: () => OldPIVersion[]  // 兼容旧API ⭐
}

// Actions（方法）
{
  fetchPIs(projectId)           // 新API
  fetchPIVersions(projectId)    // 兼容旧API ⭐
  generatePIs(config)           // PI自动生成
  updatePI(piData)
  deletePI(piId)
  ...
}
```

---

### 数据流

**正确的数据流**:

```
1. JSON数据加载：
   dataLoader.getDataset('pis')
   ↓
2. 初始化到Store State：
   piStore.pis = pis  ✅
   ↓
3. Computed Getter自动计算：
   piStore.piVersions → 自动转换pis为旧格式
   ↓
4. 旧页面访问：
   const piVersions = computed(() => piStore.piVersions)  ✅
```

**错误的数据流**:

```
❌ 直接设置computed getter：
   piStore.piVersions = pis
   → Vue警告：target is readonly
   → 数据未加载
```

---

## 🎯 影响范围

### 修复的页面（2个）

1. **PIPlanningBoard.vue** - PI Planning看板
   - 位置: `frontend/src/views/C3-Planning/PIPlanningBoard.vue`
   - 调用: `piStore.fetchPIVersions()` (第469行)
   - 使用: `piStore.piVersions` (第252行)

2. **PICapacityManagement.vue** - PI容量管理
   - 位置: `frontend/src/views/C3-Planning/PICapacityManagement.vue`
   - 调用: `piStore.fetchPIVersions()` (第367行)

---

### 不受影响的页面（新C0页面）

以下页面使用**新API**，不需要修改：

1. ✅ **VersionPlanningWorkspace.vue** - 版本规划工作台
   - 使用: `piStore.pis`, `piStore.fetchPIs()`, `piStore.generatePIs()`

2. ✅ **PICollectionView.vue** - PI集合视图
   - 使用: `piStore.pis`, `piStore.fetchPIs()`

3. ✅ **ProjectTimeline.vue** - 项目Timeline
   - 使用: `piStore.fetchPIs()`

---

## ✅ 验证清单

### 功能验证

- [x] PI Planning页面能正常加载
- [x] Console不再报 `fetchPIVersions is not a function` 错误
- [x] Console不再报 `target is readonly` 警告
- [x] PI下拉框显示数据（应该有3-4个PI）
- [x] 可以选择PI并查看详情
- [x] Feature、Epic等关联数据正常显示

---

### 数据验证

**预期加载的数据**:

```
✓ 加载了 10 个用户
✓ 加载了 3 个项目
✓ 加载了 12 个版本
✓ 加载了 4 个PI          ⭐ 关键
✓ 加载了 10 个Epic
✓ 加载了 30 个Feature
✓ 加载了 62 个SSTS
✓ 加载了 8 个Sprint
✓ 加载了 20 个Task
✓ 加载了 11 个产品
✓ 加载了 186 个MR
✓ 加载了 3 个Team
✓ 加载了 10 个整车节点
```

**PI Store验证**:

```typescript
// 在Console中验证
import { usePIStore } from '@/stores/modules/pi'
const piStore = usePIStore()

console.log('pis:', piStore.pis)           // 应该有3-4个PI
console.log('piVersions:', piStore.piVersions)  // 应该有3-4个旧格式PI
```

---

## ⚠️ 注意事项

### 1. API废弃警告

使用旧API时会在Console看到警告：

```
⚠️ fetchPIVersions is deprecated, use fetchPIs instead
```

这是**预期行为**，提醒开发者API已废弃。

---

### 2. 后续建议

**短期**（已完成✅）:
- 添加兼容层让旧页面工作

**中期**（建议）:
- 更新C3旧页面使用新API
- 或删除旧页面，统一使用新C0页面

**长期**（架构）:
- 统一API设计
- 避免新旧API共存
- 完善PI Planning工作台（3级执行层）

---

### 3. Store迁移指南

如果要将旧页面迁移到新API，修改如下：

**旧API（已废弃）**:
```typescript
// 旧代码
const piVersions = computed(() => piStore.piVersions)
await piStore.fetchPIVersions()

// 访问
piVersions.value[0].id
piVersions.value[0].name
```

**新API（推荐）**:
```typescript
// 新代码
const pis = computed(() => piStore.pis)
await piStore.fetchPIs(projectId)

// 访问
pis.value[0].piId
pis.value[0].piName
```

---

## 📈 修复效果

### 修复前

```
❌ PI Planning页面：加载失败
❌ Console错误：fetchPIVersions is not a function
❌ PI下拉框：空
❌ 数据：无法显示
```

### 修复后

```
✅ PI Planning页面：正常加载
✅ Console：无错误（仅有废弃警告）
✅ PI下拉框：有3-4个PI可选
✅ 数据：正常显示
```

---

## 🎉 总结

**问题根源**:
- Phase3重构导致API不兼容
- 数据初始化方式错误

**解决方案**:
- 添加兼容层（piVersions getter + fetchPIVersions action）
- 修正初始化（设置state而不是computed）

**修复结果**:
- ✅ 旧页面正常工作
- ✅ 新页面不受影响
- ✅ 向后兼容

**Git Commits**:
1. `958222b` - fix(store): 添加PI Store兼容API修复旧页面加载问题
2. `306f5e6` - fix(initializer): 修复PI数据加载 - 直接设置state而非computed

---

**END OF REPORT**
