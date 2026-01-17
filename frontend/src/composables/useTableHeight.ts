import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * 表格高度自适应Hook
 * 自动计算表格高度以适应窗口大小
 */
export function useTableHeight(fixedHeight = 232) {
  const tableHeight = ref<number>(600)

  const calculateTableHeight = () => {
    nextTick(() => {
      const windowHeight = window.innerHeight
      // fixedHeight = header(64) + toolbar(56) + pagination(56) + padding(56)
      tableHeight.value = Math.max(400, windowHeight - fixedHeight)
    })
  }

  onMounted(() => {
    calculateTableHeight()
    window.addEventListener('resize', calculateTableHeight)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', calculateTableHeight)
  })

  return {
    tableHeight,
    calculateTableHeight
  }
}
