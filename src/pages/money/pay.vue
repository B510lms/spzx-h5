<template>
  <view class="page-pay">
    <!-- 支付金额 -->
    <view class="pay-amount">
      <text class="pay-amount__label">待支付金额</text>
      <text class="pay-amount__value">¥{{ amount }}</text>
    </view>

    <!-- 支付方式 -->
    <view class="pay-methods">
      <view class="pay-methods__title">选择支付方式</view>
      <view
        class="pay-methods__item"
        :class="{ 'pay-methods__item--active': payType === 'alipay' }"
        @click="payType = 'alipay'"
      >
        <view class="pay-methods__icon pay-methods__icon--alipay">
          <text>支</text>
        </view>
        <text class="pay-methods__name">支付宝</text>
        <u-icon
          :name="payType === 'alipay' ? 'checkbox-mark' : 'checkbox'"
          :size="20"
          :color="payType === 'alipay' ? '#E4393C' : '#C0C4CC'"
        />
      </view>
      <view
        class="pay-methods__item"
        :class="{ 'pay-methods__item--active': payType === 'wechat' }"
        @click="payType = 'wechat'"
      >
        <view class="pay-methods__icon pay-methods__icon--wechat">
          <text>微</text>
        </view>
        <text class="pay-methods__name">微信支付</text>
        <u-icon
          :name="payType === 'wechat' ? 'checkbox-mark' : 'checkbox'"
          :size="20"
          :color="payType === 'wechat' ? '#E4393C' : '#C0C4CC'"
        />
      </view>
    </view>

    <!-- 支付按钮 -->
    <view class="pay-btn-wrap">
      <button class="pay-btn" @click="handlePay" :loading="paying" :disabled="paying">
        立即支付
      </button>
    </view>

    <!-- 支付宝支付表单（隐藏iframe加载） -->
    <view class="pay-form" v-if="payFormHtml">
      <!-- #ifdef H5 -->
      <view v-html="payFormHtml"></view>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { submitAlipay } from '@/api/pay'
import { getOrderDetail } from '@/api/order'

const orderId = ref('')
const orderNo = ref('')
const amount = ref(0)
const payType = ref('alipay')
const paying = ref(false)
const payFormHtml = ref('')

// 加载订单信息
async function loadOrder() {
  if (!orderId.value) return
  try {
    const data = await getOrderDetail(orderId.value)
    if (data) {
      orderNo.value = data.orderNo || ''
      amount.value = data.totalAmount || 0
    }
  } catch (e) {
    console.error('加载订单失败:', e)
  }
}

// 支付
async function handlePay() {
  if (!orderNo.value) {
    uni.showToast({ title: '订单信息异常', icon: 'none' })
    return
  }

  paying.value = true
  try {
    if (payType.value === 'alipay') {
      const html = await submitAlipay(orderNo.value)
      // 支付宝返回的是 HTML 表单，需要自动提交
      // #ifdef H5
      payFormHtml.value = html
      // 自动提交表单
      setTimeout(() => {
        const form = document.querySelector('form')
        if (form) form.submit()
      }, 100)
      // #endif

      // #ifdef MP-WEIXIN
      uni.showToast({ title: '请在小程序中完成支付', icon: 'none' })
      // #endif
    } else {
      uni.showToast({ title: '暂仅支持支付宝支付', icon: 'none' })
    }
  } catch (e) {
    console.error('支付失败:', e)
  } finally {
    paying.value = false
  }
}

onLoad((options?: Record<string, string>) => {
  orderId.value = options?.orderId || ''
  if (orderId.value) {
    loadOrder()
  }
})
</script>

<style lang="scss" scoped>
.page-pay {
  background: #F5F5F5;
  min-height: 100vh;
}

.pay-amount {
  background: #FFFFFF;
  padding: 60rpx 30rpx;
  text-align: center;
  margin-bottom: 16rpx;

  &__label {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
  }

  &__value {
    font-size: 60rpx;
    color: #E4393C;
    font-weight: bold;
  }
}

.pay-methods {
  background: #FFFFFF;
  padding: 0 30rpx;

  &__title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    padding: 30rpx 0 20rpx;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #F5F5F5;

    &:last-child {
      border-bottom: none;
    }
  }

  &__icon {
    width: 56rpx;
    height: 56rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;

    text {
      font-size: 28rpx;
      color: #FFFFFF;
      font-weight: bold;
    }

    &--alipay {
      background: #1677FF;
    }

    &--wechat {
      background: #07C160;
    }
  }

  &__name {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }
}

.pay-btn-wrap {
  padding: 60rpx 30rpx;
}

.pay-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #E4393C;
  color: #FFFFFF;
  font-size: 30rpx;
  border-radius: 44rpx;
  border: none;

  &[disabled] {
    background: #C0C4CC;
  }
}

.pay-form {
  display: none;
}
</style>
