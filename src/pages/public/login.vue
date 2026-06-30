<template>
  <view class="page-login">
    <!-- 头部 logo -->
    <view class="login-header">
      <image src="/static/images/temp/ad-splash.jpg" mode="aspectFill" class="login-header__bg" />
      <view class="login-header__title">尚品甑选</view>
      <view class="login-header__desc">品质生活，从这里开始</view>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <view class="login-form__item">
        <u-icon name="account" size="20" color="#999" />
        <input
          v-model="form.username"
          class="login-form__input"
          placeholder="请输入用户名/手机号"
          placeholder-style="color:#C0C4CC"
        />
      </view>
      <view class="login-form__item">
        <u-icon name="lock" size="20" color="#999" />
        <input
          v-model="form.password"
          class="login-form__input"
          type="password"
          placeholder="请输入密码"
          placeholder-style="color:#C0C4CC"
        />
      </view>

      <button class="login-btn" @click="handleLogin" :loading="loading" :disabled="loading">
        登录
      </button>

      <view class="login-links">
        <text class="login-links__item" @click="goRegister">注册账号</text>
      </view>
    </view>

    <!-- 协议 -->
    <view class="login-agreement">
      <text class="login-agreement__text">登录即表示同意</text>
      <text class="login-agreement__link">《用户协议》</text>
      <text class="login-agreement__text">和</text>
      <text class="login-agreement__link">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { login as loginApi, getCurrentUserInfo } from '@/api/user'
import { useCartStore } from '@/store/cart'

const userStore = useUserStore()
const cartStore = useCartStore()
const loading = ref(false)
const redirect = ref('')

const form = reactive({
  username: '',
  password: ''
})

// 登录
async function handleLogin() {
  if (!form.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!form.password.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    // 调用登录接口
    const token = await loginApi({
      username: form.username.trim(),
      password: form.password
    })

    if (token) {
      // 保存 token
      userStore.login(token)

      // 获取用户信息
      try {
        const userInfo = await getCurrentUserInfo()
        userStore.setUserInfo(userInfo)
      } catch (e) {
        console.error('获取用户信息失败:', e)
      }

      // 刷新购物车
      try {
        await cartStore.fetchCartList()
      } catch (e) {
        // ignore
      }

      uni.showToast({
        title: '登录成功',
        icon: 'success',
        complete: () => {
          setTimeout(() => {
            if (redirect.value) {
              uni.redirectTo({ url: decodeURIComponent(redirect.value) })
            } else {
              uni.switchTab({ url: '/pages/user/user' })
            }
          }, 500)
        }
      })
    }
  } catch (e) {
    console.error('登录失败:', e)
  } finally {
    loading.value = false
  }
}

// 跳转注册
function goRegister() {
  uni.navigateTo({ url: '/pages/public/register' })
}

onLoad((options) => {
  if (options?.redirect) {
    redirect.value = options.redirect
  }
})
</script>

<style lang="scss" scoped>
.page-login {
  min-height:  calc(100vh - 100rpx);
  background: #FFFFFF;
  padding: 0 60rpx;
}

.login-header {
  text-align: center;
  padding-top: 100rpx;
  padding-bottom: 80rpx;

  &__bg {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    margin-bottom: 30rpx;
  }

  &__title {
    font-size: 44rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
  }

  &__desc {
    font-size: 26rpx;
    color: #999;
  }
}

.login-form {
  &__item {
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid #F0F0F0;
    padding: 24rpx 0;
    margin-bottom: 16rpx;
  }

  &__input {
    flex: 1;
    font-size: 28rpx;
    margin-left: 16rpx;
    height: 48rpx;
  }
}

.login-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #E4393C;
  color: #FFFFFF;
  font-size: 30rpx;
  border-radius: 44rpx;
  border: none;
  margin-top: 60rpx;
  margin-bottom: 30rpx;
}

.login-links {
  display: flex;
  justify-content: center;

  &__item {
    font-size: 26rpx;
    color: #E4393C;
  }
}

.login-agreement {
  position: fixed;
  bottom: 60rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  &__text {
    font-size: 22rpx;
    color: #999;
  }

  &__link {
    font-size: 22rpx;
    color: #E4393C;
  }
}
</style>
