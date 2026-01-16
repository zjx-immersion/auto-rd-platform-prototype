<template>
  <PageContainer>
    <template #header>
      <PageHeader
        title="资产推荐"
        description="基于需求智能推荐合适的产品资产"
      />
    </template>

    <el-card>
      <el-form :model="form" label-width="100px">
        <el-form-item label="需求描述">
          <el-input 
            v-model="form.requirement" 
            type="textarea"
            :rows="4"
            placeholder="请详细描述您的需求，系统将智能推荐合适的资产"
          />
        </el-form-item>
        <el-form-item label="目标领域">
          <el-select v-model="form.domain" placeholder="请选择">
            <el-option label="智能驾驶" value="intelligent-driving" />
            <el-option label="智能座舱" value="smart-cockpit" />
            <el-option label="车身控制" value="body-control" />
            <el-option label="动力系统" value="powertrain" />
          </el-select>
        </el-form-item>
        <el-form-item label="功能类型">
          <el-checkbox-group v-model="form.functionTypes">
            <el-checkbox label="感知" />
            <el-checkbox label="决策" />
            <el-checkbox label="控制" />
            <el-checkbox label="交互" />
            <el-checkbox label="通信" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRecommend" :loading="loading">
            <el-icon><MagicStick /></el-icon>
            智能推荐
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="recommendations.length > 0" style="margin-top: 20px">
      <div class="recommendation-header">
        <h3>推荐结果</h3>
        <span class="result-info">为您找到 {{ recommendations.length }} 个匹配资产</span>
      </div>

      <div class="recommendation-list">
        <el-card 
          v-for="(item, index) in recommendations" 
          :key="item.id"
          class="recommendation-item"
          shadow="hover"
        >
          <div class="item-header">
            <div class="item-title-row">
              <el-badge :value="index + 1" type="primary" class="rank-badge">
                <el-icon class="item-icon"><Box /></el-icon>
              </el-badge>
              <span class="item-title">{{ item.name }}</span>
              <el-progress 
                :percentage="item.matchScore" 
                :color="getScoreColor(item.matchScore)"
                :stroke-width="20"
                text-inside
                class="match-score"
              />
            </div>
            <div class="item-meta">
              <el-tag size="small">{{ item.type }}</el-tag>
              <el-tag size="small" type="info">{{ item.domain }}</el-tag>
              <span class="reuse-info">已复用 {{ item.reuseCount }} 次</span>
            </div>
          </div>

          <div class="item-content">
            <div class="item-description">{{ item.description }}</div>
            
            <div class="match-reasons">
              <div class="reasons-title">匹配原因:</div>
              <el-tag 
                v-for="reason in item.matchReasons" 
                :key="reason"
                size="small"
                type="success"
                effect="plain"
              >
                <el-icon><Check /></el-icon>
                {{ reason }}
              </el-tag>
            </div>

            <div class="item-features">
              <div class="features-title">核心能力:</div>
              <ul>
                <li v-for="feature in item.features" :key="feature">{{ feature }}</li>
              </ul>
            </div>
          </div>

          <div class="item-actions">
            <el-button size="small" @click="handleViewDetail(item)">
              查看详情
            </el-button>
            <el-button size="small" type="success" @click="handleSelectAsset(item)">
              选择使用
            </el-button>
            <el-button size="small" @click="handleCompare(item)">
              加入对比
            </el-button>
          </div>
        </el-card>
      </div>
    </el-card>

    <el-empty 
      v-else-if="searched && !loading"
      description="暂无推荐结果，请尝试调整需求描述"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MagicStick, Box, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const searched = ref(false)

const form = ref({
  requirement: '',
  domain: '',
  functionTypes: []
})

interface Recommendation {
  id: string
  name: string
  type: string
  domain: string
  matchScore: number
  reuseCount: number
  description: string
  matchReasons: string[]
  features: string[]
}

const recommendations = ref<Recommendation[]>([])

function getScoreColor(score: number) {
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
}

async function handleRecommend() {
  if (!form.value.requirement) {
    ElMessage.warning('请输入需求描述')
    return
  }

  loading.value = true
  searched.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    recommendations.value = [
      {
        id: 'asset1',
        name: '自适应巡航控制(ACC)',
        type: '特性资产',
        domain: '智能驾驶',
        matchScore: 95,
        reuseCount: 12,
        description: '完整的ACC功能实现，支持全速域自适应巡航，包含多种驾驶场景适配',
        matchReasons: ['功能高度匹配', '领域完全一致', '成熟度高', '复用率高'],
        features: [
          '全速域自适应巡航',
          '多目标跟踪',
          '自动减速与加速',
          '与导航系统集成',
          '支持车道变更辅助'
        ]
      },
      {
        id: 'asset2',
        name: '车道保持辅助(LKA)',
        type: '特性资产',
        domain: '智能驾驶',
        matchScore: 88,
        reuseCount: 10,
        description: 'LKA功能模块，实现车道居中和车道偏离预警，支持多种车型配置',
        matchReasons: ['功能相关度高', '领域匹配', '已验证'],
        features: [
          '车道线识别',
          '车道居中控制',
          '车道偏离预警',
          '方向盘力矩控制',
          '与AEB系统联动'
        ]
      },
      {
        id: 'asset3',
        name: '智能驾驶基础平台',
        type: '产品资产',
        domain: '智能驾驶',
        matchScore: 82,
        reuseCount: 8,
        description: '完整的智能驾驶基础平台，包含感知、决策、控制全栈能力',
        matchReasons: ['平台级支持', '功能覆盖全面', '架构成熟'],
        features: [
          '多传感器融合',
          '环境感知',
          '路径规划',
          '车辆控制',
          'OTA升级支持'
        ]
      }
    ]
    
    ElMessage.success('推荐完成')
  } catch (error) {
    ElMessage.error('推荐失败')
  } finally {
    loading.value = false
  }
}

function handleReset() {
  form.value = {
    requirement: '',
    domain: '',
    functionTypes: []
  }
  recommendations.value = []
  searched.value = false
}

function handleViewDetail(item: Recommendation) {
  router.push(`/function/c2/asset/detail/${item.id}`)
}

function handleSelectAsset(item: Recommendation) {
  ElMessage.success(`已选择资产: ${item.name}`)
}

function handleCompare(item: Recommendation) {
  ElMessage.info(`已加入对比: ${item.name}`)
}
</script>

<style scoped lang="scss">
.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
  }
  
  .result-info {
    color: #909399;
    font-size: 14px;
  }
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recommendation-item {
  .item-header {
    margin-bottom: 16px;
    
    .item-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      
      .rank-badge {
        :deep(.el-badge__content) {
          font-size: 14px;
          font-weight: bold;
        }
      }
      
      .item-icon {
        font-size: 24px;
        color: #409EFF;
      }
      
      .item-title {
        flex: 1;
        font-size: 18px;
        font-weight: 500;
      }
      
      .match-score {
        width: 200px;
      }
    }
    
    .item-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: 56px;
      
      .reuse-info {
        font-size: 13px;
        color: #909399;
      }
    }
  }
  
  .item-content {
    margin-bottom: 16px;
    
    .item-description {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    .match-reasons {
      margin-bottom: 16px;
      
      .reasons-title {
        font-size: 13px;
        font-weight: 500;
        color: #606266;
        margin-bottom: 8px;
      }
      
      .el-tag {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }
    
    .item-features {
      .features-title {
        font-size: 13px;
        font-weight: 500;
        color: #606266;
        margin-bottom: 8px;
      }
      
      ul {
        margin: 0;
        padding-left: 20px;
        
        li {
          font-size: 13px;
          color: #606266;
          line-height: 1.8;
        }
      }
    }
  }
  
  .item-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #EBEEF5;
  }
}
</style>
