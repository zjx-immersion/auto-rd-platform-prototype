<template>
  <div class="team-workspace">
    <div class="workspace-header">
      <h1>团队工作台</h1>
      <p>团队协作与进度跟踪</p>
    </div>

    <div class="workspace-content">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-card>
            <el-empty description="团队工作台开发中..." />
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

.team-workspace {
  height: 100%;
  overflow: auto;
  background: $background-color-base;
}

.workspace-header {
  padding: 32px 24px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
