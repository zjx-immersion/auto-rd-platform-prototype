<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

onMounted(() => {
  // 初始化应用
  appStore.init()
})
</script>

<style scoped>
/* App级别的样式 */
</style>
