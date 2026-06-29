<template>
  <view class="page-category">
    <!-- 自定义导航栏 -->
    <view class="category-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="category-navbar__search" @click="goSearch">
        <u-icon name="search" size="16" color="#999" />
        <text class="category-navbar__search-text">搜索商品</text>
      </view>
    </view>

    <view class="category-container" :style="{ height: containerHeight + 'px' }">
      <!-- 左侧一级分类 -->
      <scroll-view scroll-y class="category-left">
        <view
          v-for="item in categoryList"
          :key="item.id"
          class="category-left__item"
          :class="{ 'category-left__item--active': currentId === item.id }"
          @click="selectCategory(item)"
        >
          <text class="category-left__name">{{ item.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧二级和三级分类 -->
      <scroll-view scroll-y class="category-right">
        <view v-if="currentCategory">
          <!-- 遍历二级分类 -->
          <view
            v-for="sub in currentCategory.children"
            :key="sub.id"
            class="category-right__group"
          >
            <!-- 二级分类标题 -->
            <view class="category-right__title">
              <text class="category-right__title-text">{{ sub.name }}</text>
            </view>

            <!-- 三级分类网格 -->
            <view class="category-right__grid" v-if="sub.children && sub.children.length > 0">
              <view
                v-for="third in sub.children"
                :key="third.id"
                class="category-right__item"
                @click="goProductList(third.id, third.name)"
              >
                <image
                  :src="third.imageUrl || defaultCateImg"
                  mode="aspectFill"
                  class="category-right__icon"
                />
                <text class="category-right__name">{{ third.name }}</text>
              </view>
            </view>

            <!-- 无三级分类 -->
            <view v-else class="category-right__empty">
              <text class="category-right__empty-text">暂无子分类</text>
            </view>
          </view>
        </view>

        <!-- 加载中 -->
        <view class="category-right__loading" v-if="loading">
          <u-loading-icon />
        </view>
      </scroll-view>
    </view>

    <!-- 底部安全距离 -->
    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/store/app'
import { getCategoryTree } from '@/api/product'
import type { CategoryNode } from '@/api/product/type'

const appStore = useAppStore()
const statusBarHeight = appStore.statusBarHeight || 20
const navBarHeight = appStore.navBarHeight || 44

const categoryList = ref<CategoryNode[]>([])
const currentId = ref<number | string | null>(null)
const loading = ref(false)

const defaultCateImg = '/static/images/temp/cate1.jpg'

// 当前选中的一级分类
const currentCategory = computed(() => {
  return categoryList.value.find(item => item.id === currentId.value)
})

// 容器高度
const containerHeight = computed(() => {
  const sysInfo = uni.getSystemInfoSync()
  const navTotal = statusBarHeight + navBarHeight
  return sysInfo.windowHeight - navTotal - 50
})

// 加载分类数据
async function loadCategories() {
  loading.value = true
  try {
    const data = await getCategoryTree()
    categoryList.value = data || []
    if (categoryList.value.length > 0) {
      currentId.value = categoryList.value[0].id
    }
  } catch (e) {
    console.error('加载分类失败:', e)
  } finally {
    loading.value = false
  }
}

// 选择一级分类
function selectCategory(item: CategoryNode) {
  currentId.value = item.id
}

// 跳转搜索
function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}

// 跳转商品列表（三级分类）
function goProductList(category3Id: number | string, categoryName: string) {
  uni.navigateTo({
    url: `/pages/product/list?category3Id=${category3Id}&title=${encodeURIComponent(categoryName)}`
  })
}

onMounted(() => {
  loadCategories()
})
</script>

<style lang="scss" scoped>
.page-category {
  background: #FFFFFF;
  min-height: 100vh;
}

.category-navbar {
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

.category-container {
  display: flex;
}

.category-left {
  width: 180rpx;
  background: #F5F5F5;

  &__item {
    padding: 30rpx 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 4rpx solid transparent;
    transition: all 0.3s;

    &--active {
      background: #FFFFFF;
      border-left-color: #E4393C;

      .category-left__name {
        color: #E4393C;
        font-weight: bold;
      }
    }
  }

  &__name {
    font-size: 26rpx;
    color: #666;
    text-align: center;
  }
}

.category-right {
  flex: 1;
  background: #FFFFFF;
  padding: 20rpx;

  &__group {
    margin-bottom: 24rpx;
  }

  &__title {
    margin-bottom: 16rpx;
    padding-bottom: 12rpx;
    border-bottom: 1rpx solid #F0F0F0;
  }

  &__title-text {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    width: 33.33%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 0;
  }

  &__icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-bottom: 12rpx;
  }

  &__name {
    font-size: 24rpx;
    color: #333;
    text-align: center;
  }

  &__empty {
    padding: 30rpx 0;
    text-align: center;
  }

  &__empty-text {
    font-size: 24rpx;
    color: #999;
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0);
}
</style>
