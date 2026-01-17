<template>
  <PageContainer>
    <PageHeader title="资产搜索" description="AI驱动的智能资产搜索与推荐" />

    <!-- 搜索区 -->
    <el-card style="margin-bottom: 16px;">
      <el-input
        v-model="searchQuery"
        placeholder="输入关键词、技术栈或功能描述搜索资产..."
        size="large"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </template>
      </el-input>

      <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
        <span style="color: #909399;">热门搜索：</span>
        <el-tag v-for="tag in hotTags" :key="tag" @click="searchQuery = tag; handleSearch()" style="cursor: pointer;">
          {{ tag }}
        </el-tag>
      </div>
    </el-card>

    <!-- 筛选条件 -->
    <el-card style="margin-bottom: 16px;">
      <el-form :inline="true">
        <el-form-item label="产品线">
          <el-select v-model="filters.productLineId" placeholder="全部" clearable style="width: 200px;">
            <el-option v-for="pl in productLines" :key="pl.id" :label="pl.name" :value="pl.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品">
          <el-select v-model="filters.productId" placeholder="全部" clearable style="width: 200px;">
            <el-option v-for="p in filteredProducts" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="资产类型">
          <el-select v-model="filters.type" placeholder="全部" clearable>
            <el-option label="算法模型" value="算法模型" />
            <el-option label="软件模块" value="软件模块" />
            <el-option label="硬件设计" value="硬件设计" />
            <el-option label="测试用例" value="测试用例" />
            <el-option label="文档模板" value="文档模板" />
          </el-select>
        </el-form-item>
        <el-form-item label="成熟度">
          <el-select v-model="filters.maturity" placeholder="全部" clearable>
            <el-option label="已发布" value="已发布" />
            <el-option label="测试中" value="测试中" />
            <el-option label="开发中" value="开发中" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 搜索结果 -->
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>搜索结果 ({{ searchResults.length }})</span>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="list">列表</el-radio-button>
            <el-radio-button label="card">卡片</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-empty v-if="searchResults.length === 0" description="暂无搜索结果" />

      <!-- 列表视图 -->
      <el-table v-if="viewMode === 'list'" :data="searchResults" v-loading="loading">
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
        <el-table-column label="匹配度" width="100" sortable>
          <template #default="{ row }">
            <el-progress :percentage="row.matchScore || 0" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link @click="handleView(row.id)">查看</el-button>
            <el-button link type="primary" @click="handleUse(row.id)">使用</el-button>
            <el-button link>对比</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 卡片视图 -->
      <el-row v-else :gutter="16">
        <el-col v-for="asset in searchResults" :key="asset.id" :span="8" style="margin-bottom: 16px;">
          <el-card shadow="hover" :body-style="{ padding: '16px' }">
            <div style="margin-bottom: 12px;">
              <h3 style="margin: 0 0 8px 0;">{{ asset.name }}</h3>
              <el-tag size="small">{{ asset.type }}</el-tag>
              <el-tag size="small" style="margin-left: 8px;" :type="getMaturityType(asset.maturity)">
                {{ asset.maturity }}
              </el-tag>
            </div>
            <div style="color: #606266; font-size: 14px; margin-bottom: 12px;">
              {{ asset.description }}
            </div>
            <div style="margin-bottom: 12px;">
              <el-tag v-for="tag in asset.tags" :key="tag" size="small" style="margin-right: 4px;">
                {{ tag }}
              </el-tag>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: #909399;">匹配度: {{ asset.matchScore || 0 }}%</span>
              <div>
                <el-button size="small" @click="handleView(asset.id)">查看</el-button>
                <el-button size="small" type="primary" @click="handleUse(asset.id)">使用</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useAssetStore } from '@/stores/modules/asset'
import { ElMessage } from 'element-plus'

const router = useRouter()
const assetStore = useAssetStore()

const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref('list')

const filters = ref({
  productLineId: '',
  productId: '',
  type: '',
  maturity: ''
})

const hotTags = ['感知算法', '决策模块', 'HMI组件', '测试框架', 'CAN通信']

const productLines = computed(() => assetStore.productLines)
const filteredProducts = computed(() => {
  if (!filters.value.productLineId) return assetStore.products
  return assetStore.productsByProductLine(filters.value.productLineId)
})

const searchResults = computed(() => {
  let results = assetStore.assets

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(a =>
      a.name.toLowerCase().includes(query) ||
      a.code.toLowerCase().includes(query) ||
      a.description?.toLowerCase().includes(query)
    )
  }

  if (filters.value.productId) {
    results = results.filter(a => a.productId === filters.value.productId)
  }

  if (filters.value.type) {
    results = results.filter(a => a.type === filters.value.type)
  }

  if (filters.value.maturity) {
    results = results.filter(a => a.maturity === filters.value.maturity)
  }

  // 添加模拟的匹配度
  return results.map(a => ({
    ...a,
    matchScore: Math.floor(Math.random() * 30) + 70
  }))
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success(`找到 ${searchResults.value.length} 个资产`)
  }, 500)
}

const handleReset = () => {
  searchQuery.value = ''
  filters.value = {
    productLineId: '',
    productId: '',
    type: '',
    maturity: ''
  }
}

const handleView = (id: string) => {
  router.push(`/function/c2/asset/${id}`)
}

const handleUse = (id: string) => {
  ElMessage.success('资产已添加到复用清单')
}

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
