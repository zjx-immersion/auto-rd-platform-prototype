<template>
  <PageContainer>
    <template #header>
      <PageHeader title="测试计划" description="创建和管理测试计划">
        <template #actions>
          <el-button type="primary"><el-icon><Plus /></el-icon>创建计划</el-button>
        </template>
      </PageHeader>
    </template>
    <el-card>
      <el-table :data="[
        { id: 'TP001', name: 'ACC功能测试计划', status: '进行中', progress: 65, startDate: '2026-04-01', endDate: '2026-04-15' },
        { id: 'TP002', name: '系统集成测试计划', status: '待开始', progress: 0, startDate: '2026-04-20', endDate: '2026-05-10' }
      ]">
        <el-table-column prop="id" label="计划ID" width="100" />
        <el-table-column prop="name" label="计划名称" width="250" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '进行中' ? 'warning' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" />
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column label="操作" width="150">
          <el-button link type="primary">查看</el-button>
          <el-button link type="primary">编辑</el-button>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
</script>
