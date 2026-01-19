# PI Planning 团队视角重构报告

> 更新时间：2026-01-19  
> 版本：2.0.0

---

## 📋 调整背景

根据用户反馈和实际需求，团队视角页面需要进行重大调整：

### 原设计问题
- 左侧显示Sprint列表，右侧显示MR列表
- MR按Sprint分组显示（基于SSTS的默认分配）
- 布局与全局视角类似，不够清晰

### 新设计目标
1. **左侧**：显示特性树（Feature → SSTS → MR 的层级结构）
2. **右侧**：显示Sprint列表（作为MR的分配目标）
3. **过滤**：只显示与选中团队管理模块相关的需求
4. **交互**：从左侧树拖拽MR到右侧Sprint进行分配

---

## 🎯 核心调整内容

### 1. 布局重构

#### Before（旧版本）
```
┌──────────────────┬──────────────────┐
│  左侧：Sprint列表 │  右侧：MR列表    │
│  (按Sprint排列)  │  (按Sprint分组)  │
│  可拖拽MR到此    │  可拖拽到左侧    │
└──────────────────┴──────────────────┘
```

#### After（新版本）
```
┌──────────────────┬──────────────────┐
│  左侧：特性树    │  右侧：Sprint列表 │
│  Feature         │  Sprint 1        │
│  ├─ SSTS         │    [MR卡片列表]  │
│  │  ├─ MR       │  Sprint 2        │
│  │  └─ MR       │    [MR卡片列表]  │
│  └─ SSTS         │  Sprint 3        │
│     └─ MR        │    [拖拽提示]    │
└──────────────────┴──────────────────┘
```

### 2. 数据过滤逻辑

```typescript
// 1. 根据团队ID过滤MR
teamMRs = allMRs.filter(mr => mr.teamId === selectedTeamId)

// 2. 反向查找SSTS
teamSSTSIds = teamMRs.map(mr => mr.sstsId)

// 3. 反向查找Feature
teamFeatureIds = teamSSTSs.map(ssts => ssts.featureId)

// 4. 构建树形结构
featureTreeData = teamFeatures.map(feature => ({
  ...feature,
  children: teamSSTSs.filter(s => s.featureId === feature.id).map(ssts => ({
    ...ssts,
    children: teamMRs.filter(mr => mr.sstsId === ssts.id)
  }))
}))
```

### 3. 特性树组件

使用 `el-tree` 组件实现树形展示：

```vue
<el-tree
  ref="treeRef"
  :data="featureTreeData"
  :props="treeProps"
  node-key="id"
  :default-expand-all="false"
  :expand-on-click-node="false"
  :filter-node-method="filterNode"
>
  <template #default="{ node, data }">
    <div 
      class="tree-node" 
      :class="`tree-node-${data.type}`"
      :draggable="data.type === 'mr'"
      @dragstart="data.type === 'mr' && handleTreeDragStart($event, data)"
    >
      <!-- 节点内容 -->
    </div>
  </template>
</el-tree>
```

**树节点类型**：
- **Feature节点**：蓝色图标，显示Story Points
- **SSTS节点**：黄色图标，显示Story Points
- **MR节点**：绿色图标，显示工时，可拖拽

### 4. 拖拽功能

#### 拖拽流程
1. 用户从左侧树拖拽MR节点
2. 鼠标移动到右侧Sprint卡片上方
3. Sprint卡片高亮显示（蓝色边框）
4. 释放鼠标，MR分配到该Sprint
5. MR节点显示"已分配"标签

#### 拖拽实现
```typescript
function handleTreeDragStart(event: DragEvent, data: any) {
  draggedMR.value = data.mrData  // 保存MR完整数据
}

function handleDragOver(event: DragEvent, sprintId: string) {
  event.preventDefault()
  dragTargetSprintId.value = sprintId  // 高亮目标Sprint
}

function handleDrop(event: DragEvent, sprintId: string) {
  // 更新MR的targetSprint
  draggedMR.value.targetSprint = sprintId
  handleSaveDraft()  // 保存草稿
}
```

---

## 📊 数据结构

### MR数据模型
```typescript
interface MR {
  id: string
  code: string
  title: string
  sstsId: string           // 所属SSTS
  teamId: string           // 负责团队 ⭐ 关键字段
  teamName: string
  effortHours: number
  storyPoints: number
  status: string
  priority: string
  targetPI?: string
  targetSprint?: string    // 分配的Sprint ⭐ 关键字段
  dependencies: string[]
  tags: string[]
}
```

### 树节点数据模型
```typescript
interface TreeNode {
  id: string                // 格式: feature-{id} | ssts-{id} | mr-{id}
  code: string
  name?: string             // Feature/SSTS
  title?: string            // MR
  storyPoints?: number      // Feature/SSTS
  effortHours?: number      // MR
  type: 'feature' | 'ssts' | 'mr'
  targetSprint?: string     // MR的分配目标
  mrData?: MR              // MR的完整数据（用于拖拽）
  children?: TreeNode[]
}
```

---

## 🎨 UI/UX 改进

### 1. 左侧特性树

| 元素 | 样式 | 说明 |
|------|------|------|
| Feature节点 | 蓝色图标 (Document) | 显示code、name、SP |
| SSTS节点 | 黄色图标 (FolderOpened) | 显示code、title、SP |
| MR节点 | 绿色图标 (Files) | 显示code、title、工时 |
| MR节点（已分配） | + 灰色标签 | 显示"已分配: Sprint名称" |
| MR节点（拖拽时） | 光标变为move | 蓝色高亮背景 |

### 2. 右侧Sprint列表

| 元素 | 样式 | 说明 |
|------|------|------|
| Sprint卡片 | 白色背景，圆角边框 | 显示容量、已用、可用 |
| Sprint卡片（拖拽目标） | 蓝色边框，浅蓝背景 | 高亮提示可放置 |
| Sprint进度条 | 绿色/黄色/红色 | <80% / 80-100% / >100% |
| MR卡片 | 灰色背景，小圆角 | 显示code、title、工时、SSTS |
| 空Sprint | 虚线边框提示 | "[+ 拖拽MR到此处]" |

### 3. 功能按钮

| 按钮 | 位置 | 功能 |
|------|------|------|
| 全部展开/收起 | 左侧卡片标题栏 | 控制树的展开状态 |
| 搜索框 | 左侧卡片标题栏 | 过滤树节点 |
| 移除按钮 | Sprint中的MR卡片 | 移除MR分配 |
| 保存草稿 | 页面顶部 | 保存分配结果 |
| 切换到全局视角 | 团队选择卡片 | 跳转到全局视角 |

---

## 💾 数据持久化

### LocalStorage结构
```typescript
// Key: pi-planning-team-draft-${piId}
{
  teamId: string,
  allocations: Array<{
    mrId: string,
    sprintId: string | undefined
  }>,
  updatedAt: string
}
```

### 保存时机
1. 拖拽MR到Sprint时自动保存
2. 移除MR时自动保存
3. 点击"保存草稿"按钮手动保存

### 加载时机
1. 切换团队时加载该团队的草稿
2. 刷新页面时恢复上次选择的团队和分配结果

---

## 🔄 与全局视角的区别

| 维度 | 全局视角 | 团队视角 |
|------|----------|----------|
| **主要对象** | Feature / SSTS | MR（模块需求） |
| **分配粒度** | Feature/SSTS → Team + Sprint | MR → Sprint |
| **左侧布局** | Sprint时间线（横向） | 特性树（树形） |
| **右侧布局** | 未分配Feature/SSTS列表 | Sprint列表（纵向） |
| **拖拽方向** | 右 → 左 | 左 → 右 |
| **团队范围** | 多团队（全局） | 单团队（选择后过滤） |
| **数据来源** | Feature、SSTS数据 | MR数据（基于团队过滤） |
| **依赖关系** | Feature依赖、SSTS依赖 | MR依赖 |

---

## ✅ 功能清单

### 核心功能
- [x] 团队选择（Radio按钮组）
- [x] 特性树展示（Feature → SSTS → MR）
- [x] 团队过滤（只显示该团队管理的模块）
- [x] 树节点搜索过滤
- [x] 树全部展开/收起
- [x] MR拖拽到Sprint
- [x] Sprint高亮拖拽目标
- [x] MR显示已分配状态
- [x] Sprint显示容量和进度
- [x] MR从Sprint移除
- [x] 草稿自动保存
- [x] 草稿加载恢复
- [x] 切换到全局视角

### 待优化功能（可选）
- [ ] MR依赖关系可视化
- [ ] Sprint容量超载警告
- [ ] MR批量分配（多选）
- [ ] 分配历史记录
- [ ] 冲突检测
- [ ] 导出分配结果

---

## 🧪 测试验证步骤

### 1. 基础功能测试

#### 1.1 团队选择
1. 打开团队视角页面
2. 选择不同的团队
3. 验证左侧特性树内容变化（只显示该团队相关的MR）

#### 1.2 特性树展示
1. 选择一个团队
2. 验证树结构：Feature → SSTS → MR
3. 验证节点图标和信息显示
4. 点击展开/收起按钮
5. 在搜索框输入关键词，验证过滤功能

#### 1.3 拖拽分配
1. 从左侧树拖拽一个MR节点
2. 移动到右侧某个Sprint卡片上方
3. 验证Sprint卡片高亮显示
4. 释放鼠标
5. 验证MR出现在Sprint的MR列表中
6. 验证MR节点显示"已分配"标签

#### 1.4 移除分配
1. 点击Sprint中某个MR的"移除"按钮
2. 验证MR从Sprint列表中移除
3. 验证MR节点的"已分配"标签消失

#### 1.5 数据持久化
1. 分配几个MR到不同Sprint
2. 刷新页面
3. 验证分配结果是否保留
4. 切换团队
5. 再切换回原团队
6. 验证分配结果是否保留

### 2. 边界情况测试

#### 2.1 空数据
- 选择一个没有MR的团队，验证显示"暂无相关需求"

#### 2.2 Sprint超载
- 向一个Sprint分配大量MR
- 验证进度条变红
- 验证容量显示超过100%

#### 2.3 重复分配
- 拖拽一个已分配的MR到同一个Sprint
- 验证提示"MR已在该Sprint中"

### 3. 交互体验测试

#### 3.1 搜索功能
- 在搜索框输入Feature代码，验证只显示匹配的Feature
- 在搜索框输入MR标题，验证只显示匹配的MR
- 清空搜索框，验证显示所有节点

#### 3.2 视角切换
- 在团队视角分配MR
- 点击"切换到全局视角"
- 验证跳转到全局视角页面
- 再切换回团队视角
- 验证分配结果保留

---

## 📝 代码变更统计

### 新建文件
- `PIPlanningStage2.vue`（完全重写）

### 备份文件
- `PIPlanningStage2.vue.backup`（原版本）

### 代码行数
- **新文件总行数**：~800行
- **模板部分**：~300行
- **脚本部分**：~400行
- **样式部分**：~100行

### 主要函数
| 函数名 | 功能 | 行数 |
|--------|------|------|
| `featureTreeData` | 构建特性树数据 | ~50行 |
| `handleTreeDragStart` | 处理树节点拖拽开始 | ~5行 |
| `handleDrop` | 处理MR放置到Sprint | ~20行 |
| `handleRemoveMR` | 移除MR分配 | ~8行 |
| `handleSaveDraft` | 保存草稿 | ~15行 |
| `filterNode` | 过滤树节点 | ~5行 |
| `getMRsInSprint` | 获取Sprint中的MR | ~3行 |
| `getSprintLoadRate` | 计算Sprint负载率 | ~5行 |

---

## 🎯 关键改进点

### 1. 清晰的层级关系
- **原设计**：MR扁平展示，按Sprint分组
- **新设计**：Feature → SSTS → MR 树形展示，清晰展示需求层级

### 2. 精准的团队过滤
- **原设计**：基于全局视角的SSTS分配来推断团队MR
- **新设计**：直接基于MR的teamId字段过滤，精准定位团队职责

### 3. 直观的拖拽交互
- **原设计**：MR列表中拖拽到Sprint（不直观）
- **新设计**：从树拖拽到Sprint（更符合从资源池分配的心智模型）

### 4. 实时的状态反馈
- **原设计**：已分配/未分配通过不同区域展示
- **新设计**：MR节点直接显示"已分配"标签，一目了然

---

## 🚀 后续优化建议

### 短期（建议）
1. **MR详情查看**：点击MR节点弹出详情抽屉
2. **依赖关系提示**：MR节点显示依赖数量，hover显示依赖详情
3. **批量操作**：支持多选MR批量分配
4. **键盘快捷键**：支持快捷键操作（如Ctrl+F搜索）

### 中期（可选）
1. **拖拽动画优化**：添加平滑的拖拽动画效果
2. **Sprint排序**：支持按时间、负载率等排序
3. **分配建议**：基于MR依赖关系和Sprint容量给出分配建议
4. **导出功能**：导出分配结果为Excel或PDF

### 长期（优化）
1. **实时协作**：多人同时规划时实时同步
2. **AI建议**：基于历史数据和依赖关系自动建议分配方案
3. **甘特图视图**：以甘特图方式展示MR在Sprint中的分布
4. **资源平衡**：自动检测并建议团队间的资源平衡

---

## 🎉 总结

### 核心价值
1. **更清晰的层级**：特性树展示需求的完整层级关系
2. **更精准的过滤**：只显示团队相关的需求，减少干扰
3. **更直观的交互**：从左到右的拖拽符合分配的心智模型
4. **更独立的视角**：团队视角和全局视角完全独立，职责清晰

### 用户体验提升
- ✅ **降低认知负担**：树形结构比扁平列表更易理解
- ✅ **提高操作效率**：拖拽交互比点击按钮更快捷
- ✅ **增强职责清晰度**：团队只看到自己相关的需求
- ✅ **保证数据完整性**：自动保存，不丢失分配结果

---

**文档版本**: 2.0.0  
**最后更新**: 2026-01-19  
**维护人员**: 开发团队
