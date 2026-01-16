<template>
  <page-container>
    <!-- 页面头部 -->
    <page-header 
      title="创建Epic" 
      description="填写Epic的基本信息" 
      :show-back="true"
    />

    <!-- 表单内容 -->
    <div class="form-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="right"
      >
        <div class="form-section">
          <h2 class="section-title">基本信息</h2>
          
          <el-form-item label="Epic名称" prop="title" required>
            <el-input
              v-model="formData.title"
              placeholder="请输入Epic名称"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="优先级" prop="priority" required>
            <el-select v-model="formData.priority" placeholder="请选择优先级">
              <el-option label="P0 - 紧急" value="p0" />
              <el-option label="P1 - 高" value="p1" />
              <el-option label="P2 - 中" value="p2" />
              <el-option label="P3 - 低" value="p3" />
            </el-select>
          </el-form-item>

          <el-form-item label="所属项目" prop="projectId" required>
            <el-select v-model="formData.projectId" placeholder="请选择项目">
              <el-option label="项目A" value="PROJECT-001" />
              <el-option label="项目B" value="PROJECT-002" />
            </el-select>
          </el-form-item>

          <el-form-item label="负责人" prop="owner" required>
            <el-select v-model="formData.owner" placeholder="请选择负责人">
              <el-option label="张三" value="zhangsan" />
              <el-option label="李四" value="lisi" />
            </el-select>
          </el-form-item>

          <el-form-item label="描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 底部操作栏 -->
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button @click="handleSaveDraft">保存草稿</el-button>
      <el-button 
        type="primary" 
        :loading="submitting"
        @click="handleSubmit"
      >
        提交
      </el-button>
    </div>
  </page-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'

const router = useRouter()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const formData = reactive({
  title: '',
  priority: 'p2',
  projectId: '',
  owner: '',
  description: ''
})

const formRules: FormRules = {
  title: [
    { required: true, message: '请输入Epic名称', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ],
  owner: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ]
}

function handleCancel() {
  router.back()
}

function handleSaveDraft() {
  ElMessage.success('草稿已保存')
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      
      // 模拟提交
      setTimeout(() => {
        submitting.value = false
        ElMessage.success('创建成功')
        router.push('/function/c1/epic/list')
      }, 1000)
    }
  })
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.form-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
  
  .section-title {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
  }
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid $border-color-light;
  background: $background-color-base;
}
</style>
