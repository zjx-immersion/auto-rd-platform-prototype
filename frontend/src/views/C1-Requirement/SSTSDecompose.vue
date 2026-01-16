<template>
  <div class="ssts-decompose-container">
    <PageContainer>
      <div class="page-header">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <h2>SSTS拆解工作台</h2>
      </div>

      <el-row :gutter="20">
        <el-col :span="10">
          <el-card header="SSTS信息">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="SSTS">{{ ssts?.title }}</el-descriptions-item>
              <el-descriptions-item label="Feature">{{ feature?.name }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ ssts?.type }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card header="拆解MR" style="margin-top: 16px">
            <el-form :model="mrForm" label-width="80px">
              <el-form-item label="MR标题">
                <el-input v-model="mrForm.title" placeholder="输入MR标题" />
              </el-form-item>
              <el-form-item label="复杂度">
                <el-select v-model="mrForm.complexity" style="width: 100%">
                  <el-option label="低" value="low" />
                  <el-option label="中" value="medium" />
                  <el-option label="高" value="high" />
                </el-select>
              </el-form-item>
              <el-form-item label="工作量">
                <el-input-number v-model="mrForm.storyPoints" :min="1" :max="13" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="mrForm.description" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="addMR">添加MR</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="14">
          <el-card header="已拆解MR列表">
            <el-table :data="mrList" stripe>
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="title" label="标题" />
              <el-table-column prop="complexity" label="复杂度" width="100" />
              <el-table-column prop="storyPoints" label="工作量" width="100" />
              <el-table-column label="操作" width="150">
                <template #default="{ $index }">
                  <el-button link type="danger" size="small" @click="removeMR($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div style="margin-top: 20px; text-align: right">
              <el-button @click="goBack">取消</el-button>
              <el-button type="primary" @click="submitDecompose" :loading="submitting">完成拆解</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useSSTSStore } from '@/stores/modules/ssts'
import { useFeatureStore } from '@/stores/modules/feature'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const route = useRoute()
const sstsStore = useSSTSStore()
const featureStore = useFeatureStore()

const sstsId = route.params.id as string
const submitting = ref(false)

const ssts = computed(() => sstsStore.sstsList.find(s => s.id === sstsId))
const feature = computed(() => featureStore.features.find(f => f.id === ssts.value?.featureId))

const mrForm = ref({ title: '', complexity: 'medium', storyPoints: 3, description: '' })
const mrList = ref<any[]>([])

const addMR = () => {
  if (!mrForm.value.title) {
    ElMessage.warning('请输入MR标题')
    return
  }
  mrList.value.push({ ...mrForm.value })
  mrForm.value = { title: '', complexity: 'medium', storyPoints: 3, description: '' }
  ElMessage.success('添加成功')
}

const removeMR = (index: number) => {
  mrList.value.splice(index, 1)
  ElMessage.success('删除成功')
}

const submitDecompose = async () => {
  if (mrList.value.length === 0) {
    ElMessage.warning('请至少添加一个MR')
    return
  }

  submitting.value = true
  try {
    for (const mr of mrList.value) {
      await sstsStore.createMR({
        ...mr,
        sstsId: sstsId,
        code: `MR-${Date.now().toString().slice(-6)}`,
        status: 'draft',
        owner: ''
      } as any)
    }
    ElMessage.success('拆解完成')
    router.back()
  } catch (error) {
    ElMessage.error('拆解失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => router.back()

onMounted(async () => {
  await Promise.all([sstsStore.fetchSSTSList(), featureStore.fetchFeatures()])
})
</script>

<style scoped lang="scss">
.ssts-decompose-container {
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
