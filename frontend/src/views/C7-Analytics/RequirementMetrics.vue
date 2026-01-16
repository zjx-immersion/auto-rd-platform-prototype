<template>
  <div class="placeholder-page">
    <page-container>
      <el-result icon="info" title="需求度量" sub-title="页面开发中...">
        <template #extra>
          <el-button type="primary" @click="$router.back()">返回</el-button>
        </template>
      </el-result>
    </page-container>
  </div>
</template>

<script setup lang="ts">
import PageContainer from '@/components/Common/PageContainer.vue'
</script>

<style scoped>
.placeholder-page {
  height: 100%;
}
</style>
