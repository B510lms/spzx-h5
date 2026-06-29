// 通用类型定义

// 分页响应
export interface Pagination<T> {
  list: T[]
  total: number
  size: number
  current: number
  pages: number
}
