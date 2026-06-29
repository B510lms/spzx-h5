<template>
  <view class="goods-card" @click="goDetail">
    <view class="goods-card__image">
      <image :src="thumbImg" mode="aspectFill" class="goods-card__img" />
    </view>
    <view class="goods-card__info">
      <view class="goods-card__name text-ellipsis-2">{{ title }}</view>
      <view class="goods-card__price">
        <text class="price-symbol">¥</text>
        <text class="price-value">{{ priceInt }}</text>
        <text class="price-decimal">.{{ priceDecimal }}</text>
        <text class="price-market" v-if="marketPrice > salePrice">¥{{ marketPrice }}</text>
      </view>
      <view class="goods-card__sale" v-if="saleNum > 0">
        已售 {{ formatSaleNum(saleNum) }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  // SKU ID
  skuId: {
    type: [Number, String],
    required: true
  },
  // 商品标题
  title: {
    type: String,
    default: ''
  },
  // 缩略图
  thumbImg: {
    type: String,
    default: '/static/images/errorImage.jpg'
  },
  // 售价
  salePrice: {
    type: Number,
    default: 0
  },
  // 市场价
  marketPrice: {
    type: Number,
    default: 0
  },
  // 销量
  saleNum: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['click'])

// 价格整数部分
const priceInt = computed(() => {
  return Math.floor(props.salePrice || 0)
})

// 价格小数部分
const priceDecimal = computed(() => {
  const num = (props.salePrice || 0).toFixed(2)
  return num.split('.')[1] || '00'
})

// 跳转商品详情
function goDetail() {
  uni.navigateTo({
    url: `/pages/detail/detail?skuId=${props.skuId}`
  })
  emit('click', props.skuId)
}

// 格式化销量
function formatSaleNum(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num
}
</script>

<style lang="scss" scoped>
.goods-card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  &__image {
    width: 100%;
    padding-top: 100%;
    position: relative;
    background: #f8f8f8;
  }

  &__img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__info {
    padding: 16rpx;
  }

  &__name {
    font-size: 26rpx;
    color: #333;
    line-height: 1.5;
    height: 78rpx;
    margin-bottom: 12rpx;
  }

  &__price {
    display: flex;
    align-items: baseline;
    margin-bottom: 8rpx;
  }
}

.price-symbol {
  color: #E4393C;
  font-size: 24rpx;
  font-weight: bold;
}

.price-value {
  color: #E4393C;
  font-size: 34rpx;
  font-weight: bold;
}

.price-decimal {
  color: #E4393C;
  font-size: 24rpx;
  font-weight: bold;
}

.price-market {
  color: #999;
  font-size: 22rpx;
  text-decoration: line-through;
  margin-left: 8rpx;
}

.goods-card__sale {
  font-size: 22rpx;
  color: #999;
}
</style>
