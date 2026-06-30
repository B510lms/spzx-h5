<template>
  <scroll-view scroll-y class="page-product-list" :style="{ height: scrollHeight + 'px' }">
    <!-- 顶部筛选栏 -->
    <view class="filter-bar">
      <view
        class="filter-bar__item"
        :class="{ 'filter-bar__item--active': currentOrder === 1 }"
        @click="changeOrder(1)"
      >
        <text>综合</text>
      </view>
      <view
        class="filter-bar__item"
        :class="{ 'filter-bar__item--active': currentOrder === 2 || currentOrder === 3 }"
        @click="togglePriceOrder"
      >
        <text>价格</text>
        <view class="filter-bar__price-icons">
          <u-icon name="arrow-up-fill" size="10" :color="currentOrder === 2 ? '#E4393C' : '#C0C4CC'" />
          <u-icon name="arrow-down-fill" size="10" :color="currentOrder === 3 ? '#E4393C' : '#C0C4CC'" />
        </view>
      </view>
      <view
        class="filter-bar__item"
        :class="{ 'filter-bar__item--active': showBrandFilter || currentBrandName }"
        @click="openBrandFilter"
      >
        <text>{{ currentBrandName || '品牌' }}</text>
        <u-icon name="arrow-down" size="12" :color="showBrandFilter ? '#E4393C' : '#C0C4CC'" />
      </view>
    </view>

    <!-- 商品列表 -->
    <goods-list
      :list="productList"
      :columns="2"
      :load-status="loadStatus"
      :loading="loading"
    />

    <!-- 空状态 -->
    <no-data v-if="!loading && productList.length === 0 && hasLoaded" text="暂无商品" />

    <!-- 品牌筛选弹窗 -->
    <view class="brand-filter-modal" v-if="showBrandFilter" @click="closeBrandFilter">
      <view class="brand-filter-content" @click.stop>
        <view class="brand-filter-header">
          <text class="brand-filter-title">选择品牌</text>
          <view class="brand-filter-close" @click="closeBrandFilter">
            <u-icon name="close" size="20" />
          </view>
        </view>
        <scroll-view scroll-y class="brand-filter-list">
          <view
            class="brand-filter-item"
            :class="{ 'brand-filter-item--active': !queryParams.brandId }"
            @click="selectBrand('', '')"
          >
            <text>全部品牌</text>
            <u-icon v-if="!queryParams.brandId" name="checkmark" size="16" color="#E4393C" />
          </view>
          <view
            v-for="brand in brandList"
            :key="brand.id"
            class="brand-filter-item"
            :class="{ 'brand-filter-item--active': queryParams.brandId === brand.id }"
            @click="selectBrand(brand.id, brand.name)"
          >
            <text>{{ brand.name }}</text>
            <u-icon v-if="queryParams.brandId === brand.id" name="checkmark" size="16" color="#E4393C" />
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 底部安全距离 -->
    <view class="safe-area-bottom" />
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { getProductList, getAllBrands } from '@/api/product'
import type { ProductItem, ProductListParams, Brand } from '@/api/product/type'
import GoodsList from '@/components/goods-list/goods-list.vue'
import NoData from '@/components/no-data/no-data.vue'

const scrollHeight = uni.getSystemInfoSync().windowHeight

// 筛选参数
const queryParams = reactive<ProductListParams>({
  keyword: '',
  brandId: '',
  category1Id: '',
  category2Id: '',
  category3Id: '',
  order: 1 // 1=综合 2=价格升序 3=价格降序
})

const currentOrder = ref<number>(1)
const page = ref<number>(1)
const limit = 10
const total = ref<number>(0)
const loading = ref<boolean>(false)
const hasLoaded = ref<boolean>(false)
const productList = ref<ProductItem[]>([])

const loadStatus = ref<string>('loadmore')

const showBrandFilter = ref<boolean>(false)
const brandList = ref<Brand[]>([])
const currentBrandName = ref<string>('')

// 打开品牌筛选
function openBrandFilter() {
  showBrandFilter.value = true
}

// 关闭品牌筛选
function closeBrandFilter() {
  showBrandFilter.value = false
}

// 选择品牌
function selectBrand(brandId: number | string, brandName: string) {
  queryParams.brandId = brandId
  currentBrandName.value = brandName
  closeBrandFilter()
  resetAndLoad()
}

// 加载品牌列表
async function loadBrands() {
  try {
    const data = await getAllBrands()
    brandList.value = data || []
  } catch (e) {
    console.error('加载品牌列表失败:', e)
  }
}

// 切换排序
function changeOrder(order: number) {
  if (currentOrder.value === order && order === 1) return
  currentOrder.value = order
  queryParams.order = order
  resetAndLoad()
}

// 价格排序切换
function togglePriceOrder() {
  if (currentOrder.value === 2) {
    changeOrder(3)
  } else {
    changeOrder(2)
  }
}

// 重置并加载
function resetAndLoad() {
  page.value = 1
  productList.value = []
  loadStatus.value = 'loadmore'
  loadProducts()
}

// 加载商品
async function loadProducts() {
  if (loading.value) return
  loading.value = true

  try {
    const data = await getProductList({
      page: page.value,
      limit,
      keyword: queryParams.keyword,
      brandId: queryParams.brandId,
      category1Id: queryParams.category1Id,
      category2Id: queryParams.category2Id,
      category3Id: queryParams.category3Id,
      order: queryParams.order
    })

    hasLoaded.value = true

    if (data) {
      const list = data.list || data.records || []
      total.value = data.total || 0

      if (page.value === 1) {
        productList.value = list
      } else {
        productList.value = [...productList.value, ...list]
      }

      // 判断是否还有更多
      if (productList.value.length >= total.value) {
        loadStatus.value = 'nomore'
      } else {
        loadStatus.value = 'loadmore'
      }
    }
  } catch (e) {
    console.error('加载商品列表失败:', e)
    loadStatus.value = 'loadmore'
  } finally {
    loading.value = false
  }
}

// 上拉加载更多
onReachBottom(() => {
  if (loadStatus.value === 'nomore' || loading.value) return
  page.value++
  loadProducts()
})

onLoad((options) => {
  if (options?.keyword) {
    queryParams.keyword = options.keyword
  }
  if (options?.category1Id) {
    queryParams.category1Id = options.category1Id
  }
  if (options?.category2Id) {
    queryParams.category2Id = options.category2Id
  }
  if (options?.category3Id) {
    queryParams.category3Id = options.category3Id
  }
  if (options?.brandId) {
    queryParams.brandId = options.brandId
  }
  if (options?.title) {
    uni.setNavigationBarTitle({ title: decodeURIComponent(options.title) })
  }
  loadBrands()
  loadProducts()
})
</script>

<style lang="scss" scoped>
.page-product-list {
  background: #F5F5F5;
}

.filter-bar {
  display: flex;
  background: #FFFFFF;
  padding: 0 30rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1rpx solid #F0F0F0;

  &__item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx 0;
    font-size: 28rpx;
    color: #666;
    gap: 6rpx;

    &--active {
      color: #E4393C;
      font-weight: bold;
    }
  }

  &__price-icons {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0);
}

.brand-filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.brand-filter-content {
  width: 100%;
  background: #FFFFFF;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.brand-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.brand-filter-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.brand-filter-close {
  padding: 10rpx;
  color: #999;
}

.brand-filter-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.brand-filter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }

  &--active {
    color: #E4393C;
    font-weight: bold;
  }
}
</style>
