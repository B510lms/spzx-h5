<template>
  <scroll-view scroll-y class="page-collect" :style="{ height: scrollHeight + 'px' }">
    <no-data text="暂无收藏">
      <button class="go-btn" @click="goHome">去逛逛</button>
    </no-data>
  </scroll-view>
</template>

<script setup lang="ts">
import NoData from '@/components/no-data/no-data.vue'

const scrollHeight = uni.getSystemInfoSync().windowHeight

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

// 收藏功能：
// 后端可能需要新增收藏相关接口（当前后端未提供收藏相关 API）
// GET /api/user/collect/auth/list - 获取收藏列表
// POST /api/user/collect/auth/add/{skuId} - 添加收藏
// DELETE /api/user/collect/auth/delete/{skuId} - 取消收藏
</script>

<style lang="scss" scoped>
.page-collect {
  background: #F5F5F5;
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
