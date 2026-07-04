<template>
  <scroll-view scroll-y class="page-detail" :style="{ height: scrollHeight + 'px' }">
    <!-- 商品轮播图 -->
    <swiper class="detail-swiper" :indicator-dots="true" :autoplay="false" circular>
      <swiper-item v-for="(url, index) in sliderUrls" :key="index">
        <image :src="url" mode="aspectFill" class="detail-swiper__img" />
      </swiper-item>
    </swiper>

    <!-- 商品基本信息 -->
    <view class="detail-info">
      <view class="detail-info__name">{{ productName }}</view>
      <view class="detail-info__price">
        <text class="detail-info__price-symbol">¥</text>
        <text class="detail-info__price-value">{{ priceInt }}</text>
        <text class="detail-info__market" v-if="marketPrice">¥{{ marketPrice }}</text>
      </view>
      <view class="detail-info__sale">
        <text>销量 {{ formatSaleNum(saleNum) }}</text>
        <text>库存 {{ formatSaleNum(stockNum) }}</text>
      </view>
    </view>

    <!-- 规格选择 -->
    <view class="detail-spec" @click="showSpec = true">
      <view class="detail-spec__label">规格</view>
      <view class="detail-spec__value">
        <text>{{ selectedSpecText || '请选择规格' }}</text>
      </view>
      <u-icon name="arrow-right" size="14" color="#999" />
    </view>

    <!-- 商品详情图 -->
    <view class="detail-content">
      <view class="detail-content__title">商品详情</view>
      <view class="detail-content__images">
        <image
          v-for="(url, index) in detailsImageUrls"
          :key="index"
          :src="url"
          mode="widthFix"
          class="detail-content__img"
        />
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="detail-bottom">
      <view class="detail-bottom__actions">
        <view class="detail-bottom__action" @click="goHome">
          <u-icon name="home" size="22" color="#666" />
          <text>首页</text>
        </view>
        <view class="detail-bottom__action" @click="goCart">
          <view class="detail-bottom__icon-wrap">
            <u-icon name="shopping-cart" size="22" color="#666" />
            <u-badge :value="cartCount" v-if="cartCount > 0" :offset="[4, -4]" />
          </view>
          <text>购物车</text>
        </view>
      </view>
      <view class="detail-bottom__btns">
        <button class="btn-cart" @click="addToCart">加入购物车</button>
        <button class="btn-buy" @click="buyNow">立即购买</button>
      </view>
    </view>

    <!-- 规格选择弹窗 -->
    <u-popup :show="showSpec" mode="bottom" @close="showSpec = false" round>
      <view class="spec-popup">
        <view class="spec-popup__header">
          <image :src="currentThumbImg" mode="aspectFill" class="spec-popup__thumb" />
          <view class="spec-popup__info">
            <text class="spec-popup__price">¥{{ currentSku?.salePrice || salePrice }}</text>
            <text class="spec-popup__stock">库存: {{ currentSku?.stockNum || 0 }}</text>
          </view>
          <u-icon name="close" size="18" color="#999" @click="showSpec = false" />
        </view>

        <scroll-view scroll-y class="spec-popup__body">
          <view class="spec-popup__group" v-for="spec in specGroups" :key="spec.specName">
            <view class="spec-popup__group-title">{{ spec.specName }}</view>
            <view class="spec-popup__group-values">
              <view
                v-for="val in spec.values"
                :key="val"
                class="spec-popup__tag"
                :class="{ 'spec-popup__tag--active': selectedSpecs[spec.specName] === val }"
                @click="selectSpec(spec.specName, val)"
              >
                {{ val }}
              </view>
            </view>
          </view>

          <!-- 数量选择 -->
          <view class="spec-popup__qty">
            <text class="spec-popup__qty-label">数量</text>
            <view class="spec-popup__qty-control">
              <view class="spec-popup__qty-btn" :class="{ 'spec-popup__qty-btn--disabled': quantity <= 1 }" @click="quantity > 1 && quantity--">
                <text>-</text>
              </view>
              <text class="spec-popup__qty-value">{{ quantity }}</text>
              <view class="spec-popup__qty-btn" :class="{ 'spec-popup__qty-btn--disabled': quantity >= currentMaxStock }" @click="quantity < currentMaxStock && quantity++">
                <text>+</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="spec-popup__confirm">
          <button class="spec-popup__btn" @click="confirmSpec">确定</button>
        </view>
      </view>
    </u-popup>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProductDetail } from '@/api/product'
import { addToCart as addToCartApi } from '@/api/cart'
import { buyNow as buyNowApi } from '@/api/order'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import { formatPrice } from '@/utils/common'
import { toLogin } from '@/utils/navigator'

const scrollHeight = uni.getSystemInfoSync().windowHeight

const userStore = useUserStore()
const cartStore = useCartStore()

// 商品数据
const skuId = ref<string>('')
const productSku = ref<any>(null)
const product = ref<Record<string, any>>({})
const sliderUrls = ref<string[]>([])
const detailsImageUrls = ref<string[]>([])
const specList = ref<any[]>([])
const skuSpecValueMap = ref<Record<string, string>>({})

// 当前选中的 SKU ID（用于价格更新）
const selectedSkuId = ref<string>('')

// 计算属性
const productName = computed(() => {
  if (currentSku.value?.skuName) return currentSku.value.skuName
  return productSku.value?.skuName || product.value?.name || ''
})

const salePrice = computed(() => {
  if (currentSku.value?.salePrice) return currentSku.value.salePrice
  return productSku.value?.salePrice || 0
})
const marketPrice = computed(() => {
  if (currentSku.value?.marketPrice) return currentSku.value.marketPrice
  return productSku.value?.marketPrice || 0
})
const saleNum = computed(() => {
  if (currentSku.value?.saleNum) return currentSku.value.saleNum
  return productSku.value?.saleNum || 0
})
const stockNum = computed(() => {
  if (currentSku.value?.stockNum) return currentSku.value.stockNum
  return productSku.value?.stockNum || 0
})

const priceInt = computed(() => Math.floor(salePrice.value))

const currentThumbImg = computed(() => {
  if (currentSku.value?.thumbImg) return currentSku.value.thumbImg
  return productSku.value?.thumbImg || sliderUrls.value[0] || '/static/images/errorImage.jpg'
})

// 购物车数量
const cartCount = computed(() => cartStore.totalCount)

// 规格弹窗
const showSpec = ref<boolean>(false)
const quantity = ref<number>(1)
const selectedSpecs = ref<Record<string, string>>({})
const currentSku = ref<any>(null)

// 规格分组
const specGroups = computed(() => {
  const groups: { specName: string; values: string[] }[] = []
  if (specList.value && specList.value.length > 0) {
    specList.value.forEach((spec: any) => {
      groups.push({
        specName: spec.key || spec.name || spec.specName, // 支持多种字段名
        values: spec.valueList || (spec.specValue ? spec.specValue.split(',') : []) // 支持数组和字符串
      })
    })
  }
  return groups
})

// 选中的规格文本（优先显示 currentSku 的规格，其次显示 selectedSpecs）
const selectedSpecText = computed(() => {
  if (currentSku.value?.skuSpec) {
    return currentSku.value.skuSpec.replace(/ \+ /g, '、')
  }
  const specs = Object.values(selectedSpecs.value)
  return specs.length > 0 ? specs.join('、') : ''
})

// 当前最大库存
const currentMaxStock = computed(() => {
  return currentSku.value?.stock || currentSku.value?.stockNum || productSku.value?.stockNum || 99
})

// 根据选中的规格匹配 SKU
async function matchSku() {
  const keys = Object.keys(selectedSpecs.value)
  if (keys.length === 0 || !skuSpecValueMap.value) return

  // 构建规格值组合键
  const specValues = keys.map(k => selectedSpecs.value[k]).filter(Boolean)
  if (specValues.length === 0) return

  // 尝试多种格式匹配（兼容不同后端数据格式）
  const possibleKeys = [
    specValues.join(' + '),           // "8G + 白色" - 电脑格式
    specValues.join(',')              // "白色,8G" - 手机格式（逗号分隔）
  ]

  let matchedSkuId: string | undefined
  for (const key of possibleKeys) {
    if (skuSpecValueMap.value[key]) {
      matchedSkuId = skuSpecValueMap.value[key]
      break
    }
  }

  if (matchedSkuId) {
    selectedSkuId.value = String(matchedSkuId)
    try {
      // 调用 API 获取对应 SKU 的价格等信息
      const skuInfo = await getProductDetail(matchedSkuId)
      // 处理可能没有 code:200 的情况（直接返回数据）
      if (skuInfo && skuInfo.productSku) {
        currentSku.value = skuInfo.productSku
        console.log('匹配到的 SKU 信息:', currentSku.value)
      }
    } catch (e: any) {
        console.error('获取 SKU 信息失败:', e)
    }
  }
}

// 选择规格值
function selectSpec(specName: string, value: string) {
  if (selectedSpecs.value[specName] === value) {
    delete selectedSpecs.value[specName]
  } else {
    selectedSpecs.value[specName] = value
  }
  matchSku()
}

// 确认规格选择
function confirmSpec() {
  showSpec.value = false
}

// 加入购物车
async function addToCart() {
  if (!userStore.isLogin) {
    toLogin()
    return
  }
  
  // 如果选择了规格，使用选中的 SKU ID，否则使用默认的
  const targetSkuId = selectedSkuId.value || skuId.value
  try {
    await addToCartApi(targetSkuId, quantity.value)
    uni.showToast({ title: '已加入购物车', icon: 'success' })
    cartStore.fetchCartList()
    showSpec.value = false
  } catch (e) {
    console.error('加入购物车失败:', e)
  }
}

// 立即购买
async function buyNow() {
  if (!userStore.isLogin) {
    toLogin()
    return
  }
  
  // 如果选择了规格，使用选中的 SKU ID，否则使用默认的
  const targetSkuId = selectedSkuId.value || skuId.value
  try {
    const data = await buyNowApi(targetSkuId)
    if (data) {
      uni.navigateTo({
        url: `/pages/order/create?from=buyNow&skuId=${targetSkuId}`
      })
    }
  } catch (e) {
    console.error('立即购买失败:', e)
  }
}

// 跳转首页
function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

// 跳转购物车
function goCart() {
  uni.switchTab({ url: '/pages/cart/cart' })
}

function formatSaleNum(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return String(num)
}

// 加载商品详情
async function loadDetail() {
  if (!skuId.value) return
  try {
    const data = await getProductDetail(skuId.value)
    if (data) {
      detailsImageUrls.value = data.detailsImageUrlList || []
      product.value = data.product || {}
      productSku.value = data.productSku
      skuSpecValueMap.value = data.skuSpecValueMap || {}
      sliderUrls.value = data.sliderUrlList || []
      specList.value = data.specValueList || []
      
      // 自动选中默认规格
      autoSelectDefaultSpec()
    }
  } catch (e) {
    console.error('加载商品详情失败:', e)
  }
}

// 自动选中默认规格
function autoSelectDefaultSpec() {
  const skuSpec = productSku.value?.skuSpec
  if (!skuSpec || !specList.value?.length) return
  
  // skuSpec 格式是 "32G + 黑色"，需要按 " + " 分割
  const specValues = skuSpec.split(' + ')
  
  // 为每个规格分组设置默认值
  specList.value.forEach((spec: any, index: number) => {
    const value = specValues[index]?.trim()
    if (value && spec.valueList?.includes(value)) {
      selectedSpecs.value[spec.key] = value
    }
  })
  
  // 如果有选中规格，更新 SKU 信息
  if (Object.keys(selectedSpecs.value).length > 0) {
    matchSku()
  }
}

onLoad((options) => {
  skuId.value = options?.skuId || ''
  loadDetail()
})

onMounted(() => {
  if (userStore.isLogin) {
    cartStore.fetchCartList()
  }
})
</script>

<style lang="scss" scoped>
.page-detail {
  background: #F5F5F5;
  padding-bottom: 100rpx;
}

.detail-swiper {
  width: 100%;
  height: 750rpx;
  background: #fff;

  &__img {
    width: 100%;
    height: 100%;
  }
}

.detail-info {
  background: #FFFFFF;
  padding: 20rpx 30rpx;
  margin-bottom: 16rpx;

  &__name {
    font-size: 30rpx;
    color: #333;
    line-height: 1.5;
  }

  &__price-symbol {
    color: #E4393C;
    font-size: 20rpx;
    font-weight: bold;
  }

  &__price-value {
    color: #E4393C;
    font-size: 32rpx;
    font-weight: 600;
  }

  &__market {
    color: #999;
    font-size: 26rpx;
    text-decoration: line-through;
    margin-left: 12rpx;
  }

  &__sale {
    display: flex;
    align-items: center;
    gap: 24rpx;
    font-size: 24rpx;
    color: #999;
    margin-top: 6rpx;
  }
}

.detail-spec {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  padding: 24rpx 30rpx;
  margin-bottom: 16rpx;

  &__label {
    font-size: 26rpx;
    color: #999;
    width: 80rpx;
  }

  &__value {
    flex: 1;
    font-size: 26rpx;
    color: #333;
  }
}

.detail-content {
  background: #FFFFFF;

  &__title {
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #F0F0F0;
  }

  &__img {
    width: 100%;
    display: block;
  }
}

.detail-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  padding: 12rpx 30rpx;
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  z-index: 99;

  &__actions {
    display: flex;
    margin-right: 20rpx;
  }

  &__action {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 16rpx;
    position: relative;

    text {
      font-size: 20rpx;
      color: #666;
      margin-top: 4rpx;
    }
  }

  &__icon-wrap {
    position: relative;
    display: inline-flex;

    .u-badge--error{
      background-color: transparent;
      color: #E4393C;
    }

    .u-badge--not-dot{
      padding: 0;
    }
  }

  &__btns {
    flex: 1;
    display: flex;
    gap: 16rpx;
  }
}

.btn-cart {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  background: linear-gradient(135deg, #FF9900, #FF7700);
  color: #FFFFFF;
  font-size: 26rpx;
  border-radius: 36rpx;
  border: none;
  padding: 0;
}

.btn-buy {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  background: linear-gradient(135deg, #E4393C, #D42F35);
  color: #FFFFFF;
  font-size: 26rpx;
  border-radius: 36rpx;
  border: none;
  padding: 0;
}

// 规格弹窗
.spec-popup {
  padding: 30rpx;

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
  }

  &__thumb {
    width: 140rpx;
    height: 140rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__price {
    font-size: 36rpx;
    color: #E4393C;
    font-weight: bold;
  }

  &__stock {
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
  }

  &__body {
    max-height: 500rpx;
    margin-bottom: 30rpx;
  }

  &__group {
    margin-bottom: 24rpx;
  }

  &__group-title {
    font-size: 26rpx;
    color: #333;
    margin-bottom: 16rpx;
  }

  &__group-values {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  &__tag {
    padding: 12rpx 28rpx;
    font-size: 24rpx;
    color: #333;
    background: #F5F5F5;
    border-radius: 8rpx;
    border: 1rpx solid transparent;

    &--active {
      color: #E4393C;
      background: #FFF0F0;
      border-color: #E4393C;
    }
  }

  &__qty {
    display: flex;
    align-items: center;
    margin-top: 30rpx;
  }

  &__qty-label {
    font-size: 26rpx;
    color: #333;
    margin-right: 24rpx;
  }

  &__qty-control {
    display: flex;
    align-items: center;
    background: #F5F5F5;
    border-radius: 8rpx;
  }

  &__qty-btn {
    width: 64rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    text {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
    }

    &--disabled {
      text {
        color: #CCC;
      }
    }
  }

  &__qty-value {
    min-width: 64rpx;
    height: 48rpx;
    line-height: 48rpx;
    text-align: center;
    font-size: 26rpx;
    color: #333;
    border-left: 1rpx solid #E4E4E4;
    border-right: 1rpx solid #E4E4E4;
  }

  &__confirm {
    padding-top: 20rpx;
  }

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
</style>
