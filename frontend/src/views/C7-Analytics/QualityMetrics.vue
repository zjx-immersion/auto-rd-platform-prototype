<template>
  <PageContainer>
    <template #header>
      <PageHeader title="质量度量" description="代码质量和测试质量分析" />
    </template>
    <el-row :gutter="20">
      <el-col :span="6"><el-card><el-statistic title="代码覆盖率" :value="85.6" suffix="%" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="单元测试通过率" :value="98.2" suffix="%" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="代码质量评分" :value="8.7" precision="1" suffix="/10" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="技术债务" :value="23" suffix="天" /></el-card></el-col>
    </el-row>
    <el-card style="margin-top: 20px">
      <template #header>质量趋势</template>
      <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #909399;">
        质量趋势图表区域
      </div>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header>代码质量问题</template>
      <el-table :data="[
        { module: 'ACC模块', blocker: 0, critical: 2, major: 5, minor: 12, info: 8 },
        { module: '座舱系统', blocker: 0, critical: 1, major: 8, minor: 15, info: 10 },
        { module: '网关模块', blocker: 1, critical: 3, major: 4, minor: 6, info: 5 }
      ]">
        <el-table-column prop="module" label="模块" />
        <el-table-column prop="blocker" label="阻断" width="80"><template #default="{ row }"><el-tag v-if="row.blocker > 0" type="danger">{{ row.blocker }}</el-tag><span v-else>0</span></template></el-table-column>
        <el-table-column prop="critical" label="严重" width="80"><template #default="{ row }"><el-tag v-if="row.critical > 0" type="danger">{{ row.critical }}</el-tag><span v-else>0</span></template></el-table-column>
        <el-table-column prop="major" label="重要" width="80"><template #default="{ row }"><el-tag v-if="row.major > 0" type="warning">{{ row.major }}</el-tag><span v-else>0</span></template></el-table-column>
        <el-table-column prop="minor" label="次要" width="80"><template #default="{ row }"><el-tag v-if="row.minor > 0" type="info">{{ row.minor }}</el-tag><span v-else>0</span></template></el-table-column>
        <el-table-column prop="info" label="提示" width="80" />
      </el-table>
    </el-card>
  </PageContainer>
</template>
<script setup lang="ts"></script>
