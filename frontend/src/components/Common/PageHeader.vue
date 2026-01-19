<template>
  <div class="page-header">
    <div class="header-left">
      <el-button 
        v-if="showBack" 
        text 
        :icon="ArrowLeft"
        @click="handleBack"
      >
        返回
      </el-button>
      <div class="title-section">
        <h1 class="page-title">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="description" class="page-description">
          {{ description }}
        </p>
      </div>
    </div>
    <div class="header-right">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

interface Props {
  title?: string
  description?: string
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  showBack: false
})

const router = useRouter()

function handleBack() {
  router.back()
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid $border-color-light;
}

.header-left {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.title-section {
  .page-title {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
    color: $text-color-primary;
  }
  
  .page-description {
    margin: 0;
    font-size: 14px;
    color: $text-color-secondary;
  }
}

.header-right {
  display: flex;
  gap: 8px;
}
</style>
