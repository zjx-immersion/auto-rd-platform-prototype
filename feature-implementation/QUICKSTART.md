# 快速开始 - 领域项目到PI规划功能开发

## 🎯 功能目标

实现从**领域项目创建**到**PI规划完成**的完整端到端业务流程。

## 📊 业务流程速览

```
创建领域项目 → 导入Epic → 拆解Feature → 编写PRD → 拆解SSTS → 规划PI版本 → PI Planning排布
    ↓            ↓          ↓           ↓         ↓            ↓              ↓
  车型计划    需求池      产品特性      需求文档   SSTS条目    版本范围      多团队迭代
```

## 🚀 开发快速启动

### 1. 切换到功能分支
```bash
cd /Users/jxzhong/workspace/voyah-devops-solution/auto-rd-platform-prototype
git checkout feature/domain-prog-to-pi
```

### 2. 启动开发服务器
```bash
./start.sh
# 访问 http://localhost:6060
```

### 3. 查看实现计划
```bash
# 详细计划文档
open feature-implementation/domain-prog-to-pi-plan.md

# 或在浏览器中查看
code feature-implementation/domain-prog-to-pi-plan.md
```

## 📋 开发清单

### Phase 1: 数据模型和基础架构 ⏳
- [ ] 定义TypeScript类型（6个核心实体）
  - [ ] DomainProject - 领域项目
  - [ ] Epic - Epic需求
  - [ ] Feature - 特性需求
  - [ ] SSTS - 系统级需求
  - [ ] PIVersion - PI版本
  - [ ] PIPlanningResult - PI规划结果
- [ ] 创建Pinia Stores（6个）
  - [ ] projectStore
  - [ ] epicStore
  - [ ] featureStore
  - [ ] sstsStore
  - [ ] piStore
  - [ ] planningStore
- [ ] Mock数据生成器
- [ ] API接口定义

### Phase 2: C0领域项目管理 ⏳
- [ ] `/function/c0/project/create-wizard` - 项目创建向导
- [ ] `/function/c0/project/timeline/:id` - 项目时间线视图
- [ ] `/function/c0/version/plan` - 版本规划工作台

### Phase 3: C1需求管理 ⏳
- [ ] `/function/c1/requirement-pool` - 需求池
- [ ] `/function/c1/epic/import` - Epic导入
- [ ] `/function/c1/epic/breakdown/:id` - Epic拆解工作台
- [ ] `/function/c1/feature/prd/:id` - Feature PRD编辑器
- [ ] `/function/c1/feature/breakdown/:id` - Feature拆解工作台
- [ ] `/function/c1/ssts/batch-create` - SSTS批量创建

### Phase 4: C3规划协调 ⏳
- [ ] `/function/c3/pi/version-planning` - PI版本规划
- [ ] `/function/c3/pi/planning/:id` - PI Planning看板（增强）
- [ ] `/function/c3/pi/team-allocation` - 团队分配视图
- [ ] `/function/c3/pi/timeline` - PI时间线视图

### Phase 5: 流程集成和优化 ⏳
- [ ] 端到端流程打通
- [ ] 页面跳转优化
- [ ] 状态同步
- [ ] 数据一致性检查

### Phase 6: 测试和文档 ⏳
- [ ] 完整流程测试
- [ ] 用户操作文档
- [ ] 技术文档
- [ ] Demo数据准备

## 🔑 关键实体关系

```
DomainProject (领域项目)
    ├─ Milestone[] (交付节点)
    ├─ Team[] (团队)
    └─ Epic[] (Epic列表)
          └─ Feature[] (特性列表)
                ├─ PRD (需求文档)
                └─ SSTS[] (SSTS条目列表)

PIVersion (PI版本)
    ├─ DomainProject[] (关联项目)
    ├─ Epic[] (包含Epic)
    ├─ Feature[] (包含Feature)
    └─ PITeamConfig[] (团队配置)

PIPlanningResult (PI规划结果)
    ├─ TeamPlanning[] (团队规划)
    ├─ SprintPlanning[] (Sprint规划)
    ├─ Dependency[] (依赖关系)
    └─ Risk[] (风险列表)
```

## 💡 开发提示

### 1. 数据流向
```typescript
// 创建项目 → 导入Epic
projectStore.createProject(projectData)
  .then(project => {
    epicStore.importEpics(project.id, epicIds)
  })

// Epic拆解 → 创建Feature
epicStore.breakdownEpic(epicId, featureData)
  .then(features => {
    featureStore.addFeatures(features)
  })

// Feature拆解 → 创建SSTS
featureStore.breakdownFeature(featureId, sstsData)
  .then(sstsList => {
    sstsStore.addSSTSList(sstsList)
  })

// 规划PI → PI Planning
piStore.createPIVersion(piData)
  .then(pi => {
    planningStore.startPlanning(pi.id)
  })
```

### 2. 状态同步
```typescript
// 监听Epic变化，自动更新Feature
watch(
  () => epicStore.currentEpic,
  (newEpic) => {
    if (newEpic) {
      featureStore.fetchFeaturesByEpic(newEpic.id)
    }
  }
)

// 监听Feature变化，自动更新SSTS
watch(
  () => featureStore.currentFeature,
  (newFeature) => {
    if (newFeature) {
      sstsStore.fetchSSTSByFeature(newFeature.id)
    }
  }
)
```

### 3. 页面跳转
```typescript
// 从项目详情 → Epic列表
router.push({
  name: 'EpicList',
  query: { projectId: project.id }
})

// 从Epic详情 → Feature拆解工作台
router.push({
  name: 'EpicBreakdown',
  params: { id: epic.id }
})

// 从Feature详情 → PRD编辑器
router.push({
  name: 'FeaturePRD',
  params: { id: feature.id }
})
```

## 🎨 UI组件建议

### 通用组件
- `<StepWizard>` - 多步骤向导
- `<TimelineView>` - 时间线视图
- `<RelationshipGraph>` - 关系图
- `<DragDropBoard>` - 拖拽看板
- `<LoadIndicator>` - 负载指示器
- `<DependencyMatrix>` - 依赖矩阵

### 业务组件
- `<ProjectCard>` - 项目卡片
- `<EpicCard>` - Epic卡片
- `<FeatureCard>` - Feature卡片
- `<SSTSItem>` - SSTS条目
- `<TeamLane>` - 团队泳道
- `<SprintTimeline>` - Sprint时间线

## 📦 推荐的npm包

```bash
# 拖拽功能
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# 富文本编辑器
npm install @tiptap/vue-3 @tiptap/starter-kit

# 图表可视化
npm install echarts vue-echarts

# 日期处理（已安装）
# npm install dayjs

# 工具库（已安装）
# npm install lodash-es
```

## 🧪 测试场景

### 端到端测试场景
1. **完整流程**
   - 创建项目"岚图梦想家Pro-智能驾驶"
   - 导入3个Epic
   - 拆解出9个Feature
   - 为3个Feature编写PRD
   - 拆解出30个SSTS
   - 创建PI-2026-Q2
   - 完成PI Planning（3个团队，6个Sprint）

2. **关键路径测试**
   - Epic依赖Feature完成
   - Feature依赖SSTS完成
   - PI Planning识别跨团队依赖
   - 负载超标预警

3. **异常场景测试**
   - 网络错误处理
   - 数据冲突处理
   - 权限不足提示
   - 表单验证

## 📚 相关文档

- [详细实现计划](./domain-prog-to-pi-plan.md) - 完整的设计和实现文档
- [开发规范](./README.md) - 开发流程和最佳实践
- [平台架构设计](../platform-design/AUTO_RD_PLATFORM_DESIGN_MERMAID.md) - 整体架构
- [导航框架设计](../prototype-framework/导航框架完整设计方案.md) - 导航和路由

## 🔄 当前进度

```
Phase 1: 数据模型和基础架构  [          ] 0%
Phase 2: C0领域项目管理      [          ] 0%
Phase 3: C1需求管理          [          ] 0%
Phase 4: C3规划协调          [          ] 0%
Phase 5: 流程集成和优化      [          ] 0%
Phase 6: 测试和文档          [          ] 0%

总体进度: [          ] 0%
```

## ❓ 遇到问题？

### 常见问题
1. **Q**: 如何在不同页面间传递复杂数据？
   **A**: 优先使用Pinia Store，避免通过路由参数传递大对象

2. **Q**: 拖拽功能如何实现？
   **A**: 使用@dnd-kit/core库，参考官方示例

3. **Q**: 如何优化大数据量渲染？
   **A**: 使用虚拟滚动（el-table-v2）或分页加载

4. **Q**: 状态如何持久化？
   **A**: 使用localStorage或sessionStorage保存关键状态

### 获取帮助
- 查看详细实现计划文档
- 参考现有页面的实现
- 查阅Vue 3和Element Plus官方文档

## ✅ 完成标准

- [ ] 所有计划的页面都已实现
- [ ] 端到端流程可以完整走通
- [ ] 所有交互功能正常工作
- [ ] 数据关联正确
- [ ] 无明显性能问题
- [ ] 代码通过Review
- [ ] 文档完整

---

**分支**: feature/domain-prog-to-pi  
**开始日期**: 2026-01-16  
**预计完成**: 2026-02-03 (12-18天后)  
**状态**: 规划完成，待开始开发

---

开始开发前，建议先阅读[完整实现计划](./domain-prog-to-pi-plan.md)了解详细设计！🚀
