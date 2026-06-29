// 应用全局状态管理
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface SystemInfo {
  statusBarHeight: number
  platform: string
  windowWidth: number
  windowHeight: number
  [key: string]: any
}

export const useAppStore = defineStore('app', () => {
  // ========== 状态 ==========
  const systemInfo = ref<SystemInfo | null>(null)
  const statusBarHeight = ref<number>(20) // 默认 20px
  const navBarHeight = ref<number>(44)    // 默认 44px

  // ========== 方法 ==========

  // 获取系统信息
  function getSystemInfo(): void {
    try {
      const info = uni.getSystemInfoSync() as SystemInfo
      systemInfo.value = info
      statusBarHeight.value = info.statusBarHeight || 20

      // #ifdef MP-WEIXIN
      const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
      navBarHeight.value =
        (menuButtonInfo.top - info.statusBarHeight) * 2 + menuButtonInfo.height
      // #endif

      // #ifdef H5
      navBarHeight.value = 44
      // #endif
    } catch (e) {
      console.error('获取系统信息失败:', e)
    }
  }

  // 初始化应用
  function init(): void {
    getSystemInfo()
  }

  return {
    systemInfo,
    statusBarHeight,
    navBarHeight,
    getSystemInfo,
    init
  }
})
