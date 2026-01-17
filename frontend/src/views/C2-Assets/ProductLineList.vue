<template>
  <PageContainer>
    <PageHeader title="产品线管理" description="管理产品线、产品和资产的组织结构">
      <template #actions>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建产品线
        </el-button>
      </template>
    </PageHeader>

    <el-card>
      <!-- 搜索筛选 -->
      <el-row :gutter="16" style="margin-bottom: 16px;">
        <el-col :span="8">
          <el-input v-model="searchKeyword" placeholder="搜索产品线..." clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 100%;">
            <el-option label="活跃" value="active" />
            <el-option label="归档" value="archived" />
          </el-select>
        </el-col>
      </el-row>

      <!-- 产品线表格 -->
      <el-table :data="filteredProductLines" v-loading="loading" style="width: 100%">
        <el-table-column prop="code" label="编号" width="120" />
        <el-table-column prop="name" label="产品线名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row)">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="250">
          <template #default="{ row }">
            <span class="text-secondary">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag>{{ getProductCount(row.id) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="120" />
        <el-table-column prop="createDate" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link size="small" @click="handleViewProducts(row)">
              <el-icon><FolderOpened /></el-icon>
              产品
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
        :total="filteredProductLines.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑产品线' : '创建产品线'"
      width="600px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="产品线编号" prop="code">
          <el-input v-model="form.code" placeholder="例如：PL-AD" />
        </el-form-item>
        <el-form-item label="产品线名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：智能驾驶产品线" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="产品线描述..."
          />
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="form.owner" placeholder="负责人姓名" />
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
import { useRouter } from 'vue-router'
import { Plus, Search, FolderOpened, Edit, Delete } from '@element-plus/icons-vue'
import { useAssetStore } from '@/stores/modules/asset'
import type { ProductLine } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const assetStore = useAssetStore()

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

const dialogVisible = ref(false)
const isEditing = ref(false)
const formRef = ref()
const form = ref<Partial<ProductLine>>({
  code: '',
  name: '',
  description: '',
  owner: ''
})

const rules = {
  code: [{ required: true, message: '请输入产品线编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入产品线名称', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
}

const productLines = computed(() => assetStore.productLines)

const filteredProductLines = computed(() => {
  return productLines.value.filter(pl => {
    if (searchKeyword.value && !pl.name.toLowerCase().includes(searchKeyword.value.toLowerCase())) {
      return false
    }
    // Note: status filter would need to be added to ProductLine type
    return true
  })
})

const getProductCount = (productLineId: string) => {
  return assetStore.products.filter(p => p.productLineId === productLineId).length
}

const handleCreate = () => {
  isEditing.value = false
  form.value = {
    code: '',
    name: '',
    description: '',
    owner: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: ProductLine) => {
  isEditing.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row: ProductLine) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品线"${row.name}"吗？这将同时删除该产品线下的所有产品和资产。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await assetStore.deleteProductLine(row.id)
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
      await assetStore.updateProductLine(form.value.id, form.value as ProductLine)
      ElMessage.success('更新成功')
    } else {
      await assetStore.createProductLine(form.value as ProductLine)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
  } finally {
    submitting.value = false
  }
}

const handleViewDetail = (row: ProductLine) => {
  router.push(`/function/c2/product/list?productLineId=${row.id}`)
}

const handleViewProducts = (row: ProductLine) => {
  router.push(`/function/c2/product/list?productLineId=${row.id}`)
}

onMounted(async () => {
  loading.value = true
  try {
    await assetStore.fetchProductLines()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.text-secondary {
  color: #909399;
}
</style>
