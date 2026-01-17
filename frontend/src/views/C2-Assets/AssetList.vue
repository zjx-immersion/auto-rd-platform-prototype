<template>
  <PageContainer>
    <PageHeader title="资产库" description="查看和管理所有研发资产">
      <template #actions>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建资产
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总资产数" :value="assets.length" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已发布" :value="assetsByMaturity('已发布').length" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="测试中" :value="assetsByMaturity('测试中').length" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="开发中" :value="assetsByMaturity('开发中').length" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选 -->
    <el-card style="margin-bottom: 16px;">
      <el-form :inline="true">
        <el-form-item label="产品线">
          <el-select v-model="filters.productLineId" placeholder="全部" clearable style="width: 200px;">
            <el-option v-for="pl in productLines" :key="pl.id" :label="pl.name" :value="pl.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filters.type" placeholder="全部" clearable>
            <el-option label="算法模型" value="算法模型" />
            <el-option label="软件模块" value="软件模块" />
            <el-option label="硬件设计" value="硬件设计" />
          </el-select>
        </el-form-item>
        <el-form-item label="成熟度">
          <el-select v-model="filters.maturity" placeholder="全部" clearable>
            <el-option label="已发布" value="已发布" />
            <el-option label="测试中" value="测试中" />
            <el-option label="开发中" value="开发中" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 资产列表 -->
    <el-card>
      <el-table :data="filteredAssets" v-loading="loading">
        <el-table-column prop="code" label="资产编号" width="150" />
        <el-table-column prop="name" label="资产名称" min-width="200" />
        <el-table-column label="产品" width="150">
          <template #default="{ row }">
            {{ getProductName(row.productId) }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column label="成熟度" width="100">
          <template #default="{ row }">
            <el-tag :type="getMaturityType(row.maturity)">{{ row.maturity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="120">
          <template #default="{ row }">
            {{ row.owner }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link @click="handleView(row.id)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row.id)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useAssetStore } from '@/stores/modules/asset'
import { ElMessage } from 'element-plus'

const router = useRouter()
const assetStore = useAssetStore()

const loading = ref(false)
const filters = ref({
  productLineId: '',
  type: '',
  maturity: ''
})

const productLines = computed(() => assetStore.productLines)
const assets = computed(() => assetStore.assets)

const filteredAssets = computed(() => {
  let results = assets.value

  if (filters.value.productLineId) {
    const productIds = assetStore.productsByProductLine(filters.value.productLineId).map(p => p.id)
    results = results.filter(a => productIds.includes(a.productId))
  }

  if (filters.value.type) {
    results = results.filter(a => a.type === filters.value.type)
  }

  if (filters.value.maturity) {
    results = results.filter(a => a.maturity === filters.value.maturity)
  }

  return results
})

const assetsByMaturity = (maturity: string) => {
  return assets.value.filter(a => a.maturity === maturity)
}

const handleCreate = () => router.push('/function/c2/asset/create')
const handleView = (id: string) => router.push(`/function/c2/asset/${id}`)
const handleEdit = (id: string) => ElMessage.info('编辑功能待实现')
const handleDelete = (id: string) => ElMessage.info('删除功能待实现')

const getProductName = (productId: string) => {
  const product = assetStore.products.find(p => p.id === productId)
  return product?.name || productId
}

const getMaturityType = (maturity: string) => {
  const map: Record<string, any> = {
    '已发布': 'success',
    '测试中': 'warning',
    '开发中': 'info'
  }
  return map[maturity] || 'info'
}

const formatDate = (date: Date) => new Date(date).toLocaleDateString('zh-CN')

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      assetStore.fetchProductLines(),
      assetStore.fetchProducts(),
      assetStore.fetchAssets()
    ])
  } finally {
    loading.value = false
  }
})
</script>
