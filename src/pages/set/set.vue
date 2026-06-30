<template>
  <scroll-view scroll-y class="page-set" :style="{ height: scrollHeight + 'px' }">

    <!-- 设置项 -->
    <view class="set-menu">
      <!-- 接口地址 -->
      <view class="set-menu__item flex-between" @click="openBaseUrlDialog">
        <text class="set-menu__label">接口地址</text>
        <view class="set-menu__right">
          <text class="set-menu__url">{{ currentBaseUrl || '默认' }}</text>
          <u-icon name="arrow-right" size="14" color="#C0C4CC" />
        </view>
      </view>
      <view class="set-menu__item flex-between" @click="clearCache">
        <text class="set-menu__label">清除缓存</text>
        <u-icon name="arrow-right" size="14" color="#C0C4CC" />
      </view>
      <view class="set-menu__item flex-between" @click="aboutUs">
        <text class="set-menu__label">关于我们</text>
        <view class="set-menu__right">
          <text class="set-menu__version">v1.0.0</text>
          <u-icon name="arrow-right" size="14" color="#C0C4CC" />
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="set-logout" v-if="userStore.isLogin">
      <button class="set-logout__btn" @click="handleLogout">退出登录</button>
    </view>

    <!-- 接口地址弹窗 -->
    <u-popup :show="showBaseUrlPopup" mode="center" @close="cancelBaseUrl" :round="16" :closeable="false">
      <view class="base-url-popup">
        <view class="base-url-popup__title">设置接口地址</view>
        <view class="base-url-popup__body">
          <input
            class="base-url-popup__input"
            v-model="baseUrlInput"
            placeholder="请输入后端接口地址，如 https://api.example.com"
            type="text"
          />
          <text class="base-url-popup__hint">
            当前默认地址：{{ defaultBaseUrl || '开发代理模式（Vite Proxy）' }}
          </text>
        </view>
        <view class="base-url-popup__footer">
          <view class="base-url-popup__btn base-url-popup__btn--reset" @click="resetBaseUrl">
            <text>恢复默认</text>
          </view>
          <view class="base-url-popup__btn base-url-popup__btn--cancel" @click="cancelBaseUrl">
            <text>取消</text>
          </view>
          <view class="base-url-popup__btn base-url-popup__btn--confirm" @click="saveBaseUrl">
            <text>确定</text>
          </view>
        </view>
      </view>
    </u-popup>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useCartStore } from '@/store/cart'
import { getDefaultBaseUrl } from '@/request'

const userStore = useUserStore()
const cartStore = useCartStore()

// 滚动区域高度：windowHeight 已排除 tabBar，无需再减
const scrollHeight = uni.getSystemInfoSync().windowHeight

// ========== 接口地址设置 ==========
const showBaseUrlPopup = ref(false)

// 当前生效的接口地址
const currentBaseUrl = computed(() => {
  const custom = uni.getStorageSync('apiBaseUrl')
  return custom || ''
})

// 默认地址（未自定义时的地址）
const defaultBaseUrl = computed(() => {
  return getDefaultBaseUrl()
})

// 输入框绑定的值
const baseUrlInput = ref('')

function openBaseUrlDialog() {
  // 打开弹窗时，预填当前地址
  const custom = uni.getStorageSync('apiBaseUrl')
  baseUrlInput.value = custom || ''
  showBaseUrlPopup.value = true
}

function saveBaseUrl() {
  const url = baseUrlInput.value.trim()
  if (url) {
    // 去掉末尾的斜杠，保持统一
    uni.setStorageSync('apiBaseUrl', url.replace(/\/+$/, ''))
  } else {
    // 如果输入为空，视为恢复默认
    uni.removeStorageSync('apiBaseUrl')
  }
  showBaseUrlPopup.value = false
  uni.showToast({ title: '接口地址已保存', icon: 'success' })
}

function cancelBaseUrl() {
  showBaseUrlPopup.value = false
}

function resetBaseUrl() {
  uni.removeStorageSync('apiBaseUrl')
  baseUrlInput.value = ''
  showBaseUrlPopup.value = false
  uni.showToast({ title: '已恢复默认地址', icon: 'success' })
}

// ========== 清除缓存 ==========
function clearCache() {
  uni.showModal({
    title: '提示',
    content: '确定清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除数据缓存
        uni.clearStorageSync()
        userStore.clearLoginState()
        cartStore.clearCart()
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      }
    }
  })
}

function aboutUs() {
  uni.showModal({
    title: '尚品甑选',
    content: '品质生活，从这里开始\n\n版本号：v1.0.0',
    showCancel: false
  })
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        cartStore.clearCart()
        uni.showToast({
          title: '已退出',
          icon: 'success',
          complete: () => {
            setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 500)
          }
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page-set {
  background: #F5F5F5;
}

.set-menu {
  background: #FFFFFF;
  margin-bottom: 60rpx;

  &__item {
    padding: 28rpx 30rpx;
    border-bottom: 1rpx solid #F5F5F5;
  }

  &__label {
    font-size: 28rpx;
    color: #333;
  }

  &__right {
    display: flex;
    align-items: center;
    max-width: 50%;
  }

  &__url {
    font-size: 22rpx;
    color: #999;
    margin-right: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__version {
    font-size: 24rpx;
    color: #999;
    margin-right: 8rpx;
  }
}

.set-logout {
  padding: 0 30rpx;

  &__btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #FFFFFF;
    color: #E4393C;
    font-size: 28rpx;
    border-radius: 44rpx;
    border: 1rpx solid #E4393C;
  }
}

// ========== 接口地址弹窗样式 ==========
.base-url-popup {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    text-align: center;
    padding: 40rpx 30rpx 20rpx;
  }

  &__body {
    padding: 20rpx 30rpx 30rpx;
  }

  &__input {
    width: 100%;
    height: 80rpx;
    padding: 0 20rpx;
    font-size: 26rpx;
    color: #333;
    background: #F5F5F5;
    border-radius: 8rpx;
    box-sizing: border-box;
  }

  &__hint {
    display: block;
    font-size: 22rpx;
    color: #C0C4CC;
    margin-top: 16rpx;
    line-height: 1.5;
    word-break: break-all;
  }

  &__footer {
    display: flex;
    border-top: 1rpx solid #F0F0F0;
  }

  &__btn {
    flex: 1;
    text-align: center;
    padding: 28rpx 0;
    font-size: 28rpx;
    position: relative;

    &--reset {
      color: #E4393C;
      flex: 1.2;
    }

    &--cancel {
      color: #999;
    }

    &--confirm {
      color: #E4393C;
      font-weight: 600;
    }
  }

  &__btn + &__btn {
    border-left: 1rpx solid #F0F0F0;
  }
}
</style>
