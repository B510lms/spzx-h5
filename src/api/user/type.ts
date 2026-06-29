// 登录请求参数
export interface LoginParams {
  username: string
  password: string
}

// 注册请求参数
export interface RegisterParams {
  username: string
  password: string
  nickName: string
  code: string
}

// 登录响应
export interface LoginResponse {
  token: string
  refreshToken?: string
}

// 用户信息
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
