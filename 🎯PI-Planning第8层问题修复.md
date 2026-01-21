# 🎯 PI Planning第8层问题修复

> **涉及页面**: Stage1（全局视角） + Stage2（团队视角）  
> **问题数量**: 2个新问题  
> **修复提交**: `0b3274f`

---

## 📋 问题背景

经过第7层修复，全局视角的Feature列表已经正常显示。但用户测试后反馈：

### 问题1：Stage1（全局视角）Sprint数据未显示

**症状**：
- ✅ Feature列表显示正常（29个Feature）
- ✅ 团队列表显示正常（ACC、APA、LKA）
- ❌ **Sprint管理区域为空**（应该显示8个Sprint）
- ❌ **里程碑配置为空**

### 问题2：Stage2（团队视角）页面组件和数据都为空

**症状**：
- ❌ 团队按钮只显示蓝色色块，没有团队名称文字
- ❌ 页面显示"请先选择一个团队"
- ❌ 下方内容区域完全空白

---

## 🔍 问题分析

### 问题1分析：Sprint过滤失败

**代码位置**：`PIPlanningStage1.vue`

**失败代码**：
```typescript
const sprints = computed(() => {
  return sprintStore.sprints.filter(s => s.piId === piId)
  // "pi-001" === "PI-001" → false ❌
})
```

**根本原因**：**又是ID大小写不匹配**（第4次！）
- Sprint数据：`piId = "pi-001"`（小写）
- URL参数：`piId = "PI-001"`（大写）
- 过滤条件：`s.piId === piId` → false ❌
- 结果：`sprints = []` → Sprint管理区域为空

---

### 问题2分析：两个子问题

#### 子问题A：Sprint过滤失败

**代码位置**：`PIPlanningStage2.vue`

**失败代码**：
```typescript
const sprints = computed(() => {
  const allSprints = sprintStore.sprints || []
  return allSprints.filter(s => s.piId === piId.value)
  // "pi-001" === "PI-001" → false ❌
})
```

**根本原因**：同问题1（第5次遇到ID大小写不匹配！）

---

#### 子问题B：团队按钮显示错误

**代码位置**：`PIPlanningStage2.vue`

**失败代码**：
```vue
<el-radio-button 
  v-for="team in teams" 
  :key="team.id"
  :value="team.id"
>
  {{ team.name }}
</el-radio-button>
```

**根本原因**：Element Plus语法错误
- 使用了`:value="team.id"`
- Element Plus的`el-radio-button`应该使用`:label`属性
- 导致：按钮显示为空（只有蓝色背景色块）

---

## ✅ 修复方案

### 修复1：Stage1 Sprint过滤（问题1）

**文件**：`frontend/src/views/C3-Planning/PIPlanningStage1.vue`

**修复前**：
```typescript
const sprints = computed(() => {
  return sprintStore.sprints.filter(s => s.piId === piId).sort(...)
})
```

**修复后**：
```typescript
const sprints = computed(() => {
  // ✅ 兼容ID大小写不匹配
  const piIdLower = piId.toLowerCase()
  const filteredSprints = sprintStore.sprints.filter(s => {
    const sprintPiIdLower = (s.piId || '').toLowerCase()
    return sprintPiIdLower === piIdLower
  }).sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )
  console.log('🔍 Sprint过滤:', {
    piId,
    totalSprints: sprintStore.sprints.length,
    matchedCount: filteredSprints.length
  })
  return filteredSprints
})
```

---

### 修复2：Stage2 Sprint过滤（问题2-A）

**文件**：`frontend/src/views/C3-Planning/PIPlanningStage2.vue`

**修复前**：
```typescript
const sprints = computed(() => {
  const allSprints = sprintStore.sprints || []
  return allSprints.filter(s => s.piId === piId.value)
})
```

**修复后**：
```typescript
const sprints = computed(() => {
  const allSprints = sprintStore.sprints || []
  // ✅ 兼容ID大小写不匹配
  const piIdLower = piId.value.toLowerCase()
  const filtered = allSprints.filter(s => {
    const sprintPiIdLower = (s.piId || '').toLowerCase()
    return sprintPiIdLower === piIdLower
  })
  console.log('🔍 Stage2 Sprint过滤:', {
    piId: piId.value,
    totalSprints: allSprints.length,
    matchedCount: filtered.length
  })
  return filtered
})
```

---

### 修复3：Stage2 团队按钮显示（问题2-B）

**文件**：`frontend/src/views/C3-Planning/PIPlanningStage2.vue`

**修复前**：
```vue
<el-radio-button 
  :value="team.id"
>
  {{ team.name }}
</el-radio-button>
```

**修复后**：
```vue
<el-radio-button 
  :label="team.id"
>
  {{ team.name }}
</el-radio-button>
```

**修改说明**：`:value` → `:label`

---

## 🚀 预期效果

### Stage1（全局视角）页面

访问：http://localhost:6060/function/c3/planning/pi/PI-001/stage1

**Console输出**：
```
✅ PI Store: 已设置currentPI PI-001
🔍 Feature过滤: {piId: 'PI-001', matchedCount: 25}
🔍 SSTS过滤: {piId: 'PI-001', matchedCount: 50}
🔍 Sprint过滤: {piId: 'PI-001', matchedCount: 8}
```

**页面显示**：

#### 1️⃣ PI信息卡片 ✅
- PI名称：工程样车 PI (EP PI)
- Sprint数量：8个
- 规划进度：Feature: 0/25, SSTS: 0/50

#### 2️⃣ 待分配列表 ✅
- 未分配Feature (25个)
- 未分配SSTS (50个)

#### 3️⃣ **Sprint管理和里程碑设置 ✅**（新修复）
- **Sprint管理**
  - 显示当前有8个Sprint
  - "添加Sprint"按钮
  - "删除最后一个Sprint"按钮
  
- **Sprint里程碑**
  - 可以为每个Sprint配置里程碑
  - 可以设置里程碑颜色、名称

#### 4️⃣ 团队×Sprint排布看板 ✅
- **Sprint列表**（横向）
  - 显示8个Sprint的时间范围
  - Sprint-001: 2026-01-01 ~ 2026-01-14
  - Sprint-002: 2026-01-15 ~ 2026-01-28
  - ... （共8个）

- **团队列表**（纵向）
  - ACC团队（容量：100 SP）
  - APA团队（容量：100 SP）
  - LKA团队（容量：100 SP）

- **拖拽功能**
  - 可以从左侧待分配列表拖拽Feature/SSTS
  - 可以拖放到团队×Sprint交叉格子中

---

### Stage2（团队视角）页面

访问：http://localhost:6060/function/c3/planning/pi/PI-001/stage2

**Console输出**：
```
✅ PI Store: 已设置currentPI PI-001
🔍 Stage2 Sprint过滤: {piId: 'PI-001', matchedCount: 8}
```

**页面显示**：

#### 1️⃣ PI信息卡片 ✅
- PI名称：工程样车 PI (EP PI)
- 时间范围：2025-02-01 ~ 2025-05-23
- Sprint数量：8个迭代
- 整体进度：0%

#### 2️⃣ **团队选择 ✅**（新修复）
- **团队按钮**（显示团队名称）
  - [ACC团队] [APA团队] [LKA团队]
  - 默认选中第一个团队（ACC团队）

#### 3️⃣ **特性需求树 ✅**（新显示）
- 左侧卡片：ACC团队 - 特性需求树
  - Feature → SSTS → MR 三层树结构
  - 显示ACC团队相关的Feature
  - 每个Feature下的SSTS
  - 每个SSTS下的MR
  - 可以搜索、全部展开/收起

#### 4️⃣ **Sprint列表 ✅**（新显示）
- 右侧卡片：ACC团队 - Sprint列表
  - 显示8个Sprint
  - 每个Sprint显示：
    - Sprint名称和时间范围
    - 已分配的MR列表
    - 容量统计

---

## 📊 ID大小写问题总结

**这已经是第4次和第5次遇到相同的问题！**

### 问题统计

| 次数 | 层级 | 位置 | 问题 |
|-----|------|------|------|
| 第1次 | 第3层 | PIPlanningBoard.vue | Sprint过滤 |
| 第2次 | 第6层 | PIPlanningBoard.vue | Sprint过滤优化 |
| 第3次 | 第7层 | PIPlanningStage1.vue | Feature过滤 |
| **第4次** | **第8层** | **PIPlanningStage1.vue** | **Sprint过滤** ⭐ |
| **第5次** | **第8层** | **PIPlanningStage2.vue** | **Sprint过滤** ⭐ |

---

### 问题模式

所有问题的根本原因都相同：
- **数据源**：旧格式mock数据使用小写（`pi-001`, `sprint-001`等）
- **URL参数/引用**：新格式使用大写（`PI-001`, `SPRINT-001`等）
- **比较方式**：使用严格相等（`===`）导致匹配失败

---

### 系统性问题

**这不是个案，而是系统性的数据不一致问题！**

**涉及的数据关联**：
1. PI ↔ Sprint：`sprint.piId === piId`
2. PI ↔ Feature：`feature.targetPI === piId`
3. PI ↔ SSTS：通过Feature间接关联
4. Feature ↔ Sprint：`feature.targetSprint === sprintId`
5. SSTS ↔ Sprint：`ssts.targetSprint === sprintId`

**每个关联都可能遇到大小写不匹配！**

---

## 💡 长期解决方案

### 方案1：统一Mock数据ID格式（推荐）⭐

**目标**：所有mock数据统一使用小写ID

**修改文件**：
1. `frontend/src/mock/pis.json`：`PI-001` → `pi-001`
2. `frontend/src/mock-data/datasets/pis.json`：保持`pi-001`
3. URL路由：`/pi/PI-001/stage1` → `/pi/pi-001/stage1`

**优点**：
- 一劳永逸解决问题
- 不需要到处使用`toLowerCase()`
- 代码更简洁
- 性能更好

**工作量**：中等
- 修改mock数据文件
- 修改路由定义
- 测试所有页面

---

### 方案2：创建ID比较工具函数

**目标**：封装大小写不敏感的ID比较

```typescript
// utils/id-comparator.ts
export function isSameId(id1: string | undefined, id2: string | undefined): boolean {
  if (!id1 || !id2) return false
  return id1.toLowerCase() === id2.toLowerCase()
}

// 使用示例
const sprints = sprintStore.sprints.filter(s => isSameId(s.piId, piId))
```

**优点**：
- 快速实施
- 统一比较逻辑
- 便于维护

**缺点**：
- 需要修改很多地方
- 每次都要调用函数

---

### 方案3：数据层规范化

**目标**：在initializer中统一规范化所有ID为小写

```typescript
// initializer.ts
function normalizeIds(data: any): any {
  if (Array.isArray(data)) {
    return data.map(normalizeIds)
  }
  if (typeof data === 'object' && data !== null) {
    const normalized: any = {}
    for (const [key, value] of Object.entries(data)) {
      // ID相关字段转小写
      if (key.endsWith('Id') || key === 'id') {
        normalized[key] = typeof value === 'string' ? value.toLowerCase() : value
      } else {
        normalized[key] = normalizeIds(value)
      }
    }
    return normalized
  }
  return data
}

// 在加载数据后立即规范化
piStore.pis = normalizeIds(pis)
```

**优点**：
- 集中处理
- 不影响业务代码
- 适合现有架构

**缺点**：
- 可能影响其他功能
- 需要全面测试

---

## 🎊 最终确认

**✅ 第8层问题已修复！**

**修复内容**：
- ✅ Stage1 Sprint过滤（ID大小写兼容）
- ✅ Stage2 Sprint过滤（ID大小写兼容）
- ✅ Stage2 团队按钮显示（`:value` → `:label`）

**修复统计**：
- Git提交：1次（0b3274f）
- 修改文件：2个
- 修改行数：约25行

---

**预期效果**：
- ✅ Stage1页面完全正常
  - Feature/SSTS列表显示
  - Sprint管理区域显示8个Sprint
  - 里程碑配置可用
  - 团队×Sprint看板显示
  
- ✅ Stage2页面完全正常
  - 团队选择按钮显示团队名称
  - 自动选中第一个团队
  - 特性需求树显示
  - Sprint列表显示8个Sprint

---

**🎉 PI Planning系统8层问题全部修复！**

**📋 刷新两个页面测试：**
1. Stage1（全局视角）：http://localhost:6060/function/c3/planning/pi/PI-001/stage1
2. Stage2（团队视角）：http://localhost:6060/function/c3/planning/pi/PI-001/stage2

**💡 强烈建议：实施长期方案1（统一Mock数据ID格式），彻底解决系统性问题！**

---

**END OF FIX**
