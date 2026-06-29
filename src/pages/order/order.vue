<template>
  <view class="page-order">
    <!-- 订单状态筛选 -->
    <view class="order-tabs">
      <scroll-view scroll-x class="order-tabs__scroll">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          class="order-tabs__item"
          :class="{ 'order-tabs__item--active': activeTab === tab.value }"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </view>
      </scroll-view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list" v-if="!loading && orders.length > 0">
      <view
        v-for="order in orders"
        :key="order.id"
        class="order-card"
      >
        <!-- 订单头部 -->
        <view class="order-card__header flex-between">
          <text class="order-card__no">订单号: {{ order.orderNo }}</text>
          <text class="order-card__status" :style="{ color: getStatusStyle(order.orderStatus).color }">
            {{ getStatusText(order.orderStatus) }}
          </text>
        </view>

        <!-- 订单商品 -->
        <view
          v-for="item in (order.orderItemList || [])"
          :key="item.id"
          class="order-card__item"
          @click="goOrderDetail(order.id)"
        >
          <image
            :src="item.thumbImg || '/static/images/errorImage.jpg'"
            mode="aspectFill"
            class="order-card__img"
          />
          <view class="order-card__info">
            <text class="order-card__name text-ellipsis-2">{{ item.skuName }}</text>
            <view class="order-card__bottom flex-between">
              <text class="order-card__price">¥{{ item.skuPrice }}</text>
              <text class="order-card__qty">x{{ item.skuNum }}</text>
            </view>
          </view>
        </view>

        <!-- 订单底部 -->
        <view class="order-card__footer flex-between">
          <text class="order-card__total">共{{ getTotalCount(order) }}件商品 合计: ¥{{ order.totalAmount }}</text>
          <view class="order-card__actions">
            <!-- 待付款 -->
            <button
              v-if="order.orderStatus === 0"
              class="order-card__btn order-card__btn--primary"
              @click="goPay(order)"
            >
              立即付款
            </button>
            <!-- 待发货 -->
            <button
              v-if="order.orderStatus === 1"
              class="order-card__btn order-card__btn--default"
            >
              提醒发货
            </button>
            <!-- 已发货 -->
            <button
              v-if="order.orderStatus === 2"
              class="order-card__btn order-card__btn--primary"
              @click="confirmReceive(order)"
            >
              确认收货
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <no-data v-if="!loading && orders.length === 0" text="暂无订单" />

    <!-- 加载更多 -->
    <view class="order-loadmore" v-if="orders.length > 0">
      <u-loadmore :status="loadStatus" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getOrderList } from '@/api/order'
import type { OrderInfo } from '@/api/order/type'
import { getOrderStatusText, getOrderStatusStyle } from '@/utils/common'
import { toLogin } from '@/utils/navigator'
import NoData from '@/components/no-data/no-data.vue'

const userStore = useUserStore()

const tabs = [
  { label: '全部', value: undefined },
  { label: '待付款', value: 0 },
  { label: '待发货', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: -1 }
]

const activeTab = ref<number | undefined>(undefined)
const orders = ref<OrderInfo[]>([])
const page = ref(1)
const loading = ref(false)
const loadStatus = ref('loadmore')

function getStatusText(status: number) {
  return getOrderStatusText(status)
}

function getStatusStyle(status: number) {
  return getOrderStatusStyle(status)
}

function getTotalCount(order: OrderInfo) {
  return (order.orderItemList || []).reduce((sum: number, item) => sum + item.skuNum, 0)
}

async function loadOrders() {
  if (loading.value) return
  loading.value = true

  try {
    const data = await getOrderList(page.value, 10, activeTab.value)
    if (data) {
      console.log(data)
      const list = data.list || []
      const total = data.total || 0

      if (page.value === 1) {
        orders.value = list
      } else {
        orders.value = [...orders.value, ...list]
      }
      console.log(orders.value)

      if (orders.value.length >= total) {
        loadStatus.value = 'nomore'
      } else {
        loadStatus.value = 'loadmore'
      }
    }
  } catch (e) {
    console.error('加载订单失败:', e)
  } finally {
    loading.value = false
  }
}

function switchTab(value: number | undefined) {
  if (activeTab.value === value) return
  activeTab.value = value
  page.value = 1
  orders.value = []
  loadStatus.value = 'loadmore'
  loadOrders()
}

function goOrderDetail(orderId: number) {
  uni.navigateTo({ url: `/pages/order/show?orderId=${orderId}` })
}

function goPay(order: OrderInfo) {
  uni.navigateTo({ url: `/pages/money/pay?orderId=${order.id}` })
}

function confirmReceive(order: OrderInfo) {
  uni.showModal({
    title: '确认收货',
    content: '确定已收到商品吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '收货成功', icon: 'success' })
        loadOrders()
      }
    }
  })
}

onReachBottom(() => {
  if (loadStatus.value === 'nomore' || loading.value) return
  page.value++
  loadOrders()
})

onLoad((options) => {
  console.log(options)
  if (!userStore.isLogin) {
    toLogin()
    return
  }
  if (options?.status !== undefined) {
    activeTab.value = Number(options.status)
  }
  loadOrders()
})
</script>

<style lang="scss" scoped>
.page-order {
  background: #F5F5F5;
  min-height: 100vh;
}

.order-tabs {
  background: #FFFFFF;
  position: sticky;
  top: 0;
  z-index: 10;

  &__scroll {
    white-space: nowrap;
  }

  &__item {
    display: inline-block;
    padding: 24rpx 30rpx;
    font-size: 26rpx;
    color: #666;
    position: relative;

    &--active {
      color: #E4393C;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 4rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: #E4393C;
        border-radius: 2rpx;
      }
    }
  }
}

.order-card {
  background: #FFFFFF;
  margin: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;

  &__header {
    padding: 20rpx 24rpx;
    border-bottom: 1rpx solid #F5F5F5;
  }

  &__no {
    font-size: 24rpx;
    color: #999;
  }

  &__status {
    font-size: 24rpx;
    font-weight: bold;
  }

  &__item {
    display: flex;
    padding: 20rpx 24rpx;
    border-bottom: 1rpx solid #F5F5F5;
  }

  &__img {
    width: 140rpx;
    height: 140rpx;
    border-radius: 8rpx;
    background: #F5F5F5;
  }

  &__info {
    flex: 1;
    margin-left: 16rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__name {
    font-size: 26rpx;
    color: #333;
    line-height: 1.4;
  }

  &__bottom {
    margin-top: auto;
  }

  &__price {
    font-size: 28rpx;
    color: #E4393C;
    font-weight: bold;
  }

  &__qty {
    font-size: 24rpx;
    color: #999;
  }

  &__footer {
    padding: 20rpx 24rpx;
  }

  &__total {
    font-size: 24rpx;
    color: #666;
  }

  &__actions {
    display: flex;
    gap: 16rpx;
  }

  &__btn {
    height: 56rpx;
    line-height: 56rpx;
    font-size: 24rpx;
    padding: 0 24rpx;
    border-radius: 28rpx;
    border: none;

    &--primary {
      background: #E4393C;
      color: #FFFFFF;
    }

    &--default {
      background: #FFFFFF;
      color: #666;
      border: 1rpx solid #E4E7ED;
    }
  }
}

.order-loadmore {
  padding: 30rpx 0;
}
</style>
