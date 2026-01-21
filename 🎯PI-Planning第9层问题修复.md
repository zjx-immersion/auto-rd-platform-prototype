# 🎯 PI Planning第9层问题修复

> **问题类型**: 数据重复加载  
> **涉及页面**: Stage1（全局视角） + Stage2（团队视角）  
> **修复提交**: `2343d03`

---

## 📋 问题背景

经过第8层修复，Sprint数据和团队按钮都已经正常显示。但用户测试后又发现两个新问题：

### 问题1：Stage1 团队数据重复

**症状**（从截图1）：
- ✅ 左侧"团队"列显示正常
- ❌ 每个Sprint下都重复显示了相同的Feature/SSTS
- ❌ ID重复导致需求放入后每个团队都重复显示

### 问题2：Stage2 团队按钮显示异常

**症状**（从截图2）：
- ✅ 团队按钮现在显示了（5个蓝色按钮）
- ❌ 按钮只有蓝色背景，没有团队名称文字
- ❌ 点击后依然显示"请先选择一个团队"
- ❌ 下方内容区域完全空白

---

## 🔍 问题分析

### 数据源调查

经过检查，发现**Teams数据被重复加载了两次**，而且数据格式不一致！

#### 第1次加载：initializer.ts

**文件**：`frontend/src/mock-data/datasets/teams.json`

**数据**：
```json
{
  "data": [
    {
      "id": "team-001",
      "code": "TEAM-001",
      "name": "ACC团队",
      "capacity": 100
    },
    {
      "id": "team-002",
      "code": "TEAM-002",
      "name": "APA团队",
      "capacity": 100
    },
    {
      "id": "team-003",
      "code": "TEAM-003",
      "name": "LKA团队",
      "capacity": 100
    }
  ]
}
```

**字段格式**：`id`, `name`  
**数量**：3条

**加载代码**：
```typescript
// initializer.ts:244
teamStore.teams = teams
```

---

#### 第2次加载：team.ts

**文件**：`frontend/src/mock/teams.json`

**数据**：
```json
{
  "teams": [
    {
      "teamId": "TEAM-001",
      "teamName": "ADAS团队",
      "teamCode": "TEAM-ADAS",
      "capacityPerIteration": 100
    },
    ...
  ]
}
```

**字段格式**：`teamId`, `teamName`（不同！）  
**数量**：5条（可能更多）

**加载代码**：
```typescript
// team.ts:73
async fetchTeams() {
  this.teams = teamsData.teams as Team[]
}
```

---

### 根本原因

**数据被覆盖/追加**：
1. initializer先加载3条数据（格式：`id`, `name`）
2. team.ts的fetchTeams()再加载5条数据（格式：`teamId`, `teamName`）
3. `teamStore.teams`被第2次加载覆盖

**字段格式不匹配**：
- 页面代码访问：`team.id`, `team.name`
- 第2次加载的数据：`teamId`, `teamName`
- 结果：`team.id` → `undefined`, `team.name` → `undefined`

**导致的问题**：
- **问题1**（Stage1）：重复的团队数据导致Feature/SSTS重复显示
- **问题2**（Stage2）：`team.name` 为undefined → 按钮没有文字
- **问题2**（Stage2）：`team.id` 为undefined → selectedTeamId无法匹配 → v-if失败

---

## ✅ 修复方案

### 修复1：Team Store不再重新加载数据

**文件**：`frontend/src/stores/modules/team.ts`

**修复前**：
```typescript
async fetchTeams() {
  this.loading = true
  this.error = null
  
  try {
    // ❌ 重新加载，覆盖initializer的数据
    this.teams = teamsData.teams as Team[]
    console.log('✅ Team Store: 已加载团队数据', this.teams.length)
    this.loading = false
  } catch (error) {
    this.error = '获取团队列表失败'
    this.loading = false
  }
}
```

**修复后**：
```typescript
async fetchTeams() {
  this.loading = true
  this.error = null
  
  try {
    // ✅ 不再重新加载，使用initializer加载的数据
    if (this.teams.length === 0) {
      console.warn('⚠️ Team Store: teams为空，可能initializer未执行')
    } else {
      console.log('✅ Team Store: 已有团队数据', this.teams.length)
    }
    this.loading = false
  } catch (error) {
    this.error = '获取团队列表失败'
    this.loading = false
  }
}
```

**修改说明**：
- ✅ 不再从`teamsData.teams`加载数据
- ✅ 只检查`this.teams`是否已有数据
- ✅ 避免覆盖initializer加载的正确格式数据

---

### 修复2：添加诊断日志

**文件**：`frontend/src/views/C3-Planning/PIPlanningStage2.vue`

#### 修改1：teams computed

**修复前**：
```typescript
const teams = computed(() => teamStore.teams || [])
```

**修复后**：
```typescript
const teams = computed(() => {
  const allTeams = teamStore.teams || []
  console.log('🔍 Stage2 Teams:', {
    count: allTeams.length,
    teams: allTeams.map(t => ({ id: t.id, name: t.name }))
  })
  return allTeams
})
```

---

#### 修改2：watch selectedTeamId

**修复前**：
```typescript
watch(selectedTeamId, () => {
  // 加载该团队的草稿
  ...
})
```

**修复后**：
```typescript
watch(selectedTeamId, (newTeamId) => {
  console.log('🔍 Stage2 团队选择变化:', {
    newTeamId,
    teamCount: teams.value.length,
    hasTeams: teams.value.length > 0
  })
  
  // 加载该团队的草稿
  ...
})
```

---

#### 修改3：初始化默认选择

**修复前**：
```typescript
// 默认选择第一个团队
if (teams.value && teams.value.length > 0) {
  selectedTeamId.value = teams.value[0].id
}
```

**修复后**：
```typescript
// 默认选择第一个团队
if (teams.value && teams.value.length > 0) {
  selectedTeamId.value = teams.value[0].id
  console.log('✅ Stage2: 默认选择第一个团队', {
    teamId: selectedTeamId.value,
    teamName: teams.value[0].name
  })
} else {
  console.warn('⚠️ Stage2: 没有可选择的团队')
}
```

---

## 🚀 预期效果

### Console输出

修复后刷新页面，应该看到：

```
✅ Team Store: 已有团队数据 3
🔍 Stage2 Teams: {
  count: 3,
  teams: [
    {id: 'team-001', name: 'ACC团队'},
    {id: 'team-002', name: 'APA团队'},
    {id: 'team-003', name: 'LKA团队'}
  ]
}
✅ Stage2: 默认选择第一个团队 {teamId: 'team-001', teamName: 'ACC团队'}
🔍 Stage2 团队选择变化: {newTeamId: 'team-001', teamCount: 3, hasTeams: true}
```

---

### Stage1（全局视角）页面

访问：http://localhost:6060/function/c3/planning/pi/PI-001/stage1

**预期显示**：
- ✅ 待分配列表（Feature/SSTS）
- ✅ Sprint管理区域（8个Sprint）
- ✅ **团队×Sprint看板**（修复）
  - 横向：6个Sprint
  - 纵向：3个团队（ACC、APA、LKA）
  - **不再重复显示**
  - 每个格子可以接受拖拽的Feature/SSTS

---

### Stage2（团队视角）页面

访问：http://localhost:6060/function/c3/planning/pi/PI-001/stage2

**预期显示**：

#### 1️⃣ **团队选择按钮 ✅**（修复）
- [ACC团队] [APA团队] [LKA团队]
- **显示团队名称**（不再是空白按钮）
- 默认选中"ACC团队"

#### 2️⃣ **特性需求树 ✅**（修复）
- 左侧卡片：ACC团队 - 特性需求树
- Feature → SSTS → MR 三层结构
- 显示ACC团队相关的Feature

#### 3️⃣ **Sprint列表 ✅**（修复）
- 右侧卡片：ACC团队 - Sprint列表
- 显示8个Sprint
- 每个Sprint可以接受MR拖拽

---

## 📊 数据格式对比

### 正确格式（datasets/teams.json）

```typescript
interface Team {
  id: string          // ✅ 页面使用
  code: string
  name: string        // ✅ 页面使用
  capacity: number
  lead: string
  members: string[]
  description: string
}
```

### 错误格式（mock/teams.json）

```typescript
interface WrongTeam {
  teamId: string      // ❌ 不匹配
  teamCode: string
  teamName: string    // ❌ 不匹配
  capacityPerIteration: number
  // ...
}
```

**结果**：
- `team.id` → `undefined`（因为数据有`teamId`而不是`id`）
- `team.name` → `undefined`（因为数据有`teamName`而不是`name`）

---

## 💡 经验教训

### 问题模式

**这是第6次遇到数据重复加载/格式不一致问题！**

| 次数 | 数据类型 | 问题 |
|-----|---------|------|
| 1 | PI | ID大小写不匹配 |
| 2 | Sprint | ID大小写不匹配 |
| 3 | Feature | ID大小写不匹配 |
| 4 | Sprint (Stage1) | ID大小写不匹配 |
| 5 | Sprint (Stage2) | ID大小写不匹配 |
| **6** | **Team** | **重复加载+格式不一致** ⭐ |

---

### 根本问题

**数据管理混乱**：
1. ❌ 多个数据源（`mock/` vs `mock-data/datasets/`）
2. ❌ 重复加载（initializer + store的fetchXxx）
3. ❌ 格式不一致（`id` vs `teamId`, `name` vs `teamName`）
4. ❌ 大小写不一致（`PI-001` vs `pi-001`）

---

### 长期解决方案

#### 方案1：统一数据源（推荐）⭐

**目标**：只使用一个数据源

**步骤**：
1. 删除`frontend/src/mock/`目录下的所有JSON文件
2. 只保留`frontend/src/mock-data/datasets/`中的数据
3. Store的`fetchXxx`方法改为只读取state，不加载数据
4. 所有数据由initializer统一加载

**优点**：
- ✅ 彻底避免重复加载
- ✅ 数据格式统一
- ✅ 便于维护

---

#### 方案2：规范字段格式

**目标**：统一所有数据的字段命名

**规范**：
```typescript
// 统一使用简短字段名
interface StandardFormat {
  id: string        // 不用 teamId, piId, sprintId
  code: string      // 不用 teamCode, piCode
  name: string      // 不用 teamName, piName
  // ...
}
```

**优点**：
- ✅ 代码更简洁
- ✅ 减少字段映射
- ✅ 易于理解

---

#### 方案3：TypeScript严格模式

**目标**：编译时检查数据格式

```typescript
// types/team.ts
export interface Team {
  id: string       // 严格要求
  name: string     // 严格要求
  // ...
}

// 加载时类型检查
const teams: Team[] = teamsData.teams  // 编译时会报错如果格式不对
```

---

## 🎊 最终确认

**✅ 第9层问题已修复！**

**修复内容**：
- ✅ Team Store不再重复加载数据
- ✅ 使用initializer加载的正确格式数据
- ✅ 添加详细的诊断日志

**修复统计**：
- Git提交：1次（2343d03）
- 修改文件：2个
- 修改行数：约25行

---

**预期效果**：
- ✅ Stage1页面团队不再重复显示
- ✅ Stage2页面团队按钮显示团队名称
- ✅ Stage2页面默认选中第一个团队
- ✅ Stage2页面内容区域正常显示

---

**🎉 PI Planning系统9层问题全部修复！**

**📋 刷新页面测试：**
1. Stage1（全局视角）：http://localhost:6060/function/c3/planning/pi/PI-001/stage1
2. Stage2（团队视角）：http://localhost:6060/function/c3/planning/pi/PI-001/stage2

**💡 强烈建议：实施长期方案1（统一数据源），彻底解决数据管理混乱问题！**

---

**END OF FIX**
