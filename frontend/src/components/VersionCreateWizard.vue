<template>
  <el-dialog
    v-model="dialogVisible"
    title="创建产品版本"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-steps :active="currentStep" align-center class="wizard-steps">
      <el-step title="基本信息" description="产品和版本信息" />
      <el-step title="迭代映射" description="选择迭代区间" />
      <el-step title="Epic分配" description="分配Epic和完成度" />
    </el-steps>

    <div class="wizard-content">
      <!-- 步骤1：基本信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <el-form ref="basicFormRef" :model="formData" :rules="basicRules" label-width="120px">
          <el-form-item label="产品" prop="productId">
            <el-select v-model="formData.productId" placeholder="选择产品" style="width: 100%" @change="handleProductChange">
              <el-option
                v-for="product in products"
                :key="product.id"
                :label="`${product.name} (${product.code})`"
                :value="product.id"
              >
                <div style="display: flex; justify-content: space-between;">
                  <span>{{ product.name }}</span>
                  <el-tag size="small">{{ product.productLine }}</el-tag>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="版本号" prop="versionNumber">
            <el-input v-model="formData.versionNumber" placeholder="例如: V1.0">
              <template #append>
                <el-button @click="autoGenerateVersion">自动生成</el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="版本名称" prop="versionName">
            <el-input v-model="formData.versionName" placeholder="例如: 工程样车版本" />
          </el-form-item>

          <el-form-item label="版本类型" prop="versionType">
            <el-radio-group v-model="formData.versionType">
              <el-radio label="major">大版本</el-radio>
              <el-radio label="minor">小版本</el-radio>
              <el-radio label="patch">补丁版本</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="对齐里程碑" prop="alignedMilestoneId">
            <el-select v-model="formData.alignedMilestoneId" placeholder="选择里程碑" style="width: 100%">
              <el-option
                v-for="milestone in milestones"
                :key="milestone.milestoneId"
                :label="`${milestone.milestoneName} (${milestone.targetDate})`"
                :value="milestone.milestoneId"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2：迭代映射 -->
      <div v-show="currentStep === 1" class="step-content">
        <el-alert
          title="选择迭代区间"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        >
          点击迭代单元格选择起始迭代，拖动选择区间，或直接输入迭代号
        </el-alert>

        <el-form :model="formData" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="起始迭代">
                <el-input-number
                  v-model="formData.startIterationNumber"
                  :min="1"
                  :max="totalIterations"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束迭代">
                <el-input-number
                  v-model="formData.endIterationNumber"
                  :min="formData.startIterationNumber || 1"
                  :max="totalIterations"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="迭代数量">
            <el-tag size="large">{{ iterationCount }}个迭代 ({{ iterationCount * 2 }}周)</el-tag>
          </el-form-item>
        </el-form>

        <div class="iteration-selector">
          <IterationAxis
            v-if="iterations.length > 0"
            :iterations="iterations"
            :milestones="milestonesForAxis"
            :selected-range="{ start: formData.startIterationNumber || 1, end: formData.endIterationNumber || 1 }"
            @iteration-click="handleIterationClick"
          />
        </div>
      </div>

      <!-- 步骤3：Epic分配 -->
      <div v-show="currentStep === 2" class="step-content">
        <el-alert
          title="分配Epic和设置完成度"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        >
          选择Epic并设置在该版本中的完成度百分比
        </el-alert>

        <div class="epic-selector">
          <el-button type="primary" size="small" @click="showEpicDialog = true">
            <el-icon><Plus /></el-icon>
            添加Epic
          </el-button>
        </div>

        <el-table :data="formData.epicAllocations" style="margin-top: 16px">
          <el-table-column label="Epic名称" prop="epicName" />
          <el-table-column label="总Story Points" prop="epicTotalSP" width="150" />
          <el-table-column label="完成度" width="200">
            <template #default="{ row }">
              <el-input-number
                v-model="row.completionPercentage"
                :min="0"
                :max="100"
                :step="10"
                @change="updateAllocatedSP(row)"
              />
              <span style="margin-left: 8px">%</span>
            </template>
          </el-table-column>
          <el-table-column label="分配SP" width="120">
            <template #default="{ row }">
              <el-tag>{{ row.allocatedSP }} SP</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="removeEpic($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="summary" style="margin-top: 20px">
          <el-statistic title="总Story Points" :value="totalStoryPoints" suffix="SP" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="wizard-footer">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="currentStep === 2" type="primary" :loading="submitting" @click="handleSubmit">
          创建版本
        </el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
    </template>

    <!-- Epic选择对话框 -->
    <el-dialog v-model="showEpicDialog" title="选择Epic" width="600px">
      <el-table :data="availableEpics" @selection-change="handleEpicSelection">
        <el-table-column type="selection" width="55" />
        <el-table-column label="Epic名称" prop="name" />
        <el-table-column label="Story Points" prop="storyPoints" width="120" />
        <el-table-column label="状态" prop="status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'planning' ? 'info' : 'success'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showEpicDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmEpicSelection">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CreateVersionInput, EpicAllocation } from '@/types/version'
import type { Iteration } from '@/types/project'
import IterationAxis from './IterationAxis.vue'

interface Props {
  visible: boolean
  products: any[]
  milestones: any[]
  iterations: Iteration[]
  epics: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: CreateVersionInput): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const currentStep = ref(0)
const submitting = ref(false)
const showEpicDialog = ref(false)
const basicFormRef = ref<FormInstance>()
const selectedEpics = ref<any[]>([])

const formData = ref<Partial<CreateVersionInput> & { epicAllocations: EpicAllocation[] }>({
  productId: '',
  productName: '',
  productCode: '',
  productLine: '',
  versionNumber: '',
  versionName: '',
  versionType: 'major',
  startIterationNumber: 1,
  endIterationNumber: 1,
  alignedMilestoneId: '',
  epicAllocations: []
})

const basicRules: FormRules = {
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  versionNumber: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  versionName: [{ required: true, message: '请输入版本名称', trigger: 'blur' }],
  versionType: [{ required: true, message: '请选择版本类型', trigger: 'change' }],
  alignedMilestoneId: [{ required: true, message: '请选择对齐里程碑', trigger: 'change' }]
}

const totalIterations = computed(() => props.iterations.length)
const iterationCount = computed(() => 
  (formData.value.endIterationNumber || 1) - (formData.value.startIterationNumber || 1) + 1
)

const milestonesForAxis = computed(() => {
  return props.milestones.map(m => ({
    iterationNumber: m.iterationNumber || 0,
    name: m.milestoneCode || m.milestoneName
  }))
})

const availableEpics = computed(() => {
  const allocatedIds = formData.value.epicAllocations?.map(e => e.epicId) || []
  return props.epics.filter(e => !allocatedIds.includes(e.id))
})

const totalStoryPoints = computed(() => {
  return formData.value.epicAllocations?.reduce((sum, e) => sum + e.allocatedSP, 0) || 0
})

const handleProductChange = (productId: string) => {
  const product = props.products.find(p => p.id === productId)
  if (product) {
    formData.value.productName = product.name
    formData.value.productCode = product.code
    formData.value.productLine = product.productLine
  }
}

const autoGenerateVersion = () => {
  const product = props.products.find(p => p.id === formData.value.productId)
  if (product) {
    formData.value.versionNumber = `V1.0`
    ElMessage.success('已自动生成版本号')
  }
}

const handleIterationClick = (iteration: Iteration) => {
  if (!formData.value.startIterationNumber) {
    formData.value.startIterationNumber = iteration.iterationNumber
    formData.value.endIterationNumber = iteration.iterationNumber
  } else if (!formData.value.endIterationNumber || formData.value.endIterationNumber === formData.value.startIterationNumber) {
    formData.value.endIterationNumber = iteration.iterationNumber
  } else {
    formData.value.startIterationNumber = iteration.iterationNumber
    formData.value.endIterationNumber = iteration.iterationNumber
  }
}

const handleEpicSelection = (selection: any[]) => {
  selectedEpics.value = selection
}

const confirmEpicSelection = () => {
  selectedEpics.value.forEach(epic => {
    if (!formData.value.epicAllocations) {
      formData.value.epicAllocations = []
    }
    formData.value.epicAllocations.push({
      epicId: epic.id,
      epicName: epic.name,
      epicTotalSP: epic.storyPoints,
      completionPercentage: 100,
      allocatedSP: epic.storyPoints
    })
  })
  showEpicDialog.value = false
  selectedEpics.value = []
}

const updateAllocatedSP = (epic: EpicAllocation) => {
  epic.allocatedSP = Math.round(epic.epicTotalSP * epic.completionPercentage / 100)
}

const removeEpic = (index: number) => {
  formData.value.epicAllocations?.splice(index, 1)
}

const nextStep = async () => {
  if (currentStep.value === 0) {
    // 验证基本信息
    if (!basicFormRef.value) return
    const valid = await basicFormRef.value.validate().catch(() => false)
    if (!valid) return
  }
  
  if (currentStep.value === 1) {
    // 验证迭代映射
    if (!formData.value.startIterationNumber || !formData.value.endIterationNumber) {
      ElMessage.warning('请选择迭代区间')
      return
    }
    if (formData.value.startIterationNumber > formData.value.endIterationNumber) {
      ElMessage.warning('起始迭代不能大于结束迭代')
      return
    }
  }
  
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const handleSubmit = async () => {
  if (!formData.value.epicAllocations || formData.value.epicAllocations.length === 0) {
    ElMessage.warning('请至少分配一个Epic')
    return
  }
  
  submitting.value = true
  try {
    emit('submit', formData.value as CreateVersionInput)
    ElMessage.success('版本创建成功')
    handleClose()
  } catch (error) {
    ElMessage.error('版本创建失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  currentStep.value = 0
  formData.value = {
    productId: '',
    productName: '',
    productCode: '',
    productLine: '',
    versionNumber: '',
    versionName: '',
    versionType: 'major',
    startIterationNumber: 1,
    endIterationNumber: 1,
    alignedMilestoneId: '',
    epicAllocations: []
  }
  basicFormRef.value?.resetFields()
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.wizard-steps {
  margin-bottom: 30px;
}

.wizard-content {
  min-height: 400px;
  padding: 20px 0;
  
  .step-content {
    animation: fadeIn 0.3s;
  }
}

.iteration-selector {
  margin-top: 20px;
}

.epic-selector {
  display: flex;
  justify-content: flex-end;
}

.summary {
  display: flex;
  justify-content: flex-end;
}

.wizard-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
