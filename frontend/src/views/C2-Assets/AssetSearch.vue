<template>
  <PageContainer>
    <template #header>
      <PageHeader
        title="资产搜索"
        description="智能搜索可复用的产品资产"
      />
    </template>

    <el-card class="search-card">
      <el-form :model="searchForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="关键词">
              <el-input 
                v-model="searchForm.keyword" 
                placeholder="输入资产名称、标签或描述"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="资产类型">
              <el-select v-model="searchForm.type" placeholder="请选择" clearable>
                <el-option label="产品资产" value="product" />
                <el-option label="特性资产" value="feature" />
                <el-option label="模块资产" value="module" />
                <el-option label="组件资产" value="component" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="领域">
              <el-select v-model="searchForm.domain" placeholder="请选择" clearable>
                <el-option label="智能驾驶" value="intelligent-driving" />
                <el-option label="智能座舱" value="smart-cockpit" />
                <el-option label="车身控制" value="body-control" />
                <el-option label="动力系统" value="powertrain" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch" style="width: 100%">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="标签">
              <el-select v-model="searchForm.tags" placeholder="选择标签" multiple clearable>
                <el-option label="高复用" value="high-reuse" />
                <el-option label="已验证" value="verified" />
                <el-option label="推荐" value="recommended" />
                <el-option label="新功能" value="new" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="成熟度">
              <el-select v-model="searchForm.maturity" placeholder="请选择" clearable>
                <el-option label="稳定" value="stable" />
                <el-option label="成熟" value="mature" />
                <el-option label="试验" value="experimental" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button @click="handleReset" style="width: 100%">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card v-loading="loading" style="margin-top: 20px">
      <div class="search-result-header">
        <span class="result-count">找到 {{ pagination.total }} 个资产</span>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="list">列表</el-radio-button>
          <el-radio-button value="card">卡片</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 列表视图 -->
      <el-table v-if="viewMode === 'list'" :data="tableData" style="margin-top: 20px">
        <el-table-column prop="name" label="资产名称" width="250">
          <template #default="{ row }">
            <div class="asset-name">
              <el-icon class="asset-icon"><Box /></el-icon>
              <el-link type="primary" @click="handleView(row)">{{ row.name }}</el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="domain" label="领域" width="150" />
        <el-table-column prop="reuseCount" label="复用次数" width="100" align="center" />
        <el-table-column prop="maturity" label="成熟度" width="100">
          <template #default="{ row }">
            <el-rate v-model="row.maturity" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="200">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags" :key="tag" size="small" style="margin-right: 5px">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="success" @click="handleUse(row)">
              使用
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 卡片视图 -->
      <div v-else class="card-view">
        <el-row :gutter="20">
          <el-col :span="8" v-for="item in tableData" :key="item.id">
            <el-card class="asset-card" shadow="hover">
              <div class="card-header">
                <el-icon class="card-icon"><Box /></el-icon>
                <span class="card-title">{{ item.name }}</span>
              </div>
              <div class="card-meta">
                <el-tag size="small">{{ item.type }}</el-tag>
                <span class="reuse-count">复用 {{ item.reuseCount }} 次</span>
              </div>
              <div class="card-description">{{ item.description }}</div>
              <div class="card-tags">
                <el-tag v-for="tag in item.tags" :key="tag" size="small">{{ tag }}</el-tag>
              </div>
              <div class="card-actions">
                <el-button size="small" @click="handleView(item)">查看详情</el-button>
                <el-button size="small" type="success" @click="handleUse(item)">立即使用</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Box } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const viewMode = ref('list')

const searchForm = ref({
  keyword: '',
  type: '',
  domain: '',
  tags: [],
  maturity: ''
})

interface Asset {
  id: string
  name: string
  type: string
  domain: string
  reuseCount: number
  maturity: number
  tags: string[]
  description: string
}

const tableData = ref<Asset[]>([])

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

async function handleSearch() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      {
        id: 'asset1',
        name: '自适应巡航控制(ACC)',
        type: '特性资产',
        domain: '智能驾驶',
        reuseCount: 12,
        maturity: 5,
        tags: ['高复用', '已验证', '推荐'],
        description: '完整的ACC功能实现，包含多场景适配'
      },
      {
        id: 'asset2',
        name: '车道保持辅助(LKA)',
        type: '特性资产',
        domain: '智能驾驶',
        reuseCount: 10,
        maturity: 5,
        tags: ['高复用', '已验证'],
        description: 'LKA功能模块，支持多种车型'
      },
      {
        id: 'asset3',
        name: '语音助手基础库',
        type: '模块资产',
        domain: '智能座舱',
        reuseCount: 8,
        maturity: 4,
        tags: ['推荐', '已验证'],
        description: '通用语音助手基础功能库'
      },
      {
        id: 'asset4',
        name: '手势识别组件',
        type: '组件资产',
        domain: '智能座舱',
        reuseCount: 5,
        maturity: 3,
        tags: ['新功能'],
        description: '多种手势识别算法组件'
      }
    ]
    pagination.value.total = 4
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

function handleReset() {
  searchForm.value = {
    keyword: '',
    type: '',
    domain: '',
    tags: [],
    maturity: ''
  }
  handleSearch()
}

function handleView(row: Asset) {
  router.push(`/function/c2/asset/detail/${row.id}`)
}

function handleUse(row: Asset) {
  ElMessage.success(`已添加资产: ${row.name}`)
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped lang="scss">
.search-card {
  margin-bottom: 20px;
}

.search-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .result-count {
    font-weight: 500;
    color: #606266;
  }
}

.asset-name {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .asset-icon {
    color: #409EFF;
  }
}

.card-view {
  margin-top: 20px;
}

.asset-card {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .card-icon {
      font-size: 20px;
      color: #409EFF;
    }
    
    .card-title {
      font-size: 16px;
      font-weight: 500;
    }
  }
  
  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .reuse-count {
      font-size: 12px;
      color: #909399;
    }
  }
  
  .card-description {
    font-size: 13px;
    color: #606266;
    margin-bottom: 12px;
    line-height: 1.5;
    min-height: 40px;
  }
  
  .card-tags {
    display: flex;
    gap: 5px;
    margin-bottom: 12px;
    min-height: 24px;
  }
  
  .card-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
