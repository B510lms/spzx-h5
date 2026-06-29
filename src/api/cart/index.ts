import request from '@/request'
import type { CartItem } from './type'

// 获取购物车列表（需认证）
export const getCartList = () =>
  request<CartItem[]>('/api/order/cart/auth/cartList', 'GET')

// 添加商品到购物车（需认证）
export const addToCart = (skuId: number | string, skuNum: number = 1) =>
  request<void>(`/api/order/cart/auth/addToCart/${skuId}/${skuNum}`, 'GET')

// 从购物车删除商品（需认证）
export const deleteCartItem = (skuId: number | string) =>
  request<void>(`/api/order/cart/auth/deleteCart/${skuId}`, 'DELETE')

// 选中/取消选中购物车商品（需认证）
export const checkCartItem = (skuId: number | string, isChecked: number) =>
  request<void>(`/api/order/cart/auth/checkCart/${skuId}/${isChecked}`, 'GET')

// 全选/取消全选（需认证）
export const checkAllCart = (isChecked: number) =>
  request<void>(`/api/order/cart/auth/allCheckCart/${isChecked}`, 'GET')

// 清空购物车（需认证）
export const clearCart = () =>
  request<void>('/api/order/cart/auth/clearCart', 'GET')

// 获取所有已选中的购物车项（需认证）
export const getCheckedItems = () =>
  request<CartItem[]>('/api/order/cart/auth/getAllCkecked', 'GET')

// 删除所有已选中的购物车项（需认证）
export const deleteCheckedItems = () =>
  request<void>('/api/order/cart/auth/deleteChecked', 'GET')
