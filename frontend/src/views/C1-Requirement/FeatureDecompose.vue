<template>
  <div class="feature-decompose-container">
    <PageContainer>
      <div class="page-header">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <h2>Feature拆解工作台</h2>
      </div>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-card header="Feature信息">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Feature">{{ feature?.name }}</el-descriptions-item>
              <el-descriptions-item label="Epic">{{ epic?.name }}</el-descriptions-item>
              <el-descriptions-item label="故事点">{{ feature?.storyPoints }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card header="拆解SSTS" style="margin-top: 16px">
            <el-form :model="sstsForm" label-width="80px">
              <el-form-item label="SSTS标题">
                <el-input v-model="sstsForm.title" placeholder="输入SSTS标题" />
              </el-form-item>
              <el-form-item label="类型">
                <el-select v-model="sstsForm.type" style="width: 100%">
                  <el-option label="功能需求" value="functional" />
                  <el-option label="技术需求" value="technical" />
                </el-select>
              </el-form-item>
              <el-form-item label="优先级">
                <el-select v-model="sstsForm.priority" style="width: 100%">
                  <el-option label="P0" value="P0" />
                  <el-option label="P1" value="P1" />
                  <el-option label="P2" value="P2" />
                  <el-option label="P3" value="P3" />
                </el-select>
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="sstsForm.description" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="addSSTS">添加SSTS</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="16">
          <el-card header="已拆解SSTS列表">
            <el-table :data="sstsList" stripe style="width: 100%">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="title" label="标题" width="200" />
              <el-table-column label="类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.type === 'functional' ? 'primary' : 'warning'" size="small">
                    {{ row.type === 'functional' ? '功能' : '技术' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="90" />
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
              <el-table-column label="操作" width="150">
                <template #default="{ $index }">
                  <el-button link type="primary" size="small" @click="editSSTS($index)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="removeSSTS($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="actions" style="margin-top: 20px; text-align: right">
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
import { useFeatureStore } from '@/stores/modules/feature'
import { useEpicStore } from '@/stores/modules/epic'
import { useSSTSStore } from '@/stores/modules/ssts'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const route = useRoute()
const featureStore = useFeatureStore()
const epicStore = useEpicStore()
const sstsStore = useSSTSStore()

const featureId = route.params.id as string
const submitting = ref(false)

const feature = computed(() => featureStore.features.find(f => f.id === featureId))
const epic = computed(() => epicStore.epics.find(e => e.id === feature.value?.epicId))

const sstsForm = ref({
  title: '',
  type: 'functional',
  priority: 'P1',
  description: ''
})

const sstsList = ref<any[]>([])

const addSSTS = () => {
  if (!sstsForm.value.title) {
    ElMessage.warning('请输入SSTS标题')
    return
  }
  sstsList.value.push({ ...sstsForm.value })
  sstsForm.value = {
    title: '',
    type: 'functional',
    priority: 'P1',
    description: ''
  }
  ElMessage.success('添加成功')
}

const editSSTS = (index: number) => {
  sstsForm.value = { ...sstsList.value[index] }
  sstsList.value.splice(index, 1)
}

const removeSSTS = (index: number) => {
  sstsList.value.splice(index, 1)
  ElMessage.success('删除成功')
}

const submitDecompose = async () => {
  if (sstsList.value.length === 0) {
    ElMessage.warning('请至少添加一个SSTS')
    return
  }

  submitting.value = true
  try {
    for (const ssts of sstsList.value) {
      await sstsStore.createSSTS({
        ...ssts,
        featureId: featureId,
        code: `SSTS-${Date.now().toString().slice(-6)}`,
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
  await Promise.all([
    featureStore.fetchFeatures(),
    epicStore.fetchEpics()
  ])
})
</script>

<style scoped lang="scss">
.feature-decompose-container {
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
