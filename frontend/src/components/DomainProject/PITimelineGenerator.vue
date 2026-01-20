<!-- PITimelineGenerator.vue - PI时间线自动生成组件 ⭐ -->
<template>
  <div class="pi-timeline-generator">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>PI时间线自动生成 ⭐</span>
          <el-button size="small" @click="handleGenerate">重新生成</el-button>
        </div>
      </template>

      <!-- PI周期设置 -->
      <el-form label-width="120px">
        <el-form-item label="PI周期（周）">
          <el-input-number 
            v-model="piCycle" 
            :min="8" 
            :max="16" 
            @change="handleCycleChange"
          />
          <span style="margin-left: 8px">周（推荐12周）</span>
        </el-form-item>
      </el-form>

      <!-- PI时间线列表 -->
      <div v-if="timeline.length > 0" class="pi-timeline-list">
        <h4>生成的PI时间线（{{ timeline.length }}个PI）</h4>
        <el-table :data="timeline" border>
          <el-table-column prop="piNumber" label="PI编号" width="120" />
          <el-table-column prop="startDate" label="开始日期" width="120" />
          <el-table-column prop="endDate" label="结束日期" width="120" />
          <el-table-column prop="weeks" label="周数" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ row.weeks }}周</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row, $index }">
              <el-tag 
                :type="$index === 0 ? 'success' : $index === 1 ? 'warning' : 'info'"
                size="small"
              >
                {{ $index === 0 ? '当前' : $index === 1 ? '下一个' : '计划中' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <el-alert 
          :closable="false" 
          type="success" 
          style="margin-top: 16px"
        >
          <template #title>
            ✅ 已自动生成{{ timeline.length }}个PI，固定{{ piCycle }}周节奏，PI之间无间隙
          </template>
        </el-alert>
      </div>

      <div v-else class="empty-state">
        <el-empty description="请先设置项目日期范围" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useProjectStore } from '@/stores/modules/project'

const props = defineProps<{
  projectStart: string
  projectEnd: string
  piCycle?: number
}>()

const emit = defineEmits<{
  update: [timeline: any[]]
}>()

const projectStore = useProjectStore()
const piCycle = ref(props.piCycle || 12)
const timeline = ref<any[]>([])

// 生成PI时间线
function handleGenerate() {
  if (!props.projectStart || !props.projectEnd) {
    console.warn('项目日期范围未设置')
    return
  }

  timeline.value = projectStore.generatePITimeline(
    props.projectStart,
    props.projectEnd,
    piCycle.value
  )

  emit('update', timeline.value)
  console.log(`✅ PI时间线已生成: ${timeline.value.length}个PI`)
}

// PI周期变化时重新生成
function handleCycleChange() {
  handleGenerate()
}

// 监听props变化
watch([() => props.projectStart, () => props.projectEnd], () => {
  handleGenerate()
})

// 初始加载
onMounted(() => {
  if (props.projectStart && props.projectEnd) {
    handleGenerate()
  }
})
</script>

<style scoped lang="scss">
.pi-timeline-generator {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pi-timeline-list {
    margin-top: 16px;

    h4 {
      margin-bottom: 12px;
      color: #409eff;
    }
  }

  .empty-state {
    padding: 40px 0;
    text-align: center;
    color: #909399;
  }
}
</style>
