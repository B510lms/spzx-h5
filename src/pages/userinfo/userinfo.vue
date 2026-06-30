<template>
  <scroll-view scroll-y class="page-userinfo" :style="{ height: scrollHeight + 'px' }">
    <!-- 头像 -->
    <view class="userinfo-avatar" @click="changeAvatar">
      <text class="userinfo-avatar__label">头像</text>
      <view class="userinfo-avatar__right">
        <image :src="userStore.avatar" mode="aspectFill" class="userinfo-avatar__img" />
        <u-icon name="arrow-right" size="14" color="#C0C4CC" />
      </view>
    </view>

    <!-- 昵称 -->
    <view class="userinfo-item" @click="editNickname">
      <text class="userinfo-item__label">昵称</text>
      <view class="userinfo-item__right">
        <text class="userinfo-item__value">{{ userStore.nickName }}</text>
        <u-icon name="arrow-right" size="14" color="#C0C4CC" />
      </view>
    </view>

    <!-- 手机号 -->
    <view class="userinfo-item">
      <text class="userinfo-item__label">手机号</text>
      <view class="userinfo-item__right">
        <text class="userinfo-item__value">{{ userInfo?.phone || '未绑定' }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import type { UserInfo } from '@/store/user'
import { getCurrentUserInfo } from '@/api/user'

const scrollHeight = uni.getSystemInfoSync().windowHeight

interface UserInfoData {
  phone?: string
  nickName?: string
  avatar?: string
  [key: string]: any
}

const userStore = useUserStore()
const userInfo = ref<UserInfoData | null>(null)

async function loadUserInfo() {
  try {
    const data = await getCurrentUserInfo()
    userInfo.value = data
    if (data) {
      userStore.setUserInfo(data)
    }
  } catch (e) {
    console.error('加载用户信息失败:', e)
  }
}

function changeAvatar() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // TODO: 上传头像到服务器
      uni.showToast({ title: '头像已更新', icon: 'success' })
    }
  })
}

function editNickname() {
  uni.showModal({
    title: '修改昵称',
    editable: true,
    placeholderText: userStore.nickName,
    success: (res) => {
      if (res.confirm && res.content) {
        // TODO: 调用修改昵称接口
        userStore.setUserInfo({ ...userInfo.value, nickName: res.content } as UserInfo)
        uni.showToast({ title: '昵称已修改', icon: 'success' })
      }
    }
  })
}

onShow(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.page-userinfo {
  background: #F5F5F5;
}

.userinfo-avatar {
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  margin-bottom: 16rpx;

  &__label {
    font-size: 28rpx;
    color: #333;
  }

  &__right {
    display: flex;
    align-items: center;
  }

  &__img {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 12rpx;
  }
}

.userinfo-item {
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #F5F5F5;

  &__label {
    font-size: 28rpx;
    color: #333;
  }

  &__right {
    display: flex;
    align-items: center;
  }

  &__value {
    font-size: 26rpx;
    color: #999;
    margin-right: 8rpx;
  }
}
</style>
