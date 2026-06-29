// 地址信息
export interface AddressInfo {
  id: number
  userId?: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  label?: string
  isDefault?: number
  createTime?: string
  updateTime?: string
  [key: string]: any
}
