<template>
  <PageContainer>
    <PageHeader title="PI回顾会议" :description="`PI: ${pi?.name || ''}`">
      <template #actions>
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="handleExport">导出报告</el-button>
      </template>
    </PageHeader>

    <el-row :gutter="20">
      <el-col :span="16">
        <!-- What went well -->
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <div>
                <el-icon color="#67c23a" size="20"><CircleCheck /></el-icon>
                <span style="margin-left: 8px;">What went well（做得好的）</span>
              </div>
              <el-button size="small" @click="addItem('wentWell')">添加</el-button>
            </div>
          </template>
          <div class="review-list">
            <el-card
              v-for="item in reviewData.wentWell"
              :key="item.id"
              shadow="hover"
              class="review-item"
            >
              <div class="item-content">
                {{ item.content }}
              </div>
              <div class="item-meta">
                <span class="item-author">{{ item.author }}</span>
                <el-button link size="small" type="danger" @click="removeItem('wentWell', item.id)">
                  删除
                </el-button>
              </div>
            </el-card>
            <el-empty v-if="reviewData.wentWell.length === 0" description="暂无记录" />
          </div>
        </el-card>

        <!-- To improve -->
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <div>
                <el-icon color="#e6a23c" size="20"><Warning /></el-icon>
                <span style="margin-left: 8px;">To improve（待改进的）</span>
              </div>
              <el-button size="small" @click="addItem('toImprove')">添加</el-button>
            </div>
          </template>
          <div class="review-list">
            <el-card
              v-for="item in reviewData.toImprove"
              :key="item.id"
              shadow="hover"
              class="review-item"
            >
              <div class="item-content">
                {{ item.content }}
              </div>
              <div class="item-meta">
                <span class="item-author">{{ item.author }}</span>
                <el-button link size="small" type="danger" @click="removeItem('toImprove', item.id)">
                  删除
                </el-button>
              </div>
            </el-card>
            <el-empty v-if="reviewData.toImprove.length === 0" description="暂无记录" />
          </div>
        </el-card>

        <!-- Action items -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <div>
                <el-icon color="#409eff" size="20"><Flag /></el-icon>
                <span style="margin-left: 8px;">Action items（行动计划）</span>
              </div>
              <el-button size="small" @click="addActionItem">添加</el-button>
            </div>
          </template>
          <el-table :data="reviewData.actionItems" stripe>
            <el-table-column prop="content" label="行动项" min-width="250" />
            <el-table-column prop="owner" label="负责人" width="120" />
            <el-table-column prop="dueDate" label="截止日期" width="150" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getActionStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link size="small" @click="editActionItem(row)">编辑</el-button>
                <el-button link size="small" type="danger" @click="removeActionItem(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- PI总结 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>PI总结</span>
            </div>
          </template>
          <el-form label-width="100px" size="small">
            <el-form-item label="完成率">
              <el-progress :percentage="piSummary.completion" />
            </el-form-item>
            <el-form-item label="Feature完成">
              {{ piSummary.completedFeatures }} / {{ piSummary.totalFeatures }}
            </el-form-item>
            <el-form-item label="Story Points">
              {{ piSummary.completedSP }} / {{ piSummary.totalSP }} SP
            </el-form-item>
            <el-form-item label="平均速率">
              {{ piSummary.avgVelocity }} SP/周
            </el-form-item>
            <el-form-item label="团队满意度">
              <el-rate v-model="piSummary.satisfaction" />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 关键指标 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>关键指标</span>
            </div>
          </template>
          <div class="metrics-list">
            <div class="metric-item">
              <span class="metric-label">做得好</span>
              <el-tag type="success">{{ reviewData.wentWell.length }}</el-tag>
            </div>
            <div class="metric-item">
              <span class="metric-label">待改进</span>
              <el-tag type="warning">{{ reviewData.toImprove.length }}</el-tag>
            </div>
            <div class="metric-item">
              <span class="metric-label">行动项</span>
              <el-tag type="primary">{{ reviewData.actionItems.length }}</el-tag>
            </div>
          </div>
        </el-card>

        <!-- 参与人员 -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>参与人员</span>
            </div>
          </template>
          <el-tag
            v-for="participant in participants"
            :key="participant"
            style="margin: 4px;"
          >
            {{ participant }}
          </el-tag>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加review item对话框 -->
    <el-dialog v-model="showItemDialog" :title="dialogTitle" width="600px">
      <el-input
        v-model="itemContent"
        type="textarea"
        :rows="4"
        placeholder="请输入内容..."
      />
      <template #footer>
        <el-button @click="showItemDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddItem">添加</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑action item对话框 -->
    <el-dialog v-model="showActionDialog" :title="isEditAction ? '编辑行动项' : '添加行动项'" width="600px">
      <el-form :model="actionForm" label-width="100px">
        <el-form-item label="行动项">
          <el-input v-model="actionForm.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="actionForm.owner" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="actionForm.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="状态" v-if="isEditAction">
          <el-select v-model="actionForm.status" style="width: 100%;">
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showActionDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAction">保存</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheck, Warning, Flag } from '@element-plus/icons-vue'
import { usePIStore } from '@/stores/modules/pi'
import PageContainer from '@/components/Common/PageContainer.vue'
import PageHeader from '@/components/Common/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const piStore = usePIStore()

const piId = computed(() => route.params.id as string)
const pi = computed(() => piStore.currentPI)

const showItemDialog = ref(false)
const showActionDialog = ref(false)
const isEditAction = ref(false)
const currentItemType = ref<'wentWell' | 'toImprove'>('wentWell')
const itemContent = ref('')

const dialogTitle = computed(() => {
  return currentItemType.value === 'wentWell' ? '添加做得好的' : '添加待改进的'
})

// 模拟回顾数据
const reviewData = ref({
  wentWell: [
    { id: '1', content: '团队协作良好，沟通效率高', author: '张三' },
    { id: '2', content: 'PI Planning充分，目标明确', author: '李四' },
  ],
  toImprove: [
    { id: '1', content: '代码审查流程需要优化', author: '王五' },
    { id: '2', content: '测试环境不稳定', author: '赵六' },
  ],
  actionItems: [
    {
      id: '1',
      content: '建立代码审查checklist',
      owner: '王五',
      dueDate: '2026-02-01',
      status: 'pending',
    },
    {
      id: '2',
      content: '升级测试环境服务器',
      owner: '赵六',
      dueDate: '2026-02-15',
      status: 'in-progress',
    },
  ],
})

const actionForm = ref({
  id: '',
  content: '',
  owner: '',
  dueDate: '',
  status: 'pending',
})

const piSummary = ref({
  completion: 68,
  completedFeatures: 14,
  totalFeatures: 20,
  completedSP: 340,
  totalSP: 500,
  avgVelocity: 42,
  satisfaction: 4,
})

const participants = ref([
  '张三',
  '李四',
  '王五',
  '赵六',
  '钱七',
  '孙八',
])

const getActionStatusType = (status: string): any => {
  const map: Record<string, string> = {
    pending: 'info',
    'in-progress': 'warning',
    completed: 'success',
  }
  return map[status] || ''
}

const addItem = (type: 'wentWell' | 'toImprove') => {
  currentItemType.value = type
  itemContent.value = ''
  showItemDialog.value = true
}

const handleAddItem = () => {
  if (!itemContent.value) {
    ElMessage.warning('请输入内容')
    return
  }

  const newItem = {
    id: `${Date.now()}`,
    content: itemContent.value,
    author: '当前用户',
  }

  reviewData.value[currentItemType.value].push(newItem)
  showItemDialog.value = false
  ElMessage.success('添加成功')
}

const removeItem = (type: 'wentWell' | 'toImprove', id: string) => {
  const index = reviewData.value[type].findIndex(item => item.id === id)
  if (index !== -1) {
    reviewData.value[type].splice(index, 1)
    ElMessage.success('删除成功')
  }
}

const addActionItem = () => {
  isEditAction.value = false
  actionForm.value = {
    id: '',
    content: '',
    owner: '',
    dueDate: '',
    status: 'pending',
  }
  showActionDialog.value = true
}

const editActionItem = (item: any) => {
  isEditAction.value = true
  actionForm.value = { ...item }
  showActionDialog.value = true
}

const handleSaveAction = () => {
  if (!actionForm.value.content) {
    ElMessage.warning('请输入行动项')
    return
  }

  if (isEditAction.value) {
    const index = reviewData.value.actionItems.findIndex(item => item.id === actionForm.value.id)
    if (index !== -1) {
      reviewData.value.actionItems[index] = { ...actionForm.value }
      ElMessage.success('更新成功')
    }
  } else {
    reviewData.value.actionItems.push({
      ...actionForm.value,
      id: `${Date.now()}`,
    })
    ElMessage.success('添加成功')
  }

  showActionDialog.value = false
}

const removeActionItem = (id: string) => {
  const index = reviewData.value.actionItems.findIndex(item => item.id === id)
  if (index !== -1) {
    reviewData.value.actionItems.splice(index, 1)
    ElMessage.success('删除成功')
  }
}

const goBack = () => {
  router.back()
}

const handleExport = () => {
  ElMessage.success('报告导出功能待实现（PDF/Word）')
}

onMounted(async () => {
  await piStore.fetchPIById(piId.value)
})
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;

  > div {
    display: flex;
    align-items: center;
  }
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-item {
  .item-content {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .item-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-author {
      font-size: 12px;
      color: #909399;
    }
  }
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;

    .metric-label {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
