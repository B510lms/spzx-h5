import request from '@/request'

// 提交支付宝支付
export const submitAlipay = (orderNo: string) =>
  request<string>(`/api/order/alipay/submitAlipay/${orderNo}`, 'GET')
