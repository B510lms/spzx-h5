// 结算页数据
export interface TradeVo {
  totalAmount: number
  orderItemList: OrderItemVo[]
  userAddressList?: AddressInfo[]
}

// 订单项
export interface OrderItemVo {
  skuId: number
  skuName: string
  skuImage: string
  salePrice: number
  skuNum: number
  [key: string]: any
}

// 提交订单参数
export interface SubmitOrderParams {
  userAddressId: number
  feightFee?: number
  remark?: string
  orderItemList: OrderItemVo[]
}

// 订单信息
export interface OrderInfo {
  id: number
  orderNo: string
  orderStatus: number
  totalAmount: number
  createTime: string
  orderItemList?: OrderItemVo[]
  userAddress?: AddressInfo
  [key: string]: any
}

// 地址信息（订单中内嵌）
export interface AddressInfo {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault?: number
  [key: string]: any
}
