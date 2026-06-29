import type { ApiResponse } from './type'

type Method = UniApp.RequestOptions['method']

const TIMEOUT = 10000

/**
 * 获取后端 API 基础地址
 * 优先级：用户自定义 > 环境变量 > 开发默认值
 * 开发环境：空字符串（走 Vite proxy 转发 /api 到 localhost:8500）
 * 生产环境：从环境变量读取
 */
function getBaseUrl(): string {
  // 优先使用用户在设置中配置的自定义接口地址
  const customBaseUrl = uni.getStorageSync('apiBaseUrl')
  if (customBaseUrl) return customBaseUrl

  if (import.meta.env.DEV) return ''
  return import.meta.env.VITE_API_BASE_URL || ''
}

/**
 * 获取默认的 API 基础地址（不含用户自定义配置）
 */
export function getDefaultBaseUrl(): string {
  if (import.meta.env.DEV) return ''
  return import.meta.env.VITE_API_BASE_URL || ''
}

/**
 * 从 storage 获取 token，注入请求头
 */
function getTokenHeader(): Record<string, string> {
  const token = uni.getStorageSync('token')
  return token ? { token } : {}
}

/**
 * 处理登录过期
 */
function handleLoginExpired(): void {
  try {
    // 动态导入避免循环依赖
    import('@/store/user').then(({ useUserStore }) => {
      const userStore = useUserStore()
      userStore.logout()
    })
  } catch {
    uni.removeStorageSync('token')
    uni.removeStorageSync('refreshToken')
    uni.removeStorageSync('userInfo')
  }
  uni.showToast({
    title: '请先登录',
    icon: 'none',
    complete: () => {
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/public/login' })
      }, 1500)
    }
  })
}

/**
 * 提取响应中的业务错误消息
 */
function pickMessage(result: Record<string, any>): string {
  return result.message || result.msg || '请求失败'
}

/**
 * 核心请求函数
 * @param url - 请求路径（相对于 BASE_URL）
 * @param method - HTTP 方法
 * @param data - 请求参数
 * @param header - 额外请求头
 * @returns Promise<T> 直接返回 data 字段
 */
function request<T = any>(
  url: string,
  method: Method = 'GET',
  data?: any,
  header?: Record<string, string>
): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: getBaseUrl() + url,
      method,
      data,
      timeout: TIMEOUT,
      header: {
        'Content-Type': 'application/json',
        ...getTokenHeader(),
        ...header
      },

      success(res) {
        const { statusCode } = res
        const raw = res.data as Record<string, any>

        // HTTP 状态码异常
        if (statusCode !== 200) {
          uni.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none'
          })
          reject(new Error(`HTTP Error: ${statusCode}`))
          return
        }

        // 业务状态码判断
        // 后端统一返回格式: { code, message, data }
        const code = raw?.code

        if (code === 200) {
          // 成功：提取 data 字段
          resolve(raw.data as T)
        } else if (code === 208) {
          // 未登录
          handleLoginExpired()
          reject(raw)
        } else {
          // 其他业务错误
          uni.showToast({
            title: pickMessage(raw),
            icon: 'none'
          })
          reject(raw)
        }
      },

      fail(err) {
        uni.showToast({
          title: '网络连接失败，请检查网络',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default request
