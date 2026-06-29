<template>
  <view class="page-create-order">
    <!-- 收货地址 -->
    <view class="create-address" @click="goSelectAddress">
      <view v-if="selectedAddress" class="create-address__content">
        <view class="create-address__top">
          <text class="create-address__name">{{ selectedAddress.name }}</text>
          <text class="create-address__phone">{{ selectedAddress.phone }}</text>
          <text class="create-address__tag" v-if="selectedAddress.tagName">{{ selectedAddress.tagName }}</text>
        </view>
        <view class="create-address__detail text-ellipsis">
          <text>{{ selectedAddress.fullAddress || selectedAddress.address }}</text>
        </view>
      </view>
      <view v-else class="create-address__placeholder">
        <u-icon name="plus-circle" size="20" color="#E4393C" />
        <text>请选择收货地址</text>
      </view>
      <u-icon name="arrow-right" size="14" color="#C0C4CC" />
    </view>

    <!-- 商品列表 -->
    <view class="create-goods">
      <view class="create-goods__title">商品信息</view>
      <view
        v-for="item in orderItems"
        :key="item.id || item.skuId"
        class="create-goods__item"
      >
        <image
          :src="item.thumbImg || '/static/images/errorImage.jpg'"
          mode="aspectFill"
          class="create-goods__img"
        />
        <view class="create-goods__info">
          <text class="create-goods__name text-ellipsis-2">{{ item.skuName }}</text>
          <view class="create-goods__bottom flex-between">
            <text class="create-goods__price">¥{{ item.skuPrice || item.cartPrice }}</text>
            <text class="create-goods__qty">x{{ item.skuNum }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="create-remark">
      <text class="create-remark__label">备注</text>
      <input
        v-model="remark"
        class="create-remark__input"
        placeholder="选填：给卖家留言"
        placeholder-style="color:#C0C4CC"
        maxlength="100"
      />
    </view>

    <!-- 费用信息 -->
    <view class="create-fee">
      <view class="create-fee__item flex-between">
        <text class="create-fee__label">商品金额</text>
        <text class="create-fee__value">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
      <view class="create-fee__item flex-between">
        <text class="create-fee__label">运费</text>
        <text class="create-fee__value">¥{{ freightFee.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 底部提交 -->
    <view class="create-bottom">
      <view class="create-bottom__total">
        <text class="create-bottom__total-label">合计:</text>
        <text class="create-bottom__total-price">¥{{ (totalAmount + freightFee).toFixed(2) }}</text>
      </view>
      <button class="create-bottom__btn" @click="submitOrder" :loading="submitting" :disabled="submitting">
        提交订单
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getTrade, submitOrder as submitOrderApi, buyNow } from '@/api/order'
import type { OrderItemVo, TradeVo } from '@/api/order/type'
import { getAddressList } from '@/api/address'
import type { AddressInfo } from '@/api/address/type'
import { toLogin } from '@/utils/navigator'

const userStore = useUserStore()

// 订单数据
const orderItems = ref<OrderItemVo[]>([])
const totalAmount = ref(0)
const freightFee = ref(0)
const remark = ref('')
const submitting = ref(false)

// 地址
const selectedAddress = ref<AddressInfo | null>(null)

// 页面来源
const fromType = ref('') // 'cart' | 'buyNow'
const buySkuId = ref('')

// 加载结算数据
async function loadTradeData() {
  try {
    let data: TradeVo | null = null
    if (fromType.value === 'buyNow' && buySkuId.value) {
      data = await buyNow(buySkuId.value)
    } else {
      data = await getTrade()
    }

    if (data) {
      orderItems.value = data.orderItemList || []
      totalAmount.value = data.totalAmount || 0
    }
  } catch (e) {
    console.error('加载订单数据失败:', e)
  }
}

// 加载地址
async function loadAddress() {
  try {
    const list = await getAddressList()
    if (list && list.length > 0) {
      // 优先取默认地址
      selectedAddress.value = list.find((a: AddressInfo) => a.isDefault === 1) || list[0] || null
    }
  } catch (e) {
    console.error('加载地址失败:', e)
  }
}

// 选择地址
function goSelectAddress() {
  uni.navigateTo({
    url: '/pages/address/addressManage?select=true'
  })
  // 通过事件总线或全局变量传递选中的地址
  // 简化处理：使用 uni.$emit
  uni.$once('addressSelected', (address: AddressInfo) => {
    selectedAddress.value = address
  })
}

// 提交订单
async function submitOrder() {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }
  if (orderItems.value.length === 0) {
    uni.showToast({ title: '暂无商品', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const orderId = await submitOrderApi({
      userAddressId: selectedAddress.value.id,
      feightFee: freightFee.value,
      remark: remark.value,
      orderItemList: orderItems.value
    })

    // 跳转到支付页
    uni.redirectTo({
      url: `/pages/money/pay?orderId=${orderId}`
    })
  } catch (e) {
    console.error('提交订单失败:', e)
  } finally {
    submitting.value = false
  }
}

onLoad((options) => {
  if (!userStore.isLogin) {
    toLogin()
    return
  }

  if (options?.from === 'buyNow') {
    fromType.value = 'buyNow'
    buySkuId.value = options?.skuId || ''
  } else {
    fromType.value = 'cart'
  }

  loadTradeData()
  loadAddress()
})
</script>

<style lang="scss" scoped>
.page-create-order {
  background: #F5F5F5;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.create-address {
  background: #FFFFFF;
  padding: 30rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;

  &__content {
    flex: 1;
  }

  &__top {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
  }

  &__name {
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
    margin-right: 16rpx;
  }

  &__phone {
    font-size: 26rpx;
    color: #666;
    margin-right: 12rpx;
  }

  &__tag {
    font-size: 20rpx;
    color: #E4393C;
    background: #FFF0F0;
    padding: 2rpx 12rpx;
    border-radius: 4rpx;
  }

  &__detail {
    font-size: 26rpx;
    color: #666;
  }

  &__placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12rpx;
    font-size: 28rpx;
    color: #C0C4CC;
  }
}

.create-goods {
  background: #FFFFFF;
  padding: 24rpx 30rpx;
  margin-bottom: 16rpx;

  &__title {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 20rpx;
  }

  &__item {
    display: flex;
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }
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
    margin-top: 8rpx;
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
}

.create-remark {
  background: #FFFFFF;
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  margin-bottom: 16rpx;

  &__label {
    font-size: 28rpx;
    color: #333;
    margin-right: 16rpx;
    white-space: nowrap;
  }

  &__input {
    flex: 1;
    font-size: 26rpx;
    height: 48rpx;
  }
}

.create-fee {
  background: #FFFFFF;
  padding: 24rpx 30rpx;
  margin-bottom: 16rpx;

  &__item {
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
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

.create-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16rpx 30rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  z-index: 99;

  &__total {
    margin-right: 30rpx;
  }

  &__total-label {
    font-size: 24rpx;
    color: #333;
  }

  &__total-price {
    font-size: 32rpx;
    color: #E4393C;
    font-weight: bold;
  }

  &__btn {
    height: 72rpx;
    line-height: 72rpx;
    background: #E4393C;
    color: #FFFFFF;
    font-size: 26rpx;
    border-radius: 36rpx;
    padding: 0 46rpx;
    border: none;

    &[disabled] {
      background: #C0C4CC;
    }
  }
}
</style>
