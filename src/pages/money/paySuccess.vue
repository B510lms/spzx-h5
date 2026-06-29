<template>
  <view class="page-pay-success">
    <!-- 成功状态 -->
    <view class="pay-success">
      <view class="pay-success__icon">
        <u-icon name="checkmark-circle-fill" size="80" color="#19BE6B" />
      </view>
      <text class="pay-success__title">支付成功</text>
      <text class="pay-success__desc">感谢您的购买，我们将尽快为您发货</text>
    </view>

    <!-- 订单信息 -->
    <view class="pay-info" v-if="orderNo">
      <view class="pay-info__item flex-between">
        <text class="pay-info__label">订单编号</text>
        <text class="pay-info__value">{{ orderNo }}</text>
      </view>
      <view class="pay-info__item flex-between" v-if="amount > 0">
        <text class="pay-info__label">支付金额</text>
        <text class="pay-info__value price-red">¥{{ amount.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="pay-actions">
      <button class="pay-actions__btn pay-actions__btn--primary" @click="goOrder">
        查看订单
      </button>
      <button class="pay-actions__btn pay-actions__btn--default" @click="goHome">
        返回首页
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const orderNo = ref('')
const amount = ref(0)

function goOrder() {
  uni.redirectTo({ url: '/pages/order/order' })
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

onLoad((options?: Record<string, string>) => {
  orderNo.value = options?.orderNo || ''
  amount.value = Number(options?.amount || 0)
})
</script>

<style lang="scss" scoped>
.page-pay-success {
  background: #F5F5F5;
  min-height: 100vh;
}

.pay-success {
  background: #FFFFFF;
  padding: 80rpx 30rpx 50rpx;
  text-align: center;
  margin-bottom: 16rpx;

  &__icon {
    margin-bottom: 24rpx;
  }

  &__title {
    display: block;
    font-size: 36rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 16rpx;
  }

  &__desc {
    font-size: 26rpx;
    color: #999;
  }
}

.pay-info {
  background: #FFFFFF;
  padding: 0 30rpx;
  margin-bottom: 16rpx;

  &__item {
    padding: 24rpx 0;
    border-bottom: 1rpx solid #F5F5F5;

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    font-size: 26rpx;
    color: #666;
  }

  &__value {
    font-size: 26rpx;
    color: #333;
  }
}

.pay-actions {
  padding: 60rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  &__btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    font-size: 28rpx;
    border-radius: 44rpx;
    border: none;

    &--primary {
      background: #E4393C;
      color: #FFFFFF;
    }

    &--default {
      background: #FFFFFF;
      color: #333;
      border: 1rpx solid #E4E7ED;
    }
  }
}
</style>
