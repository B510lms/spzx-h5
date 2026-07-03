import type { AxiosInstance, Method, AxiosRequestConfig } from 'axios'
import axios from 'axios'

const TIMEOUT = 10000

// ============================================================
// 小程序适配器：将 axios 请求转为 uni.request 调用
// ============================================================
function createUniAdapter() {
  return (config: AxiosRequestConfig): Promise<any> => {
    return new Promise((resolve, reject) => {
      uni.request({
        url: (config.baseURL || '') + (config.url || ''),
        method: (config.method || 'GET') as any,
        data: config.data,
        params: config.params,
        header: config.headers as any,
        timeout: config.timeout || TIMEOUT,
        success(res) {
          resolve({
            data: res.data,
            status: res.statusCode,
            statusText: '',
            headers: res.header,
            config,
          })
        },
        fail(err) {
          reject(err)
        },
      })
    })
  }
}

// ============================================================
// 创建 axios 实例
// ============================================================
const http: AxiosInstance = axios.create({
  timeout: TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
  // #ifdef MP-WEIXIN
  adapter: createUniAdapter(),
  // #endif
})

// ============================================================
// 请求拦截器：动态设置 baseURL + 注入 token
// ============================================================
http.interceptors.request.use((config) => {
  // 动态 baseURL：用户自定义 > 开发环境(空/proxy) > 环境变量
  const customBaseUrl = uni.getStorageSync('apiBaseUrl')
  if (customBaseUrl) {
    config.baseURL = customBaseUrl
  } else if (import.meta.env.DEV) {
    config.baseURL = ''
  } else {
    config.baseURL = import.meta.env.VITE_API_BASE_URL || ''
  }

  // 注入 token
  const token = uni.getStorageSync('token')
  if (token) {
    config.headers['token'] = token
  }

  return config
})

// ============================================================
// 响应拦截器：解包 + 错误处理
// ============================================================

function handleLoginExpired(): void {
  try {
    import('@/store/user').then(({ useUserStore }) => {
      useUserStore().logout()
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
    },
  })
}

http.interceptors.response.use(
  (response) => {
    const raw = response.data as Record<string, any>

    // HTTP 状态码异常
    if (response.status !== 200) {
      uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      return Promise.reject(new Error(`HTTP Error: ${response.status}`))
    }

    const code = raw?.code
    if (code === 200) {
      return raw.data // 成功 → 解包 data
    }

    if (code === 208) {
      handleLoginExpired()
      return Promise.reject(raw)
    }

    // 其他业务错误
    const msg = raw?.message || raw?.msg || '请求失败'
    uni.showToast({ title: msg, icon: 'none' })
    return Promise.reject(raw)
  },
  (error) => {
    uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' })
    return Promise.reject(error)
  },
)

// ============================================================
// 公开 API（保持与旧版相同的签名）
// ============================================================

/**
 * 获取默认的 API 基础地址（不含用户自定义配置）
 */
export function getDefaultBaseUrl(): string {
  if (import.meta.env.DEV) return ''
  return import.meta.env.VITE_API_BASE_URL || ''
}

/**
 * 核心请求函数
 * @param url - 请求路径
 * @param method - HTTP 方法
 * @param data - 请求参数（GET → query params, 其他 → body）
 * @param header - 额外请求头
 * @returns Promise<T> 直接返回 data 字段
 */
function request<T = any>(
  url: string,
  method: Method = 'GET',
  data?: any,
  header?: Record<string, string>,
): Promise<T> {
  const config: AxiosRequestConfig = {
    url,
    method,
    headers: header,
  }

  // GET 请求参数放 params，其他放 data
  if (method === 'GET') {
    config.params = data
  } else {
    config.data = data
  }

  return http.request(config) as Promise<T>
}

export default request
