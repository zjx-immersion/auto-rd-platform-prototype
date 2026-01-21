<template>
  <div class="version-gantt-container">
    <div class="gantt-header">
      <div class="header-left">
        <span class="gantt-title">版本甘特图</span>
        <el-tag size="small" type="info">{{ versions.length }}个版本</el-tag>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button size="small" @click="toggleGrouping">
            {{ groupByProduct ? '取消分组' : '按产品分组' }}
          </el-button>
          <el-button size="small" @click="refresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="gantt-content">
      <!-- 左侧版本列表 -->
      <div class="version-list">
        <div class="list-header">
          <div class="column-name">产品/版本</div>
          <div class="column-info">信息</div>
        </div>
        
        <div class="list-body">
          <template v-if="groupByProduct">
            <!-- 按产品分组 -->
            <div v-for="group in groupedVersions" :key="group.productLine" class="product-group">
              <div class="group-header" @click="toggleGroup(group.productLine)">
                <el-icon>
                  <component :is="group.collapsed ? 'CaretRight' : 'CaretBottom'" />
                </el-icon>
                <span class="group-name">{{ group.productLine }}</span>
                <el-tag size="small">{{ group.versions.length }}个版本</el-tag>
              </div>
              
              <div v-show="!group.collapsed" class="group-versions">
                <div
                  v-for="version in group.versions"
                  :key="version.versionId"
                  class="version-row"
                  :class="{ 'is-selected': selectedVersion === version.versionId }"
                  @click="selectVersion(version)"
                >
                  <div class="version-name">
                    <div class="name">{{ version.productName }}</div>
                    <div class="version-number">{{ version.versionNumber }}</div>
                  </div>
                  <div class="version-info">
                    <el-tag :type="getAlignmentType(version.alignmentStatus)" size="small">
                      {{ version.alignmentStatus }}
                    </el-tag>
                    <span class="sp-count">{{ version.totalStoryPoints }} SP</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <template v-else>
            <!-- 不分组 -->
            <div
              v-for="version in versions"
              :key="version.versionId"
              class="version-row"
              :class="{ 'is-selected': selectedVersion === version.versionId }"
              @click="selectVersion(version)"
            >
              <div class="version-name">
                <div class="name">{{ version.productName }}</div>
                <div class="version-number">{{ version.versionNumber }}</div>
              </div>
              <div class="version-info">
                <el-tag :type="getAlignmentType(version.alignmentStatus)" size="small">
                  {{ version.alignmentStatus }}
                </el-tag>
                <span class="sp-count">{{ version.totalStoryPoints }} SP</span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 右侧甘特图区域 -->
      <div class="gantt-chart" :style="{ width: chartWidth + 'px' }">
        <!-- 迭代刻度 -->
        <div class="chart-scale">
          <div
            v-for="iter in totalIterations"
            :key="iter"
            class="scale-cell"
            :class="{ 'is-milestone': isMilestoneIteration(iter) }"
            :style="{ width: cellWidth + 'px' }"
          >
            <span>{{ iter }}</span>
          </div>
        </div>

        <!-- 版本条 -->
        <div class="chart-bars">
          <template v-if="groupByProduct">
            <div v-for="group in groupedVersions" :key="group.productLine" class="product-group-bars">
              <div class="group-header-spacer"></div>
              <div v-show="!group.collapsed" class="group-version-bars">
                <div
                  v-for="version in group.versions"
                  :key="version.versionId"
                  class="version-bar-row"
                >
                  <div
                    class="version-bar"
                    :class="{
                      'is-selected': selectedVersion === version.versionId,
                      [`status-${version.alignmentStatus}`]: true
                    }"
                    :style="getBarStyle(version)"
                    @click="selectVersion(version)"
                  >
                    <div class="bar-content">
                      <span class="bar-label">{{ version.versionNumber }}</span>
                      <span class="bar-sp">{{ version.totalStoryPoints }}SP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <template v-else>
            <div
              v-for="version in versions"
              :key="version.versionId"
              class="version-bar-row"
            >
              <div
                class="version-bar"
                :class="{
                  'is-selected': selectedVersion === version.versionId,
                  [`status-${version.alignmentStatus}`]: true
                }"
                :style="getBarStyle(version)"
                @click="selectVersion(version)"
              >
                <div class="bar-content">
                  <span class="bar-label">{{ version.versionNumber }}</span>
                  <span class="bar-sp">{{ version.totalStoryPoints }}SP</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 里程碑标注线 -->
        <div class="milestone-markers">
          <div
            v-for="milestone in milestones"
            :key="milestone.milestoneId"
            class="milestone-line"
            :style="{ left: getMilestonePosition(milestone) + 'px' }"
          >
            <div class="line"></div>
            <div class="label">{{ milestone.milestoneName }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Refresh, CaretRight, CaretBottom } from '@element-plus/icons-vue'
import type { ProductVersion } from '@/types/version'
import type { Milestone } from '@/types/project'

interface Props {
  versions: ProductVersion[]
  milestones: Milestone[]
  totalIterations: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'version-select', version: ProductVersion): void
  (e: 'version-edit', version: ProductVersion): void
}>()

const groupByProduct = ref(true)
const selectedVersion = ref<string>()
const collapsedGroups = ref<Set<string>>(new Set())

const cellWidth = 60  // 每个迭代单元格的宽度
const chartWidth = computed(() => props.totalIterations * cellWidth)

// 按产品线分组
const groupedVersions = computed(() => {
  const groups = new Map<string, ProductVersion[]>()
  
  props.versions.forEach(version => {
    const productLine = version.productLine
    if (!groups.has(productLine)) {
      groups.set(productLine, [])
    }
    groups.get(productLine)!.push(version)
  })
  
  return Array.from(groups.entries()).map(([productLine, versions]) => ({
    productLine,
    versions,
    collapsed: collapsedGroups.value.has(productLine)
  }))
})

const toggleGrouping = () => {
  groupByProduct.value = !groupByProduct.value
}

const toggleGroup = (productLine: string) => {
  if (collapsedGroups.value.has(productLine)) {
    collapsedGroups.value.delete(productLine)
  } else {
    collapsedGroups.value.add(productLine)
  }
}

const selectVersion = (version: ProductVersion) => {
  selectedVersion.value = version.versionId
  emit('version-select', version)
}

const getBarStyle = (version: ProductVersion) => {
  const start = version.startIterationNumber - 1
  const width = (version.endIterationNumber - version.startIterationNumber + 1) * cellWidth
  
  return {
    left: `${start * cellWidth}px`,
    width: `${width}px`
  }
}

const isMilestoneIteration = (iterationNumber: number): boolean => {
  return props.milestones.some(m => m.iterationNumber === iterationNumber)
}

const getMilestonePosition = (milestone: Milestone): number => {
  if (!milestone.iterationNumber) return 0
  return (milestone.iterationNumber - 0.5) * cellWidth
}

const getAlignmentType = (status: string) => {
  const map: Record<string, any> = {
    good: 'success',
    tight: 'warning',
    risk: 'danger'
  }
  return map[status] || 'info'
}

const refresh = () => {
  // 刷新逻辑
}
</script>

<style scoped lang="scss">
.version-gantt-container {
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  
  .gantt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .gantt-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
  
  .gantt-content {
    display: flex;
    overflow-x: auto;
    
    .version-list {
      flex-shrink: 0;
      width: 300px;
      border-right: 2px solid #dcdfe6;
      background: #fafafa;
      
      .list-header {
        display: flex;
        padding: 12px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;
        font-weight: 600;
        font-size: 13px;
        color: #606266;
        
        .column-name {
          flex: 1;
        }
        
        .column-info {
          width: 120px;
        }
      }
      
      .list-body {
        .product-group {
          .group-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background: #f0f0f0;
            cursor: pointer;
            border-bottom: 1px solid #e4e7ed;
            
            &:hover {
              background: #e8e8e8;
            }
            
            .group-name {
              flex: 1;
              font-weight: 600;
              font-size: 13px;
            }
          }
          
          .group-versions {
            background: white;
          }
        }
        
        .version-row {
          display: flex;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
          
          &:hover {
            background: #f5f7fa;
          }
          
          &.is-selected {
            background: #e3f2fd;
            border-left: 3px solid #2196f3;
          }
          
          .version-name {
            flex: 1;
            
            .name {
              font-size: 13px;
              color: #303133;
              margin-bottom: 4px;
            }
            
            .version-number {
              font-size: 12px;
              color: #909399;
            }
          }
          
          .version-info {
            width: 120px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
            
            .sp-count {
              font-size: 12px;
              color: #606266;
            }
          }
        }
      }
    }
    
    .gantt-chart {
      flex: 1;
      position: relative;
      min-height: 400px;
      
      .chart-scale {
        display: flex;
        position: sticky;
        top: 0;
        background: #f5f7fa;
        border-bottom: 2px solid #dcdfe6;
        z-index: 10;
        
        .scale-cell {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 4px;
          border-right: 1px solid #e4e7ed;
          font-size: 12px;
          color: #606266;
          
          &.is-milestone {
            background: #fff3e0;
            font-weight: 600;
            color: #ff9800;
          }
        }
      }
      
      .chart-bars {
        position: relative;
        
        .product-group-bars {
          .group-header-spacer {
            height: 40px;
            background: #f8f8f8;
            border-bottom: 1px solid #e4e7ed;
          }
        }
        
        .version-bar-row {
          height: 60px;
          position: relative;
          border-bottom: 1px solid #f0f0f0;
          
          .version-bar {
            position: absolute;
            top: 10px;
            height: 40px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            padding: 0 12px;
            
            &.status-good {
              background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
              box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
            }
            
            &.status-tight {
              background: linear-gradient(135deg, #ff9800 0%, #ffa726 100%);
              box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
            }
            
            &.status-risk {
              background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
              box-shadow: 0 2px 4px rgba(244, 67, 54, 0.3);
            }
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            &.is-selected {
              border: 2px solid #2196f3;
              box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
            }
            
            .bar-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
              color: white;
              font-size: 12px;
              font-weight: 600;
              
              .bar-label {
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
              }
              
              .bar-sp {
                opacity: 0.9;
              }
            }
          }
        }
      }
      
      .milestone-markers {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        
        .milestone-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          
          .line {
            width: 2px;
            height: 100%;
            background: #ff9800;
            opacity: 0.5;
          }
          
          .label {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff9800;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }
  }
}
</style>
