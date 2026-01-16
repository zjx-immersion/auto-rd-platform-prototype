<template>
  <div class="management-workspace">
    <div class="workspace-header">
      <h1>管理工作台</h1>
      <p>效能分析与决策支持</p>
    </div>

    <div class="workspace-content">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-card>
            <el-empty description="管理工作台开发中..." />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
//
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.management-workspace {
  height: 100%;
  overflow: auto;
  background: $background-color-base;
}

.workspace-header {
  padding: 32px 24px;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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
</style>
