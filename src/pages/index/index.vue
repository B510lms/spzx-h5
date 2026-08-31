<template>
  <view class="page-index">
    <!-- 轮播图区域（含搜索栏） -->
    <view class="index-banner-wrap">
      <!-- 轮播图 -->
      <swiper
        class="index-banner"
        :indicator-dots="false"
        :autoplay="true"
        :interval="3000"
        :duration="500"
        circular
        @change="onBannerChange"
      >
        <swiper-item v-for="(item, index) in banners" :key="index">
          <image :src="item" mode="aspectFill" class="index-banner__img" />
        </swiper-item>
      </swiper>

      <!-- 顶部渐变遮罩（搜索栏上方，保护状态栏） -->
      <view class="index-banner__top-mask" />

      <!-- 搜索栏（毛玻璃，悬浮在轮播图顶部） -->
      <view class="index-banner__search" @click="goSearch">
        <u-icon name="search" size="16" color="#999" />
        <text class="index-banner__search-text">搜索商品</text>
      </view>

      <!-- 自定义进度条指示器 -->
      <view class="index-banner__dots">
        <view
          v-for="(_item, index) in banners"
          :key="index"
          class="index-banner__dot"
          :class="{ 'index-banner__dot--active': currentBanner === index }"
        />
      </view>

      <!-- 底部白色渐变过渡 -->
      <view class="index-banner__bottom-mask" />
    </view>

    <!-- 滚动后出现的紧凑导航栏 -->
    <view
      class="index-navbar-scroll"
      :style="{ opacity: navOpacity }"
      v-show="navOpacity > 0.3"
    >
      <view class="index-navbar-scroll__inner">
        <view class="index-navbar-scroll__search" @click="goSearch">
          <u-icon name="search" size="16" color="#999" />
          <text class="index-navbar-scroll__search-text">搜索商品</text>
        </view>
      </view>
    </view>

    <!-- 导航入口 -->
    <view class="index-nav">
      <view class="index-nav__list">
        <view
          v-for="item in navList"
          :key="item.id"
          class="index-nav__item"
          @click="goProductListByNav(item)"
        >
          <image :src="item.imageUrl" mode="aspectFill" class="index-nav__icon" />
          <text class="index-nav__name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 广告图 -->
    <view class="index-ad" v-if="adImage">
      <image :src="adImage" mode="widthFix" class="index-ad__img" />
    </view>

    <!-- 热销推荐区域 -->
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
import { ref, onMounted, computed } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app'
import { getIndexData } from '@/api/product'
import type { CategoryNode } from '@/api/product/type'
import GoodsList from '@/components/goods-list/goods-list.vue'

// 轮播图
const banners = ref([
  '/static/images/temp/banner1.jpg',
  '/static/images/temp/banner2.jpg',
  '/static/images/temp/banner3.jpg',
])

// 当前轮播索引
const currentBanner = ref(0)

// 轮播切换
function onBannerChange(e: any) {
  currentBanner.value = e.detail.current
}

// 导航入口列表
const navList = ref<CategoryNode[]>([])

// 广告图
const adImage = ref('https://lilishop-oss.oss-cn-beijing.aliyuncs.com/1313246c16f6471e8e751355a675fbfb.gif')

// 滚动距离
const scrollTop = ref(0)
// 导航栏透明度 (0-1)，滚动超过轮播图后渐显
const navOpacity = computed(() => {
  const threshold = 300
  return Math.min(Math.max(scrollTop.value - 200, 0) / threshold, 1)
})

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

      const skuList = data.productSkuList || []
      hotProducts.value = skuList.map((item: any) => ({
        ...item,
        name: item.skuName,
        imgUrl: item.thumbImg
      }))
    }
  } catch (e) {
    console.error('加载首页数据失败:', e)
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

onPageScroll((e) => {
  scrollTop.value = e.scrollTop
})

defineExpose({ onPullDownRefresh })
</script>

<style lang="scss" scoped>
.page-index {
  background: #F5F5F5;
  min-height: 100vh;
}

// ==================== 轮播图区域 ====================
.index-banner-wrap {
  position: relative;
  width: 100%;
  height: 440rpx;
  overflow: hidden;
}

// 顶部暗色渐变遮罩（状态栏区域，搜索栏上方）
.index-banner__top-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180rpx;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 100%);
  z-index: 2;
  pointer-events: none;
}

// 底部白色渐变过渡
.index-banner__bottom-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60rpx;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 100%);
  z-index: 2;
  pointer-events: none;
}

.index-banner {
  width: 100%;
  height: 100%;

  &__img {
    width: 100%;
    height: 100%;
  }
}

// 进度条胶囊指示器
.index-banner__dots {
  position: absolute;
  bottom: 24rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12rpx;
  z-index: 3;
}

.index-banner__dot {
  width: 24rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;

  &--active {
    width: 40rpx;
    background: #E4393C;
  }
}

// 毛玻璃搜索栏（顶部）
.index-banner__search {
  position: absolute;
  top: calc(var(--status-bar-height) + 36rpx);
  left: 24rpx;
  right: 24rpx;
  display: flex;
  align-items: center;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 36rpx;
  padding: 0 28rpx;
  z-index: 3;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:active {
    background: rgba(255, 255, 255, 0.9);
    transform: scale(0.98);
  }
}

.index-banner__search-text {
  font-size: 26rpx;
  color: #999;
  margin-left: 12rpx;
}

// ==================== 滚动后紧凑导航栏 ====================
.index-navbar-scroll {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding-top: var(--status-bar-height);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: opacity 0.3s ease;

  &__inner {
    padding: 10rpx 24rpx;
  }

  &__search {
    display: flex;
    align-items: center;
    height: 64rpx;
    background: #F5F5F5;
    border-radius: 32rpx;
    padding: 0 24rpx;
  }

  &__search-text {
    font-size: 26rpx;
    color: #999;
    margin-left: 12rpx;
  }
}

// ==================== 导航入口 ====================
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

// ==================== 广告图 ====================
.index-ad {
  width: 100%;
  background: #FFFFFF;
  padding: 10rpx 0;

  &__img {
    width: 100%;
  }
}

// ==================== 热销推荐区域 ====================
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

// ==================== 加载状态 ====================
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
