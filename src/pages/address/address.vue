<template>
  <scroll-view scroll-y class="page-address-edit" :style="{ height: scrollHeight + 'px' }">
    <view class="address-form">
      <view class="address-form__item">
        <text class="address-form__label">收货人</text>
        <input
          v-model="form.name"
          class="address-form__input"
          placeholder="请输入收货人姓名"
          placeholder-style="color:#C0C4CC"
        />
      </view>
      <view class="address-form__item">
        <text class="address-form__label">手机号</text>
        <input
          v-model="form.phone"
          class="address-form__input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          placeholder-style="color:#C0C4CC"
        />
      </view>
      <view class="address-form__item">
        <text class="address-form__label">标签</text>
        <input
          v-model="form.tagName"
          class="address-form__input"
          placeholder="如：家、公司、学校"
          placeholder-style="color:#C0C4CC"
        />
      </view>
      <view class="address-form__item">
        <text class="address-form__label">所在地区</text>
        <input
          v-model="form.area"
          class="address-form__input"
          placeholder="请选择省市区"
          placeholder-style="color:#C0C4CC"
          disabled
        />
        <u-icon name="arrow-right" size="14" color="#C0C4CC" />
      </view>
      <view class="address-form__item">
        <text class="address-form__label">详细地址</text>
        <input
          v-model="form.address"
          class="address-form__input"
          placeholder="街道、门牌号等"
          placeholder-style="color:#C0C4CC"
        />
      </view>
    </view>

    <!-- 设为默认 -->
    <view class="address-default">
      <text class="address-default__label">设为默认地址</text>
      <u-switch v-model="form.isDefault" active-color="#E4393C" />
    </view>

    <!-- 保存按钮 -->
    <view class="address-save">
      <button class="address-save__btn" @click="saveAddress">保存</button>
      <button class="address-save__btn address-save__btn--delete" v-if="isEdit" @click="deleteAddress">
        删除地址
      </button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAddress } from '@/api/address'
import type { AddressInfo } from '@/api/address/type'

const scrollHeight = uni.getSystemInfoSync().windowHeight

const isEdit = ref(false)

const form = reactive({
  id: '',
  name: '',
  phone: '',
  tagName: '',
  area: '',
  address: '',
  fullAddress: '',
  provinceCode: '',
  cityCode: '',
  districtCode: '',
  isDefault: false
})

// 加载地址详情（编辑模式）
async function loadAddress(id: string) {
  try {
    const data = await getAddress(id)
    if (data) {
      form.id = String(data.id)
      form.name = data.name || ''
      form.phone = data.phone || ''
      form.tagName = data.tagName || ''
      form.address = data.address || ''
      form.fullAddress = data.fullAddress || ''
      form.isDefault = data.isDefault === 1
    }
  } catch (e) {
    console.error('加载地址失败:', e)
  }
}

// 保存地址
function saveAddress() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return
  }
  if (!form.phone.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!form.address.trim()) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return
  }

  // TODO: 调用新增/编辑地址接口
  uni.showToast({
    title: isEdit.value ? '修改成功' : '添加成功',
    icon: 'success',
    complete: () => {
      setTimeout(() => uni.navigateBack(), 1000)
    }
  })
}

// 删除地址
function deleteAddress() {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '已删除',
          icon: 'success',
          complete: () => {
            setTimeout(() => uni.navigateBack(), 1000)
          }
        })
      }
    }
  })
}

onLoad((options) => {
  if (options?.id) {
    isEdit.value = true
    loadAddress(options.id)
  }
})
</script>

<style lang="scss" scoped>
.page-address-edit {
  background: #F5F5F5;
}

.address-form {
  background: #FFFFFF;
  margin-bottom: 16rpx;

  &__item {
    display: flex;
    align-items: center;
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #F5F5F5;
  }

  &__label {
    font-size: 28rpx;
    color: #333;
    width: 140rpx;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    font-size: 26rpx;
    height: 48rpx;
  }
}

.address-default {
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  margin-bottom: 60rpx;

  &__label {
    font-size: 28rpx;
    color: #333;
  }
}

.address-save {
  padding: 0 30rpx;

  &__btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #E4393C;
    color: #FFFFFF;
    font-size: 28rpx;
    border-radius: 44rpx;
    border: none;
    margin-bottom: 20rpx;

    &--delete {
      background: #FFFFFF;
      color: #E4393C;
      border: 1rpx solid #E4393C;
    }
  }
}
</style>
