import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import type { Plugin } from 'vue'
import uviewPlus from 'uview-plus'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)

  // Pinia 状态管理
  const pinia = createPinia()
  app.use(pinia as unknown as Plugin)

  // uView Plus UI 组件库
  app.use(uviewPlus as unknown as Plugin)

  return {
    app,
    pinia
  }
}
