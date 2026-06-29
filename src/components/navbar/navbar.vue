<template>
  <view class="custom-navbar" :style="navbarStyle">
    <!-- 状态栏占位 -->
    <view class="custom-navbar__status" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 导航栏主体 -->
    <view class="custom-navbar__body" :style="{ height: navHeight + 'px' }">
      <!-- 返回按钮 -->
      <view class="custom-navbar__back" v-if="showBack" @click="goBack">
        <u-icon name="arrow-left" size="20" color="#333" />
      </view>

      <!-- 标题 -->
      <view class="custom-navbar__title" :class="{ 'has-back': showBack }">
        <text class="custom-navbar__title-text">{{ title }}</text>
      </view>

      <!-- 右侧操作区 -->
      <view class="custom-navbar__actions" v-if="$slots.right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/app'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  },
  backgroundColor: {
    type: String,
    default: '#FFFFFF'
  }
})

const appStore = useAppStore()

const statusBarHeight = computed(() => appStore.statusBarHeight || 20)
const navHeight = computed(() => appStore.navBarHeight || 44)

const navbarStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  paddingTop: '0px'
}))

function goBack() {
  uni.navigateBack({
    delta: 1
  })
}
</script>

<style lang="scss" scoped>
.custom-navbar {
  position: sticky;
  top: 0;
  z-index: 999;
  width: 100%;

  &__body {
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    position: relative;
  }

  &__back {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__title {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    &.has-back {
      justify-content: center;
      padding-right: 60rpx;
    }
  }

  &__title-text {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 400rpx;
  }

  &__actions {
    flex-shrink: 0;
  }
}
</style>
