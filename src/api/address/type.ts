// 地址信息
export interface AddressInfo {
  id?: number
  userId?: number
  name: string
  phone: string
  tagName?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  address?: string
  fullAddress?: string
  isDefault?: number
  createTime?: string
  updateTime?: string
  [key: string]: any
}
