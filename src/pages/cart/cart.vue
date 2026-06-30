<template>
  <view class="page-cart">
    <!-- 空购物车 -->
    <no-data
      v-if="!loading && cartStore.cartList.length === 0"
      text="购物车是空的"
    >
      <button class="go-shopping-btn" @click="goHome">去逛逛</button>
    </no-data>

    <!-- 购物车列表 -->
    <template v-else>
      <scroll-view scroll-y class="cart-scroll" :style="{ height: scrollHeight + 'px' }">
        <view class="cart-list">
        <view
          v-for="item in cartStore.cartList"
          :key="item.id || item.skuId"
          class="cart-item"
        >
          <!-- 选择框 -->
          <view class="cart-item__check" @click="toggleCheck(item)">
            <u-icon
              :name="item.isChecked === 1 ? 'checkbox-mark' : 'checkbox'"
              :size="20"
              :color="item.isChecked === 1 ? '#E4393C' : '#C0C4CC'"
            />
          </view>

          <!-- 商品图片 -->
          <image
            :src="item.imgUrl || '/static/images/errorImage.jpg'"
            mode="aspectFill"
            class="cart-item__img"
            @click="goDetail(item.skuId)"
          />

          <!-- 商品信息 -->
          <view class="cart-item__info">
            <view class="cart-item__name text-ellipsis-2" @click="goDetail(item.skuId)">
              {{ item.skuName }}
            </view>
            <view class="cart-item__bottom flex-between">
              <text class="cart-item__price">¥{{ item.cartPrice || 0 }}</text>
              <!-- 数量控制 -->
              <view class="cart-item__qty">
                <view class="cart-item__qty-btn" @click="decreaseQty(item)">
                  <u-icon name="minus" size="14" color="#666" />
                </view>
                <text class="cart-item__qty-value">{{ item.skuNum }}</text>
                <view class="cart-item__qty-btn" @click="increaseQty(item)">
                  <u-icon name="plus" size="14" color="#666" />
                </view>
              </view>
            </view>
          </view>

          <!-- 删除按钮 -->
          <view class="cart-item__delete" @click="deleteCart(item)">
            <u-icon name="trash" size="18" color="#C0C4CC" />
          </view>
        </view>
        </view>
      </scroll-view>

      <!-- 底部结算栏 -->
      <view class="cart-bottom">
        <view class="cart-bottom__check" @click="toggleAllCheck">
          <u-icon
            :name="cartStore.isAllChecked ? 'checkbox-mark' : 'checkbox'"
            :size="20"
            :color="cartStore.isAllChecked ? '#E4393C' : '#C0C4CC'"
          />
          <text class="cart-bottom__check-text">全选</text>
        </view>

        <view class="cart-bottom__total">
          <text class="cart-bottom__total-label">合计:</text>
          <text class="cart-bottom__total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</text>
        </view>

        <button
          class="cart-bottom__btn"
          :disabled="cartStore.checkedCount === 0"
          @click="goCreateOrder"
        >
          去结算({{ cartStore.checkedCount }})
        </button>
      </view>
    </template>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/store/cart'
import { useUserStore } from '@/store/user'
import {
  addToCart as addToCartApi,
  deleteCartItem,
  checkCartItem,
  checkAllCart
} from '@/api/cart'
import NoData from '@/components/no-data/no-data.vue'
import { toLogin } from '@/utils/navigator'

const userStore = useUserStore()
const cartStore = useCartStore()
const loading = ref(false)
const scrollHeight = ref(0)

function calculateHeight() {
  const sysInfo = uni.getSystemInfoSync()
  scrollHeight.value = sysInfo.windowHeight - 120
}

onMounted(() => {
  calculateHeight()
})

// 加载购物车数据
async function loadCart() {
  if (!userStore.isLogin) return
  loading.value = true
  try {
    await cartStore.fetchCartList()
  } catch (e) {
    console.error('加载购物车失败:', e)
  } finally {
    loading.value = false
  }
}

// 切换商品选中状态
async function toggleCheck(item: CartItem) {
  if (!userStore.isLogin) return toLogin()
  const isChecked = item.isChecked === 1 ? 0 : 1
  try {
    await checkCartItem(item.skuId, isChecked)
    // 刷新列表
    await cartStore.fetchCartList()
  } catch (e) {
    console.error('切换选中失败:', e)
  }
}

// 切换全选
async function toggleAllCheck() {
  if (!userStore.isLogin) return toLogin()
  const isChecked = cartStore.isAllChecked ? 0 : 1
  try {
    await checkAllCart(isChecked)
    await cartStore.fetchCartList()
  } catch (e) {
    console.error('全选失败:', e)
  }
}

// 增加数量
async function increaseQty(item: CartItem) {
  if (!userStore.isLogin) return toLogin()
  try {
    await addToCartApi(item.skuId, 1)
    await cartStore.fetchCartList()
  } catch (e) {
    console.error('增加数量失败:', e)
  }
}

// 减少数量
async function decreaseQty(item: CartItem) {
  if (!userStore.isLogin) return toLogin()
  if (item.skuNum <= 1) {
    // 数量为1时询问是否删除
    uni.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: async (res: any) => {
        if (res.confirm) {
          await deleteCart(item)
        }
      }
    })
    return
  }
  try {
    // 购物车的 addToCart 增加数量，减少需要特殊处理
    // 这里使用 -1 表示减少（需要后端支持）
    // 简化处理：直接调删除再重新添加
    await addToCartApi(item.skuId, -1)
    await cartStore.fetchCartList()
  } catch (e) {
    console.error('减少数量失败:', e)
  }
}

// 删除购物车商品
async function deleteCart(item: CartItem) {
  try {
    await deleteCartItem(item.skuId)
    await cartStore.fetchCartList()
    uni.showToast({ title: '已删除', icon: 'success' })
  } catch (e) {
    console.error('删除失败:', e)
  }
}

// 跳转商品详情
function goDetail(skuId: number | string) {
  uni.navigateTo({ url: `/pages/detail/detail?skuId=${skuId}` })
}

// 跳转创建订单
function goCreateOrder() {
  if (!userStore.isLogin) return toLogin()
  if (cartStore.checkedCount === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/order/create' })
}

// 跳转首页
function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

onShow(() => {
  if (userStore.isLogin) {
    loadCart()
  }
})
</script>

<style lang="scss" scoped>
.page-cart {
  background: #F5F5F5;
  min-height: 100%;
}

.cart-list {
  background: #FFFFFF;
  margin: 20rpx;
  border-radius: 12rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }

  &__check {
    padding: 10rpx;
    margin-right: 10rpx;
  }

  &__img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 8rpx;
    background: #F5F5F5;
  }

  &__info {
    flex: 1;
    margin-left: 16rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 160rpx;
  }

  &__name {
    font-size: 26rpx;
    color: #333;
    line-height: 1.4;
  }

  &__bottom {
    margin-top: auto;
  }

  &__price {
    font-size: 30rpx;
    color: #E4393C;
    font-weight: bold;
  }

  &__qty {
    display: flex;
    align-items: center;
    border: 1rpx solid #E4E7ED;
    border-radius: 8rpx;
    overflow: hidden;

    &-btn {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F5F5F5;
    }

    &-value {
      width: 60rpx;
      text-align: center;
      font-size: 24rpx;
      color: #333;
    }
  }

  &__delete {
    padding: 10rpx;
    margin-left: 10rpx;
  }
}

.cart-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  padding: 16rpx 30rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  z-index: 99;

  &__check {
    display: flex;
    align-items: center;
  }

  &__check-text {
    font-size: 24rpx;
    color: #666;
    margin-left: 8rpx;
  }

  &__total {
    flex: 1;
    text-align: right;
    margin-right: 20rpx;
  }

  &__total-label {
    font-size: 24rpx;
    color: #333;
  }

  &__total-price {
    font-size: 30rpx;
    color: #E4393C;
    font-weight: bold;
  }

  &__btn {
    height: 72rpx;
    line-height: 72rpx;
    background: #E4393C;
    color: #FFFFFF;
    font-size: 26rpx;
    border-radius: 36rpx;
    padding: 0 36rpx;
    border: none;

    &[disabled] {
      background: #C0C4CC;
      color: #FFFFFF;
    }
  }
}

.go-shopping-btn {
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
