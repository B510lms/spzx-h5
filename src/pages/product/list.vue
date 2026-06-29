<template>
  <view class="page-product-list">
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

    <!-- 底部安全距离 -->
    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { getProductList } from '@/api/product'
import type { ProductItem, ProductListParams } from '@/api/product/type'
import GoodsList from '@/components/goods-list/goods-list.vue'
import NoData from '@/components/no-data/no-data.vue'

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
  if (options?.category3Id) {
    queryParams.category3Id = options.category3Id
  }
  if (options?.categoryId) {
    queryParams.category1Id = options.categoryId
  }
  if (options?.brandId) {
    queryParams.brandId = options.brandId
  }
  if (options?.title) {
    uni.setNavigationBarTitle({ title: decodeURIComponent(options.title) })
  }
  loadProducts()
})
</script>

<style lang="scss" scoped>
.page-product-list {
  background: #F5F5F5;
  min-height: 100vh;
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
</style>
