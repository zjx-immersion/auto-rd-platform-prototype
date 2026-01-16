<template>
  <PageContainer>
    <template #header>
      <PageHeader title="团队效能" description="团队生产力和协作效率分析" />
    </template>
    <el-row :gutter="20">
      <el-col :span="6"><el-card><el-statistic title="团队速率" :value="28.5" suffix="SP/周" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="人均产出" :value="3.8" suffix="SP/人/周" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="代码提交频率" :value="45" suffix="次/周" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="Code Review率" :value="96" suffix="%" /></el-card></el-col>
    </el-row>
    <el-card style="margin-top: 20px">
      <template #header>团队效能趋势</template>
      <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #909399;">
        团队效能趋势图表区域
      </div>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header>团队成员效能</template>
      <el-table :data="[
        { name: '张三', role: '开发工程师', tasksCompleted: 12, storyPoints: 32, codeLines: 2850, codeReviews: 15, availability: 95 },
        { name: '李四', role: '开发工程师', tasksCompleted: 10, storyPoints: 28, codeLines: 2320, codeReviews: 12, availability: 90 },
        { name: '王五', role: '测试工程师', tasksCompleted: 18, storyPoints: 25, codeLines: 1200, codeReviews: 8, availability: 98 },
        { name: '赵六', role: '架构师', tasksCompleted: 8, storyPoints: 35, codeLines: 1890, codeReviews: 25, availability: 85 }
      ]">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column prop="tasksCompleted" label="完成任务" width="100" />
        <el-table-column prop="storyPoints" label="Story Points" width="120" />
        <el-table-column prop="codeLines" label="代码行数" width="100" />
        <el-table-column prop="codeReviews" label="Code Review" width="120" />
        <el-table-column prop="availability" label="可用度" width="100">
          <template #default="{ row }">{{ row.availability }}%</template>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>
<script setup lang="ts"></script>
