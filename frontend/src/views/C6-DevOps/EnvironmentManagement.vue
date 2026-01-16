<template>
  <PageContainer>
    <template #header>
      <PageHeader title="环境管理" description="管理开发、测试、生产环境">
        <template #actions>
          <el-button type="primary"><el-icon><Plus /></el-icon>添加环境</el-button>
        </template>
      </PageHeader>
    </template>
    <el-card>
      <el-table :data="[
        { id: 'ENV001', name: '开发环境', type: 'development', status: '正常', version: 'v1.2.0-dev', url: 'http://dev.example.com', lastUpdate: '2026-04-10' },
        { id: 'ENV002', name: '测试环境', type: 'testing', status: '正常', version: 'v1.1.5', url: 'http://test.example.com', lastUpdate: '2026-04-09' },
        { id: 'ENV003', name: '预发布环境', type: 'staging', status: '维护中', version: 'v1.1.0', url: 'http://staging.example.com', lastUpdate: '2026-04-08' },
        { id: 'ENV004', name: '生产环境', type: 'production', status: '正常', version: 'v1.0.3', url: 'http://prod.example.com', lastUpdate: '2026-04-05' }
      ]">
        <el-table-column prop="name" label="环境名称" width="150" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'production' ? 'danger' : row.type === 'staging' ? 'warning' : 'info'">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="120" />
        <el-table-column prop="url" label="访问地址" min-width="250" />
        <el-table-column prop="lastUpdate" label="最后更新" width="120" />
        <el-table-column label="操作" width="250">
          <el-button link type="primary">详情</el-button>
          <el-button link type="warning">部署</el-button>
          <el-button link>配置</el-button>
          <el-button link type="danger">重启</el-button>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
</script>
