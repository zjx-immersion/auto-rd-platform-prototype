<template>
  <PageContainer>
    <template #header>
      <PageHeader title="测试报告" description="查看和生成测试报告">
        <template #actions>
          <el-button type="primary"><el-icon><Document /></el-icon>生成报告</el-button>
        </template>
      </PageHeader>
    </template>
    <el-row :gutter="20">
      <el-col :span="6"><el-card><el-statistic title="总用例数" :value="328" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="通过率" :value="94.5" suffix="%" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="发现缺陷" :value="18" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="遗留缺陷" :value="3" /></el-card></el-col>
    </el-row>
    <el-card style="margin-top: 20px">
      <el-table :data="[
        { id: 'TR001', name: 'Sprint 1 测试报告', createDate: '2026-04-14', testCases: 120, passRate: 95 },
        { id: 'TR002', name: 'ACC功能测试报告', createDate: '2026-04-10', testCases: 85, passRate: 92 }
      ]">
        <el-table-column prop="id" label="报告ID" width="100" />
        <el-table-column prop="name" label="报告名称" />
        <el-table-column prop="createDate" label="生成日期" width="120" />
        <el-table-column prop="testCases" label="测试用例数" width="120" />
        <el-table-column prop="passRate" label="通过率" width="100">
          <template #default="{ row }">{{ row.passRate }}%</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <el-button link type="primary">查看</el-button>
          <el-button link>下载</el-button>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>
<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
</script>
