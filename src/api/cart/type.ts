// 购物车项
export interface CartItem {
  skuId: number
  skuNum: number
  cartPrice: number
  isChecked: number
  skuName?: string
  skuImage?: string
  salePrice?: number
  marketPrice?: number
  [key: string]: any
}
