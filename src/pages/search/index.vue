<template>
  <view class="page-search">
    <!-- 搜索栏 -->
    <view class="search-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="search-bar__input-wrap">
        <u-icon name="search" size="16" color="#999" />
        <input
          v-model="keyword"
          class="search-bar__input"
          placeholder="搜索商品"
          confirm-type="search"
          @confirm="doSearch"
          focus
        />
      </view>
      <text class="search-bar__cancel" @click="goBack">取消</text>
    </view>

    <!-- 搜索历史 -->
    <view class="search-history" v-if="!hasSearched && historyList.length > 0">
      <view class="search-history__header flex-between">
        <text class="search-history__title">搜索历史</text>
        <text class="search-history__clear" @click="clearHistory">清除</text>
      </view>
      <view class="search-history__tags">
        <view
          v-for="(item, index) in historyList"
          :key="index"
          class="search-history__tag"
          @click="searchFromHistory(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 热门搜索 -->
    <view class="search-hot" v-if="!hasSearched">
      <view class="search-hot__title">热门搜索</view>
      <view class="search-hot__tags">
        <view
          v-for="(item, index) in hotKeywords"
          :key="index"
          class="search-hot__tag"
          @click="searchFromHistory(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="search-result" v-if="hasSearched">
      <goods-list
        :list="productList"
        :columns="2"
        :load-status="loadStatus"
        :loading="loading"
      />
      <no-data v-if="!loading && productList.length === 0" text="未找到相关商品" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProductList } from '@/api/product'
import type { ProductItem } from '@/api/product/type'
import { useAppStore } from '@/store/app'
import GoodsList from '@/components/goods-list/goods-list.vue'
import NoData from '@/components/no-data/no-data.vue'

const appStore = useAppStore()
const statusBarHeight = appStore.statusBarHeight || 20

const keyword = ref<string>('')
const productList = ref<ProductItem[]>([])
const loading = ref<boolean>(false)
const hasSearched = ref<boolean>(false)
const loadStatus = ref<string>('loadmore')
const page = ref<number>(1)

// 热门搜索关键词
const hotKeywords = ['手机', '电脑', '零食', '水果', '衣服']

// 搜索历史
const historyList = ref<string[]>([])

// 加载搜索历史
function loadHistory() {
  try {
    const history = uni.getStorageSync('searchHistory')
    if (history) {
      historyList.value = JSON.parse(history)
    }
  } catch (e) {
    // ignore
  }
}

// 保存搜索历史
function saveHistory(keyword: string) {
  if (!keyword.trim()) return
  let list = [...historyList.value]
  // 去重
  list = list.filter((item: string) => item !== keyword)
  // 添加到最前
  list.unshift(keyword)
  // 最多保存 10 条
  list = list.slice(0, 10)
  historyList.value = list
  uni.setStorageSync('searchHistory', JSON.stringify(list))
}

// 执行搜索
async function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) return

  saveHistory(kw)
  hasSearched.value = true
  page.value = 1
  productList.value = []
  loadStatus.value = 'loadmore'

  loading.value = true
  try {
    const data = await getProductList({
      page: 1,
      limit: 10,
      keyword: kw,
      order: 1
    })
    if (data) {
      productList.value = data.list || data.records || []
      if (productList.value.length >= (data.total || 0)) {
        loadStatus.value = 'nomore'
      }
    }
  } catch (e) {
    console.error('搜索失败:', e)
  } finally {
    loading.value = false
  }
}

// 从历史/热门搜索
function searchFromHistory(kw: string) {
  keyword.value = kw
  doSearch()
}

// 清除搜索历史
function clearHistory() {
  historyList.value = []
  uni.removeStorageSync('searchHistory')
}

function goBack() {
  uni.navigateBack()
}

onLoad((options) => {
  loadHistory()
  if (options?.keyword) {
    keyword.value = options.keyword
    doSearch()
  }
})
</script>

<style lang="scss" scoped>
.page-search {
  background: #F5F5F5;
  min-height: 100vh;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  padding: 16rpx 30rpx;
  position: sticky;
  top: 0;
  z-index: 99;

  &__input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    background: #F5F5F5;
    border-radius: 36rpx;
    padding: 12rpx 24rpx;
  }

  &__input {
    flex: 1;
    font-size: 26rpx;
    margin-left: 12rpx;
    height: 40rpx;
  }

  &__cancel {
    font-size: 28rpx;
    color: #333;
    margin-left: 20rpx;
    white-space: nowrap;
  }
}

.search-history,
.search-hot {
  background: #FFFFFF;
  padding: 30rpx;
  margin-bottom: 16rpx;

  &__header {
    margin-bottom: 20rpx;
  }

  &__title {
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
  }

  &__clear {
    font-size: 24rpx;
    color: #999;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  &__tag {
    padding: 12rpx 28rpx;
    background: #F5F5F5;
    border-radius: 30rpx;
    font-size: 24rpx;
    color: #666;
  }
}

.search-hot__title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.search-result {
  min-height: calc(100vh - 100rpx);
}
</style>
