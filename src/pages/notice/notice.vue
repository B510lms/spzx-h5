<template>
  <scroll-view scroll-y class="page-notice" :style="{ height: scrollHeight + 'px' }">
    <no-data text="暂无通知消息" />
  </scroll-view>
</template>

<script setup lang="ts">
import NoData from '@/components/no-data/no-data.vue'

const scrollHeight = uni.getSystemInfoSync().windowHeight

// 通知消息功能：
// 后端可能需要新增通知相关接口（当前后端未提供通知 API）
// GET /api/user/notice/auth/list - 获取通知列表
// PUT /api/user/notice/auth/read/{id} - 标记已读
</script>

<style lang="scss" scoped>
.page-notice {
  background: #F5F5F5;
}
</style>
