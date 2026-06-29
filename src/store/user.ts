// 用户状态管理
// 管理登录状态、token、用户信息
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCartStore } from '@/store/cart'

export interface UserInfo {
  id: number
  username: string
  nickName: string
  avatar: string
  phone?: string
  email?: string
  sex?: number
  [key: string]: any
}

export const useUserStore = defineStore('user', () => {
  // ========== 状态 ==========
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)

  // ========== 计算属性 ==========
  const isLogin = computed(() => !!token.value)

  const nickName = computed(() => userInfo.value?.nickName || '未登录')

  const avatar = computed(
    () => userInfo.value?.avatar || '/static/images/missing-face.png'
  )

  // ========== 方法 ==========

  // 初始化 - 从本地存储恢复登录状态
  function checkLogin(): void {
    try {
      const storedToken = uni.getStorageSync('token')
      const storedRefreshToken = uni.getStorageSync('refreshToken')
      const storedUserInfo = uni.getStorageSync('userInfo')

      if (storedToken) {
        token.value = storedToken
        refreshToken.value = storedRefreshToken || ''
        userInfo.value = storedUserInfo ? JSON.parse(storedUserInfo) : null
      }
    } catch (e) {
      console.error('恢复登录状态失败:', e)
      clearLoginState()
    }
  }

  // 保存登录 token
  function setToken(newToken: string, newRefreshToken: string = ''): void {
    token.value = newToken
    refreshToken.value = newRefreshToken
    uni.setStorageSync('token', newToken)
    if (newRefreshToken) {
      uni.setStorageSync('refreshToken', newRefreshToken)
    }
  }

  // 保存用户信息
  function setUserInfo(info: UserInfo): void {
    userInfo.value = info
    uni.setStorageSync('userInfo', JSON.stringify(info))
  }

  // 登录成功后设置状态
  function login(loginData: string | { token: string; refreshToken?: string }): void {
    if (typeof loginData === 'string') {
      setToken(loginData)
    } else {
      setToken(loginData.token, loginData.refreshToken)
    }
  }

  // 退出登录
  function logout(): void {
    clearLoginState()
    // 清除购物车
    const cartStore = useCartStore()
    cartStore.clearCart()
  }

  // 清除登录状态
  function clearLoginState(): void {
    token.value = ''
    refreshToken.value = ''
    userInfo.value = null
    try {
      uni.removeStorageSync('token')
      uni.removeStorageSync('refreshToken')
      uni.removeStorageSync('userInfo')
    } catch (e) {
      console.error('清除登录状态失败:', e)
    }
  }

  return {
    token,
    refreshToken,
    userInfo,
    isLogin,
    nickName,
    avatar,
    checkLogin,
    setToken,
    setUserInfo,
    login,
    logout,
    clearLoginState
  }
})
