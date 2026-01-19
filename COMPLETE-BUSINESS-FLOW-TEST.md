# 完整业务流程测试方案

> **测试目标**: 验证从需求管理到Sprint计划的完整业务流程  
> **测试日期**: 2026-01-19  
> **测试工具**: MCP Playwright

---

## 🎯 测试目标

验证以下完整业务场景：
1. **需求查看**：Epic/Feature列表查看、详情查看
2. **需求拆解**：Feature拆解SSTS
3. **PI Planning - 全局视角**：Feature/SSTS实际分配到Team+Sprint
4. **PI Planning - 团队视角**：MR实际分配到Sprint
5. **数据验证**：分配结果的正确性和完整性

---

## 📋 测试场景设计

### 场景1：需求管理（Epic → Feature → SSTS）

#### 步骤1-1：查看Epic列表
- **URL**: `/function/c1/epic`
- **验证点**：
  - Epic列表正确显示（10个Epic）
  - 每个Epic显示：编码、标题、状态、Feature数量
  - 筛选和搜索功能正常
- **截图**: `TC-S1-1-Epic-List.png`

#### 步骤1-2：查看Epic详情
- **操作**: 点击"EPIC-001 智能驾驶核心功能"
- **验证点**：
  - Epic基本信息完整（标题、描述、状态、优先级）
  - 关联的Feature列表（6个）
  - 可以点击"拆解Feature"按钮
- **截图**: `TC-S1-2-Epic-Detail.png`

#### 步骤1-3：查看Feature列表
- **URL**: `/function/c1/feature`
- **验证点**：
  - Feature列表正确显示（30个）
  - 每个Feature显示：编码、标题、Story Points、状态、产品
  - 可以看到已分配PI的Feature
- **截图**: `TC-S1-3-Feature-List.png`

#### 步骤1-4：查看Feature详情
- **操作**: 点击"FEAT-001 自适应巡航控制(ACC)"
- **验证点**：
  - Feature基本信息（34 SP，高优先级）
  - PRD文档Tab可见
  - 关联的SSTS列表（6个）
  - 产品和Epic关联关系
- **截图**: `TC-S1-4-Feature-Detail.png`

#### 步骤1-5：查看Feature PRD
- **操作**: 点击"PRD文档"Tab
- **验证点**：
  - PRD内容正确显示
  - 有编辑按钮
  - 有版本历史
- **截图**: `TC-S1-5-Feature-PRD.png`

#### 步骤1-6：查看SSTS列表
- **URL**: `/function/c1/ssts`
- **验证点**：
  - SSTS列表显示（62个）
  - 每个SSTS显示：编码、标题、Feature、团队、依赖
  - 依赖关系可视化
- **截图**: `TC-S1-6-SSTS-List.png`

---

### 场景2：PI Planning看板（概览）

#### 步骤2-1：打开PI Planning看板
- **URL**: `/function/c3/pi-planning-board`
- **验证点**：
  - 显示2026 Q1 PI
  - 统计信息：6个Sprint，0个依赖，0个风险
  - 有"进入2阶段规划工作台（新版）"按钮
- **截图**: `TC-S2-1-PI-Board.png`

---

### 场景3：全局视角 - Feature/SSTS分配

#### 步骤3-1：进入全局视角
- **操作**: 点击"进入2阶段规划工作台（新版）"
- **URL**: `/function/c3/planning/pi/pi-001/stage1`
- **验证点**：
  - 页面标题："PI Planning - 全局视角"
  - 显示6个默认Sprint
  - 左侧：待分配Feature/SSTS列表（29个Feature）
  - 右侧：Team×Sprint矩阵（3个Team × 6个Sprint）
  - 规划进度：Feature 0/29，SSTS 0/59
- **截图**: `TC-S3-1-Global-View-Initial.png`

#### 步骤3-2：查看待分配Feature
- **操作**: 滚动查看左侧Feature列表
- **验证点**：
  - Feature卡片显示完整信息：
    - 编码（FEAT-001）
    - 标题（自适应巡航控制(ACC)）
    - Story Points（34 SP）
    - 优先级（high）
    - 产品（ADAS核心算法）
    - SSTS数量（6个）
- **截图**: `TC-S3-2-Feature-Cards.png`

#### 步骤3-3：实际分配Feature到Sprint（重点测试）
- **操作**: 
  1. 拖拽 FEAT-001（ACC）到 "ACC团队 × Sprint 1"
  2. 拖拽 FEAT-002（LKA）到 "LKA团队 × Sprint 1"
  3. 拖拽 FEAT-003（ALC）到 "ACC团队 × Sprint 2"
- **验证点**：
  - Feature成功移动到目标Sprint格子
  - 待分配列表中移除已分配的Feature
  - Sprint格子显示分配的Feature
  - 规划进度更新：Feature 3/29
- **截图**: `TC-S3-3-Feature-Allocated.png`

#### 步骤3-4：查看分配后的Sprint矩阵
- **操作**: 查看整个Team×Sprint矩阵
- **验证点**：
  - Sprint 1：
    - ACC团队：FEAT-001 (34 SP)
    - LKA团队：FEAT-002 (21 SP)
  - Sprint 2：
    - ACC团队：FEAT-003 (55 SP)
  - 容量信息正确显示
- **截图**: `TC-S3-4-Sprint-Matrix.png`

#### 步骤3-5：实际分配SSTS到Sprint（重点测试）
- **操作**: 
  1. 展开已分配的Feature，查看其SSTS
  2. 拖拽 SSTS-001（ACC控制器核心算法）到 "ACC团队 × Sprint 1"
  3. 拖拽 SSTS-004（LKA方向盘控制）到 "LKA团队 × Sprint 1"
- **验证点**：
  - SSTS成功分配
  - 规划进度更新：SSTS 2/59
  - Sprint格子同时显示Feature和SSTS
- **截图**: `TC-S3-5-SSTS-Allocated.png`

#### 步骤3-6：设置跨迭代Feature（重点测试）
- **操作**: 
  1. 点击 FEAT-004 的"设置持续时间"按钮
  2. 选择持续2个Sprint
  3. 保存
- **验证点**：
  - Feature显示黄色渐变背景
  - 显示"持续2个Sprint"标签
  - Feature同时出现在Sprint 2和Sprint 3
- **截图**: `TC-S3-6-Cross-Sprint-Feature.png`

#### 步骤3-7：保存草稿
- **操作**: 点击"保存草稿"按钮
- **验证点**：
  - 显示保存成功提示
  - 数据保存到localStorage
- **截图**: `TC-S3-7-Save-Draft.png`

---

### 场景4：团队视角 - MR分配

#### 步骤4-1：切换到团队视角
- **操作**: 点击"切换到团队视角"按钮
- **URL**: `/function/c3/planning/pi/pi-001/stage2`
- **验证点**：
  - 页面标题："PI Planning - 团队视角"
  - 默认选中ACC团队
  - 左侧：特性树（Feature → SSTS → MR）
  - 右侧：6个Sprint列表
- **截图**: `TC-4-1-Team-View-Initial.png`

#### 步骤4-2：查看ACC团队的特性树（默认收起）
- **验证点**：
  - 显示16个Feature节点（蓝色图标）
  - 每个Feature显示：编码、标题、SP
  - 节点可以展开
- **截图**: `TC-4-2-Team-Tree-Collapsed.png`

#### 步骤4-3：展开特性树查看完整层级
- **操作**: 点击"全部展开"按钮
- **验证点**：
  - Feature → SSTS → MR 三层结构完整展示
  - FEAT-001 (ACC)
    - SSTS-001 (ACC控制器核心算法)
      - MR-SSTS-001-001 (30h)
      - MR-SSTS-001-002 (40h)
      - MR-SSTS-001-003 (50h)
  - 图标颜色：蓝色(Feature) / 黄色(SSTS) / 绿色(MR)
- **截图**: `TC-4-3-Team-Tree-Expanded.png`

#### 步骤4-4：查看Sprint列表（分配前）
- **验证点**：
  - 6个Sprint正确显示
  - 每个Sprint显示：
    - Sprint名称和日期
    - 容量：100 SP
    - 已分配：0 SP
    - 可用：100 SP
    - 提示："[+ 拖拽MR到此处]"
- **截图**: `TC-4-4-Sprint-List-Empty.png`

#### 步骤4-5：实际拖拽MR到Sprint（重点测试）
- **操作**: 
  1. 从左侧树拖拽 MR-SSTS-001-001 (30h) 到 Sprint 1
  2. 拖拽 MR-SSTS-001-002 (40h) 到 Sprint 1
  3. 拖拽 MR-SSTS-001-003 (50h) 到 Sprint 2
  4. 拖拽 MR-SSTS-004-001 (30h) 到 Sprint 1
- **验证点**：
  - MR成功出现在Sprint卡片中
  - MR节点显示"已分配: Sprint X"标签
  - Sprint进度条更新
  - Sprint已用容量增加
- **截图**: `TC-4-5-MR-Allocated.png`

#### 步骤4-6：查看Sprint容量和进度
- **验证点**：
  - Sprint 1：
    - 已分配：100h (3个MR)
    - 容量使用率更新
    - 进度条显示（可能变黄或红）
  - Sprint 2：
    - 已分配：50h (1个MR)
  - MR在Sprint中显示：编码、标题、工时
- **截图**: `TC-4-6-Sprint-Capacity.png`

#### 步骤4-7：切换到APA团队
- **操作**: 点击"APA团队"按钮
- **验证点**：
  - 特性树更新，显示APA团队的Feature（8个）
  - Sprint列表保持不变（6个）
  - 已分配的MR是APA团队的
- **截图**: `TC-4-7-APA-Team.png`

#### 步骤4-8：切换到LKA团队
- **操作**: 点击"LKA团队"按钮
- **验证点**：
  - 特性树更新，显示LKA团队的Feature（12个）
  - Sprint列表保持不变
- **截图**: `TC-4-8-LKA-Team.png`

#### 步骤4-9：保存草稿
- **操作**: 点击"保存草稿"按钮
- **验证点**：
  - 显示保存成功提示
- **截图**: `TC-4-9-Save-Draft.png`

---

### 场景5：数据持久化验证

#### 步骤5-1：刷新页面验证全局视角数据
- **操作**: 刷新浏览器（F5）
- **URL**: `/function/c3/planning/pi/pi-001/stage1`
- **验证点**：
  - 之前分配的Feature和SSTS依然在Sprint中
  - 规划进度正确（Feature 3/29，SSTS 2/59）
  - 跨迭代Feature设置保留
- **截图**: `TC-5-1-Global-Persist.png`

#### 步骤5-2：刷新页面验证团队视角数据
- **操作**: 
  1. 切换到团队视角
  2. 刷新浏览器
- **URL**: `/function/c3/planning/pi/pi-001/stage2`
- **验证点**：
  - 之前分配的MR依然在Sprint中
  - MR节点显示"已分配"标签
  - Sprint容量和进度保留
- **截图**: `TC-5-2-Team-Persist.png`

---

## 📊 测试场景汇总

| 场景 | 步骤数 | 截图数 | 重点验证 |
|------|--------|--------|----------|
| 场景1：需求管理 | 6 | 6 | Epic/Feature/SSTS查看 |
| 场景2：PI Planning看板 | 1 | 1 | 概览信息 |
| 场景3：全局视角分配 | 7 | 7 | Feature/SSTS实际分配 |
| 场景4：团队视角分配 | 9 | 9 | MR实际分配 |
| 场景5：数据持久化 | 2 | 2 | 数据保存和恢复 |
| **总计** | **25** | **25** | **完整业务流程** |

---

## 🎯 关键验证点

### 需求查看
- [x] Epic列表和详情完整展示
- [x] Feature列表和详情完整展示
- [x] Feature PRD文档可查看
- [x] SSTS列表和依赖关系展示

### 实际分配操作（重点）
- [x] Feature拖拽到Team+Sprint
- [x] SSTS拖拽到Team+Sprint
- [x] Feature设置跨迭代持续时间
- [x] MR拖拽到Sprint

### 数据展示
- [x] 分配前的完整数据展示
- [x] 分配中的实时更新
- [x] 分配后的结果展示
- [x] 容量和进度实时更新

### 团队切换
- [x] 3个团队的数据正确过滤
- [x] 每个团队的Feature/SSTS/MR数量正确

### 数据持久化
- [x] 全局视角数据刷新后保留
- [x] 团队视角数据刷新后保留

---

## 📸 截图命名规范

- **TC-S1-X**: 场景1（需求管理）
- **TC-S2-X**: 场景2（PI Planning看板）
- **TC-S3-X**: 场景3（全局视角）
- **TC-S4-X**: 场景4（团队视角）
- **TC-S5-X**: 场景5（数据持久化）

---

## ✅ 成功标准

### 功能完整性
- 所有页面正常加载（< 2秒）
- 所有数据正确展示
- 所有交互操作正常

### 业务流程完整性
- 能完整走通从需求查看到Sprint计划的全流程
- 分配操作真实可执行
- 数据持久化正确

### UI/UX质量
- 页面布局合理
- 数据展示清晰
- 操作反馈及时
- 截图完整清晰

---

**测试设计人员**: 测试团队  
**测试日期**: 2026-01-19  
**预计执行时间**: ~30分钟
