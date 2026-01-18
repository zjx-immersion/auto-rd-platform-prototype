# UX-F02 上下文感知面板

> **功能编号**: UX-F02  
> **功能名称**: 上下文感知面板  
> **所属能力域**: 用户体验优化  
> **主要用户**: 全角色  
> **页面类型**: 通用组件

---

## 一、功能概述

### 1.1 功能定位
上下文感知面板是在详情页右侧显示的智能面板，根据当前页面和用户角色，动态显示相关信息、快捷操作和智能建议，帮助用户在不跳转页面的情况下完成大部分常见任务。

### 1.2 核心价值
- **减少页面跳转**: 单页面完成80%常见任务
- **提升操作效率**: 减少60%信息查找时间
- **智能推荐**: 根据上下文智能推荐相关操作
- **无缝体验**: 无需离开当前页面即可完成操作

### 1.3 使用场景

| 场景 | 用户操作 | 面板显示内容 |
|------|---------|-------------|
| 查看Epic详情 | 打开Epic详情页 | 关联Feature列表、相关任务、评审状态、快捷操作 |
| 查看Feature详情 | 打开Feature详情页 | 关联SSTS列表、PRD链接、评审状态、分配操作 |
| 查看Sprint详情 | 打开Sprint详情页 | 任务列表、燃尽图、阻塞问题、快捷操作 |
| 查看Task详情 | 打开Task详情页 | 关联MR、代码链接、评审状态、工时记录 |

---

## 二、页面布局

### 2.1 面板结构

```
┌─────────────────────────────────────────────────────────────┐
│ Epic详情页 - ADAS-E001                                       │
├──────────────────────────┬──────────────────────────────────┤
│                          │ 上下文感知面板 (右侧，可折叠)    │
│ 主内容区                 │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                          │                                  │
│ Epic基本信息             │ 📋 相关信息                      │
│ ━━━━━━━━━━━━━━━━━━━━━━ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                          │                                  │
│ 标题: 智能驾驶辅助系统   │ 🔗 关联Feature (5个)             │
│ 状态: 进行中             │ ┌────────────────────────────┐ │
│ 进度: 40%                │ │ ADAS-F001 自适应巡航 (ACC) │ │
│                          │ │ ADAS-F002 车道保持 (LKA)   │ │
│ Epic描述                 │ │ ADAS-F003 交通标志识别(TSR)│ │
│ ━━━━━━━━━━━━━━━━━━━━━━ │ │ ...                        │ │
│                          │ │ [查看全部] [创建Feature]    │ │
│ 实现L2级别智能驾驶辅助   │ └────────────────────────────┘ │
│ 功能，包括：              │                                  │
│ ...                      │ 📊 相关数据                     │
│                          │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                          │ • 总Feature数: 5个               │
│                          │ • 已完成: 2个 (40%)              │
│                          │ • 进行中: 2个                    │
│                          │ • 待开始: 1个                    │
│                          │                                  │
│                          │ ⚡ 快捷操作                      │
│                          │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                          │ [创建Feature]                    │
│                          │ [发起评审]                       │
│                          │ [分配到版本]                     │
│                          │ [查看看板]                       │
│                          │                                  │
│                          │ 💡 智能建议                      │
│                          │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                          │ ⚠️ 有2个Feature待评审，建议优先处理│
│                          │ 📈 进度较计划延迟5%，建议调整资源 │
│                          │                                  │
│                          │ 🔔 相关通知 (3条未读)            │
│                          │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                          │ • Feature ADAS-F001评审完成      │
│                          │ • Feature ADAS-F002状态变更      │
│                          │ • 新评论: @你 在Epic中提到了你   │
│                          │ [查看全部]                        │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 三、数据字段

### 3.1 上下文信息字段

| 字段名 | 字段类型 | 说明 |
|--------|---------|------|
| entityType | Enum | 实体类型: epic/feature/ssts/mr/task/sprint/pi |
| entityId | String | 实体ID |
| relatedEntities | Array<Entity> | 关联实体列表 |
| relatedTasks | Array<Task> | 相关任务列表 |
| relatedDocuments | Array<Document> | 相关文档列表 |
| relatedComments | Array<Comment> | 相关评论列表 |
| statistics | Object | 统计数据 |
| quickActions | Array<Action> | 快捷操作列表 |
| smartSuggestions | Array<Suggestion> | 智能建议列表 |
| notifications | Array<Notification> | 相关通知列表 |

### 3.2 关联实体字段

| 字段名 | 字段类型 | 说明 |
|--------|---------|------|
| id | String | 实体ID |
| type | Enum | 实体类型 |
| name | String | 实体名称 |
| status | Enum | 状态 |
| progress | Number | 进度（0-100） |
| actionUrl | String | 操作链接 |

### 3.3 智能建议字段

| 字段名 | 字段类型 | 说明 |
|--------|---------|------|
| type | Enum | 建议类型: warning/optimization/info |
| title | String | 建议标题 |
| description | String | 建议描述 |
| action | Object | 建议操作 |
| priority | Enum | 优先级: high/medium/low |

---

## 四、交互设计

### 4.1 面板显示规则

| 实体类型 | 显示内容 | 优先级 |
|---------|---------|--------|
| Epic | 关联Feature、相关任务、评审状态、统计信息 | P0 |
| Feature | 关联SSTS、PRD链接、评审状态、分配信息 | P0 |
| SSTS | 关联MR、评审状态、追溯关系 | P0 |
| MR | 关联Task、代码链接、评审状态 | P0 |
| Task | 关联MR、代码链接、工时记录、阻塞问题 | P0 |
| Sprint | 任务列表、燃尽图、阻塞问题、统计信息 | P0 |
| PI | 关联Epic/Feature、Sprint列表、进度信息 | P0 |

### 4.2 快捷操作

- **创建关联实体**: 点击按钮直接创建关联实体（如从Epic创建Feature）
- **批量操作**: 支持批量选择关联实体进行操作
- **状态变更**: 快速变更实体状态
- **评审操作**: 快速发起评审或查看评审状态

### 4.3 智能建议

- **风险预警**: 自动识别风险并提示
- **优化建议**: 基于数据分析提供优化建议
- **下一步操作**: 推荐下一步应该执行的操作

### 4.4 面板交互

- **折叠/展开**: 点击面板标题可折叠/展开
- **固定/浮动**: 可固定面板位置或浮动显示
- **拖拽调整**: 可拖拽调整面板宽度
- **快速跳转**: 点击关联实体快速跳转

---

## 五、API接口

### 5.1 获取上下文信息

**请求**:
```http
GET /api/v1/context-panel?entityType=epic&entityId=epic-001
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "entityType": "epic",
    "entityId": "epic-001",
    "relatedEntities": [
      {
        "id": "feature-001",
        "type": "feature",
        "name": "ADAS-F001 自适应巡航",
        "status": "in-progress",
        "progress": 60,
        "actionUrl": "/function/c1-requirement/feature/feature-001"
      }
    ],
    "statistics": {
      "totalFeatures": 5,
      "completedFeatures": 2,
      "inProgressFeatures": 2,
      "pendingFeatures": 1
    },
    "quickActions": [
      {
        "id": "create-feature",
        "label": "创建Feature",
        "action": "create",
        "target": "feature",
        "url": "/function/c1-requirement/feature/create?epicId=epic-001"
      }
    ],
    "smartSuggestions": [
      {
        "type": "warning",
        "title": "有2个Feature待评审",
        "description": "建议优先处理待评审的Feature",
        "action": {
          "label": "查看待评审Feature",
          "url": "/function/c1-requirement/feature?status=pending-review"
        },
        "priority": "high"
      }
    ],
    "notifications": [
      {
        "id": "notif-001",
        "type": "review",
        "title": "Feature ADAS-F001评审完成",
        "read": false,
        "createdAt": "2026-01-17T10:00:00Z"
      }
    ]
  }
}
```

---

## 六、集成位置

### 6.1 Epic详情页
- 显示关联Feature列表
- 显示Epic统计信息
- 提供创建Feature快捷操作
- 显示评审状态和建议

### 6.2 Feature详情页
- 显示关联SSTS列表
- 显示PRD链接
- 提供创建SSTS快捷操作
- 显示分配信息和评审状态

### 6.3 SSTS详情页
- 显示关联MR列表
- 显示追溯关系
- 提供创建MR快捷操作
- 显示评审状态

### 6.4 MR详情页
- 显示关联Task列表
- 显示代码链接
- 提供创建Task快捷操作
- 显示评审状态和构建状态

### 6.5 Task详情页
- 显示关联MR信息
- 显示代码链接
- 显示工时记录
- 显示阻塞问题

### 6.6 Sprint详情页
- 显示任务列表
- 显示燃尽图
- 显示阻塞问题
- 显示统计信息

### 6.7 PI详情页
- 显示关联Epic/Feature列表
- 显示Sprint列表
- 显示进度信息
- 显示风险预警

---

## 七、技术实现

### 7.1 组件设计

```vue
<ContextPanel
  :entity-type="entityType"
  :entity-id="entityId"
  :collapsible="true"
  :position="'right'"
/>
```

### 7.2 数据获取策略

- **实时数据**: 关联实体列表、统计信息
- **缓存数据**: 智能建议（5分钟缓存）
- **懒加载**: 通知列表（滚动加载）

### 7.3 性能优化

- **虚拟滚动**: 关联实体列表使用虚拟滚动
- **分页加载**: 通知列表分页加载
- **防抖处理**: 搜索和筛选操作防抖处理

---

**设计版本**: V1.0  
**最后更新**: 2026-01-17
