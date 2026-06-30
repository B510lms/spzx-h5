<template>
  <view class="page-index">
    <!-- 自定义导航栏 -->
    <view class="index-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <!-- 搜索栏 -->
      <view class="index-navbar__search" @click="goSearch">
        <u-icon name="search" size="16" color="#999" />
        <text class="index-navbar__search-text">搜索商品</text>
      </view>
    </view>

    <!-- 轮播图 -->
    <swiper
      class="index-banner"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="500"
      circular
    >
      <swiper-item v-for="(item, index) in banners" :key="index">
        <image :src="item" mode="aspectFill" class="index-banner__img" />
      </swiper-item>
    </swiper>

    <!-- 导航入口 -->
    <view class="index-nav">
      <view class="index-nav__list">
        <view
          v-for="item in navList"
          :key="item.id"
          class="index-nav__item"
          @click="goProductListByNav(item)"
        >
          <image :src="item.imageUrl || defaultNavImg" mode="aspectFill" class="index-nav__icon" />
          <text class="index-nav__name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 广告图 -->
    <view class="index-ad" v-if="adImage">
      <image :src="adImage" mode="widthFix" class="index-ad__img" />
    </view>

    <!-- 秒杀/促销区域 -->
    <view class="index-section" v-if="hotProducts.length > 0">
      <view class="index-section__header flex-between">
        <view class="index-section__title">
          <text class="index-section__title-text">热销推荐</text>
        </view>
        <view class="index-section__more" @click="goProductList">
          <text>查看更多</text>
          <u-icon name="arrow-right" size="12" color="#999" />
        </view>
      </view>

      <!-- 商品列表 -->
      <GoodsList
        :list="hotProducts"
        :columns="2"
        :show-load-more="false"
        :show-empty="false"
      />
    </view>

    <!-- 加载状态 -->
    <view class="index-loading" v-if="loading">
      <u-loading-icon />
      <text class="index-loading__text">加载中...</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/store/app'
import { getIndexData } from '@/api/product'
import type { CategoryNode } from '@/api/product/type'
import GoodsList from '@/components/goods-list/goods-list.vue'

const appStore = useAppStore()
const statusBarHeight = appStore.statusBarHeight || 20
const navBarHeight = appStore.navBarHeight || 44

// 轮播图
const banners = ref([
  '/static/images/temp/banner1.jpg',
  '/static/images/temp/banner2.jpg',
  '/static/images/temp/banner3.jpg',
  '/static/images/temp/banner4.jpg'
])

// 导航入口列表
const navList = ref<CategoryNode[]>([])

// 默认导航图标
const defaultNavImg = '/static/images/temp/cate1.jpg'

// 广告图
const adImage = ref('/static/images/temp/ad1.jpg')

// 热销商品
const hotProducts = ref<any[]>([])

// 加载状态
const loading = ref(false)

// 加载首页数据
async function loadIndexData() {
  loading.value = true
  try {
    const data = await getIndexData()
    if (data) {
      navList.value = data.categoryList || []

      // 处理商品 SKU 列表
      const skuList = data.productSkuList || []
      hotProducts.value = skuList.map((item: any) => ({
        ...item,
        name: item.skuName,
        imgUrl: item.thumbImg
      }))
    }
  } catch (e) {
    console.error('加载首页数据失败:', e)
    // 使用默认数据展示
  } finally {
    loading.value = false
  }
}

// 跳转搜索
function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}

// 跳转到商品列表（按导航入口）
function goProductListByNav(item: { id: number | string; name: string }) {
  uni.navigateTo({
    url: `/pages/product/list?category1Id=${item.id}&title=${encodeURIComponent(item.name)}`
  })
}

// 跳转商品列表
function goProductList() {
  uni.navigateTo({ url: '/pages/product/list' })
}

// 下拉刷新
async function onPullDownRefresh() {
  await loadIndexData()
  uni.stopPullDownRefresh()
}

onMounted(() => {
  loadIndexData()
})

// 暴露下拉刷新
defineExpose({ onPullDownRefresh })
</script>

<style lang="scss" scoped>
.page-index {
  background: #F5F5F5;
  min-height: 100vh;
}

.index-navbar {
  background: #FFFFFF;
  padding: 0 30rpx 16rpx;
  position: sticky;
  top: 0;
  z-index: 99;

  &__search {
    display: flex;
    align-items: center;
    background: #F5F5F5;
    border-radius: 36rpx;
    padding: 14rpx 24rpx;
  }

  &__search-text {
    font-size: 26rpx;
    color: #999;
    margin-left: 12rpx;
  }
}

.index-banner {
  width: 100%;
  height: 340rpx;

  &__img {
    width: 100%;
    height: 100%;
  }
}

.index-nav {
  background: #FFFFFF;
  padding: 24rpx 0;

  &__list {
    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
    margin-bottom: 20rpx;
  }

  &__icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-bottom: 10rpx;
  }

  &__name {
    font-size: 22rpx;
    color: #333;
    text-align: center;
  }
}

.index-ad {
  padding: 20rpx;
  background: #FFFFFF;
  margin-top: 16rpx;

  &__img {
    width: 100%;
    display: block;
    border-radius: 12rpx;
  }
}

.index-section {
  margin-top: 16rpx;
  background: #FFFFFF;

  &__header {
    padding: 24rpx 20rpx;
  }

  &__title-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
  }

  &__more {
    display: flex;
    align-items: center;

    text {
      font-size: 24rpx;
      color: #999;
      margin-right: 4rpx;
    }
  }
}

.index-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  &__text {
    font-size: 26rpx;
    color: #999;
    margin-top: 16rpx;
  }
}

</style>
