# 🎯 PI Planning第10层问题修复

> **问题类型**: Element Plus组件验证错误 + Stage2数据链路诊断  
> **修复提交**: `8577b5b`, `abcf8f1`

---

## 📋 问题背景

经过第9层修复（Team重复加载），用户测试后发现：

### 问题1：Stage2 特性需求树显示"暂无数据"

**症状**（从截图）：
- ✅ 团队按钮显示正常：[ACC团队] [APA团队] [LKA团队]
- ✅ 已经自动选中ACC团队
- ✅ Sprint列表显示2个Sprint
- ❌ **左侧"特性需求树"显示"暂无数据"**

### 问题2：ElProgress percentage验证错误（性能问题）

**症状**（从Console）：
- ⚠️ 50多个`Invalid prop: custom validator check failed for prop "percentage"`
- 影响页面性能
- Console被错误刷屏

### 问题3：Element Plus API警告

**症状**：
- ⚠️ `[el-radio] label act as value is deprecated, use value instead`
- `:label`已经被弃用，应该使用`:value`

---

## 🔍 问题分析

### 问题1分析：特性需求树数据链路

**数据流程**（反向查找）：
```
MR → SSTS → Feature → 树
```

**代码逻辑**：
```typescript
// 第1步：过滤该团队的MR
const teamMRs = allMRs.filter(mr => mr.teamId === selectedTeamId)

// 第2步：提取SSTS ID
const teamSSTSIds = teamMRs.map(mr => mr.sstsId)

// 第3步：提取Feature ID
const teamFeatureIds = teamSSTSIds.map(sstsId => {
  const ssts = allSsts.find(s => s.id === sstsId)
  return ssts?.featureId
})

// 第4步：构建树
const treeData = teamFeatureIds.map(featureId => {
  // 构建Feature → SSTS → MR 树结构
})
```

**可能断点**：
- 如果`teamMRs = []` → 整个链条断裂
- 如果MR中没有`sstsId`字段 → 无法查找SSTS
- 如果SSTS中没有`featureId`字段 → 无法查找Feature
- 如果ID格式不匹配（大小写） → 查找失败

---

### 问题2分析：ElProgress percentage错误

**代码位置**：`PIPlanningStage1.vue`

**错误代码**：
```vue
<el-progress 
  :percentage="Math.min(getLoadRate(team.id, sprint.id), 100)" 
/>
```

**getLoadRate函数**：
```typescript
function getLoadRate(teamId: string, sprintId: string) {
  const team = teams.value.find(t => t.id === teamId)
  if (!team) return 0
  const load = getSprintTeamLoad(teamId, sprintId)
  return team.capacity > 0 ? Math.round((load / team.capacity) * 100) : 0
}
```

**问题点**：
- `team.capacity`可能undefined → `load / undefined` → NaN
- 计算结果可能是NaN → ElProgress验证失败

---

## ✅ 修复方案

### 修复1：添加Stage2数据链路诊断

**文件**：`frontend/src/views/C3-Planning/PIPlanningStage2.vue`

**修改内容**：
1. `teamMRs` computed - 添加详细日志
2. `teamSSTSIds` computed - 添加日志
3. `teamFeatureIds` computed - 添加日志

**诊断日志示例**：
```typescript
console.log('🔍 Stage2 TeamMRs:', {
  selectedTeamId: selectedTeamId.value,
  totalMRs: allMRs.value?.length || 0,
  matchedCount: filtered.length,
  sampleMRs: allMRs.value?.slice(0, 3).map(mr => ({ 
    id: mr.id, 
    teamId: mr.teamId 
  }))
})
```

---

### 修复2：ElProgress percentage验证

**文件**：`frontend/src/views/C3-Planning/PIPlanningStage1.vue`

**修改前**：
```typescript
function getLoadRate(teamId: string, sprintId: string) {
  const team = teams.value.find(t => t.id === teamId)
  if (!team) return 0
  const load = getSprintTeamLoad(teamId, sprintId)
  return team.capacity > 0 ? Math.round((load / team.capacity) * 100) : 0
}
```

**修改后**：
```typescript
function getLoadRate(teamId: string, sprintId: string) {
  const team = teams.value.find(t => t.id === teamId)
  if (!team) return 0
  const capacity = team.capacity || 100 // ✅ 默认容量100
  const load = getSprintTeamLoad(teamId, sprintId)
  const rate = capacity > 0 ? Math.round((load / capacity) * 100) : 0
  // ✅ 确保返回有效数字（ElProgress要求0-100之间的数字）
  return isNaN(rate) ? 0 : Math.max(0, rate)
}
```

**修改要点**：
1. ✅ 添加`capacity`默认值（100）
2. ✅ 使用`isNaN()`检查计算结果
3. ✅ 使用`Math.max(0, rate)`防止负数

---

### 修复3：Element Plus radio-button语法

**文件**：`frontend/src/views/C3-Planning/PIPlanningStage2.vue`

**修改**：`:label` 改回 `:value`

**原因**：Element Plus警告提示`label`作为value已经被弃用，应该使用`:value`

---

## 🚀 预期效果

### Console输出（刷新页面后）

Stage1页面：
- ✅ **不再有50+个ElProgress错误**
- ✅ 负载率计算正常

Stage2页面：
- 应该看到详细的数据链路诊断：

```
✅ Team Store: 已有团队数据 3
🔍 Stage2 Teams: {count: 3, teams: [...]}
✅ Stage2: 默认选择第一个团队 {teamId: 'team-001', teamName: 'ACC团队'}

🔍 Stage2 TeamMRs: {
  selectedTeamId: 'team-001',
  totalMRs: 186,
  matchedCount: XX,
  sampleMRs: [{id: 'mr-xxx', teamId: 'team-001'}, ...]
}

🔍 Stage2 TeamSSTSIds: {
  teamMRCount: XX,
  sstsIdsCount: YY
}

🔍 Stage2 TeamFeatureIds: {
  sstsIdsCount: YY,
  featureIdsCount: ZZ
}
```

**通过这些日志，可以定位到底哪个环节断了**。

---

### 页面显示

**如果数据链路正常**：
- ✅ 特性需求树显示Feature → SSTS → MR结构
- ✅ Sprint列表显示MR分配情况

**如果某个环节断了**：
- ❌ 显示"暂无数据"
- 但Console会明确显示哪个环节的数量为0

---

## 📊 修复统计

**修复内容**：
- ✅ Stage2数据链路诊断日志
- ✅ Stage1 ElProgress percentage验证
- ✅ Element Plus radio-button语法修正

**Git提交**：
- `8577b5b` - Stage2诊断日志 + radio语法
- `abcf8f1` - Stage1 ElProgress修复

**修改文件**：
- `frontend/src/views/C3-Planning/PIPlanningStage2.vue`
- `frontend/src/views/C3-Planning/PIPlanningStage1.vue`

**修改行数**：约30行

---

## 🎊 下一步

**✅ 第10层问题修复已完成！**

**📋 请刷新页面并提供新的Console输出！**

**关键诊断信息**：
- 🔍 Stage2 TeamMRs: matchedCount = ?
- 🔍 Stage2 TeamSSTSIds: sstsIdsCount = ?
- 🔍 Stage2 TeamFeatureIds: featureIdsCount = ?

**这些日志会告诉我们**：
- 如果`matchedCount = 0` → MR过滤失败（可能是teamId不匹配）
- 如果`sstsIdsCount = 0` → MR中没有sstsId字段
- 如果`featureIdsCount = 0` → SSTS中没有featureId字段

---

**🎉 等待新的Console输出，继续定位问题！**

---

**END OF FIX**
