# 整车软件研发平台 - 前端

> 基于 Vue 3 + TypeScript + Element Plus 的企业级研发协作平台

## 📋 项目概述

本项目是整车软件研发平台的前端实现，提供了完整的导航体系、页面框架和核心功能流程，支持端到端的研发协作管理。

## 🎯 核心特性

### 三种导航模式
- **流程驱动模式**: 6个端到端流程 (P1-P6)
- **固有功能模式**: 8个能力域 (C0-C7) 共179个功能
- **工作台模式**: 4种工作台视图

### 完整的页面体系
- **列表页**: 标准化的列表展示、筛选、排序、分页
- **详情页**: Tab式详情展示、关联数据、操作历史
- **表单页**: 步骤式表单、验证、草稿保存
- **仪表板**: Widget化的数据展示和快捷操作
- **向导页**: 流程引导式的多步骤操作

## 🏗️ 技术栈

### 核心框架
- **Vue 3.4+**: Composition API, Script Setup
- **TypeScript 5.3+**: 类型安全
- **Vite 5**: 极速开发体验
- **Vue Router 4**: 路由管理
- **Pinia**: 状态管理

### UI组件库
- **Element Plus 2.5+**: 企业级组件库
- **Element Plus Icons**: 图标库

### 工具库
- **Axios**: HTTP请求
- **Day.js**: 日期处理
- **Lodash-es**: 工具函数

## 📁 项目结构

```
frontend/
├── src/
│   ├── assets/              # 静态资源
│   │   └── styles/          # 样式文件
│   │       ├── variables.scss    # 变量定义
│   │       └── global.scss       # 全局样式
│   │
│   ├── components/          # 公共组件
│   │   ├── Layout/          # 布局组件
│   │   │   ├── Shell.vue              # 应用外壳
│   │   │   ├── TopNavigation.vue      # 顶部导航
│   │   │   ├── SideNavigation.vue     # 侧边导航
│   │   │   ├── BreadcrumbNav.vue      # 面包屑
│   │   │   └── nav-modes/             # 导航模式
│   │   │       ├── ProcessNav.vue     # 流程驱动导航
│   │   │       ├── FunctionNav.vue    # 固有功能导航
│   │   │       └── WorkspaceNav.vue   # 工作台导航
│   │   │
│   │   └── Common/          # 通用组件
│   │       ├── PageContainer.vue      # 页面容器
│   │       └── PageHeader.vue         # 页面头部
│   │
│   ├── views/               # 页面视图
│   │   ├── Login.vue                  # 登录页
│   │   ├── NotFound.vue               # 404页面
│   │   │
│   │   ├── Process/         # 流程驱动页面
│   │   │   ├── MyProcess.vue          # 我的流程
│   │   │   ├── P1Strategic/           # P1: 战略规划
│   │   │   ├── P2Feature/             # P2: 特性设计
│   │   │   ├── P3Solution/            # P3: 方案设计
│   │   │   ├── P4Iteration/           # P4: 团队迭代
│   │   │   ├── P5Testing/             # P5: 测试验证
│   │   │   └── P6Release/             # P6: 发布交付
│   │   │
│   │   ├── Workspace/       # 工作台页面
│   │   │   ├── MyWorkspace.vue        # 我的工作台
│   │   │   ├── TeamWorkspace.vue      # 团队工作台
│   │   │   ├── ProjectWorkspace.vue   # 项目工作台
│   │   │   └── ManagementWorkspace.vue # 管理工作台
│   │   │
│   │   ├── C0-Project/      # C0: 领域项目管理
│   │   ├── C1-Requirements/ # C1: 需求管理
│   │   │   ├── Epic/        # Epic管理 (已完成)
│   │   │   │   ├── EpicList.vue
│   │   │   │   ├── EpicDetail.vue
│   │   │   │   └── EpicCreate.vue
│   │   │   ├── Feature/     # Feature管理
│   │   │   ├── SSTS/        # SSTS管理
│   │   │   └── MR/          # MR管理
│   │   │
│   │   ├── C2-Assets/       # C2: 产品管理(资产)
│   │   ├── C3-Planning/     # C3: 规划协调
│   │   ├── C4-Iteration/    # C4: 迭代执行
│   │   ├── C5-Testing/      # C5: 测试验收
│   │   ├── C6-DevOps/       # C6: DevOps交付
│   │   └── C7-Analytics/    # C7: 分析与治理
│   │
│   ├── router/              # 路由配置
│   │   └── index.ts         # 路由主文件
│   │
│   ├── stores/              # 状态管理
│   │   └── modules/
│   │       ├── app.ts       # 应用状态
│   │       ├── user.ts      # 用户状态
│   │       └── navigation.ts # 导航状态
│   │
│   ├── types/               # 类型定义
│   │   ├── global.d.ts      # 全局类型
│   │   └── entities.ts      # 实体类型
│   │
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问: http://localhost:3000

默认登录账号:
- 用户名: `admin`
- 密码: `admin123`

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📊 实现进度

### ✅ 已完成功能

#### 1. 核心框架 (100%)
- [x] 项目初始化和配置
- [x] 应用外壳和布局
- [x] 路由配置和守卫
- [x] 状态管理架构
- [x] 全局样式系统

#### 2. 导航体系 (100%)
- [x] 顶部导航栏
  - [x] Logo和平台名称
  - [x] 模式切换器
  - [x] 全局搜索
  - [x] 快捷创建
  - [x] 通知中心
  - [x] 用户中心
- [x] 左侧导航
  - [x] 流程驱动导航 (6个流程)
  - [x] 固有功能导航 (8个能力域)
  - [x] 工作台导航 (4种工作台)
- [x] 面包屑导航
- [x] 侧边栏折叠

#### 3. 页面骨架 (100%)
- [x] 登录页面
- [x] 404页面
- [x] 流程驱动页面骨架 (P1-P6)
- [x] 工作台页面骨架 (4个)
- [x] 固有功能页面骨架 (C0-C7)

#### 4. 完整实现的功能
- [x] **登录系统**: 登录/登出、会话管理
- [x] **我的工作台**: 
  - 待办事项
  - 今日日程
  - Sprint燃尽图
  - 任务统计
  - 最近访问
- [x] **P1战略规划流程**:
  - 5步骤向导
  - Epic创建
  - 草稿保存
- [x] **C1需求管理 - Epic**:
  - Epic列表 (搜索、筛选、分页)
  - Epic详情 (标签页、关联数据、历史)
  - Epic创建 (表单验证、草稿)

#### 5. 状态管理 (100%)
- [x] 应用状态 (主题、导航模式、侧边栏)
- [x] 用户状态 (登录、权限)
- [x] 导航状态 (历史、收藏、最近访问)

#### 6. 工具组件 (100%)
- [x] PageContainer - 页面容器
- [x] PageHeader - 页面头部

### 🚧 待完成功能

#### 1. C1需求管理 (20% -> 100%)
- [ ] Feature管理 (列表、详情、创建、PRD编写)
- [ ] SSTS管理 (列表、详情、拆解向导)
- [ ] MR管理 (列表、详情、Team分配)

#### 2. C0-C7其他模块 (10% -> 100%)
- [ ] C0: 项目管理、版本管理、PI规划
- [ ] C2: 资产搜索、资产库、资产推荐
- [ ] C3: Sprint管理、PI Planning、依赖管理
- [ ] C4: Sprint看板、任务管理、燃尽图
- [ ] C5: 测试计划、测试用例、缺陷管理
- [ ] C6: 构建管理、部署管理、流水线
- [ ] C7: 各类度量和报表

#### 3. 流程页面 (20% -> 100%)
- [ ] P2: 特性设计流程
- [ ] P3: 方案设计流程
- [ ] P4: 团队迭代流程
- [ ] P5: 测试验证流程
- [ ] P6: 发布交付流程

#### 4. 其他工作台 (25% -> 100%)
- [ ] 团队工作台
- [ ] 项目工作台
- [ ] 管理工作台

#### 5. 高级功能 (0% -> 100%)
- [ ] 全局搜索实现
- [ ] 通知中心
- [ ] 权限控制
- [ ] 主题切换
- [ ] 国际化
- [ ] 图表可视化
- [ ] 拖拽排序
- [ ] 实时协作

## 🎨 设计规范

### 颜色系统
- **主色**: #1890ff (蓝色)
- **成功**: #52c41a (绿色)
- **警告**: #faad14 (橙色)
- **危险**: #f5222d (红色)

### 布局尺寸
- **顶部导航高度**: 64px
- **侧边栏宽度**: 240px (折叠: 64px)
- **右侧面板宽度**: 320px

### 间距系统
- **基础单位**: 8px
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

## 🔄 页面跳转流程

### 典型流程示例

```
1. 登录 → 我的工作台
2. 工作台待办 → Epic详情 → 拆解Feature → Feature列表
3. 流程驱动 → P1战略规划 → Epic创建 → Epic列表
4. 固有功能 → C1需求管理 → Epic列表 → Epic详情
```

## 📝 开发指南

### 创建新页面

1. 在对应目录创建Vue文件
2. 使用标准页面模板
3. 在router/index.ts添加路由
4. 更新左侧导航菜单

### 页面模板结构

```vue
<template>
  <page-container>
    <page-header :title="title" :description="description" />
    
    <!-- 页面内容 -->
    
  </page-container>
</template>

<script setup lang="ts">
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'

// 页面逻辑
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

// 页面样式
</style>
```

## 🔗 相关文档

- [平台架构设计](../platform-design/AUTO_RD_PLATFORM_DESIGN_MERMAID.md)
- [导航系统设计](../prototype-framework/navigation-design/)
- [页面框架设计](../prototype-framework/页面框架UI设计规范.md)
- [功能清单](../platform-design/全量功能清单_C0-C7.md)

## 📄 License

Copyright © 2024-2026
