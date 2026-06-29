<template>
  <view class="page-register">
    <view class="register-form">
      <view class="register-form__item">
        <u-icon name="account" size="20" color="#999" />
        <input
          v-model="form.username"
          class="register-form__input"
          placeholder="请输入手机号"
          placeholder-style="color:#C0C4CC"
          type="number"
          maxlength="11"
        />
      </view>

      <view class="register-form__item">
        <u-icon name="lock" size="20" color="#999" />
        <input
          v-model="form.password"
          class="register-form__input"
          type="password"
          placeholder="请设置密码（6-20位）"
          placeholder-style="color:#C0C4CC"
          maxlength="20"
        />
      </view>

      <view class="register-form__item">
        <u-icon name="man" size="20" color="#999" />
        <input
          v-model="form.nickName"
          class="register-form__input"
          placeholder="请输入昵称"
          placeholder-style="color:#C0C4CC"
          maxlength="20"
        />
      </view>

      <view class="register-form__item">
        <u-icon name="chat" size="20" color="#999" />
        <input
          v-model="form.code"
          class="register-form__input"
          placeholder="请输入验证码"
          placeholder-style="color:#C0C4CC"
          maxlength="6"
        />
        <button
          class="register-form__sms-btn"
          :disabled="smsCountdown > 0"
          @click="sendSmsCode"
        >
          {{ smsCountdown > 0 ? smsCountdown + 's' : '获取验证码' }}
        </button>
      </view>

      <button class="register-btn" @click="handleRegister" :loading="loading" :disabled="loading">
        注册
      </button>

      <view class="register-links">
        <text class="register-links__item" @click="goLogin">已有账号？去登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { register as registerApi, sendSms } from '@/api/user'
import { useUserStore } from '@/store/user'
import { isPhone } from '@/utils/common'

const userStore = useUserStore()
const loading = ref(false)
const smsCountdown = ref(0)

const form = reactive({
  username: '',
  password: '',
  nickName: '',
  code: ''
})

// 发送短信验证码
async function sendSmsCode() {
  if (!form.username.trim()) {
    uni.showToast({ title: '请先输入手机号', icon: 'none' })
    return
  }
  if (!isPhone(form.username.trim())) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    await sendSms(form.username.trim())
    uni.showToast({ title: '验证码已发送', icon: 'success' })

    // 倒计时
    smsCountdown.value = 60
    const timer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (e) {
    console.error('发送验证码失败:', e)
  }
}

// 注册
async function handleRegister() {
  if (!isPhone(form.username.trim())) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!form.password.trim() || form.password.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' })
    return
  }
  if (!form.nickName.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  if (!form.code.trim()) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await registerApi({
      username: form.username.trim(),
      password: form.password,
      nickName: form.nickName.trim(),
      code: form.code.trim()
    })

    uni.showToast({
      title: '注册成功',
      icon: 'success',
      complete: () => {
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    })
  } catch (e) {
    console.error('注册失败:', e)
  } finally {
    loading.value = false
  }
}

function goLogin() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page-register {
  min-height: 100vh;
  background: #FFFFFF;
  padding: 0 60rpx;
}

.register-form {
  padding-top: 60rpx;

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

  &__sms-btn {
    font-size: 24rpx;
    color: #E4393C;
    background: none;
    border: 1rpx solid #E4393C;
    border-radius: 8rpx;
    padding: 8rpx 16rpx;
    line-height: 1.4;
    white-space: nowrap;

    &[disabled] {
      color: #999;
      border-color: #E4E7ED;
    }
  }
}

.register-btn {
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

.register-links {
  display: flex;
  justify-content: center;

  &__item {
    font-size: 26rpx;
    color: #E4393C;
  }
}
</style>
