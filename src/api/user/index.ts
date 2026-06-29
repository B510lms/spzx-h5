import request from '@/request'
import type { LoginParams, RegisterParams, LoginResponse, UserInfo } from './type'

// 用户登录
export const login = (data: LoginParams) =>
  request<string>('/api/user/userInfo/login', 'POST', data)

// 用户注册
export const register = (data: RegisterParams) =>
  request<void>('/api/user/userInfo/register', 'POST', data)

// 发送短信验证码
export const sendSms = (phone: string) =>
  request<boolean>(`/api/user/sms/sendCode/${phone}`, 'GET')

// 获取当前登录用户信息（需认证）
export const getCurrentUserInfo = () =>
  request<UserInfo>('/api/user/userInfo/auth/getCurrentUserInfo', 'GET')
