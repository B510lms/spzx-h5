<template>
  <scroll-view scroll-y class="page-collect" :style="{ height: scrollHeight + 'px' }">
    <view class="collect-header" v-if="collectList.length > 0">
      <text class="collect-header__title">我的收藏</text>
    </view>

    <no-data v-if="!loading && collectList.length === 0" text="暂无收藏">
      <button class="go-btn" @click="goHome">去逛逛</button>
    </no-data>

    <view class="collect-list" v-else>
      <view 
        v-for="(item, index) in collectList" 
        :key="item.id" 
        class="collect-item-wrap"
        @touchstart="onTouchStart($event, index)"
        @touchmove="onTouchMove($event, index)"
        @touchend="onTouchEnd($event, index)"
      >
        <view class="collect-item-delete" @click="deleteItem(item.skuId)">
          <text class="delete-text">删除</text>
        </view>
        <view 
          class="collect-item" 
          :style="{ transform: `translateX(${slideOffsets[index] || 0}px)` }"
          @click="goDetail(item.skuId)"
        >
          <view class="collect-item__img">
            <image :src="item.imgUrl" mode="aspectFill" />
          </view>
          <view class="collect-item__info">
            <text class="collect-item__name">{{ item.skuName }}</text>
            <text class="collect-item__price">¥{{ item.salePrice }}</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCollectList, deleteCollect } from '@/api/user/collect'
import { useUserStore } from '@/store/user'
import NoData from '@/components/no-data/no-data.vue'
import { toLogin } from '@/utils/navigator'

const userStore = useUserStore()
const scrollHeight = uni.getSystemInfoSync().windowHeight
const loading = ref(false)
const collectList = ref<any[]>([])

const slideOffsets = ref<{ [key: number]: number }>({})
const startX = ref<{ [key: number]: number }>({})
const deleteWidth = 60

async function loadCollectList() {
  if (!userStore.isLogin) return
  loading.value = true
  try {
    const res = await getCollectList()
    collectList.value = res || []
    slideOffsets.value = {}
  } catch (e) {
    console.error('加载收藏失败:', e)
  } finally {
    loading.value = false
  }
}

function onTouchStart(e: TouchEvent, index: number) {
  startX.value[index] = e.touches[0].clientX
  for (const key of Object.keys(slideOffsets.value)) {
    const idx = parseInt(key)
    if (idx !== index && slideOffsets.value[idx] !== 0) {
      slideOffsets.value[idx] = 0
    }
  }
}

function onTouchMove(e: TouchEvent, index: number) {
  const currentX = e.touches[0].clientX
  const diff = currentX - startX.value[index]
  let offset = diff
  if (offset > 0) offset = 0
  if (offset < -deleteWidth) offset = -deleteWidth
  slideOffsets.value[index] = offset
}

function onTouchEnd(e: TouchEvent, index: number) {
  const currentX = e.changedTouches[0].clientX
  const diff = currentX - startX.value[index]
  if (diff < -deleteWidth / 2) {
    slideOffsets.value[index] = -deleteWidth
  } else {
    slideOffsets.value[index] = 0
  }
}

async function deleteItem(skuId: number) {
  try {
    await deleteCollect(skuId)
    collectList.value = collectList.value.filter(item => item.skuId !== skuId)
    uni.showToast({ title: '已取消收藏', icon: 'success' })
  } catch (e) {
    console.error('取消收藏失败:', e)
  }
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

function goDetail(skuId: number) {
  uni.navigateTo({ url: `/pages/detail/detail?skuId=${skuId}` })
}

onShow(() => {
  if (userStore.isLogin) {
    loadCollectList()
  }
})

onMounted(() => {
  if (!userStore.isLogin) {
    toLogin()
  }
})
</script>

<style lang="scss" scoped>
.page-collect {
  background: #F5F5F5;
}

.collect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #FFFFFF;

  &__title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
  }
}

.collect-list {
  padding: 20rpx;
}

.collect-item-wrap {
  position: relative;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.collect-item-delete {
  position: absolute;
  right: 5rpx;
  top: 10rpx;
  bottom: 10rpx;
  width: 120rpx;
  background: #E4393C;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 10rpx 10rpx 0;

  .delete-text {
    color: #FFFFFF;
    font-size: 28rpx;
  }
}

.collect-item {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 10rpx;
  padding: 20rpx;
  position: relative;
  transition: transform 0.2s ease;

  &__img {
    width: 180rpx;
    height: 180rpx;
    border-radius: 8rpx;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
    }
  }

  &__info {
    flex: 1;
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;

    &__name {
      font-size: 26rpx;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
      margin-bottom: 10rpx;
    }

    &__price {
      font-size: 30rpx;
      color: #E4393C;
      font-weight: bold;
    }
  }
}

.go-btn {
  margin-top: 20rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #E4393C;
  color: #FFFFFF;
  font-size: 26rpx;
  border-radius: 36rpx;
  padding: 0 60rpx;
  border: none;
}
</style>