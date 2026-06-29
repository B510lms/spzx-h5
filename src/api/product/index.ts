import request from '@/request'
import type {
  IndexData,
  CategoryNode,
  ProductListParams,
  ProductDetail,
  Brand,
  SkuInfo
} from './type'

// 获取首页数据（一级分类 + 热销商品SKU）
export const getIndexData = () =>
  request<IndexData>('/api/product/index', 'GET')

// 获取完整分类树
export const getCategoryTree = () =>
  request<CategoryNode[]>('/api/product/category/findCategoryTree', 'GET')

// 分页搜索商品SKU列表
export const getProductList = (params: ProductListParams) => {
  const { page = 1, limit = 10, ...rest } = params
  return request<any>(`/api/product/${page}/${limit}`, 'GET', rest)
}

// 获取商品详情（按 SKU ID）
export const getProductDetail = (skuId: number | string) =>
  request<ProductDetail>(`/api/product/item/${skuId}`, 'GET')

// 获取所有品牌列表
export const getAllBrands = () =>
  request<Brand[]>('/api/product/brand/findAll', 'GET')

// 根据 SKU ID 获取 SKU 基本信息
export const getSkuById = (skuId: number | string) =>
  request<SkuInfo>(`/api/product/getBySkuId/${skuId}`, 'GET')
