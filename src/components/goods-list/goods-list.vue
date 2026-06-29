<template>
  <view class="goods-list">
    <view class="goods-list__grid" :class="columnClass">
      <view
        v-for="(item, index) in list"
        :key="item.id || index"
        class="goods-list__item"
      >
        <goods-card
          :sku-id="item.id || item.skuId || 0"
          :title="item.skuName || item.name"
          :thumb-img="item.thumbImg || item.imgUrl"
          :sale-price="item.salePrice"
          :market-price="item.marketPrice"
          :sale-num="item.saleNum"
        />
      </view>
    </view>

    <!-- 加载更多状态 -->
    <view class="goods-list__load-more" v-if="list.length > 0">
      <u-loadmore
        :status="loadStatus"
        loading-text="加载中..."
        loadmore-text="上拉加载更多"
        nomore-text="没有更多了"
      />
    </view>

    <!-- 空状态 -->
    <no-data v-if="list.length === 0 && !loading" text="暂无商品" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import GoodsCard from '@/components/goods-card/goods-card.vue'
import NoData from '@/components/no-data/no-data.vue'

interface GoodsItem {
  id?: number | string
  skuId?: number
  title?: string
  skuName?: string
  name?: string
  thumbImg?: string
  imgUrl?: string
  salePrice?: number
  marketPrice?: number
  saleNum?: number
}

const props = defineProps({
  // 商品列表数据
  list: {
    type: Array as PropType<GoodsItem[]>,
    default: () => []
  },
  // 列数：2 或 1
  columns: {
    type: Number,
    default: 2
  },
  // 加载状态: 'loadmore' | 'loading' | 'nomore'
  loadStatus: {
    type: String,
    default: 'loadmore'
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  }
})

const columnClass = computed(() => {
  return props.columns === 1 ? 'goods-list__grid--single' : 'goods-list__grid--double'
})
</script>

<style lang="scss" scoped>
.goods-list {
  padding: 20rpx;

  &__grid {
    display: flex;
    flex-wrap: wrap;

    &--double {
      margin: 0 -10rpx;

      .goods-list__item {
        width: calc(50% - 20rpx);
        margin: 0 10rpx 20rpx;
      }
    }

    &--single {
      flex-direction: column;

      .goods-list__item {
        width: 100%;
        margin-bottom: 20rpx;
      }
    }
  }

  &__load-more {
    padding: 30rpx 0;
  }
}
</style>
