# SASS变量未定义错误修复报告

> **修复时间**: 2026-01-17  
> **问题**: `[sass] Undefined variable: $text-color-primary`  
> **状态**: ✅ 已修复

---

## 问题描述

### 错误信息
```
[plugin:vite:css] [sass] Undefined variable.
   ╷
17 │       color: $text-color-primary;
   │              ^^^^^^^^^^^^^^^^^^^
   ╵
  src/views/C0-Project/ProjectList.vue 17:14  root stylesheet
```

### 影响范围
- ❌ 项目列表页面无法加载
- ❌ 其他5个页面潜在相同问题
- ❌ 阻塞用户访问核心功能

---

## 根本原因分析

### 问题根源
Vue组件的`<style scoped lang="scss">`标签中使用了SASS变量（如`$text-color-primary`、`$spacing-md`等），但**未导入变量定义文件**。

### 技术细节
```vue
<!-- ❌ 错误写法 -->
<style scoped lang="scss">
.page-header {
  h2 {
    color: $text-color-primary; // ❌ 变量未定义
  }
}
</style>

<!-- ✅ 正确写法 -->
<style scoped lang="scss">
@import '@/assets/styles/variables.scss'; // ✅ 导入变量定义

.page-header {
  h2 {
    color: $text-color-primary; // ✅ 变量可用
  }
}
</style>
```

### 为什么会出现这个问题？
1. **Scoped样式隔离**: Vue的`scoped`样式是独立编译的，不会自动继承全局变量
2. **SASS编译机制**: 每个`.vue`文件的`<style>`块是独立的SASS编译单元
3. **Vite构建特性**: Vite不会自动注入全局SASS变量（与Webpack不同）

---

## 修复方案

### 修复策略
在所有使用SASS变量的Vue组件中，添加变量文件导入语句。

### 修复的文件清单

| 文件 | 位置 | 使用的变量 | 状态 |
|------|------|-----------|------|
| ProjectList.vue | C0-Project | `$text-color-primary`, `$text-color-secondary` | ✅ 已修复 |
| ProjectCreate.vue | C0-Project | `$text-color-primary`, `$spacing-md` | ✅ 已修复 |
| ProjectDetail.vue | C0-Project | `$text-color-primary`, `$border-color-base` | ✅ 已修复 |
| SSTSList.vue | C1-Requirement | `$text-color-primary`, `$text-color-secondary` | ✅ 已修复 |
| MRList.vue | C1-Requirement | `$text-color-primary`, `$spacing-lg` | ✅ 已修复 |
| RequirementPool.vue | C1-Requirement | `$text-color-primary`, `$primary-color` | ✅ 已修复 |

### 修复代码示例

**修复前**:
```vue
<style scoped lang="scss">
.project-list-container {
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: $text-color-primary; // ❌ 错误：变量未定义
    }
  }
}
</style>
```

**修复后**:
```vue
<style scoped lang="scss">
@import '@/assets/styles/variables.scss'; // ✅ 添加导入

.project-list-container {
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: $text-color-primary; // ✅ 正确：变量可用
    }
  }
}
</style>
```

---

## 变量定义文件内容

### variables.scss 完整内容

```scss
// ===== 颜色系统 =====

// 主色调
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #f5222d;
$info-color: #1890ff;

// 中性色
$text-color-primary: #262626;
$text-color-secondary: #595959;
$text-color-disabled: #bfbfbf;
$border-color-base: #d9d9d9;
$border-color-light: #e8e8e8;
$background-color-base: #fafafa;
$background-color-light: #ffffff;

// 功能色
$link-color: #1890ff;
$hover-color: #40a9ff;
$active-color: #096dd9;
$disabled-color: #f5f5f5;

// ===== 字体系统 =====
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, 'Noto Sans', sans-serif;

$font-size-base: 14px;
$font-size-sm: 12px;
$font-size-lg: 16px;
$font-size-xl: 18px;
$font-size-xxl: 20px;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 600;

$line-height-base: 1.5715;

// ===== 间距系统 =====
$spacing-unit: 8px;

$spacing-xs: $spacing-unit * 0.5; // 4px
$spacing-sm: $spacing-unit; // 8px
$spacing-md: $spacing-unit * 2; // 16px
$spacing-lg: $spacing-unit * 3; // 24px
$spacing-xl: $spacing-unit * 4; // 32px
$spacing-xxl: $spacing-unit * 6; // 48px

// ===== 布局尺寸 =====
$header-height: 64px;
$sidebar-width: 240px;
$sidebar-collapsed-width: 64px;
$right-panel-width: 320px;

// ===== 圆角 =====
$border-radius-base: 2px;
$border-radius-sm: 1px;
$border-radius-lg: 4px;
$border-radius-xl: 8px;

// ===== 阴影 =====
$box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15);
$box-shadow-light: 0 2px 4px rgba(0, 0, 0, 0.08);
$box-shadow-heavy: 0 4px 16px rgba(0, 0, 0, 0.2);
$box-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);

// ===== 动画 =====
$transition-base: all 0.3s ease;
$transition-fast: all 0.2s ease;
```

---

## 验证结果

### 修复前后对比

| 检查项 | 修复前 | 修复后 |
|--------|--------|--------|
| 项目列表页面 | ❌ 编译错误 | ✅ 正常加载 |
| 项目创建页面 | ❌ 潜在错误 | ✅ 正常加载 |
| 项目详情页面 | ❌ 潜在错误 | ✅ 正常加载 |
| SSTS列表页面 | ❌ 潜在错误 | ✅ 正常加载 |
| MR列表页面 | ❌ 潜在错误 | ✅ 正常加载 |
| 需求池页面 | ❌ 潜在错误 | ✅ 正常加载 |
| SASS变量解析 | ❌ Undefined | ✅ 正确解析 |
| 页面样式显示 | ❌ 异常 | ✅ 正常 |

### 测试验证

#### 1. 编译测试 ✅
```bash
npm run dev -- --port 6060
# ✅ 无SASS编译错误
# ✅ Vite服务正常启动
```

#### 2. 页面访问测试 ✅
```
✅ http://localhost:6060/function/c0-project/list
✅ http://localhost:6060/function/c0-project/create
✅ http://localhost:6060/function/c0-project/detail/:id
✅ http://localhost:6060/function/c1-requirement/ssts/list
✅ http://localhost:6060/function/c1-requirement/mr/list
✅ http://localhost:6060/function/c1-requirement/pool
```

#### 3. 样式渲染测试 ✅
- ✅ 文字颜色正确（`$text-color-primary: #262626`）
- ✅ 间距正确（`$spacing-md: 16px`）
- ✅ 边框颜色正确（`$border-color-base: #d9d9d9`）
- ✅ 主题色正确（`$primary-color: #1890ff`）

---

## 预防措施

### 1. 代码规范
在所有使用SASS变量的Vue组件中，**必须**在`<style>`标签开头添加导入语句：

```vue
<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

// 你的样式代码...
</style>
```

### 2. 自动化检查
建议添加ESLint规则或pre-commit hook，检查SASS变量使用但未导入的情况：

```javascript
// .eslintrc.js 建议配置
module.exports = {
  rules: {
    // 自定义规则：检查SASS变量使用
    'vue/require-sass-import': 'error'
  }
}
```

### 3. 开发文档
在开发文档中明确说明：

> **重要提示**: 在Vue组件中使用SASS变量（如`$text-color-primary`、`$spacing-md`等）时，
> 必须在`<style>`标签中导入变量文件：
> ```scss
> @import '@/assets/styles/variables.scss';
> ```

### 4. 组件模板
创建Vue组件模板，自动包含变量导入：

```vue
<!-- .vscode/templates/vue-component.vue -->
<template>
  <div class="component-name">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss'; // ✅ 模板自动包含

.component-name {
  // 样式代码
}
</style>
```

---

## 技术知识点

### 为什么Vite不自动注入SASS变量？

**Webpack方式**（自动注入）:
```javascript
// vue.config.js (Webpack)
module.exports = {
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  }
}
```

**Vite方式**（手动导入）:
```javascript
// vite.config.ts (Vite)
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Vite不推荐全局注入，建议按需导入
        // additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  }
})
```

**Vite的设计理念**:
1. **按需加载**: 只在需要的地方导入，减少不必要的编译
2. **明确依赖**: 显式导入让依赖关系更清晰
3. **性能优化**: 避免全局注入导致的重复编译

### Scoped样式的工作原理

```vue
<!-- 源代码 -->
<template>
  <div class="container">Hello</div>
</template>

<style scoped>
.container { color: red; }
</style>

<!-- 编译后 -->
<template>
  <div class="container" data-v-f3f3eg9>Hello</div>
</template>

<style>
.container[data-v-f3f3eg9] { color: red; }
</style>
```

每个`scoped`样式块都是**独立编译**的，因此需要独立导入依赖。

---

## Git提交记录

```bash
commit e039afc
Author: AI Assistant
Date: 2026-01-17

fix: 修复SASS变量未定义错误 - 添加variables.scss导入

【修复内容】
在6个文件的<style>标签中添加 @import '@/assets/styles/variables.scss':
1. C0-Project/ProjectList.vue
2. C0-Project/ProjectCreate.vue
3. C0-Project/ProjectDetail.vue
4. C1-Requirement/SSTSList.vue
5. C1-Requirement/MRList.vue
6. C1-Requirement/RequirementPool.vue

【验证结果】
✅ 所有SASS变量现在可以正常解析
✅ 页面加载无错误
✅ 样式显示正常
```

---

## 总结

### 问题影响
- **严重程度**: 🔴 高（阻塞核心功能）
- **影响范围**: 6个页面
- **修复难度**: 🟢 低（简单导入）
- **修复时间**: ~5分钟

### 经验教训
1. ✅ **显式导入优于隐式注入**: Vite的设计理念更清晰
2. ✅ **Scoped样式需要独立依赖**: 理解Vue样式隔离机制
3. ✅ **代码规范很重要**: 统一的导入规范避免类似问题
4. ✅ **自动化检查必不可少**: 通过工具预防问题

### 后续行动
- [ ] 检查其他模块（C2-C7）是否有类似问题
- [ ] 添加ESLint规则检查SASS导入
- [ ] 更新开发文档和组件模板
- [ ] 在Code Review中重点关注样式导入

---

**文档版本**: V1.0  
**修复时间**: 2026-01-17  
**修复人**: AI Assistant  
**状态**: ✅ 已修复并验证
