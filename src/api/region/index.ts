import request from '@/request'

export interface Region {
  id: number
  code: string
  parentCode: string
  name: string
  level: number
}

export const getRegionByParentCode = (parentCode: number) =>
  request<Region[]>(`/api/product/region/findByParentCode/${parentCode}`, 'GET')