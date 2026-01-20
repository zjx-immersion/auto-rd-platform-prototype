# 完整业务流程测试执行指南

> **测试日期**: 2026-01-19  
> **测试方案**: COMPLETE-BUSINESS-FLOW-TEST.md  
> **预计时间**: 30分钟

---

## 🚀 测试准备

### 1. 启动前端服务
```bash
cd /Users/jxzhong/workspace/voyah-devops-solution/auto-rd-platform-prototype/frontend
npm run dev
```

### 2. 确认服务运行
- 访问：http://localhost:6060
- 确认页面正常加载
- 确认数据已加载（186个MR，62个SSTS，30个Feature）

### 3. 测试工具准备
- 使用MCP Playwright或手动测试
- 准备截图工具
- 创建截图保存目录：`browser-test/screenshots/business-flow/`

---

## 📋 测试执行清单

### ✅ 场景1：需求管理（6个步骤）

#### S1-1: Epic列表
- [ ] 访问：http://localhost:6060/function/c1/epic
- [ ] 验证：Epic列表显示10个Epic
- [ ] 截图：`TC-S1-1-Epic-List.png`

#### S1-2: Epic详情
- [ ] 操作：点击"EPIC-001 智能驾驶核心功能"
- [ ] 验证：显示Epic详情和关联Feature（6个）
- [ ] 截图：`TC-S1-2-Epic-Detail.png`

#### S1-3: Feature列表
- [ ] 访问：http://localhost:6060/function/c1/feature
- [ ] 验证：Feature列表显示30个Feature
- [ ] 截图：`TC-S1-3-Feature-List.png`

#### S1-4: Feature详情
- [ ] 操作：点击"FEAT-001 自适应巡航控制(ACC)"
- [ ] 验证：显示Feature详情（34 SP，6个SSTS）
- [ ] 截图：`TC-S1-4-Feature-Detail.png`

#### S1-5: Feature PRD
- [ ] 操作：点击"PRD文档"Tab
- [ ] 验证：PRD内容正确显示
- [ ] 截图：`TC-S1-5-Feature-PRD.png`

#### S1-6: SSTS列表
- [ ] 访问：http://localhost:6060/function/c1/ssts
- [ ] 验证：SSTS列表显示62个SSTS
- [ ] 截图：`TC-S1-6-SSTS-List.png`

---

### ✅ 场景2：PI Planning看板（1个步骤）

#### S2-1: PI Planning看板
- [ ] 访问：http://localhost:6060/function/c3/pi-planning-board
- [ ] 验证：显示2026 Q1 PI，6个Sprint
- [ ] 截图：`TC-S2-1-PI-Board.png`

---

### ✅ 场景3：全局视角分配（7个步骤）

#### S3-1: 进入全局视角
- [ ] 操作：点击"进入2阶段规划工作台（新版）"
- [ ] 验证：URL为/stage1，显示待分配Feature列表
- [ ] 截图：`TC-S3-1-Global-View-Initial.png`

#### S3-2: 查看待分配Feature
- [ ] 操作：滚动查看Feature卡片
- [ ] 验证：显示完整信息（编码、标题、SP、优先级、产品）
- [ ] 截图：`TC-S3-2-Feature-Cards.png`

#### S3-3: 实际分配Feature（重点）
- [ ] 操作：拖拽FEAT-001到"ACC团队×Sprint 1"
- [ ] 操作：拖拽FEAT-002到"LKA团队×Sprint 1"
- [ ] 操作：拖拽FEAT-003到"ACC团队×Sprint 2"
- [ ] 验证：Feature成功分配，规划进度更新
- [ ] 截图：`TC-S3-3-Feature-Allocated.png`

#### S3-4: 查看Sprint矩阵
- [ ] 验证：Sprint 1有2个Feature，Sprint 2有1个Feature
- [ ] 验证：容量信息正确显示
- [ ] 截图：`TC-S3-4-Sprint-Matrix.png`

#### S3-5: 实际分配SSTS（重点）
- [ ] 操作：展开Feature，查看SSTS
- [ ] 操作：拖拽SSTS-001到"ACC团队×Sprint 1"
- [ ] 操作：拖拽SSTS-004到"LKA团队×Sprint 1"
- [ ] 验证：SSTS成功分配，SSTS进度更新
- [ ] 截图：`TC-S3-5-SSTS-Allocated.png`

#### S3-6: 设置跨迭代Feature（重点）
- [ ] 操作：点击FEAT-004的"设置持续时间"
- [ ] 操作：选择持续2个Sprint，保存
- [ ] 验证：Feature显示黄色背景，"持续2个Sprint"标签
- [ ] 截图：`TC-S3-6-Cross-Sprint-Feature.png`

#### S3-7: 保存草稿
- [ ] 操作：点击"保存草稿"按钮
- [ ] 验证：显示保存成功提示
- [ ] 截图：`TC-S3-7-Save-Draft.png`

---

### ✅ 场景4：团队视角分配（9个步骤）

#### S4-1: 切换到团队视角
- [ ] 操作：点击"切换到团队视角"按钮
- [ ] 验证：URL为/stage2，显示特性树和Sprint列表
- [ ] 截图：`TC-S4-1-Team-View-Initial.png`

#### S4-2: 查看特性树（收起状态）
- [ ] 验证：显示16个Feature节点（蓝色图标）
- [ ] 验证：节点可以展开
- [ ] 截图：`TC-S4-2-Team-Tree-Collapsed.png`

#### S4-3: 展开特性树
- [ ] 操作：点击"全部展开"按钮
- [ ] 验证：显示Feature→SSTS→MR三层结构
- [ ] 验证：FEAT-001下有SSTS-001，SSTS-001下有3个MR
- [ ] 截图：`TC-S4-3-Team-Tree-Expanded.png`

#### S4-4: 查看Sprint列表（分配前）
- [ ] 验证：6个Sprint显示，每个100 SP容量
- [ ] 验证：显示"[+ 拖拽MR到此处]"提示
- [ ] 截图：`TC-S4-4-Sprint-List-Empty.png`

#### S4-5: 实际拖拽MR到Sprint（重点）
- [ ] 操作：拖拽MR-SSTS-001-001 (30h)到Sprint 1
- [ ] 操作：拖拽MR-SSTS-001-002 (40h)到Sprint 1
- [ ] 操作：拖拽MR-SSTS-001-003 (50h)到Sprint 2
- [ ] 操作：拖拽MR-SSTS-004-001 (30h)到Sprint 1
- [ ] 验证：MR成功分配，MR节点显示"已分配"标签
- [ ] 截图：`TC-S4-5-MR-Allocated.png`

#### S4-6: 查看Sprint容量
- [ ] 验证：Sprint 1已用100h（3个MR）
- [ ] 验证：Sprint 2已用50h（1个MR）
- [ ] 验证：进度条更新，容量使用率显示
- [ ] 截图：`TC-S4-6-Sprint-Capacity.png`

#### S4-7: 切换到APA团队
- [ ] 操作：点击"APA团队"按钮
- [ ] 验证：特性树显示8个Feature（APA团队的）
- [ ] 截图：`TC-S4-7-APA-Team.png`

#### S4-8: 切换到LKA团队
- [ ] 操作：点击"LKA团队"按钮
- [ ] 验证：特性树显示12个Feature（LKA团队的）
- [ ] 截图：`TC-S4-8-LKA-Team.png`

#### S4-9: 保存草稿
- [ ] 操作：点击"保存草稿"按钮
- [ ] 验证：显示保存成功提示
- [ ] 截图：`TC-S4-9-Save-Draft.png`

---

### ✅ 场景5：数据持久化（2个步骤）

#### S5-1: 验证全局视角数据持久化
- [ ] 操作：访问/stage1，刷新页面（F5）
- [ ] 验证：之前分配的Feature和SSTS依然存在
- [ ] 验证：规划进度正确（Feature 3/29，SSTS 2/59）
- [ ] 截图：`TC-S5-1-Global-Persist.png`

#### S5-2: 验证团队视角数据持久化
- [ ] 操作：访问/stage2，刷新页面（F5）
- [ ] 验证：之前分配的MR依然在Sprint中
- [ ] 验证：Sprint容量和进度保留
- [ ] 截图：`TC-S5-2-Team-Persist.png`

---

## 📊 测试执行记录

### 执行信息
- **执行人员**: _________________
- **执行日期**: _________________
- **执行时间**: _________________
- **浏览器**: _________________
- **前端服务**: _________________

### 执行结果
- **通过步骤**: ___ / 25
- **失败步骤**: ___
- **阻塞问题**: ___
- **截图数量**: ___ / 25

---

## ✅ 验收标准

### 功能完整性
- [ ] 所有页面正常加载（< 2秒）
- [ ] 所有数据正确展示
- [ ] 所有拖拽操作正常
- [ ] 所有保存操作正常

### 业务流程完整性
- [ ] 需求查看流程完整
- [ ] Feature/SSTS分配流程完整
- [ ] MR分配流程完整
- [ ] 数据持久化正常

### 截图质量
- [ ] 所有截图清晰可读
- [ ] 关键信息可见
- [ ] 操作前后对比明显

---

## 🐛 问题记录

### 发现的问题
| 序号 | 步骤 | 问题描述 | 严重程度 | 状态 |
|------|------|----------|----------|------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## 📝 测试报告生成

测试完成后，生成测试报告：

### 报告内容
1. 测试执行概要
2. 各场景测试结果
3. 截图附件（25张）
4. 发现的问题
5. 测试结论和建议

### 报告文件
- `COMPLETE-BUSINESS-FLOW-TEST-REPORT.md`

---

**执行指南版本**: 1.0  
**最后更新**: 2026-01-19  
**维护人员**: 测试团队
