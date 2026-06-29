<template>
  <view class="page-user">
    <!-- 头部背景 -->
    <view class="user-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <image src="/static/images/user-bg.jpg" mode="aspectFill" class="user-header__bg" />
      <view class="user-header__content">
        <!-- 已登录 -->
        <view class="user-header__info" v-if="userStore.isLogin" @click="goUserInfo">
          <image :src="userStore.avatar" mode="aspectFill" class="user-header__avatar" />
          <view class="user-header__text">
            <text class="user-header__name">{{ userStore.nickName }}</text>
          </view>
        </view>
        <!-- 未登录 -->
        <view class="user-header__info" v-else @click="goLogin">
          <image src="/static/images/missing-face.png" mode="aspectFill" class="user-header__avatar" />
          <view class="user-header__text">
            <text class="user-header__name">点击登录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单入口 -->
    <view class="user-order">
      <view class="user-order__header flex-between">
        <text class="user-order__title">我的订单</text>
        <view class="user-order__all" @click="goOrderList()">
          <text>全部订单</text>
          <u-icon name="arrow-right" size="12" color="#999" />
        </view>
      </view>
      <view class="user-order__grid">
        <view class="user-order__item" @click="goOrderList(0)">
          <u-icon name="rmb-circle" size="24" color="#E4393C" />
          <text class="user-order__label">待付款</text>
        </view>
        <view class="user-order__item" @click="goOrderList(1)">
          <u-icon name="car" size="24" color="#FF9900" />
          <text class="user-order__label">待发货</text>
        </view>
        <view class="user-order__item" @click="goOrderList(2)">
          <u-icon name="order" size="24" color="#19BE6B" />
          <text class="user-order__label">已发货</text>
        </view>
        <view class="user-order__item" @click="goOrderList(3)">
          <u-icon name="checkmark-circle" size="24" color="#909399" />
          <text class="user-order__label">已完成</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="user-menu">
      <view class="user-menu__item" @click="goAddress">
        <u-icon name="map" size="20" color="#E4393C" />
        <text class="user-menu__label">地址管理</text>
        <u-icon name="arrow-right" size="14" color="#C0C4CC" />
      </view>
      <view class="user-menu__item" @click="goBrowseHistory">
        <u-icon name="eye" size="20" color="#FF9900" />
        <text class="user-menu__label">浏览记录</text>
        <u-icon name="arrow-right" size="14" color="#C0C4CC" />
      </view>
      <view class="user-menu__item" @click="goCollect">
        <u-icon name="star" size="20" color="#F5A623" />
        <text class="user-menu__label">我的收藏</text>
        <u-icon name="arrow-right" size="14" color="#C0C4CC" />
      </view>
      <view class="user-menu__item" @click="goNotice">
        <u-icon name="bell" size="20" color="#19BE6B" />
        <text class="user-menu__label">消息通知</text>
        <u-icon name="arrow-right" size="14" color="#C0C4CC" />
      </view>
      <view class="user-menu__item" @click="goSet">
        <u-icon name="setting" size="20" color="#909399" />
        <text class="user-menu__label">设置</text>
        <u-icon name="arrow-right" size="14" color="#C0C4CC" />
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="user-logout" v-if="userStore.isLogin">
      <button class="user-logout__btn" @click="handleLogout">退出登录</button>
    </view>

    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import { useCartStore } from '@/store/cart'

const userStore = useUserStore()
const appStore = useAppStore()
const cartStore = useCartStore()

const statusBarHeight = appStore.statusBarHeight || 20

// 跳转登录
function goLogin() {
  uni.navigateTo({ url: '/pages/public/login' })
}

// 跳转个人信息
function goUserInfo() {
  if (!userStore.isLogin) return goLogin()
  uni.navigateTo({ url: '/pages/userinfo/userinfo' })
}

// 跳转订单列表
function goOrderList(status?: number) {
  if (!userStore.isLogin) return goLogin()
  const url = status !== undefined
    ? `/pages/order/order?status=${status}`
    : '/pages/order/order'
  console.log(url)
  uni.navigateTo({ url })
}

// 跳转地址管理
function goAddress() {
  if (!userStore.isLogin) return goLogin()
  uni.navigateTo({ url: '/pages/address/addressManage' })
}

// 跳转浏览记录
function goBrowseHistory() {
  if (!userStore.isLogin) return goLogin()
  uni.navigateTo({ url: '/pages/userinfo/userBrowse' })
}

// 跳转收藏
function goCollect() {
  if (!userStore.isLogin) return goLogin()
  uni.navigateTo({ url: '/pages/userinfo/userCollect' })
}

// 跳转通知
function goNotice() {
  uni.navigateTo({ url: '/pages/notice/notice' })
}

// 跳转设置
function goSet() {
  uni.navigateTo({ url: '/pages/set/set' })
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        cartStore.clearCart()
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    }
  })
}

onMounted(() => {
  userStore.checkLogin()
})

onShow(() => {
  userStore.checkLogin()
  if (userStore.isLogin) {
    cartStore.fetchCartList()
  }
})
</script>

<style lang="scss" scoped>
.page-user {
  background: #F5F5F5;
  min-height: 100vh;
}

.user-header {
  position: relative;
  height: 340rpx;
  overflow: hidden;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__content {
    position: relative;
    z-index: 1;
    padding: 60rpx 40rpx 0;
  }

  &__info {
    display: flex;
    align-items: center;
  }

  &__avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.6);
  }

  &__text {
    margin-left: 24rpx;
  }

  &__name {
    font-size: 36rpx;
    color: #FFFFFF;
    font-weight: bold;
  }
}

.user-order {
  background: #FFFFFF;
  margin: -40rpx 20rpx 16rpx;
  border-radius: 16rpx;
  position: relative;
  z-index: 2;
  padding: 24rpx;

  &__header {
    margin-bottom: 24rpx;
  }

  &__title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
  }

  &__all {
    display: flex;
    align-items: center;

    text {
      font-size: 24rpx;
      color: #999;
    }
  }

  &__grid {
    display: flex;
    justify-content: space-around;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10rpx 20rpx;
  }

  &__label {
    font-size: 22rpx;
    color: #666;
    margin-top: 10rpx;
  }
}

.user-menu {
  background: #FFFFFF;
  margin: 0 20rpx 16rpx;
  border-radius: 16rpx;
  overflow: hidden;

  &__item {
    display: flex;
    align-items: center;
    padding: 28rpx 30rpx;
    border-bottom: 1rpx solid #F5F5F5;

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    font-size: 28rpx;
    color: #333;
    flex: 1;
    margin-left: 16rpx;
  }
}

.user-logout {
  padding: 40rpx 20rpx;

  &__btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background: #FFFFFF;
    color: #E4393C;
    font-size: 28rpx;
    border-radius: 40rpx;
    border: 1rpx solid #E4393C;
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0);
}
</style>
