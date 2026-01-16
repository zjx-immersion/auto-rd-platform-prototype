<template>
  <div class="pi-create-container">
    <PageContainer>
      <div class="page-header">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <h2>创建PI</h2>
      </div>

      <el-card>
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" style="max-width: 600px">
          <el-form-item label="PI名称" prop="name">
            <el-input v-model="formData.name" placeholder="例如：PI 1" />
          </el-form-item>
          <el-form-item label="PI编码" prop="code">
            <el-input v-model="formData.code" placeholder="自动生成或手动输入">
              <template #append>
                <el-button @click="generateCode">生成</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="所属项目" prop="projectId">
            <el-select v-model="formData.projectId" placeholder="请选择项目" style="width: 100%">
              <el-option v-for="proj in allProjects" :key="proj.id" :label="proj.name" :value="proj.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属版本" prop="versionId">
            <el-select v-model="formData.versionId" placeholder="请选择版本" style="width: 100%">
              <el-option v-for="ver in projectVersions" :key="ver.id" :label="ver.name" :value="ver.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Sprint数量" prop="sprintCount">
            <el-input-number v-model="formData.sprintCount" :min="1" :max="6" />
          </el-form-item>
          <el-form-item label="PI周期" prop="dateRange">
            <el-date-picker
              v-model="formData.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="PI目标" prop="goals">
            <el-input v-model="formData.goals" type="textarea" :rows="4" placeholder="输入PI目标" />
          </el-form-item>
          <el-form-item>
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">创建PI</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useProjectStore } from '@/stores/modules/project'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const formData = ref({
  name: '',
  code: '',
  projectId: route.query.projectId as string || '',
  versionId: '',
  sprintCount: 5,
  dateRange: [] as any[],
  goals: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入PI名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入PI编码', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择PI周期', trigger: 'change' }]
}

const allProjects = computed(() => projectStore.projects)
const projectVersions = computed(() => {
  if (!formData.value.projectId) return []
  return projectStore.getVersionsByProject(formData.value.projectId)
})

const generateCode = () => {
  formData.value.code = `PI-${Date.now().toString().slice(-6)}`
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const piData = {
        name: formData.value.name,
        code: formData.value.code,
        projectId: formData.value.projectId,
        versionId: formData.value.versionId,
        startDate: formData.value.dateRange[0],
        endDate: formData.value.dateRange[1],
        status: 'planning',
        sprints: Array.from({ length: formData.value.sprintCount }, (_, i) => ({
          name: `Sprint ${i + 1}`,
          startDate: '',
          endDate: ''
        })),
        goals: formData.value.goals.split('\n').filter(g => g.trim()),
        teams: []
      }

      await projectStore.createPI(piData as any)
      ElMessage.success('创建成功')
      router.back()
    } catch (error) {
      ElMessage.error('创建失败')
    } finally {
      submitting.value = false
    }
  })
}

const goBack = () => router.back()

onMounted(async () => {
  await projectStore.fetchProjects()
  generateCode()
})
</script>

<style scoped lang="scss">
.pi-create-container {
  height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
}
</style>
