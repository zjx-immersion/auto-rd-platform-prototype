<template>
  <PageContainer>
    <template #header>
      <PageHeader
        title="每日站会"
        description="记录和查看每日站会内容"
      >
        <template #actions>
          <el-button type="primary" @click="handleAddStandup">
            <el-icon><Plus /></el-icon>
            记录站会
          </el-button>
        </template>
      </PageHeader>
    </template>

    <el-row :gutter="20">
      <!-- 左侧：站会列表 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>站会记录</span>
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                size="small"
                @change="handleDateChange"
              />
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="item in standupList"
              :key="item.id"
              :timestamp="item.time"
              @click="handleSelectStandup(item)"
              :class="{ 'active-item': selectedStandup?.id === item.id }"
            >
              <div class="standup-item">
                <div class="standup-title">{{ item.title }}</div>
                <div class="standup-meta">
                  <el-tag size="small">{{ item.participants }}人参与</el-tag>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- 右侧：站会详情 -->
      <el-col :span="16">
        <el-card v-if="selectedStandup">
          <template #header>
            <div class="card-header">
              <span>{{ selectedStandup.title }}</span>
              <el-button size="small" @click="handleEdit">编辑</el-button>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="时间">{{ selectedStandup.time }}</el-descriptions-item>
            <el-descriptions-item label="参与人数">{{ selectedStandup.participants }}人</el-descriptions-item>
            <el-descriptions-item label="持续时长">{{ selectedStandup.duration }}分钟</el-descriptions-item>
            <el-descriptions-item label="主持人">{{ selectedStandup.host }}</el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">
            <el-icon><User /></el-icon>
            团队成员汇报
          </el-divider>

          <div class="member-reports">
            <el-card
              v-for="member in selectedStandup.memberReports"
              :key="member.name"
              class="member-card"
              shadow="hover"
            >
              <div class="member-header">
                <el-avatar :size="32">{{ member.name[0] }}</el-avatar>
                <span class="member-name">{{ member.name }}</span>
              </div>

              <div class="report-section">
                <div class="section-title">
                  <el-icon color="#67C23A"><CircleCheck /></el-icon>
                  昨日完成
                </div>
                <ul>
                  <li v-for="(item, index) in member.yesterday" :key="index">{{ item }}</li>
                </ul>
              </div>

              <div class="report-section">
                <div class="section-title">
                  <el-icon color="#409EFF"><Clock /></el-icon>
                  今日计划
                </div>
                <ul>
                  <li v-for="(item, index) in member.today" :key="index">{{ item }}</li>
                </ul>
              </div>

              <div class="report-section" v-if="member.blockers.length > 0">
                <div class="section-title">
                  <el-icon color="#F56C6C"><WarningFilled /></el-icon>
                  遇到阻碍
                </div>
                <ul>
                  <li v-for="(item, index) in member.blockers" :key="index">{{ item }}</li>
                </ul>
              </div>
            </el-card>
          </div>

          <el-divider v-if="selectedStandup.actionItems.length > 0" content-position="left">
            行动项
          </el-divider>

          <el-table v-if="selectedStandup.actionItems.length > 0" :data="selectedStandup.actionItems">
            <el-table-column prop="description" label="行动项" />
            <el-table-column prop="owner" label="负责人" width="100" />
            <el-table-column prop="deadline" label="截止日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '完成' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-empty v-else description="请选择一个站会记录" />
      </el-col>
    </el-row>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, User, CircleCheck, Clock, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const selectedDate = ref(new Date())
const selectedStandup = ref<any>(null)

const standupList = ref([
  {
    id: '1',
    title: 'Sprint 1 - Day 5 站会',
    time: '2026-04-10 09:30',
    participants: 8,
    duration: 15,
    host: '张经理',
    memberReports: [
      {
        name: '张三',
        yesterday: ['完成ACC模块单元测试', '修复2个缺陷'],
        today: ['开始集成测试', '代码评审'],
        blockers: []
      },
      {
        name: '李四',
        yesterday: ['完成接口设计文档'],
        today: ['实现雷达数据接口'],
        blockers: ['缺少测试环境']
      },
      {
        name: '王五',
        yesterday: ['参与架构评审'],
        today: ['完成数据库设计'],
        blockers: []
      }
    ],
    actionItems: [
      {
        description: '协调测试环境',
        owner: '张经理',
        deadline: '2026-04-11',
        status: '进行中'
      }
    ]
  },
  {
    id: '2',
    title: 'Sprint 1 - Day 4 站会',
    time: '2026-04-09 09:30',
    participants: 8,
    duration: 12,
    host: '张经理',
    memberReports: [
      {
        name: '张三',
        yesterday: ['完成ACC模块核心逻辑'],
        today: ['编写单元测试'],
        blockers: []
      }
    ],
    actionItems: []
  }
])

function handleDateChange() {
  ElMessage.info('加载该日期的站会记录')
}

function handleSelectStandup(item: any) {
  selectedStandup.value = item
}

function handleAddStandup() {
  ElMessage.info('记录新的站会')
}

function handleEdit() {
  ElMessage.info('编辑站会记录')
}
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.standup-item {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background: #F5F7FA;
  }
  
  .standup-title {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .standup-meta {
    display: flex;
    gap: 8px;
  }
}

:deep(.el-timeline-item) {
  &.active-item {
    .standup-item {
      background: #ECF5FF;
    }
  }
}

.member-reports {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.member-card {
  .member-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .member-name {
      font-weight: 500;
      font-size: 16px;
    }
  }
  
  .report-section {
    margin-bottom: 12px;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    ul {
      margin: 0;
      padding-left: 24px;
      
      li {
        font-size: 13px;
        color: #606266;
        line-height: 1.8;
      }
    }
  }
}
</style>
