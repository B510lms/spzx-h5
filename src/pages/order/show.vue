<template>
  <scroll-view scroll-y class="page-order-show" :style="{ height: scrollHeight + 'px' }">
    <!-- 订单状态 -->
    <view class="order-show__status" v-if="orderInfo">
      <view class="order-show__status-icon">
        <u-icon
          :name="statusIcon"
          :size="40"
          :color="statusColor"
        />
      </view>
      <text class="order-show__status-text" :style="{ color: statusColor }">
        {{ getStatusText(orderInfo.orderStatus) }}
      </text>
    </view>

    <!-- 收货地址 -->
    <view class="order-show__section" v-if="orderInfo">
      <view class="order-show__section-title">收货信息</view>
      <view class="order-show__address">
        <text>{{ orderInfo.receiverName }} {{ orderInfo.receiverPhone }}</text>
        <text class="order-show__address-detail">
          {{ orderInfo.receiverProvince }}{{ orderInfo.receiverCity }}{{ orderInfo.receiverDistrict }} {{ orderInfo.receiverAddress }}
        </text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="order-show__section">
      <view class="order-show__section-title">商品信息</view>
      <view
        v-for="item in (orderInfo?.orderItemList || [])"
        :key="item.id"
        class="order-show__item"
      >
        <image
          :src="item.thumbImg || '/static/images/errorImage.jpg'"
          mode="aspectFill"
          class="order-show__img"
        />
        <view class="order-show__info">
          <text class="order-show__name text-ellipsis-2">{{ item.skuName }}</text>
          <view class="flex-between">
            <text class="order-show__price">¥{{ item.skuPrice }}</text>
            <text class="order-show__qty">x{{ item.skuNum }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-show__section" v-if="orderInfo">
      <view class="order-show__section-title">订单信息</view>
      <view class="order-show__row flex-between">
        <text class="order-show__row-label">订单编号</text>
        <text class="order-show__row-value">{{ orderInfo.orderNo }}</text>
      </view>
      <view class="order-show__row flex-between">
        <text class="order-show__row-label">下单时间</text>
        <text class="order-show__row-value">{{ orderInfo.createTime }}</text>
      </view>
      <view class="order-show__row flex-between" v-if="orderInfo.paymentTime">
        <text class="order-show__row-label">付款时间</text>
        <text class="order-show__row-value">{{ orderInfo.paymentTime }}</text>
      </view>
      <view class="order-show__row flex-between">
        <text class="order-show__row-label">商品金额</text>
        <text class="order-show__row-value">¥{{ orderInfo.originalTotalAmount }}</text>
      </view>
      <view class="order-show__row flex-between">
        <text class="order-show__row-label">运费</text>
        <text class="order-show__row-value">¥{{ orderInfo.feightFee }}</text>
      </view>
      <view class="order-show__row flex-between">
        <text class="order-show__row-label">实付金额</text>
        <text class="order-show__row-value price-red">¥{{ orderInfo.totalAmount }}</text>
      </view>
    </view>

    <view class="safe-area-bottom" />
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail } from '@/api/order'
import type { OrderInfo } from '@/api/order/type'
import { getOrderStatusText, getOrderStatusStyle } from '@/utils/common'

const scrollHeight = uni.getSystemInfoSync().windowHeight

const orderInfo = ref<OrderInfo | null>(null)

function getStatusText(status: number) {
  return getOrderStatusText(status)
}

const statusStyle = computed(() => {
  return orderInfo.value ? getOrderStatusStyle(orderInfo.value.orderStatus) : { color: '#909399', bgColor: '#F5F5F5' }
})

const statusColor = computed(() => statusStyle.value.color || '#999')
const statusIcon = computed(() => {
  const status = orderInfo.value?.orderStatus
  if (status === 0) return 'rmb-circle'
  if (status === 1) return 'clock'
  if (status === 2) return 'car'
  if (status === 3) return 'checkmark-circle'
  return 'close-circle'
})

async function loadOrder() {
  try {
    const data = await getOrderDetail(orderId.value)
    orderInfo.value = data
  } catch (e) {
    console.error('加载订单详情失败:', e)
  }
}

const orderId = ref('')

onLoad((options) => {
  orderId.value = options?.orderId || ''
  if (orderId.value) {
    loadOrder()
  }
})
</script>

<style lang="scss" scoped>
.page-order-show {
  background: #F5F5F5;
}

.order-show__status {
  background: #FFFFFF;
  padding: 40rpx 30rpx;
  text-align: center;
  margin-bottom: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  &-icon {
    margin-bottom: 12rpx;
  }

  &-text {
    font-size: 30rpx;
    font-weight: bold;
  }
}

.order-show__section {
  background: #FFFFFF;
  padding: 24rpx 30rpx;
  margin-bottom: 16rpx;

  &-title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 16rpx;
  }
}

.order-show__address {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;

  &-detail {
    display: block;
  }
}

.order-show__item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }
}

.order-show__img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 8rpx;
}

.order-show__info {
  flex: 1;
  margin-left: 16rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-show__name {
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
}

.order-show__price {
  font-size: 28rpx;
  color: #E4393C;
  font-weight: bold;
}

.order-show__qty {
  font-size: 24rpx;
  color: #999;
}

.order-show__row {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }

  &-label {
    font-size: 24rpx;
    color: #999;
  }

  &-value {
    font-size: 24rpx;
    color: #333;
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0);
}
</style>
