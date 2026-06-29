// 首页数据
export interface IndexData {
  banners: string[]
  categoryList: CategoryNode[]
  hotProducts: ProductItem[]
  productSkuList?: any[]
  adImage?: string
}

// 商品列表项
export interface ProductItem {
  skuId: number
  title: string
  thumbImg: string
  salePrice: number
  marketPrice: number
  saleNum: number
}

// 分类树节点
export interface CategoryNode {
  id: number
  name: string
  imageUrl?: string
  children?: CategoryNode[]
}

// 商品列表查询参数
export interface ProductListParams {
  page?: number
  limit?: number
  keyword?: string
  brandId?: number | string
  category1Id?: number | string
  category2Id?: number | string
  category3Id?: number | string
  // 1=综合, 2=价格升序, 3=价格降序
  order?: number | string
}

// 商品详情
export interface ProductDetail {
  skuId: number
  title: string
  thumbImg: string
  salePrice: number
  marketPrice: number
  saleNum: number
  detailImages?: string[]
  specs?: ProductSpec[]
  stock?: number
  description?: string
  [key: string]: any
}

// 商品规格
export interface ProductSpec {
  name: string
  values: string[]
}

// 品牌
export interface Brand {
  id: number
  name: string
  logo?: string
}

// SKU 基本信息
export interface SkuInfo {
  skuId: number
  title: string
  thumbImg: string
  salePrice: number
  marketPrice: number
  [key: string]: any
}
