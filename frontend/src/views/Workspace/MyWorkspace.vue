<template>
  <div class="my-workspace">
    <div class="workspace-header">
      <h1>我的工作台</h1>
      <p>{{ greeting }}, {{ userStore.profile?.realName }}!</p>
    </div>

    <div class="workspace-content">
      <!-- 第一行: 待办事项 和 日程 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-card class="widget-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>我的待办</span>
                <el-link type="primary" @click="viewAllTodos">查看全部</el-link>
              </div>
            </template>
            <el-empty v-if="todoList.length === 0" description="暂无待办事项" />
            <div v-else class="todo-list">
              <div
                v-for="todo in todoList"
                :key="todo.id"
                class="todo-item"
                @click="handleTodoClick(todo)"
              >
                <el-checkbox v-model="todo.completed" />
                <div class="todo-content">
                  <div class="todo-title">{{ todo.title }}</div>
                  <div class="todo-meta">
                    <el-tag size="small" :type="getPriorityType(todo.priority)">
                      {{ todo.priority }}
                    </el-tag>
                    <span class="todo-time">{{ todo.dueDate }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="widget-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>今日日程</span>
                <el-link type="primary">查看日历</el-link>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item timestamp="09:00" placement="top">
                <span>每日站会</span>
              </el-timeline-item>
              <el-timeline-item timestamp="14:00" placement="top">
                <span>需求评审会</span>
              </el-timeline-item>
              <el-timeline-item timestamp="16:00" placement="top">
                <span>Sprint规划会</span>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>

      <!-- 第二行: Sprint燃尽图 和 我的任务 -->
      <el-row :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <el-card class="widget-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>Sprint燃尽图</span>
                <el-link type="primary">查看详情</el-link>
              </div>
            </template>
            <div class="chart-container">
              <el-empty description="图表加载中..." />
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="widget-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>我的任务统计</span>
              </div>
            </template>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">8</div>
                <div class="stat-label">进行中</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">3</div>
                <div class="stat-label">待评审</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">15</div>
                <div class="stat-label">已完成</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">2</div>
                <div class="stat-label">已阻塞</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 第三行: 最近访问 -->
      <el-row :gutter="16" style="margin-top: 16px">
        <el-col :span="24">
          <el-card class="widget-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>最近访问</span>
              </div>
            </template>
            <div class="recent-list">
              <div
                v-for="item in navigationStore.recentVisited.slice(0, 5)"
                :key="item.path"
                class="recent-item"
                @click="router.push(item.path)"
              >
                <el-icon><Document /></el-icon>
                <span>{{ item.title }}</span>
                <span class="recent-time">{{ formatTime(item.timestamp) }}</span>
              </div>
              <el-empty v-if="navigationStore.recentVisited.length === 0" description="暂无访问记录" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useNavigationStore } from '@/stores/modules/navigation'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()
const navigationStore = useNavigationStore()

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 待办事项
const todoList = ref([
  {
    id: '1',
    title: 'EPIC-1001 需求评审',
    priority: 'P0',
    dueDate: '今天 17:00',
    completed: false
  },
  {
    id: '2',
    title: 'Feature-2001 设计方案评审',
    priority: 'P1',
    dueDate: '明天 10:00',
    completed: false
  },
  {
    id: '3',
    title: 'TASK-3001 代码评审',
    priority: 'P2',
    dueDate: '后天 14:00',
    completed: false
  }
])

function viewAllTodos() {
  router.push('/function/c4/task/list')
}

function handleTodoClick(todo: any) {
  // 跳转到对应的详情页
}

function getPriorityType(priority: string) {
  const map: Record<string, any> = {
    P0: 'danger',
    P1: 'warning',
    P2: 'info'
  }
  return map[priority] || ''
}

function formatTime(timestamp: number) {
  return dayjs(timestamp).fromNow()
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.my-workspace {
  height: 100%;
  overflow: auto;
  background: $background-color-base;
}

.workspace-header {
  padding: 32px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;

  h1 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 16px;
    opacity: 0.9;
  }
}

.workspace-content {
  padding: 24px;
}

.widget-card {
  height: 400px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
  
  :deep(.el-card__body) {
    height: calc(100% - 56px);
    overflow: auto;
  }
}

.todo-list {
  .todo-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
      background: $background-color-base;
    }
    
    .todo-content {
      flex: 1;
      
      .todo-title {
        margin-bottom: 4px;
        font-size: 14px;
      }
      
      .todo-meta {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 12px;
        color: $text-color-secondary;
      }
    }
  }
}

.chart-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  height: 100%;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: $background-color-base;
    border-radius: 4px;
    
    .stat-value {
      font-size: 32px;
      font-weight: 600;
      color: $primary-color;
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 14px;
      color: $text-color-secondary;
    }
  }
}

.recent-list {
  .recent-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
      background: $background-color-base;
    }
    
    .recent-time {
      margin-left: auto;
      font-size: 12px;
      color: $text-color-secondary;
    }
  }
}
</style>
