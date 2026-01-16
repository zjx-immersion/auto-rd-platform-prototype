<template>
  <div class="process-wizard">
    <page-header 
      title="P1: 战略规划流程" 
      description="Epic创建、优先级排序、MoSCoW分类、版本规划"
      :show-back="true"
    />

    <!-- 步骤条 -->
    <div class="steps-container">
      <el-steps :active="currentStep" finish-status="success">
        <el-step title="Epic创建" description="创建战略级需求" />
        <el-step title="优先级排序" description="确定Epic优先级" />
        <el-step title="MoSCoW分类" description="需求分类管理" />
        <el-step title="版本规划" description="分配到版本" />
        <el-step title="确认" description="完成战略规划" />
      </el-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1: Epic创建 -->
      <div v-if="currentStep === 0" class="step-panel">
        <h3>步骤1: 创建Epic</h3>
        <p>请填写Epic的基本信息，或选择已有的Epic</p>
        
        <el-radio-group v-model="step1Action" style="margin-bottom: 16px">
          <el-radio label="new">创建新Epic</el-radio>
          <el-radio label="existing">选择已有Epic</el-radio>
        </el-radio-group>

        <div v-if="step1Action === 'new'">
          <el-form :model="epicForm" label-width="120px">
            <el-form-item label="Epic名称">
              <el-input v-model="epicForm.title" placeholder="请输入Epic名称" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="epicForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入描述"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <div v-else>
          <el-select v-model="selectedEpicId" placeholder="请选择Epic" style="width: 100%">
            <el-option label="EPIC-1001: ADAS功能" value="1001" />
            <el-option label="EPIC-1002: 车联网功能" value="1002" />
          </el-select>
        </div>
      </div>

      <!-- 步骤2: 优先级排序 -->
      <div v-if="currentStep === 1" class="step-panel">
        <h3>步骤2: 优先级排序</h3>
        <p>拖动调整Epic的优先级顺序</p>
        <el-empty description="优先级排序功能开发中..." />
      </div>

      <!-- 步骤3: MoSCoW分类 -->
      <div v-if="currentStep === 2" class="step-panel">
        <h3>步骤3: MoSCoW分类</h3>
        <p>将Epic分类为Must、Should、Could、Won't</p>
        <el-empty description="MoSCoW分类功能开发中..." />
      </div>

      <!-- 步骤4: 版本规划 -->
      <div v-if="currentStep === 3" class="step-panel">
        <h3>步骤4: 版本规划</h3>
        <p>将Epic分配到对应的版本</p>
        <el-empty description="版本规划功能开发中..." />
      </div>

      <!-- 步骤5: 确认 -->
      <div v-if="currentStep === 4" class="step-panel">
        <h3>步骤5: 确认</h3>
        <el-result
          icon="success"
          title="战略规划完成"
          sub-title="已成功完成Epic的战略规划流程"
        >
          <template #extra>
            <el-button type="primary" @click="finishProcess">查看Epic列表</el-button>
          </template>
        </el-result>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-footer">
      <el-button @click="handlePrevious" :disabled="currentStep === 0">
        上一步
      </el-button>
      <el-button @click="handleSaveDraft">保存草稿</el-button>
      <el-button
        v-if="currentStep < 4"
        type="primary"
        @click="handleNext"
      >
        下一步
      </el-button>
      <el-button
        v-else
        type="primary"
        @click="finishProcess"
      >
        完成
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/Common/PageHeader.vue'

const router = useRouter()

const currentStep = ref(0)
const step1Action = ref('new')
const selectedEpicId = ref('')

const epicForm = reactive({
  title: '',
  description: ''
})

function handlePrevious() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function handleNext() {
  // 验证当前步骤
  if (currentStep.value === 0) {
    if (step1Action.value === 'new' && !epicForm.title) {
      ElMessage.warning('请输入Epic名称')
      return
    }
    if (step1Action.value === 'existing' && !selectedEpicId.value) {
      ElMessage.warning('请选择Epic')
      return
    }
  }
  
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

function handleSaveDraft() {
  ElMessage.success('草稿已保存')
}

function finishProcess() {
  ElMessage.success('战略规划流程已完成')
  router.push('/function/c1/epic/list')
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.process-wizard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.steps-container {
  padding: 24px;
  border-bottom: 1px solid $border-color-light;
}

.step-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}

.step-panel {
  max-width: 800px;
  margin: 0 auto;
  
  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
  }
  
  p {
    margin: 0 0 24px;
    color: $text-color-secondary;
  }
}

.action-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid $border-color-light;
  background: $background-color-base;
}
</style>
