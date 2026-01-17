<template>
  <PageContainer>
    <PageHeader title="产品管理" description="管理产品和关联的资产">
      <template #actions>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建产品
        </el-button>
      </template>
    </PageHeader>

    <el-card>
      <!-- 筛选栏 -->
      <el-row :gutter="16" style="margin-bottom: 16px;">
        <el-col :span="6">
          <el-select v-model="filterProductLineId" placeholder="选择产品线" clearable style="width: 100%;" @change="loadProducts">
            <el-option
              v-for="pl in productLines"
              :key="pl.id"
              :label="pl.name"
              :value="pl.id"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 100%;">
            <el-option label="规划中" value="planning" />
            <el-option label="开发中" value="developing" />
            <el-option label="已发布" value="released" />
            <el-option label="已废弃" value="deprecated" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input v-model="searchKeyword" placeholder="搜索产品..." clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>

      <!-- 产品表格 -->
      <el-table :data="paginatedProducts" v-loading="loading" style="width: 100%">
        <el-table-column prop="code" label="产品编号" width="120" />
        <el-table-column prop="name" label="产品名称" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row)">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="产品线" width="150">
          <template #default="{ row }">
            {{ getProductLineName(row.productLineId) }}
          </template>
        </el-table-column>
        <el-table-column prop="domain" label="领域" width="120" />
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Feature数量" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ getFeatureCount(row.id) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="资产数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success">{{ getAssetCount(row.id) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link size="small" @click="handleViewAssets(row)">
              <el-icon><Files /></el-icon>
              资产
            </el-button>
            <el-button link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button link size="small" type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredProducts.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑产品' : '创建产品'"
      width="600px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="产品编号" prop="code">
          <el-input v-model="form.code" placeholder="例如：P-HAP" />
        </el-form-item>
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：高速领航辅助" />
        </el-form-item>
        <el-form-item label="产品线" prop="productLineId">
          <el-select v-model="form.productLineId" placeholder="选择产品线" style="width: 100%;">
            <el-option
              v-for="pl in productLines"
              :key="pl.id"
              :label="pl.name"
              :value="pl.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="领域">
          <el-input v-model="form.domain" placeholder="例如：智能驾驶" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="form.version" placeholder="例如：V2.0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="产品描述..."
          />
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="form.owner" placeholder="负责人姓名" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="选择状态" style="width: 100%;">
            <el-option label="规划中" value="planning" />
            <el-option label="开发中" value="developing" />
            <el-option label="已发布" value="released" />
            <el-option label="已废弃" value="deprecated" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Plus, Search, Files, Edit, Delete } from '@element-plus/icons-vue'
import { useAssetStore } from '@/stores/modules/asset'
import { useFeatureStore } from '@/stores/modules/feature'
import type { Product } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const assetStore = useAssetStore()
const featureStore = useFeatureStore()

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const filterProductLineId = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

const dialogVisible = ref(false)
const isEditing = ref(false)
const formRef = ref()
const form = ref<Partial<Product>>({
  code: '',
  name: '',
  productLineId: '',
  domain: '',
  version: '',
  description: '',
  owner: '',
  status: 'planning'
})

const rules = {
  code: [{ required: true, message: '请输入产品编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  productLineId: [{ required: true, message: '请选择产品线', trigger: 'change' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
}

const productLines = computed(() => assetStore.productLines)
const products = computed(() => assetStore.products)

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    if (filterProductLineId.value && p.productLineId !== filterProductLineId.value) return false
    if (filterStatus.value && p.status !== filterStatus.value) return false
    if (searchKeyword.value && !p.name.toLowerCase().includes(searchKeyword.value.toLowerCase())) return false
    return true
  })
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

const getProductLineName = (productLineId: string) => {
  const pl = productLines.value.find(p => p.id === productLineId)
  return pl?.name || productLineId
}

const getFeatureCount = (productId: string) => {
  return featureStore.features.filter(f => f.product === productId).length
}

const getAssetCount = (productId: string) => {
  return assetStore.assets.filter(a => a.productId === productId).length
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    planning: 'info',
    developing: 'warning',
    released: 'success',
    deprecated: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    planning: '规划中',
    developing: '开发中',
    released: '已发布',
    deprecated: '已废弃'
  }
  return map[status] || status
}

const handleCreate = () => {
  isEditing.value = false
  form.value = {
    code: '',
    name: '',
    productLineId: filterProductLineId.value || '',
    domain: '',
    version: '',
    description: '',
    owner: '',
    status: 'planning'
  }
  dialogVisible.value = true
}

const handleEdit = (row: Product) => {
  isEditing.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品"${row.name}"吗？这将同时删除该产品下的所有资产。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await assetStore.deleteProduct(row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    // User cancelled
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEditing.value && form.value.id) {
      await assetStore.updateProduct(form.value.id, form.value as Product)
      ElMessage.success('更新成功')
    } else {
      await assetStore.createProduct(form.value as Product)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
  } finally {
    submitting.value = false
  }
}

const handleViewDetail = (row: Product) => {
  router.push(`/function/c2/asset/list?productId=${row.id}`)
}

const handleViewAssets = (row: Product) => {
  router.push(`/function/c2/asset/list?productId=${row.id}`)
}

const loadProducts = async () => {
  loading.value = true
  try {
    await assetStore.fetchProducts()
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      assetStore.fetchProductLines(),
      assetStore.fetchProducts(),
      featureStore.fetchFeatures()
    ])
    
    // 从URL参数获取产品线ID
    if (route.query.productLineId) {
      filterProductLineId.value = route.query.productLineId as string
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
</style>
