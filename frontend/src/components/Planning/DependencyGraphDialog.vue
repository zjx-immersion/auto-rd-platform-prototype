<template>
  <el-dialog
    v-model="visible"
    title="依赖关系图"
    width="95%"
    fullscreen
    :close-on-click-modal="false"
  >
    <div class="graph-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-space>
          <el-button-group>
            <el-button :type="layout === 'force' ? 'primary' : ''" @click="layout = 'force'">
              <el-icon><Share /></el-icon>
              力导向图
            </el-button>
            <el-button :type="layout === 'tree' ? 'primary' : ''" @click="layout = 'tree'">
              <el-icon><Menu /></el-icon>
              树形图
            </el-button>
            <el-button :type="layout === 'circular' ? 'primary' : ''" @click="layout = 'circular'">
              <el-icon><Aim /></el-icon>
              环形图
            </el-button>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-button-group>
            <el-button @click="zoomIn">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
            <el-button @click="zoomOut">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
            <el-button @click="resetZoom">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-select v-model="highlightNode" placeholder="高亮节点" clearable style="width: 200px;">
            <el-option
              v-for="node in allNodes"
              :key="node.id"
              :label="`${node.code} - ${node.title}`"
              :value="node.id"
            />
          </el-select>

          <el-checkbox v-model="showLabels">显示标签</el-checkbox>
          <el-checkbox v-model="showDependencyType">显示依赖类型</el-checkbox>
        </el-space>
      </div>

      <!-- 图表容器 -->
      <div ref="chartRef" class="chart" />

      <!-- 图例 -->
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color" style="background: #409eff;" />
          <span>Feature</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #67c23a;" />
          <span>SSTS</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #e6a23c;" />
          <span>MR</span>
        </div>
        <div class="legend-divider" />
        <div class="legend-item">
          <div class="legend-line" style="border-color: #f56c6c; border-width: 2px;" />
          <span>强依赖</span>
        </div>
        <div class="legend-item">
          <div class="legend-line" style="border-color: #e6a23c; border-style: dashed;" />
          <span>弱依赖</span>
        </div>
        <div class="legend-item">
          <div class="legend-line" style="border-color: #909399; border-style: dotted;" />
          <span>可选依赖</span>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats">
        <el-text size="small">节点数: {{ statistics.nodeCount }}</el-text>
        <el-text size="small" style="margin-left: 16px;">边数: {{ statistics.edgeCount }}</el-text>
        <el-text size="small" style="margin-left: 16px;">最大深度: {{ statistics.maxDepth }}</el-text>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleExport">导出图片</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Share, Menu, Aim, ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { DependencyNode, DependencyEdge } from '@/utils/dependency-checker'

// Props
interface Props {
  modelValue: boolean
  nodes: DependencyNode[]
  edges: DependencyEdge[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// State
const chartRef = ref<HTMLElement>()
const chart = ref<ECharts>()
const layout = ref<'force' | 'tree' | 'circular'>('force')
const highlightNode = ref<string>('')
const showLabels = ref(true)
const showDependencyType = ref(false)

// Computed
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const allNodes = computed(() => props.nodes)

const statistics = computed(() => {
  const depths = new Map<string, number>()
  
  // 计算每个节点的深度（BFS）
  const calculateDepth = (startId: string) => {
    const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }]
    const visited = new Set<string>()
    
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!
      if (visited.has(id)) continue
      
      visited.add(id)
      depths.set(id, Math.max(depths.get(id) || 0, depth))
      
      // 找到所有指向此节点的边
      props.edges
        .filter(e => e.target === id)
        .forEach(e => {
          queue.push({ id: e.source, depth: depth + 1 })
        })
    }
  }
  
  // 从所有叶子节点开始计算
  const leafNodes = props.nodes.filter(node => 
    !props.edges.some(e => e.source === node.id)
  )
  leafNodes.forEach(node => calculateDepth(node.id))
  
  return {
    nodeCount: props.nodes.length,
    edgeCount: props.edges.length,
    maxDepth: Math.max(...Array.from(depths.values()), 0)
  }
})

// Methods
function initChart() {
  if (!chartRef.value) return
  
  chart.value = echarts.init(chartRef.value)
  updateChart()
}

function updateChart() {
  if (!chart.value) return
  
  const graphNodes = props.nodes.map(node => ({
    id: node.id,
    name: showLabels.value ? `${node.code}\n${node.title.substring(0, 10)}...` : node.code,
    value: node.code,
    symbolSize: node.type === 'feature' ? 60 : node.type === 'ssts' ? 50 : 40,
    itemStyle: {
      color: node.type === 'feature' ? '#409eff' : 
             node.type === 'ssts' ? '#67c23a' : '#e6a23c'
    },
    label: {
      show: showLabels.value
    },
    category: node.type,
    ...(highlightNode.value === node.id ? {
      emphasis: {
        focus: 'adjacency'
      }
    } : {})
  }))
  
  const graphEdges = props.edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    label: {
      show: showDependencyType.value,
      formatter: edge.type === 'strong' ? '强' : edge.type === 'weak' ? '弱' : '可选'
    },
    lineStyle: {
      color: edge.type === 'strong' ? '#f56c6c' : 
             edge.type === 'weak' ? '#e6a23c' : '#909399',
      width: edge.type === 'strong' ? 2 : 1,
      type: edge.type === 'strong' ? 'solid' : 
            edge.type === 'weak' ? 'dashed' : 'dotted',
      curveness: 0.2
    }
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const node = props.nodes.find(n => n.id === params.data.id)
          if (node) {
            return `
              <b>${node.code}</b><br/>
              ${node.title}<br/>
              类型: ${node.type}<br/>
              ${node.sprintId ? `Sprint: ${node.sprintId}` : '未分配'}
            `
          }
        } else if (params.dataType === 'edge') {
          const edge = props.edges.find(e => 
            e.source === params.data.source && e.target === params.data.target
          )
          if (edge) {
            return `
              <b>依赖关系</b><br/>
              类型: ${edge.type === 'strong' ? '强依赖' : 
                      edge.type === 'weak' ? '弱依赖' : '可选依赖'}<br/>
              ${edge.reason || ''}
            `
          }
        }
        return ''
      }
    },
    series: [
      {
        type: 'graph',
        layout: layout.value === 'tree' ? 'none' : layout.value,
        data: graphNodes,
        links: graphEdges,
        categories: [
          { name: 'feature' },
          { name: 'ssts' },
          { name: 'mr' }
        ],
        roam: true,
        label: {
          show: showLabels.value,
          position: 'right',
          formatter: '{b}'
        },
        labelLayout: {
          hideOverlap: true
        },
        lineStyle: {
          color: 'source',
          curveness: 0.2
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 3
          }
        },
        ...(layout.value === 'force' ? {
          force: {
            repulsion: 1000,
            edgeLength: [100, 200],
            gravity: 0.1,
            friction: 0.6
          }
        } : {}),
        ...(layout.value === 'tree' ? {
          orient: 'TB',
          initialTreeDepth: -1,
          nodeAlign: 'left'
        } : {}),
        ...(layout.value === 'circular' ? {
          circular: {
            rotateLabel: true
          }
        } : {})
      }
    ]
  }
  
  chart.value.setOption(option)
}

function zoomIn() {
  chart.value?.dispatchAction({
    type: 'dataZoom',
    start: 30,
    end: 70
  })
}

function zoomOut() {
  chart.value?.dispatchAction({
    type: 'dataZoom',
    start: 0,
    end: 100
  })
}

function resetZoom() {
  updateChart()
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleExport() {
  if (!chart.value) return
  
  const url = chart.value.getDataURL({
    type: 'png',
    backgroundColor: '#fff',
    pixelRatio: 2
  })
  
  const link = document.createElement('a')
  link.href = url
  link.download = `依赖关系图-${new Date().toISOString().slice(0, 10)}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Watch
watch(() => props.modelValue, async (val) => {
  if (val) {
    await nextTick()
    initChart()
  }
})

watch(layout, updateChart)
watch(showLabels, updateChart)
watch(showDependencyType, updateChart)
watch(highlightNode, updateChart)
watch(() => [props.nodes, props.edges], updateChart, { deep: true })

// Lifecycle
onMounted(() => {
  if (visible.value) {
    initChart()
  }
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chart.value?.dispose()
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  chart.value?.resize()
}
</script>

<style scoped>
.graph-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 150px);
}

.toolbar {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.chart {
  width: 100%;
  height: calc(100% - 120px);
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.legend {
  position: absolute;
  bottom: 60px;
  right: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.legend-line {
  width: 30px;
  height: 0;
  border-top: 2px solid;
}

.legend-divider {
  height: 1px;
  background: #e4e7ed;
  margin: 8px 0;
}

.stats {
  position: absolute;
  bottom: 16px;
  left: 20px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
