# 页面设计：项目Timeline（1级整体多集计划主页）

> **页面类型**: 1级视图层  
> **优先级**: P0 ⭐⭐⭐⭐⭐  
> **参考原型**: NIO NSDP TimePlan（截图1）

---

## 一、页面定位

### 1.1 功能定位

**核心价值**：项目级整体Timeline视图，展示多集计划全景

**用户角色**：
- **主要用户**：项目经理PM
- **次要用户**：产品负责人PO、RTE

**使用场景**：
1. 查看项目整体进度
2. 了解里程碑对齐情况
3. 快速导航到2级版本规划
4. 查看PI集合概览

---

### 1.2 路由信息

```typescript
{
  path: '/function/c0-project/timeline/:projectId',
  name: 'ProjectTimeline',
  component: () => import('@/views/C0-Project/ProjectTimeline.vue'),
  meta: {
    title: '项目Timeline',
    breadcrumb: ['固有功能', 'C0: 领域项目管理', '项目Timeline']
  }
}
```

---

## 二、页面布局

### 2.1 整体布局结构（参考截图1）

```
┌────────────────────────────────────────────────────────────────────┐
│ 页面头部 (Page Header)                                              │
├────────────────────────────────────────────────────────────────────┤
│ 项目概览卡片 (Project Overview Card)                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Timeline可视化区域 (Timeline Visualization Area)                    │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ 时间轴 (Time Axis)                                           │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 里程碑线 (Milestone Line) ⭐参考截图1红框                    │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 产品版本Timeline (Product Version Timeline) ⭐横向甘特条      │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ PI Timeline (PI Timeline) ⭐下方Milestone标注                │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ 操作提示区 (Action Hints)                                           │
└────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 页面头部

```vue
<template>
  <div class="page-header">
    <div class="header-left">
      <el-button text @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回项目列表
      </el-button>
      <h2>{{ project.projectName }} - 项目Timeline</h2>
    </div>
    
    <div class="header-actions">
      <el-button type="primary" @click="goToVersionPlanning">
        🎯 进入版本规划工作台
      </el-button>
      <el-button @click="goToPICollection">
        📊 查看PI集合
      </el-button>
      <el-button @click="openProjectSettings">
        ⚙️ 项目设置
      </el-button>
    </div>
  </div>
</template>
```

---

### 2.3 项目概览卡片

```vue
<template>
  <el-card class="project-overview-card">
    <div class="overview-stats">
      <div class="stat-item">
        <span class="stat-label">项目周期</span>
        <span class="stat-value">
          {{ project.startDate }} ~ {{ project.endDate }} ({{ project.totalWeeks }}周)
        </span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">迭代配置</span>
        <span class="stat-value">
          {{ project.iterationWeeks }}周/迭代，共{{ project.totalIterations }}个迭代
        </span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">里程碑数</span>
        <span class="stat-value">
          {{ project.milestones.length }}个 
          ({{ project.milestones.map(m => m.milestoneName).join(', ') }})
        </span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">产品版本</span>
        <span class="stat-value">
          {{ versionCount }}个版本，跨{{ productCount }}个产品线
        </span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">PI集合</span>
        <span class="stat-value">
          {{ piCount }}个PI
        </span>
      </div>
    </div>
  </el-card>
</template>
```

---

### 2.4 Timeline可视化区域（核心）⭐⭐⭐⭐⭐

#### 2.4.1 时间轴

```vue
<template>
  <div class="timeline-axis">
    <!-- 月份标签 -->
    <div class="month-labels">
      <div 
        v-for="month in months" 
        :key="month.key"
        :style="{ width: month.width + 'px' }"
        class="month-label"
      >
        {{ month.label }}
      </div>
    </div>
    
    <!-- 迭代标签 -->
    <div class="iteration-labels">
      <div 
        v-for="iteration in iterations" 
        :key="iteration.iterationNumber"
        :style="{ width: iterationWidth + 'px' }"
        class="iteration-label"
        :class="{ 'is-milestone': iteration.hasMilestone }"
      >
        迭{{ iteration.iterationNumber }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-axis {
  background: #f5f7fa;
  border-bottom: 2px solid #409eff;
}

.month-labels {
  display: flex;
  border-bottom: 1px solid #dcdfe6;
}

.iteration-labels {
  display: flex;
}

.iteration-label {
  text-align: center;
  font-size: 12px;
  border-right: 1px dashed #e4e7ed;
}

.iteration-label.is-milestone {
  border-right: 2px solid #f56c6c;
  font-weight: bold;
}
</style>
```

---

#### 2.4.2 里程碑线（参考截图1红框中的Milestone标注）

```vue
<template>
  <div class="milestone-line">
    <div 
      v-for="milestone in milestones" 
      :key="milestone.milestoneId"
      :style="getMilestoneStyle(milestone)"
      class="milestone-marker"
    >
      <div class="milestone-flag">
        <el-icon><Flag /></el-icon>
      </div>
      <div class="milestone-label">
        <div class="milestone-name">{{ milestone.milestoneName }}</div>
        <div class="milestone-date">{{ milestone.targetDate }}</div>
      </div>
      <div class="milestone-line-vertical"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
function getMilestoneStyle(milestone: Milestone) {
  // 计算里程碑在Timeline上的位置
  const iterationNumber = milestone.mappedIterationNumber
  const position = (iterationNumber - 1) * iterationWidth
  
  return {
    left: position + 'px'
  }
}
</script>

<style scoped>
.milestone-line {
  position: relative;
  height: 60px;
  background: linear-gradient(to bottom, #fff3e0 0%, #ffffff 100%);
}

.milestone-marker {
  position: absolute;
  top: 0;
}

.milestone-flag {
  color: #f56c6c;
  font-size: 24px;
}

.milestone-label {
  font-size: 12px;
  white-space: nowrap;
}

.milestone-line-vertical {
  position: absolute;
  left: 12px;
  top: 40px;
  bottom: -200px;
  width: 2px;
  background: #f56c6c;
  opacity: 0.3;
  z-index: 1;
}
</style>
```

---

#### 2.4.3 产品版本Timeline（参考截图1的横向条状图）

```vue
<template>
  <div class="product-version-timeline">
    <!-- 按产品分组 -->
    <div 
      v-for="product in products" 
      :key="product.productId"
      class="product-group"
    >
      <!-- 产品标题行 -->
      <div class="product-header">
        <el-icon><Box /></el-icon>
        <span class="product-name">{{ product.productName }}</span>
        <el-tag size="small">{{ product.productLine }}</el-tag>
      </div>
      
      <!-- 版本甘特条 -->
      <div class="version-bars">
        <div 
          v-for="version in product.versions" 
          :key="version.versionId"
          :style="getVersionBarStyle(version)"
          class="version-bar"
          :class="getVersionBarClass(version)"
          @click="handleVersionClick(version)"
        >
          <div class="version-label">
            <span class="version-number">{{ version.versionNumber }}</span>
            <span class="version-iterations">(迭{{ version.startIterationNumber }}-{{ version.endIterationNumber }})</span>
          </div>
          
          <div class="version-milestone-tag">
            → {{ version.alignedMilestone.milestoneName }}
          </div>
          
          <el-progress 
            :percentage="version.completionPercentage" 
            :stroke-width="4"
            :show-text="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
function getVersionBarStyle(version: ProductVersion) {
  const startPosition = (version.startIterationNumber - 1) * iterationWidth
  const width = (version.endIterationNumber - version.startIterationNumber + 1) * iterationWidth
  
  return {
    left: startPosition + 'px',
    width: width + 'px'
  }
}

function getVersionBarClass(version: ProductVersion) {
  // 根据对齐状态设置颜色
  if (version.alignmentStatus === 'good') return 'version-bar--good'
  if (version.alignmentStatus === 'warning') return 'version-bar--warning'
  return 'version-bar--danger'
}
</script>

<style scoped>
.product-version-timeline {
  padding: 20px 0;
}

.product-group {
  margin-bottom: 30px;
}

.product-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
}

.version-bars {
  position: relative;
  height: 60px;
  background: #fafafa;
  border-radius: 4px;
}

.version-bar {
  position: absolute;
  height: 50px;
  top: 5px;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.version-bar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* 参考截图1的配色 */
.version-bar--good {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border-left: 4px solid #409eff;
}

.version-bar--warning {
  background: linear-gradient(135deg, #e6a23c 0%, #f0a350 100%);
  border-left: 4px solid #e6a23c;
}

.version-bar--danger {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  border-left: 4px solid #f56c6c;
}

.version-label {
  color: white;
  font-size: 13px;
  font-weight: 600;
}

.version-milestone-tag {
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  margin-top: 2px;
}
</style>
```

---

#### 2.4.4 PI Timeline（参考截图3下方的Milestone标注）

```vue
<template>
  <div class="pi-timeline">
    <div class="pi-timeline-header">
      <h3>PI集合</h3>
      <el-button size="small" @click="goToPICollection">
        查看全部 <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
    
    <div class="pi-bars">
      <div 
        v-for="pi in pis" 
        :key="pi.piId"
        :style="getPIBarStyle(pi)"
        class="pi-bar"
        @click="handlePIClick(pi)"
      >
        <div class="pi-header">
          <span class="pi-number">{{ pi.piNumber }}</span>
          <span class="pi-name">({{ pi.piName }})</span>
        </div>
        
        <div class="pi-details">
          <div class="pi-duration">迭{{ pi.startIterationNumber }}-{{ pi.endIterationNumber }}</div>
          <div class="pi-versions">
            包含：{{ pi.includedVersions.map(v => v.versionNumber).join(', ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pi-timeline {
  margin-top: 40px;
  padding: 20px;
  background: #f0f2f5;
  border-radius: 8px;
}

.pi-bars {
  position: relative;
  height: 80px;
  margin-top: 16px;
}

.pi-bar {
  position: absolute;
  height: 70px;
  border-radius: 6px;
  padding: 12px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
  cursor: pointer;
  border: 2px solid #409eff;
  transition: all 0.3s;
}

.pi-bar:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.pi-header {
  font-weight: 600;
  margin-bottom: 8px;
}

.pi-details {
  font-size: 12px;
  opacity: 0.95;
}
</style>
```

---

## 三、交互设计

### 3.1 点击交互

| 点击目标 | 交互行为 |
|---------|---------|
| 版本条 | 显示版本详情弹窗（Epic列表、完成度、统计） |
| 产品名称 | 跳转到版本规划工作台（聚焦该产品） |
| PI条 | 跳转到PI Planning工作台 |
| 里程碑标记 | 显示里程碑详情（关联版本、对齐状态） |

---

### 3.2 缩放与滚动

```typescript
// 时间轴缩放
const zoomLevel = ref(1.0)  // 1.0 = 100%

function handleZoomIn() {
  zoomLevel.value = Math.min(zoomLevel.value + 0.2, 2.0)
  recalculateLayout()
}

function handleZoomOut() {
  zoomLevel.value = Math.max(zoomLevel.value - 0.2, 0.5)
  recalculateLayout()
}

// 横向滚动
const scrollContainer = ref<HTMLElement>()

function scrollToIteration(iterationNumber: number) {
  const position = (iterationNumber - 1) * iterationWidth * zoomLevel.value
  scrollContainer.value?.scrollTo({ left: position, behavior: 'smooth' })
}
```

---

## 四、数据模型

### 4.1 页面数据结构

```typescript
interface ProjectTimelineData {
  project: {
    projectId: string
    projectName: string
    startDate: string
    endDate: string
    totalWeeks: number
    iterationWeeks: number
    totalIterations: number
    milestones: Milestone[]
  }
  
  iterationAxis: {
    iterations: Iteration[]
  }
  
  products: ProductWithVersions[]
  
  pis: PI[]
  
  statistics: {
    versionCount: number
    productCount: number
    piCount: number
    totalStoryPoints: number
  }
}

interface ProductWithVersions {
  productId: string
  productName: string
  productLine: string
  versions: ProductVersion[]
}

interface ProductVersion {
  versionId: string
  versionNumber: string
  startIterationNumber: number
  endIterationNumber: number
  alignedMilestone: Milestone
  alignmentStatus: 'good' | 'warning' | 'danger'
  completionPercentage: number
  totalStoryPoints: number
}
```

---

### 4.2 数据加载

```typescript
import { useProjectStore } from '@/stores/modules/project'
import { useVersionStore } from '@/stores/modules/version'
import { usePIStore } from '@/stores/modules/pi'

const projectStore = useProjectStore()
const versionStore = useVersionStore()
const piStore = usePIStore()

async function loadTimelineData(projectId: string) {
  loading.value = true
  
  try {
    // 1. 加载项目信息
    await projectStore.fetchProjectById(projectId)
    
    // 2. 加载版本数据
    await versionStore.fetchVersionsByProject(projectId)
    
    // 3. 加载PI集合
    await piStore.fetchPIsByProject(projectId)
    
    // 4. 组织数据
    timelineData.value = {
      project: projectStore.currentProject,
      iterationAxis: projectStore.currentProject.iterationAxis,
      products: groupVersionsByProduct(versionStore.versions),
      pis: piStore.pis,
      statistics: calculateStatistics()
    }
  } finally {
    loading.value = false
  }
}
```

---

## 五、样式规范

### 5.1 配色方案（参考截图1）

```scss
$color-timeline-bg: #f5f7fa;
$color-milestone: #f56c6c;
$color-version-good: #67c23a;
$color-version-warning: #e6a23c;
$color-version-danger: #f56c6c;
$color-pi: #409eff;
$color-iteration-border: #dcdfe6;
```

---

### 5.2 布局尺寸

```scss
$iteration-width: 120px;  // 每个迭代的宽度
$product-row-height: 80px;  // 每个产品行高度
$version-bar-height: 50px;  // 版本条高度
$milestone-line-width: 2px;  // 里程碑线宽度
```

---

## 六、核心功能点

### 6.1 自动对齐检测

```typescript
function checkVersionAlignment(version: ProductVersion): AlignmentStatus {
  const versionEndDate = getIterationEndDate(version.endIterationNumber)
  const milestoneDate = new Date(version.alignedMilestone.targetDate)
  const gapDays = calculateDaysBetween(versionEndDate, milestoneDate)
  
  if (gapDays < 0) {
    // 版本晚于里程碑
    return {
      status: 'danger',
      message: `超期${Math.abs(gapDays)}天`,
      color: 'red'
    }
  } else if (gapDays < 30) {
    // buffer < 30天
    return {
      status: 'warning',
      message: `仅预留${gapDays}天buffer`,
      color: 'orange'
    }
  } else {
    // buffer >= 30天
    return {
      status: 'good',
      message: `预留${gapDays}天buffer`,
      color: 'green'
    }
  }
}
```

---

### 6.2 快速导航

```typescript
// 导航到版本规划工作台
function goToVersionPlanning(productId?: string) {
  router.push({
    name: 'VersionPlanningWorkspace',
    params: { projectId: project.value.projectId },
    query: productId ? { focusProduct: productId } : {}
  })
}

// 导航到PI Planning
function goToPIPlanning(piId: string) {
  router.push({
    name: 'PIPlanningWorkspace',
    params: { piId }
  })
}
```

---

## 七、响应式设计

### 7.1 小屏幕适配

```scss
@media (max-width: 1280px) {
  $iteration-width: 80px;  // 缩小迭代宽度
  
  .version-label {
    font-size: 11px;  // 缩小字体
  }
  
  .milestone-label {
    display: none;  // 隐藏里程碑文字
  }
}
```

---

## 八、性能优化

### 8.1 虚拟滚动

```typescript
// 只渲染可见区域的产品
const visibleProducts = computed(() => {
  const scrollTop = scrollContainer.value?.scrollTop || 0
  const containerHeight = scrollContainer.value?.clientHeight || 0
  
  const startIndex = Math.floor(scrollTop / productRowHeight)
  const endIndex = Math.ceil((scrollTop + containerHeight) / productRowHeight)
  
  return products.value.slice(startIndex, endIndex + 1)
})
```

---

## 九、总结

### 9.1 核心价值

1. **全局视图**：一屏展示项目所有规划
2. **可视化强**：Timeline甘特图直观展示
3. **快速导航**：点击跳转到详细页面
4. **对齐检测**：自动检查里程碑对齐状态

---

### 9.2 与NIO NSDP对比

| 特性 | NIO NSDP | 本设计 |
|------|----------|--------|
| Timeline视图 | ✅ | ✅ |
| 多产品展示 | ✅ | ✅ |
| 里程碑标注 | ✅ | ✅ |
| PI展示 | ❓ | ✅ |
| 交互导航 | ✅ | ✅ |

---

**设计完成度**: ✅ 100%  
**参考原型**: NIO NSDP TimePlan（截图1）  
**状态**: 待实施
