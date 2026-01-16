<template>
  <PageContainer>
    <template #header>
      <PageHeader title="CI/CD流水线" description="管理持续集成和部署流水线">
        <template #actions>
          <el-button type="primary"><el-icon><Plus /></el-icon>创建流水线</el-button>
        </template>
      </PageHeader>
    </template>
    <el-card>
      <el-table :data="[
        { id: 'PL001', name: 'ACC模块CI流水线', status: '成功', lastRun: '2026-04-10 14:30', duration: '5分32秒', successRate: 95 },
        { id: 'PL002', name: '座舱系统CD流水线', status: '运行中', lastRun: '2026-04-10 15:20', duration: '进行中', successRate: 88 },
        { id: 'PL003', name: '网关模块测试流水线', status: '失败', lastRun: '2026-04-10 10:15', duration: '3分18秒', successRate: 92 }
      ]">
        <el-table-column prop="id" label="流水线ID" width="120" />
        <el-table-column prop="name" label="流水线名称" width="250" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '成功' ? 'success' : row.status === '运行中' ? 'warning' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastRun" label="最后运行" width="150" />
        <el-table-column prop="duration" label="耗时" width="120" />
        <el-table-column prop="successRate" label="成功率" width="100">
          <template #default="{ row }">{{ row.successRate }}%</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <el-button link type="primary">查看</el-button>
          <el-button link type="success">运行</el-button>
          <el-button link>编辑</el-button>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
</script>
