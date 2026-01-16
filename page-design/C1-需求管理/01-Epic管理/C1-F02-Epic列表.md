# C1-F02 Epic列表

> **功能编号**: C1-F02  
> **功能名称**: Epic列表  
> **所属能力域**: C1-需求管理  
> **主要用户**: PO、PM、SE  
> **页面类型**: 列表页

---

## 一、功能概述

### 1.1 功能定位
Epic列表是需求管理的核心入口，展示所有Epic的概览信息，支持多维度筛选、排序和快速操作。

### 1.2 核心价值
- **全局视图**: 一览所有Epic的状态和进度
- **快速筛选**: 多维度筛选定位目标Epic
- **批量操作**: 支持批量评审、分配等操作
- **数据洞察**: 通过统计卡片快速了解整体情况

---

## 二、页面布局

### 2.1 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ 面包屑导航: 工作台 > 需求管理 > Epic列表                      │
├─────────────────────────────────────────────────────────────┤
│ 页面标题: Epic列表                                [+ 创建Epic]│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│ │ 全部Epic    │ │ 进行中      │ │ 已完成      │ │ 已延期  ││
│ │ 24          │ │ 15          │ │ 8           │ │ 1       ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
├─────────────────────────────────────────────────────────────┤
│ 筛选器区域                                                   │
│ [产品线▼] [优先级▼] [状态▼] [负责人▼] [版本▼] [搜索框]     │
├─────────────────────────────────────────────────────────────┤
│ 列表工具栏                                                   │
│ [批量操作▼] [导出] [视图切换: 列表/看板]  已选: 0项         │
├─────────────────────────────────────────────────────────────┤
│ Epic列表（表格视图）                                         │
│ ┌──┬────────┬──────────────┬────┬────┬────┬────┬────┬────┐│
│ │☐│Epic ID │标题          │产品│优先│状态│进度│负责│操作││
│ ├──┼────────┼──────────────┼────┼────┼────┼────┼────┼────┤│
│ │☐│ADAS-E001│L2+级自动驾驶 │ADAS│P0  │进行│65% │张伟│... ││
│ │☐│ADAS-E002│自动泊车系统  │ADAS│P0  │进行│55% │张伟│... ││
│ │☐│CABIN-E001│智能语音助手 │CABIN│P0 │进行│78% │李娜│... ││
│ └──┴────────┴──────────────┴────┴────┴────┴────┴────┴────┘│
├─────────────────────────────────────────────────────────────┤
│ 分页: 共24条 [<] 1/3 [>] [10条/页▼]                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、数据字段

### 3.1 列表字段

| 字段名 | 字段说明 | 数据类型 | 显示规则 |
|--------|---------|---------|---------|
| 复选框 | 批量选择 | Boolean | 始终显示 |
| Epic ID | Epic唯一标识 | String | 可点击跳转详情 |
| 标题 | Epic标题 | String | 最多显示50字符，超出显示... |
| 产品线 | 所属产品 | Enum | 显示产品名称+图标 |
| 优先级 | 业务优先级 | Enum | P0(红)、P1(橙)、P2(黄) |
| 状态 | 当前状态 | Enum | 草稿/规划中/进行中/已完成 |
| 进度 | 完成进度 | Number | 进度条+百分比 |
| 负责人 | Epic Owner | User | 显示头像+姓名 |
| 目标版本 | 计划发布版本 | String | 版本号 |
| Feature数 | 关联Feature数量 | Number | 可点击展开 |
| 创建时间 | 创建时间 | DateTime | YYYY-MM-DD |
| 操作 | 快捷操作 | Actions | 查看/编辑/删除 |

### 3.2 筛选条件

```json
{
  "filters": {
    "productLine": {
      "label": "产品线",
      "type": "multiSelect",
      "options": ["ADAS", "CABIN", "EE", "POWER", "CHASSIS"]
    },
    "priority": {
      "label": "优先级",
      "type": "multiSelect",
      "options": ["P0", "P1", "P2", "P3"]
    },
    "status": {
      "label": "状态",
      "type": "multiSelect",
      "options": ["DRAFT", "PLANNING", "IN_PROGRESS", "DONE", "CANCELLED"]
    },
    "owner": {
      "label": "负责人",
      "type": "userSelect",
      "multiple": true
    },
    "targetVersion": {
      "label": "目标版本",
      "type": "multiSelect",
      "options": ["V1.0", "V2.0", "V3.0"]
    },
    "businessValue": {
      "label": "业务价值",
      "type": "multiSelect",
      "options": ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    },
    "moscowCategory": {
      "label": "MoSCoW分类",
      "type": "multiSelect",
      "options": ["MUST", "SHOULD", "COULD", "WONT"]
    },
    "keyword": {
      "label": "关键词搜索",
      "type": "text",
      "placeholder": "搜索Epic ID、标题、描述"
    }
  }
}
```

---

## 四、交互设计

### 4.1 列表操作

**单条操作**:
```json
{
  "rowActions": [
    {
      "action": "view",
      "label": "查看详情",
      "icon": "eye",
      "permission": "epic:view"
    },
    {
      "action": "edit",
      "label": "编辑",
      "icon": "edit",
      "permission": "epic:edit",
      "condition": "status != 'DONE'"
    },
    {
      "action": "review",
      "label": "发起评审",
      "icon": "check-circle",
      "permission": "epic:review",
      "condition": "status == 'DRAFT'"
    },
    {
      "action": "delete",
      "label": "删除",
      "icon": "delete",
      "permission": "epic:delete",
      "condition": "status == 'DRAFT' && featureCount == 0",
      "confirm": "确认删除该Epic？删除后不可恢复"
    }
  ]
}
```

**批量操作**:
```json
{
  "batchActions": [
    {
      "action": "batchAssign",
      "label": "批量分配",
      "permission": "epic:assign"
    },
    {
      "action": "batchUpdatePriority",
      "label": "批量修改优先级",
      "permission": "epic:edit"
    },
    {
      "action": "batchExport",
      "label": "批量导出",
      "permission": "epic:export"
    }
  ]
}
```

### 4.2 视图切换

**列表视图**（默认）:
- 表格形式展示
- 支持列排序
- 支持列自定义显示

**看板视图**:
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 草稿     │ │ 规划中   │ │ 进行中   │ │ 已完成   │
├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤
│ Epic卡片 │ │ Epic卡片 │ │ Epic卡片 │ │ Epic卡片 │
│ Epic卡片 │ │ Epic卡片 │ │ Epic卡片 │ │ Epic卡片 │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## 五、数据示例

### 5.1 列表数据

```json
{
  "total": 24,
  "pageSize": 10,
  "currentPage": 1,
  "items": [
    {
      "id": "ADAS-E001",
      "title": "L2+级自动驾驶功能",
      "product": {
        "id": "ADAS-001",
        "name": "岚图智能驾驶系统",
        "type": "ADAS"
      },
      "priority": "P0",
      "status": "IN_PROGRESS",
      "progress": 65,
      "owner": {
        "id": "U001",
        "name": "张伟",
        "avatar": "https://avatar.example.com/zhangwei.jpg"
      },
      "targetVersion": "V2.0",
      "featureCount": 5,
      "businessValue": "CRITICAL",
      "moscowCategory": "MUST",
      "createdAt": "2024-03-01T08:00:00Z",
      "updatedAt": "2025-01-14T10:30:00Z"
    }
  ]
}
```

---

## 六、页面跳转

### 6.1 入口

- 顶部导航 > 需求管理 > Epic列表
- 工作台 > 我的Epic
- 产品详情页 > Epic列表

### 6.2 出口

- 点击Epic ID/标题 → C1-F03 Epic详情
- 点击[创建Epic] → C1-F01 Epic创建
- 点击[编辑] → C1-F04 Epic编辑
- 点击Feature数 → C1-F08 Feature列表（带Epic筛选）

---

## 七、权限控制

| 操作 | 所需权限 | 角色 |
|------|---------|------|
| 查看列表 | epic:view | PO、PM、SE、SO、Dev |
| 创建Epic | epic:create | PO |
| 编辑Epic | epic:edit | PO、Epic Owner |
| 删除Epic | epic:delete | PO |
| 批量操作 | epic:batch | PO、PM |

---

**设计版本**: V1.0  
**最后更新**: 2025-01-14

