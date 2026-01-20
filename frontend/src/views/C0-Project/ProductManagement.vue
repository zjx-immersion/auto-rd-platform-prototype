<template>
  <div class="product-management-container">
    <PageContainer>
      <!-- 页面标题 -->
      <div class="page-header">
        <div>
          <h2>产品管理 - {{ projectName }}</h2>
          <p class="description">管理项目下的产品和版本</p>
        </div>
        <el-button type="primary" :icon="Plus" @click="handleCreateProduct">
          新建产品
        </el-button>
      </div>

      <!-- 产品列表 -->
      <div class="product-list">
        <el-row :gutter="20">
          <el-col
            v-for="product in productList"
            :key="product.productId"
            :span="8"
          >
            <el-card class="product-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <div>
                    <h3>{{ product.productName }}</h3>
                    <el-tag size="small">{{ product.productCode }}</el-tag>
                  </div>
                  <el-dropdown>
                    <el-icon><MoreFilled /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handleEditProduct(product)">编辑</el-dropdown-item>
                        <el-dropdown-item @click="handleDeleteProduct(product)" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>

              <div class="product-info">
                <div class="info-row">
                  <span class="label">产品线:</span>
                  <el-tag size="small" type="info">{{ getProductLineName(product.productLine) }}</el-tag>
                </div>
                <div class="info-row">
                  <span class="label">负责人:</span>
                  <span>{{ product.productOwner.userName }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Epic数:</span>
                  <el-tag size="small">{{ product.stats.totalEpics }}</el-tag>
                </div>
                <div class="info-row">
                  <span class="label">总SP:</span>
                  <el-tag size="small">{{ product.stats.totalSP }}</el-tag>
                </div>
                <div class="info-row">
                  <span class="label">版本数:</span>
                  <el-tag size="small" type="success">{{ product.stats.totalVersions }}</el-tag>
                </div>
              </div>

              <div class="card-actions">
                <el-button type="primary" text @click="handleViewProduct(product)">
                  查看详情
                </el-button>
                <el-button type="primary" text @click="handleVersionPlanning(product)">
                  版本规划
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="productList.length === 0" description="暂无产品,请创建产品">
          <el-button type="primary" @click="handleCreateProduct">创建产品</el-button>
        </el-empty>
      </div>
    </PageContainer>

    <!-- 创建/编辑产品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="formData.productName" placeholder="例如: ADAS ECU" />
        </el-form-item>
        
        <el-form-item label="产品编码" prop="productCode">
          <el-input v-model="formData.productCode" placeholder="例如: ADAS-ECU-V1" />
        </el-form-item>

        <el-form-item label="产品线" prop="productLine">
          <el-select v-model="formData.productLine" placeholder="选择产品线" style="width: 100%">
            <el-option label="智能驾驶" value="adas" />
            <el-option label="智能座舱" value="cabin" />
            <el-option label="电子电器架构" value="eea" />
            <el-option label="底盘域" value="chassis" />
            <el-option label="新能源" value="power" />
          </el-select>
        </el-form-item>

        <el-form-item label="产品负责人" prop="productOwnerId">
          <el-select v-model="formData.productOwnerId" placeholder="选择负责人" style="width: 100%">
            <el-option
              v-for="user in users"
              :key="user.userId"
              :label="user.userName"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="产品描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MoreFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useDomainProductStore } from '@/stores/modules/domain-product'
import { useProjectStore } from '@/stores/modules/project'
import { useUserStore } from '@/stores/modules/user'
import type { ProductLine } from '@/types/domain-models'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const route = useRoute()
const productStore = useDomainProductStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

const projectId = ref(route.params.projectId as string)

// 数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建产品')
const formRef = ref<FormInstance>()
const currentEditId = ref<string>()

// 表单数据
const formData = ref({
  productName: '',
  productCode: '',
  productLine: '' as ProductLine,
  productOwnerId: '',
  description: '',
  allocatedEpicIds: [] as string[]
})

const formRules: FormRules = {
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  productCode: [{ required: true, message: '请输入产品编码', trigger: 'blur' }],
  productLine: [{ required: true, message: '请选择产品线', trigger: 'change' }],
  productOwnerId: [{ required: true, message: '请选择负责人', trigger: 'change' }]
}

// 计算属性
const productList = computed(() => productStore.getProductsByProjectId(projectId.value))
const users = computed(() => userStore.users || [])
const projectName = computed(() => {
  const project = projectStore.projects.find(p => p.id === projectId.value)
  return project?.name || ''
})

// 辅助函数
const getProductLineName = (line: ProductLine) => {
  const map: Record<ProductLine, string> = {
    adas: '智能驾驶',
    cabin: '智能座舱',
    eea: '电子电器架构',
    chassis: '底盘域',
    power: '新能源'
  }
  return map[line] || line
}

// 事件处理
const handleCreateProduct = () => {
  dialogTitle.value = '新建产品'
  currentEditId.value = undefined
  formData.value = {
    productName: '',
    productCode: '',
    productLine: '' as ProductLine,
    productOwnerId: '',
    description: '',
    allocatedEpicIds: []
  }
  dialogVisible.value = true
}

const handleEditProduct = (product: any) => {
  dialogTitle.value = '编辑产品'
  currentEditId.value = product.productId
  formData.value = {
    productName: product.productName,
    productCode: product.productCode,
    productLine: product.productLine,
    productOwnerId: product.productOwner.userId,
    description: product.description,
    allocatedEpicIds: product.allocatedEpicIds
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (currentEditId.value) {
        await productStore.updateProduct(currentEditId.value, formData.value)
        ElMessage.success('更新成功')
      } else {
        await productStore.createProduct({
          ...formData.value,
          projectId: projectId.value
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
    } catch (error) {
      ElMessage.error('操作失败')
      console.error(error)
    } finally {
      submitting.value = false
    }
  })
}

const handleDeleteProduct = async (product: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品"${product.productName}"吗？`,
      '确认删除',
      { type: 'warning' }
    )
    await productStore.deleteProduct(product.productId)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

const handleViewProduct = (product: any) => {
  router.push(`/function/c0-project/product/${product.productId}`)
}

const handleVersionPlanning = (product: any) => {
  router.push(`/function/c0-project/product/${product.productId}/version/create`)
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      productStore.fetchProductsByProject(projectId.value),
      projectStore.fetchProjects()
    ])
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.product-management-container {
  height: 100%;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .description {
    margin: 0;
    font-size: 14px;
    color: $text-color-secondary;
  }
}

.product-list {
  .product-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .product-info {
      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .label {
          width: 80px;
          color: $text-color-secondary;
          font-size: 14px;
        }
      }
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid $border-color-base;
    }
  }
}
</style>
