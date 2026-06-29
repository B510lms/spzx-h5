<template>
  <view class="no-data">
    <image
      class="no-data__image"
      :src="imageSrc"
      mode="aspectFit"
    />
    <text class="no-data__text">{{ text }}</text>
    <view class="no-data__action" v-if="$slots.default">
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps({
  // 提示文字
  text: {
    type: String,
    default: '暂无数据'
  },
  // 图片路径（可选自定义）
  image: {
    type: String,
    default: ''
  }
})

const imageSrc = props.image || '/static/images/emptyCart.jpg'
</script>

<style lang="scss" scoped>
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;

  &__image {
    width: 320rpx;
    height: 240rpx;
    margin-bottom: 30rpx;
  }

  &__text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 30rpx;
  }

  &__action {
    display: flex;
    align-items: center;
  }
}
</style>
