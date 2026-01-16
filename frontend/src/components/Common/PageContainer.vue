<template>
  <div :class="['page-container', pageType]">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageType = computed(() => route.meta.pageType || 'default')
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.page-container {
  width: 100%;
  height: 100%;
  background: #fff;
  
  &.list {
    display: flex;
    flex-direction: column;
  }
  
  &.detail {
    display: grid;
    grid-template-rows: auto 1fr;
  }
  
  &.form {
    display: flex;
    flex-direction: column;
  }
  
  &.dashboard {
    padding: 24px;
  }
}
</style>
