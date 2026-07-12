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
      <view class="address-form__item" @click="showPicker = true">
        <text class="address-form__label">所在地区</text>
        <text class="address-form__input address-form__input--area">
          {{ form.area || '请选择省市区' }}
        </text>
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

    <view class="address-default">
      <text class="address-default__label">设为默认地址</text>
      <u-switch v-model="form.isDefault" active-color="#E4393C" />
    </view>

    <view class="address-save">
      <button class="address-save__btn" @click="saveAddressHandle">保存</button>
      <button class="address-save__btn address-save__btn--delete" v-if="isEdit" @click="deleteAddress">
        删除地址
      </button>
    </view>

    <view v-if="showPicker" class="region-picker-mask" @click="showPicker = false">
      <view class="region-picker" @click.stop>
        <view class="region-picker__header">
          <text class="region-picker__cancel" @click="showPicker = false">取消</text>
          <text class="region-picker__confirm" @click="confirmRegion">确定</text>
        </view>
        <view class="region-picker__body">
          <view class="region-picker__column">
            <scroll-view scroll-y class="region-scroll" :scroll-into-view="provinceScrollId" scroll-with-animation>
              <view v-for="(item, index) in provinces" :key="item.code" :id="'p-' + index" 
                class="region-option" :class="{ active: provinceIndex === index }"
                @click="selectProvince(index)">
                {{ item.name }}
              </view>
            </scroll-view>
          </view>
          <view class="region-picker__column">
            <scroll-view scroll-y class="region-scroll" :scroll-into-view="cityScrollId" scroll-with-animation>
              <view v-for="(item, index) in cities" :key="item.code" :id="'c-' + index" 
                class="region-option" :class="{ active: cityIndex === index }"
                @click="selectCity(index)">
                {{ item.name }}
              </view>
            </scroll-view>
          </view>
          <view class="region-picker__column">
            <scroll-view scroll-y class="region-scroll" :scroll-into-view="districtScrollId" scroll-with-animation>
              <view v-for="(item, index) in districts" :key="item.code" :id="'d-' + index" 
                class="region-option" :class="{ active: districtIndex === index }"
                @click="selectDistrict(index)">
                {{ item.name }}
              </view>
            </scroll-view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAddress, saveAddress, updateAddress, deleteAddress as deleteAddressApi } from '@/api/address'
import type { AddressInfo } from '@/api/address/type'
import { getRegionByParentCode, type Region } from '@/api/region'

const scrollHeight = uni.getSystemInfoSync().windowHeight

const isEdit = ref(false)
const showPicker = ref(false)

const provinceIndex = ref(0)
const cityIndex = ref(0)
const districtIndex = ref(0)

const provinceScrollId = ref('p-0')
const cityScrollId = ref('c-0')
const districtScrollId = ref('d-0')

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

const provinces = ref<Region[]>([])
const cities = ref<Region[]>([])
const districts = ref<Region[]>([])

async function loadProvinces() {
  try {
    provinces.value = await getRegionByParentCode(0) || []
  } catch (e) {
    console.error('加载省份失败:', e)
  }
}

async function loadCities(provinceCode: string) {
  try {
    cities.value = await getRegionByParentCode(Number(provinceCode)) || []
    districts.value = []
    cityIndex.value = 0
    districtIndex.value = 0
    cityScrollId.value = 'c-0'
    districtScrollId.value = 'd-0'
    if (cities.value.length > 0) {
      await loadDistricts(cities.value[0].code)
    }
  } catch (e) {
    console.error('加载城市失败:', e)
  }
}

async function loadDistricts(cityCode: string) {
  try {
    districts.value = await getRegionByParentCode(Number(cityCode)) || []
    districtIndex.value = 0
    districtScrollId.value = 'd-0'
  } catch (e) {
    console.error('加载区县失败:', e)
  }
}

function selectProvince(index: number) {
  provinceIndex.value = index
  provinceScrollId.value = 'p-' + index
  if (provinces.value[index]) {
    loadCities(provinces.value[index].code)
  }
}

function selectCity(index: number) {
  cityIndex.value = index
  cityScrollId.value = 'c-' + index
  if (cities.value[index]) {
    loadDistricts(cities.value[index].code)
  }
}

function selectDistrict(index: number) {
  districtIndex.value = index
  districtScrollId.value = 'd-' + index
}

function confirmRegion() {
  const province = provinces.value[provinceIndex.value]
  const city = cities.value[cityIndex.value]
  const district = districts.value[districtIndex.value]
  
  if (province && city && district) {
    form.provinceCode = province.code
    form.cityCode = city.code
    form.districtCode = district.code
    form.area = `${province.name} ${city.name} ${district.name}`
    form.fullAddress = `${province.name}${city.name}${district.name}`
  }
  showPicker.value = false
}

async function loadAddress(id: string) {
  try {
    const data = await getAddress(id)
    console.log('加载地址:', data)
    if (data) {
      form.id = String(data.id)
      form.name = data.name || ''
      form.phone = data.phone || ''
      form.tagName = data.tagName || ''
      form.address = data.address || ''
      form.fullAddress = data.fullAddress || ''
      form.provinceCode = data.provinceCode || ''
      form.cityCode = data.cityCode || ''
      form.districtCode = data.districtCode || ''
      form.isDefault = data.isDefault === 1
      
      if (form.provinceCode) {
        const pIndex = provinces.value.findIndex(r => r.code === form.provinceCode)
        console.log('省份索引:', pIndex)
        if (pIndex >= 0) {
          provinceIndex.value = pIndex
          provinceScrollId.value = 'p-' + pIndex
          await loadCities(form.provinceCode)
          
          if (form.cityCode) {
            const cIndex = cities.value.findIndex(r => r.code === form.cityCode)
            if (cIndex >= 0) {
              cityIndex.value = cIndex
              cityScrollId.value = 'c-' + cIndex
              await loadDistricts(form.cityCode)
              
              if (form.districtCode) {
                const dIndex = districts.value.findIndex(r => r.code === form.districtCode)
                if (dIndex >= 0) {
                  districtIndex.value = dIndex
                  districtScrollId.value = 'd-' + dIndex
                }
              }
              const p = provinces.value.find(r => r.code === form.provinceCode)
              const c = cities.value.find(r => r.code === form.cityCode)
              const d = districts.value.find(r => r.code === form.districtCode)
              if (p && c && d) {
                form.area = `${p.name} ${c.name} ${d.name}`
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('加载地址失败:', e)
  }
}

async function saveAddressHandle() {
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
  if (!form.provinceCode || !form.cityCode || !form.districtCode) {
    uni.showToast({ title: '请选择省市区', icon: 'none' })
    return
  }

  const province = provinces.value.find(p => p.code === form.provinceCode)
  const city = cities.value.find(c => c.code === form.cityCode)
  const district = districts.value.find(d => d.code === form.districtCode)
  const regionText = province && city && district ? `${province.name}${city.name}${district.name}` : ''
  
  const addressData: AddressInfo = {
    id: form.id ? Number(form.id) : undefined,
    name: form.name,
    phone: form.phone,
    tagName: form.tagName,
    address: form.address,
    fullAddress: regionText + form.address,
    provinceCode: form.provinceCode,
    cityCode: form.cityCode,
    districtCode: form.districtCode,
    isDefault: form.isDefault ? 1 : 0
  }

  try {
    if (isEdit.value) {
      await updateAddress(addressData)
    } else {
      await saveAddress(addressData)
    }
    uni.showToast({
      title: isEdit.value ? '修改成功' : '添加成功',
      icon: 'success',
      complete: () => {
        setTimeout(() => uni.navigateBack(), 1000)
      }
    })
  } catch (e) {
    console.error('保存地址失败:', e)
  }
}

async function deleteAddress() {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    success: async (res) => {
      if (res.confirm && form.id) {
        try {
          await deleteAddressApi(form.id)
          uni.showToast({
            title: '已删除',
            icon: 'success',
            complete: () => {
              setTimeout(() => uni.navigateBack(), 1000)
            }
          })
        } catch (e) {
          console.error('删除地址失败:', e)
        }
      }
    }
  })
}

onLoad(async (options) => {
  await loadProvinces()
  if (options?.id) {
    isEdit.value = true
    await loadAddress(options.id)
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

    &--area {
      color: #333;
    }
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

.region-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.region-picker {
  width: 100%;
  background: #FFFFFF;
  border-radius: 20rpx 20rpx 0 0;
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #F5F5F5;

    &__cancel {
      font-size: 28rpx;
      color: #999;
    }

    &__confirm {
      font-size: 28rpx;
      color: #E4393C;
      font-weight: bold;
    }
  }

  &__body {
    display: flex;
    height: 500rpx;
  }

  &__column {
    flex: 1;
    border-right: 1rpx solid #F5F5F5;

    &:last-child {
      border-right: none;
    }
  }
}

.region-scroll {
  height: 500rpx;
}

.region-option {
  padding: 24rpx 20rpx;
  text-align: center;
  font-size: 26rpx;
  color: #333;

  &.active {
    color: #E4393C;
    font-weight: bold;
    background: #FFF5F5;
  }
}
</style>