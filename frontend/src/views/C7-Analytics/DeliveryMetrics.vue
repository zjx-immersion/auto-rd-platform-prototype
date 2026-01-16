<template>
  <PageContainer>
    <template #header>
      <PageHeader title="交付度量" description="项目交付效率和质量分析" />
    </template>
    <el-row :gutter="20">
      <el-col :span="6"><el-card><el-statistic title="按时交付率" :value="92.5" suffix="%" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="平均交付周期" :value="14.3" suffix="天" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="本月交付Feature" :value="28" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="发布频率" :value="3.2" suffix="次/月" /></el-card></el-col>
    </el-row>
    <el-card style="margin-top: 20px">
      <template #header>交付趋势</template>
      <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #909399;">
        交付趋势图表区域
      </div>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header>Sprint交付统计</template>
      <el-table :data="[
        { sprint: 'Sprint 1', planned: 25, completed: 24, carryOver: 1, onTime: true, velocity: 24 },
        { sprint: 'Sprint 2', planned: 28, completed: 26, carryOver: 2, onTime: false, velocity: 26 },
        { sprint: 'Sprint 3', planned: 30, completed: 30, carryOver: 0, onTime: true, velocity: 30 }
      ]">
        <el-table-column prop="sprint" label="Sprint" />
        <el-table-column prop="planned" label="计划" width="80" />
        <el-table-column prop="completed" label="完成" width="80" />
        <el-table-column prop="carryOver" label="遗留" width="80" />
        <el-table-column prop="onTime" label="按时交付" width="100">
          <template #default="{ row }">
            <el-tag :type="row.onTime ? 'success' : 'warning'">{{ row.onTime ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="velocity" label="速率" width="80" />
      </el-table>
    </el-card>
  </PageContainer>
</template>
<script setup lang="ts"></script>
