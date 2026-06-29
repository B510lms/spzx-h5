<template>
  <view class="page-browse">
    <no-data text="暂无浏览记录">
      <button class="go-btn" @click="goHome">去逛逛</button>
    </no-data>
  </view>
</template>

<script setup lang="ts">
import NoData from '@/components/no-data/no-data.vue'

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

// 浏览记录功能：
// 浏览记录数据存储在本地，后续可通过接口同步到服务端
// 商品详情页在加载时保存浏览记录
</script>

<style lang="scss" scoped>
.page-browse {
  background: #F5F5F5;
  min-height: 100vh;
}

.go-btn {
  margin-top: 20rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #E4393C;
  color: #FFFFFF;
  font-size: 26rpx;
  border-radius: 36rpx;
  padding: 0 60rpx;
  border: none;
}
</style>
