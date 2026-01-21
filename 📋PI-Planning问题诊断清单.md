# 📋 PI Planning问题诊断清单

> **快速参考**：诊断Stage2特性需求树为空的问题  
> **最新提交**: `5f3b057`

---

## 🎯 诊断流程

### 第1步：刷新页面

访问：http://localhost:6060/function/c3/planning/pi/PI-001/stage2

---

### 第2步：查看Console诊断日志

**必须包含以下日志**：

#### 1️⃣ Teams诊断
```
🔍 Stage2 Teams: {count: 3, teams: [...]}
```
- 如果count ≠ 3 → Teams数据加载问题

---

#### 2️⃣ 默认团队选择
```
✅ Stage2: 默认选择第一个团队 {teamId: 'team-001', teamName: 'ACC团队'}
```
- 如果没有这条日志 → 团队选择失败

---

#### 3️⃣ MR过滤（第1层）
```
🔍 Stage2 TeamMRs: {
  selectedTeamId: 'team-001',
  totalMRs: 186,
  matchedCount: 94,  ← 关键！
  sampleMRs: [...]
}
```
- 如果`matchedCount = 0` → **MR过滤失败**
  - 可能原因：`mr.teamId ≠ selectedTeamId`（大小写、格式）
  - 解决：添加toLowerCase()或检查字段名

---

#### 4️⃣ SSTS ID提取（第2层）
```
🔍 Stage2 TeamSSTSIds: {
  teamMRCount: 94,
  sstsIdsCount: 31  ← 关键！
}
```
- 如果`sstsIdsCount = 0` → **MR中没有sstsId字段**
  - 可能原因：字段名不对（`sstId`? `sstsId`?）
  - 解决：检查MR数据格式

---

#### 5️⃣ Feature ID提取（第3层）
```
🔍 Stage2 TeamFeatureIds: {
  sstsIdsCount: 31,
  featureIdsCount: 16  ← 关键！
}
```
- 如果`featureIdsCount = 0` → **SSTS中没有featureId字段**
  - 可能原因：字段名不对
  - 解决：检查SSTS数据格式

---

#### 6️⃣ 树构建（第4层）- 最关键！
```
🔍 Stage2 FeatureTreeData: {
  selectedTeamId: 'team-001',
  teamFeatureIdsCount: 16,
  featureFoundCount: ?,    ← 实际找到的Feature数量
  sstsFoundCount: ?,       ← 实际找到的SSTS数量
  mrFoundCount: ?,         ← 实际找到的MR数量
  treeNodesCount: ?        ← 最终树节点数量
}
```

**诊断矩阵**：

| featureFoundCount | sstsFoundCount | mrFoundCount | treeNodesCount | 问题位置 |
|------------------|----------------|--------------|----------------|---------|
| 0 | 0 | 0 | 0 | ❌ Feature查找失败 |
| 16 | 0 | 0 | 0 | ❌ SSTS查找失败 |
| 16 | >0 | 0 | 0 | ❌ MR查找失败 |
| 16 | >0 | >0 | 0 | ❌ 树构建条件不满足 |
| 16 | >0 | >0 | >0 | ✅ 正常（应该显示树） |

---

## 🔍 常见问题场景

### 场景1：Feature查找失败

**诊断结果**：
```
featureFoundCount: 0
```

**原因**：`features.value.find(f => f.id === featureId)`找不到

**可能原因**：
- Feature ID格式不匹配（大小写）
- features.value未加载
- Feature数据中使用了不同的ID字段

**解决方案**：
```typescript
// 添加大小写兼容
const feature = features.value.find(f => 
  (f.id || '').toLowerCase() === featureId.toLowerCase()
)
```

---

### 场景2：SSTS查找失败

**诊断结果**：
```
featureFoundCount: 16
sstsFoundCount: 0
```

**原因**：`allSsts.filter(s => s.featureId === featureId)`找不到

**可能原因**：
- SSTS的`featureId`字段格式不匹配
- SSTS不在`teamSSTSIds`列表中
- SSTS数据中使用了不同的字段名

**解决方案**：
```typescript
// 添加大小写兼容
const featureSSTSs = allSsts.filter(s => {
  const sFeatureIdLower = (s.featureId || '').toLowerCase()
  const featureIdLower = featureId.toLowerCase()
  return sFeatureIdLower === featureIdLower && 
         teamSSTSIds.value.includes(s.id)
})
```

---

### 场景3：MR查找失败

**诊断结果**：
```
featureFoundCount: 16
sstsFoundCount: 31
mrFoundCount: 0
```

**原因**：`teamMRs.filter(mr => mr.sstsId === ssts.id)`找不到

**可能原因**：
- MR的`sstsId`字段不匹配SSTS的`id`
- MR数据中字段名不对（`sstsId`? `sstId`?）

**解决方案**：
```typescript
// 检查字段名和大小写
const sstsMRs = teamMRs.value.filter(mr => {
  const mrSstsIdLower = (mr.sstsId || '').toLowerCase()
  const sstsIdLower = (ssts.id || '').toLowerCase()
  return mrSstsIdLower === sstsIdLower
})
```

---

### 场景4：树构建条件不满足

**诊断结果**：
```
featureFoundCount: 16
sstsFoundCount: 31
mrFoundCount: 94
treeNodesCount: 0
```

**原因**：虽然找到了数据，但不满足树构建条件

**可能原因**：
- SSTS下没有MR → `sstsNode.children.length = 0`
- Feature下没有SSTS → `featureNode.children.length = 0`

**这意味着数据关联有问题**：
- 94个MR的`sstsId`可能都不在31个SSTS的`id`列表中
- 或者31个SSTS的`id`都不在94个MR的`sstsId`列表中

**解决方案**：检查MR和SSTS的ID格式是否一致

---

## 📊 快速检查脚本

如果需要手动检查数据关联，可以在Console中运行：

```javascript
// 检查MR的sstsId格式
const mrSstsIds = teamMRs.value.map(mr => mr.sstsId).slice(0, 5)
console.log('MR的sstsId示例:', mrSstsIds)

// 检查SSTS的id格式
const sstsIds = teamSSTSIds.value.slice(0, 5)
console.log('SSTS的id示例:', sstsIds)

// 检查是否匹配
const matched = mrSstsIds.filter(id => sstsIds.includes(id))
console.log('匹配的ID:', matched)
```

---

## 🎊 下一步

**✅ 诊断日志已完善！**

**📋 请刷新页面并提供新的Console输出！**

**关键信息**：
```
🔍 Stage2 FeatureTreeData: {
  featureFoundCount: ?,
  sstsFoundCount: ?,
  mrFoundCount: ?,
  treeNodesCount: ?
}
```

**根据这4个数字，就能精确定位问题！**

---

**END OF DIAGNOSTIC**
