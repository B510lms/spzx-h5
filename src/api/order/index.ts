import request from '@/request'
import type { TradeVo, SubmitOrderParams, OrderInfo } from './type'
import type { Pagination } from '@/type/common'

// 确认订单 - 获取结算页数据（需认证）
export const getTrade = () =>
  request<TradeVo>('/api/order/orderInfo/auth/trade', 'GET')

// 提交订单（需认证）
export const submitOrder = (data: SubmitOrderParams) =>
  request<number>('/api/order/orderInfo/auth/submitOrder', 'POST', data)

// 获取订单分页列表（需认证）
export const getOrderList = (
  page: number = 1,
  limit: number = 10,
  orderStatus?: number
) =>
  request<Pagination<OrderInfo>>(
    `/api/order/orderInfo/auth/${page}/${limit}`,
    'GET',
    { orderStatus: orderStatus !== undefined ? orderStatus : '' }
  )

// 获取订单详情（需认证）
export const getOrderDetail = (orderId: number | string) =>
  request<OrderInfo>(`/api/order/orderInfo/auth/${orderId}`, 'GET')

// 立即购买（直接下单，需认证）
export const buyNow = (skuId: number | string) =>
  request<TradeVo>(`/api/order/orderInfo/auth/buy/${skuId}`, 'GET')

// 根据订单号获取订单信息（需认证）
export const getOrderByOrderNo = (orderNo: string) =>
  request<OrderInfo>(
    `/api/order/orderInfo/auth/getOrderInfoByOrderNo/${orderNo}`,
    'GET'
  )
