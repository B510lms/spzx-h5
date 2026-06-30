<template>
  <view class="page-category">
    <view class="category-container">
      <!-- 左侧一级分类 -->
      <view class="category-left">
        <view
          v-for="item in categoryList"
          :key="item.id"
          class="category-left__item"
          :class="{ 'category-left__item--active': currentId === item.id }"
          @click="selectCategory(item)"
        >
          <text class="category-left__name">{{ item.name }}</text>
        </view>
      </view>

      <!-- 右侧二级和三级分类 -->
      <scroll-view
        scroll-y
        class="category-right"
        :scroll-top="rightScrollTop"
      >
        <view v-if="currentCategory">
          <view
            v-for="sub in currentCategory.children"
            :key="sub.id"
            class="category-right__group"
          >
            <view class="category-right__title">
              <text class="category-right__title-text">{{ sub.name }}</text>
            </view>

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

            <view v-else class="category-right__empty">
              <text class="category-right__empty-text">暂无子分类</text>
            </view>
          </view>
        </view>

        <view class="category-right__loading" v-if="loading">
          <u-loading-icon />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCategoryTree } from '@/api/product'
import type { CategoryNode } from '@/api/product/type'

const categoryList = ref<CategoryNode[]>([])
const currentId = ref<number | string | null>(null)
const loading = ref(false)
const rightScrollTop = ref(0)

const defaultCateImg = '/static/images/temp/cate1.jpg'

const currentCategory = computed(() => {
  return categoryList.value.find(item => item.id === currentId.value)
})

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

function selectCategory(item: CategoryNode) {
  currentId.value = item.id
  // 切换分类后右侧滚动到顶部
  rightScrollTop.value = rightScrollTop.value === 0 ? 1 : 0
}

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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
}

.category-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.category-left {
  width: 180rpx;
  height: 100%;
  background: #FFFFFF;

  &__item {
    padding: 30rpx 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 4rpx solid transparent;
    transition: all 0.3s;

    &--active {
      background: #F5F5F5;
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
  height: 100%;
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
</style>

<style>
/* 隐藏 uni-app tabBar 自动注入的底部占位，分类页自行管理布局 */
uni-page-wrapper::after {
  display: none !important;
}
</style>
