import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import '@/assets/styles/global.scss'
// import { initializeMockData } from '@/utils/mockDataInitializer' // 旧的Mock数据初始化
import { initializeJSONDatasets } from '@/mock-data' // 新的JSON数据集初始化

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default'
})

app.mount('#app')

// 初始化JSON数据集（在应用挂载后）
initializeJSONDatasets().then(() => {
  console.log('✅ 应用和JSON数据集初始化完成')
})
