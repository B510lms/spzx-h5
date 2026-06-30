<template>
  <scroll-view scroll-y class="page-address" :style="{ height: scrollHeight + 'px' }">
    <!-- 地址列表 -->
    <view class="address-list" v-if="addressList.length > 0">
      <view
        v-for="item in addressList"
        :key="item.id"
        class="address-item"
        :class="{ 'address-item--default': item.isDefault === 1 }"
      >
        <view class="address-item__content" @click="selectAddress(item)">
          <view class="address-item__top">
            <text class="address-item__name">{{ item.name }}</text>
            <text class="address-item__phone">{{ item.phone }}</text>
            <text class="address-item__tag" v-if="item.tagName">{{ item.tagName }}</text>
            <text class="address-item__default" v-if="item.isDefault === 1">默认</text>
          </view>
          <text class="address-item__detail">
            {{ item.fullAddress || (item.provinceCode + item.cityCode + item.districtCode + ' ' + item.address) }}
          </text>
        </view>
        <view class="address-item__actions">
          <text class="address-item__edit" @click="editAddress(item)">编辑</text>
          <text class="address-item__delete" @click="deleteAddress(item)">删除</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <no-data v-else text="暂无收货地址" />

    <!-- 新增按钮 -->
    <view class="address-bottom">
      <button class="address-bottom__btn" @click="addAddress">新增收货地址</button>
    </view>

    <view class="safe-area-bottom" />
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getAddressList } from '@/api/address'
import type { AddressInfo } from '@/api/address/type'
import { useUserStore } from '@/store/user'
import NoData from '@/components/no-data/no-data.vue'

const scrollHeight = uni.getSystemInfoSync().windowHeight

const userStore = useUserStore()
const addressList = ref<AddressInfo[]>([])
const isSelectMode = ref(false)

async function loadAddresses() {
  try {
    const list = await getAddressList()
    addressList.value = list || []
  } catch (e) {
    console.error('加载地址失败:', e)
  }
}

function selectAddress(item: AddressInfo) {
  if (isSelectMode.value) {
    // 选择模式：返回选中的地址
    uni.$emit('addressSelected', item)
    uni.navigateBack()
  }
}

function addAddress() {
  uni.navigateTo({ url: '/pages/address/address' })
}

function editAddress(item: AddressInfo) {
  uni.navigateTo({ url: `/pages/address/address?id=${item.id}` })
}

function deleteAddress(item: AddressInfo) {
  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    success: (res) => {
      if (res.confirm) {
        // 删除逻辑
        uni.showToast({ title: '已删除', icon: 'success' })
        loadAddresses()
      }
    }
  })
}

onLoad((options) => {
  isSelectMode.value = options?.select === 'true'
})

onShow(() => {
  loadAddresses()
})
</script>

<style lang="scss" scoped>
.page-address {
  background: #F5F5F5;
  padding-bottom: 120rpx;
}

.address-item {
  background: #FFFFFF;
  margin: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;

  &__content {
    padding: 24rpx;
  }

  &__top {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
  }

  &__name {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    margin-right: 16rpx;
  }

  &__phone {
    font-size: 26rpx;
    color: #666;
    margin-right: 8rpx;
  }

  &__tag {
    font-size: 20rpx;
    color: #E4393C;
    background: #FFF0F0;
    padding: 2rpx 12rpx;
    border-radius: 4rpx;
    margin-right: 8rpx;
  }

  &__default {
    font-size: 20rpx;
    color: #E4393C;
    border: 1rpx solid #E4393C;
    padding: 2rpx 12rpx;
    border-radius: 4rpx;
  }

  &__detail {
    font-size: 26rpx;
    color: #666;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    border-top: 1rpx solid #F5F5F5;
  }

  &__edit,
  &__delete {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 26rpx;
  }

  &__edit {
    color: #333;
    border-right: 1rpx solid #F5F5F5;
  }

  &__delete {
    color: #E4393C;
  }
}

.address-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

  &__btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background: #E4393C;
    color: #FFFFFF;
    font-size: 28rpx;
    border-radius: 40rpx;
    border: none;
  }
}

.safe-area-bottom {
  height: calc(120rpx + env(safe-area-inset-bottom));
}
</style>
