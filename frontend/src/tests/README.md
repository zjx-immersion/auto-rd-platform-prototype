# Phase 1 集成测试

## 概述

此测试套件用于验证Phase 1实现的数据模型、Pinia Stores和Mock数据生成器的集成。

## 测试内容

### 1. 项目Store基本功能
- 创建项目
- 设置当前项目
- 创建版本
- 创建PI

### 2. 需求层次结构
- 创建Epic
- 创建Feature并关联Epic
- 更新Feature的PRD
- 创建SSTS并关联Feature
- 创建MR并关联SSTS

### 3. PI Planning流程
- 创建PI
- 启动PI Planning
- 添加PI目标
- 配置团队
- 分配Feature到团队
- 添加依赖关系
- 添加风险
- 检测冲突
- 保存草稿
- 提交PI Planning

### 4. Mock数据生成器
- 生成项目数据
- 生成Epic、Feature、SSTS、MR
- 生成PI和PI Planning结果
- 生成完整需求层次结构

### 5. Store数据查询
- 按状态查询Epic
- 按Epic查询Feature
- 按PI查询Feature

## 运行测试

由于这是一个Vue 3 + TypeScript项目，测试需要在浏览器环境中运行。可以通过以下方式运行：

### 方式1：在开发者工具中运行

1. 启动开发服务器
```bash
npm run dev
```

2. 在浏览器中打开应用
3. 打开浏览器开发者工具（F12）
4. 在Console中运行：
```javascript
import { runAllTests } from '@/tests/phase1-integration-test'
runAllTests()
```

### 方式2：创建测试页面

创建一个专门的测试页面来运行测试，并在路由中注册。

## 预期结果

所有测试应该通过，输出如下：

```
╔════════════════════════════════════════════════╗
║   Phase 1 集成测试 - 数据流和Store集成        ║
╚════════════════════════════════════════════════╝

=== 测试1: 项目Store基本功能 ===
✓ 创建项目成功: PROJ-0001 智能驾驶领域项目 1
✓ 设置当前项目成功: 智能驾驶领域项目 1
✓ 创建版本成功: V1.0
✓ 创建PI成功: PI-1
✓ 项目Store测试通过

=== 测试2: 需求层次结构 ===
✓ 创建项目: 智能驾驶领域项目 1
✓ 创建Epic: EPIC-0001 自动泊车功能
✓ 创建Feature: FEAT-0001 垂直泊车入位
✓ 更新PRD成功
✓ 创建SSTS: SSTS-0001 泊车控制算法
✓ 关联SSTS到Feature成功
✓ 创建MR: MR-0001 路径规划模块
✓ 需求层次结构测试通过

=== 测试3: PI Planning流程 ===
✓ 创建PI: PI-1
✓ 启动PI Planning: planning-xxx
✓ 添加PI目标成功
✓ 配置团队成功
✓ 分配Feature到团队成功
✓ 添加依赖关系成功
✓ 添加风险成功
✓ 检测冲突完成，发现 0 个冲突
✓ 保存草稿成功
✓ 提交PI Planning成功
✓ 提交PI成功
✓ PI Planning流程测试通过

=== 测试4: Mock数据生成器 ===
✓ 生成项目: PROJ-0001 智能驾驶领域项目 1
✓ 生成Epic: EPIC-0001 自动泊车功能完善
✓ 生成Feature: FEAT-0001 垂直泊车入位
✓ 生成SSTS: SSTS-0001 软硬件规格需求-1
✓ 生成MR: MR-0001 模块需求-1
✓ 生成PI: PI-1 PI 1
✓ 生成PI Planning结果: planning-xxx
  - 团队规划数: 3
  - Sprint规划数: 6
  - 依赖关系数: 5
  - 风险数: 3
✓ 生成完整需求层次结构:
  - Epics: 3
  - Features: 7
  - SSTS: 28
  - MRs: 42
✓ Mock数据生成器测试通过

=== 测试5: Store数据查询 ===
✓ 按状态查询Epic: 1 个in-progress Epic
✓ 按Epic查询Feature: 2 个Feature
✓ 按PI查询Feature: 2 个Feature
✓ Store数据查询测试通过

╔════════════════════════════════════════════════╗
║          ✓ 所有测试通过！                      ║
╚════════════════════════════════════════════════╝
```

## 注意事项

1. 这些测试使用内存中的Pinia Store，数据不会持久化
2. 测试数据是随机生成的，每次运行结果可能略有不同
3. 测试主要验证数据流和API的正确性，不涉及UI交互
4. 在实际项目中，应该使用正式的测试框架（如Vitest）来运行这些测试
