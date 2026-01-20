<!-- FeatureCompletionDialog.vue - Feature精细化设置对话框 ⭐⭐⭐⭐⭐ -->
<template>
  <el-dialog
    v-model="visible"
    title="Feature精细化设置 ⭐"
    width="800px"
    @close="handleClose"
  >
    <div class="feature-completion-dialog">
      <el-alert :closable="false" type="info" style="margin-bottom: 16px">
        Epic: {{ epic?.name }} - 设置每个Feature的完成度目标
      </el-alert>

      <el-table :data="featureList" border>
        <el-table-column prop="name" label="Feature名称" />
        <el-table-column prop="storyPoints" label="总SP" width="100" />
        <el-table-column label="完成度目标" width="300">
          <template #default="{ row }">
            <el-slider
              v-model="row.completionTarget"
              :min="0"
              :max="100"
              :step="5"
              show-stops
              @change="handleFeatureChange(row)"
            />
            <span>{{ row.completionTarget }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="目标SP" width="100">
          <template #default="{ row }">
            <strong>{{ calculateTargetSP(row) }} SP</strong>
          </template>
        </el-table-column>
      </el-table>

      <div class="validation-info" style="margin-top: 16px">
        <el-alert
          :type="validationResult.isValid ? 'success' : 'warning'"
          :closable="false"
        >
          {{ validationResult.message }}
        </el-alert>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useVersionStore } from '@/stores/modules/version'

const props = defineProps<{
  modelValue: boolean
  epic: any
  features: any[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  update: [epicId: string, features: any[]]
}>()

const versionStore = useVersionStore()
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const featureList = ref<any[]>([])

// 初始化Feature列表
watch(() => props.features, (newFeatures) => {
  if (newFeatures && newFeatures.length > 0) {
    featureList.value = newFeatures.map(f => ({
      ...f,
      completionTarget: f.completionTarget || 0
    }))
  }
}, { immediate: true })

// 计算目标SP
function calculateTargetSP(feature: any) {
  return Math.round(feature.storyPoints * (feature.completionTarget / 100))
}

function handleFeatureChange(feature: any) {
  console.log(`Feature ${feature.name} 完成度: ${feature.completionTarget}%`)
}

// 验证结果
const validationResult = computed(() => {
  if (!props.epic || featureList.value.length === 0) {
    return { isValid: true, message: '暂无数据' }
  }

  // 计算Feature加权平均完成度
  const calculatedCompletion = versionStore.calculateEpicCompletion(
    props.epic.id,
    featureList.value
  )

  const epicCompletion = (props.epic as any).completionTarget || 0
  const diff = Math.abs(calculatedCompletion - epicCompletion)

  return {
    isValid: diff <= 1,
    message: diff <= 1
      ? `✓ Feature完成度验证通过（${calculatedCompletion}% = Epic ${epicCompletion}%）`
      : `⚠️ Feature完成度（${calculatedCompletion}%）与Epic目标（${epicCompletion}%）不一致`
  }
})

function handleSave() {
  emit('update', props.epic.id, featureList.value)
  handleClose()
}

function handleClose() {
  visible.value = false
}
</script>

<style scoped lang="scss">
.feature-completion-dialog {
  .validation-info {
    padding: 12px 0;
  }
}
</style>
