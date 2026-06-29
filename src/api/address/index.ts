import request from '@/request'
import type { AddressInfo } from './type'

// 获取用户地址列表（需认证）
export const getAddressList = () =>
  request<AddressInfo[]>('/api/user/userAddress/auth/findUserAddressList', 'GET')

// 获取单个地址信息
export const getAddress = (id: number | string) =>
  request<AddressInfo>(`/api/user/userAddress/getUserAddress/${id}`, 'GET')
