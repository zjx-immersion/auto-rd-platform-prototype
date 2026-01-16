#!/bin/bash

# 创建占位页面的函数
create_page() {
  local file_path=$1
  local title=$2
  
  mkdir -p "$(dirname "$file_path")"
  
  cat > "$file_path" << EOF
<template>
  <div class="placeholder-page">
    <page-container>
      <el-result icon="info" title="${title}" sub-title="页面开发中...">
        <template #extra>
          <el-button type="primary" @click="\$router.back()">返回</el-button>
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
EOF
}

# C0-Project
create_page "src/views/C0-Project/ProjectList.vue" "项目列表"
create_page "src/views/C0-Project/ProjectDetail.vue" "项目详情"
create_page "src/views/C0-Project/ProjectCreate.vue" "创建项目"

# C1-Requirements - Feature
create_page "src/views/C1-Requirements/Feature/FeatureList.vue" "Feature列表"
create_page "src/views/C1-Requirements/Feature/FeatureDetail.vue" "Feature详情"
create_page "src/views/C1-Requirements/Feature/FeatureCreate.vue" "创建Feature"

# C1-Requirements - SSTS
create_page "src/views/C1-Requirements/SSTS/SSTSList.vue" "SSTS列表"
create_page "src/views/C1-Requirements/SSTS/SSTSDetail.vue" "SSTS详情"

# C1-Requirements - MR
create_page "src/views/C1-Requirements/MR/MRList.vue" "MR列表"

# C2-Assets
create_page "src/views/C2-Assets/AssetList.vue" "资产列表"

# C3-Planning
create_page "src/views/C3-Planning/SprintList.vue" "Sprint管理"

# C4-Iteration
create_page "src/views/C4-Iteration/TaskList.vue" "任务列表"
create_page "src/views/C4-Iteration/SprintBoard.vue" "Sprint看板"

# C5-Testing
create_page "src/views/C5-Testing/TestCaseList.vue" "测试用例列表"
create_page "src/views/C5-Testing/DefectList.vue" "缺陷列表"

# C6-DevOps
create_page "src/views/C6-DevOps/BuildList.vue" "构建列表"
create_page "src/views/C6-DevOps/DeployList.vue" "部署列表"

# C7-Analytics
create_page "src/views/C7-Analytics/RequirementMetrics.vue" "需求度量"

echo "页面创建完成!"
