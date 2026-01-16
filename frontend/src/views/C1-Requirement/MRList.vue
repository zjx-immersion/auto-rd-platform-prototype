<template>
  <div class="mr-list-container">
    <div class="page-header">
      <h2>MR 列表</h2>
      <el-button type="primary">创建MR</el-button>
    </div>
    <el-card shadow="never">
      <el-empty description="MR列表页面待实现" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// MR列表页面 - 占位符
</script>

<style scoped lang="scss">
.mr-list-container {
  padding: 20px;
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    h2 { margin: 0; }
  }
}
</style>
