<template>
  <div class="process-page">
    <el-result icon="info" title="P3: 方案设计流程" sub-title="功能开发中...">
      <template #extra>
        <el-button type="primary" @click="$router.back()">返回</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.process-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #fff;
}
</style>
