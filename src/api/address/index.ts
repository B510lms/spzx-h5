import request from '@/request'
import type { AddressInfo } from './type'

// 获取用户地址列表（需认证）
export const getAddressList = () =>
  request<AddressInfo[]>('/api/user/userAddress/auth/findUserAddressList', 'GET')

// 获取单个地址信息
export const getAddress = (id: number | string) =>
  request<AddressInfo>(`/api/user/userAddress/auth/getUserAddress/${id}`, 'GET')

// 新增地址
export const saveAddress = (data: AddressInfo) =>
  request<void>('/api/user/userAddress/auth/save', 'POST', data)

// 修改地址
export const updateAddress = (data: AddressInfo) =>
  request<void>('/api/user/userAddress/auth/update', 'PUT', data)

// 删除地址
export const deleteAddress = (id: number | string) =>
  request<void>(`/api/user/userAddress/auth/delete/${id}`, 'DELETE')
