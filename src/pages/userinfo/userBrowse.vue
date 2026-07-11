<template>
  <scroll-view scroll-y class="page-browse" :style="{ height: scrollHeight + 'px' }">
    <view class="browse-header" v-if="browseList.length > 0">
      <text class="browse-header__title">浏览记录</text>
      <text class="browse-header__clear" @click="clearAll">清空</text>
    </view>

    <no-data v-if="!loading && browseList.length === 0" text="暂无浏览记录">
      <button class="go-btn" @click="goHome">去逛逛</button>
    </no-data>

    <view class="browse-list" v-else>
      <view 
        v-for="(item, index) in browseList" 
        :key="item.id" 
        class="browse-item-wrap"
        @touchstart="onTouchStart($event, index)"
        @touchmove="onTouchMove($event, index)"
        @touchend="onTouchEnd($event, index)"
      >
        <view class="browse-item-delete" @click="deleteItem(item.skuId)">
          <text class="delete-text">删除</text>
        </view>
        <view 
          class="browse-item" 
          :style="{ transform: `translateX(${slideOffsets[index] || 0}px)` }"
          @click="goDetail(item.skuId)"
        >
          <view class="browse-item__img">
            <image :src="item.imgUrl" mode="aspectFill" />
          </view>
          <view class="browse-item__info">
            <text class="browse-item__name">{{ item.skuName }}</text>
            <text class="browse-item__price">¥{{ item.salePrice }}</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getBrowseHistoryList, deleteBrowseHistory, deleteAllBrowseHistory } from '@/api/user/browse'
import { useUserStore } from '@/store/user'
import NoData from '@/components/no-data/no-data.vue'
import { toLogin } from '@/utils/navigator'

const userStore = useUserStore()
const scrollHeight = uni.getSystemInfoSync().windowHeight
const loading = ref(false)
const browseList = ref<any[]>([])

const slideOffsets = ref<{ [key: number]: number }>({})
const startX = ref<{ [key: number]: number }>({})
const deleteWidth = 60

async function loadBrowseHistory() {
  if (!userStore.isLogin) return
  loading.value = true
  try {
    const res = await getBrowseHistoryList()
    browseList.value = res || []
    slideOffsets.value = {}
  } catch (e) {
    console.error('加载浏览记录失败:', e)
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
    await deleteBrowseHistory(skuId)
    browseList.value = browseList.value.filter(item => item.skuId !== skuId)
    uni.showToast({ title: '删除成功', icon: 'success' })
  } catch (e) {
    console.error('删除浏览记录失败:', e)
  }
}

async function clearAll() {
  uni.showModal({
    title: '提示',
    content: '确定要清空所有浏览记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteAllBrowseHistory()
          browseList.value = []
          uni.showToast({ title: '已清空', icon: 'success' })
        } catch (e) {
          console.error('清空浏览记录失败:', e)
        }
      }
    }
  })
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

function goDetail(skuId: number) {
  uni.navigateTo({ url: `/pages/detail/detail?skuId=${skuId}` })
}

onShow(() => {
  if (userStore.isLogin) {
    loadBrowseHistory()
  }
})

onMounted(() => {
  if (!userStore.isLogin) {
    toLogin()
  }
})
</script>

<style lang="scss" scoped>
.page-browse {
  background: #F5F5F5;
}

.browse-header {
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

  &__clear {
    font-size: 24rpx;
    color: #999;
  }
}

.browse-list {
  padding: 20rpx;
}

.browse-item-wrap {
  position: relative;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.browse-item-delete {
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

.browse-item {
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