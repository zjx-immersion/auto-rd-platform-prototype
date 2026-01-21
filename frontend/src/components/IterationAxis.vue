<template>
  <div class="iteration-axis-container">
    <div class="axis-header">
      <div class="header-left">
        <span class="axis-title">{{ title || '统一迭代轴' }}</span>
        <el-tag size="small" type="info">{{ iterations.length }}个迭代</el-tag>
      </div>
      <div class="header-right">
        <el-button-group v-if="showControls">
          <el-button size="small" :icon="ZoomIn" @click="zoomIn">放大</el-button>
          <el-button size="small" :icon="ZoomOut" @click="zoomOut">缩小</el-button>
        </el-button-group>
      </div>
    </div>
    
    <div class="axis-content" :style="{ overflowX: scrollable ? 'auto' : 'hidden' }">
      <div class="iteration-cells" :style="{ minWidth: totalWidth + 'px' }">
        <div
          v-for="iteration in iterations"
          :key="iteration.iterationNumber"
          class="iteration-cell"
          :class="{
            'is-milestone': getMilestone(iteration.iterationNumber),
            'is-selected': selectedIteration === iteration.iterationNumber,
            'is-in-range': isInSelectedRange(iteration.iterationNumber)
          }"
          :style="{ width: cellWidth + 'px' }"
          @click="handleCellClick(iteration)"
        >
          <div class="cell-content">
            <div class="iteration-number">迭{{ iteration.iterationNumber }}</div>
            <div v-if="showDates" class="iteration-dates">
              {{ formatDate(iteration.startDate) }} - {{ formatDate(iteration.endDate) }}
            </div>
            <div v-if="getMilestone(iteration.iterationNumber)" class="milestone-marker">
              <el-icon><Flag /></el-icon>
              <span>{{ getMilestone(iteration.iterationNumber) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ZoomIn, ZoomOut, Flag } from '@element-plus/icons-vue'
import type { Iteration } from '@/types/project'

interface Props {
  iterations: Iteration[]
  title?: string
  showDates?: boolean
  showControls?: boolean
  scrollable?: boolean
  milestones?: Array<{ iterationNumber: number; name: string }>
  selectedIteration?: number
  selectedRange?: { start: number; end: number }
}

const props = withDefaults(defineProps<Props>(), {
  showDates: false,
  showControls: true,
  scrollable: true
})

const emit = defineEmits<{
  (e: 'iteration-click', iteration: Iteration): void
  (e: 'range-select', range: { start: number; end: number }): void
}>()

// 缩放级别
const zoomLevel = ref(1)
const baseCellWidth = 80

const cellWidth = computed(() => baseCellWidth * zoomLevel.value)
const totalWidth = computed(() => cellWidth.value * props.iterations.length)

const zoomIn = () => {
  if (zoomLevel.value < 2) {
    zoomLevel.value += 0.2
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.2
  }
}

const getMilestone = (iterationNumber: number): string => {
  const milestone = props.milestones?.find(m => m.iterationNumber === iterationNumber)
  return milestone ? milestone.name : ''
}

const isInSelectedRange = (iterationNumber: number): boolean => {
  if (!props.selectedRange) return false
  return iterationNumber >= props.selectedRange.start && iterationNumber <= props.selectedRange.end
}

const formatDate = (dateStr: string): string => {
  return dateStr.slice(5)  // 只显示月-日
}

const handleCellClick = (iteration: Iteration) => {
  emit('iteration-click', iteration)
}
</script>

<style scoped lang="scss">
.iteration-axis-container {
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  
  .axis-header {
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
      
      .axis-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
  
  .axis-content {
    position: relative;
    
    .iteration-cells {
      display: flex;
      
      .iteration-cell {
        flex-shrink: 0;
        border-right: 1px solid #e4e7ed;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background: #f0f9ff;
        }
        
        &.is-milestone {
          background: #fff3e0;
          border-right-color: #ff9800;
          
          &:hover {
            background: #ffe0b2;
          }
        }
        
        &.is-selected {
          background: #e3f2fd;
          border: 2px solid #2196f3;
        }
        
        &.is-in-range {
          background: #e8f5e9;
        }
        
        .cell-content {
          padding: 12px 8px;
          text-align: center;
          
          .iteration-number {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }
          
          .iteration-dates {
            font-size: 11px;
            color: #909399;
            line-height: 1.2;
          }
          
          .milestone-marker {
            margin-top: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: #ff9800;
            font-size: 12px;
            font-weight: 600;
            
            .el-icon {
              font-size: 16px;
            }
          }
        }
      }
    }
  }
}
</style>
