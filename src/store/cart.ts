// 购物车状态管理
// 购物车数据从服务端同步
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCartList } from '@/api/cart'
import type { CartItem } from '@/api/cart/type'

export type { CartItem }

export const useCartStore = defineStore('cart', () => {
  // ========== 状态 ==========
  const cartList = ref<CartItem[]>([])
  const totalCount = ref<number>(0)

  // ========== 计算属性 ==========

  // 选中的购物车项
  const checkedItems = computed(() =>
    cartList.value.filter((item) => item.isChecked === 1)
  )

  // 选中数量
  const checkedCount = computed(() =>
    checkedItems.value.reduce((sum, item) => sum + item.skuNum, 0)
  )

  // 选中商品总价
  const totalPrice = computed(() =>
    checkedItems.value.reduce(
      (sum, item) => sum + (item.cartPrice || 0) * item.skuNum,
      0
    )
  )

  // 是否全选
  const isAllChecked = computed(() => {
    if (cartList.value.length === 0) return false
    return cartList.value.every((item) => item.isChecked === 1)
  })

  // ========== 方法 ==========

  // 从服务端加载购物车列表
  async function fetchCartList(): Promise<void> {
    try {
      const data = await getCartList()
      cartList.value = data || []
      totalCount.value = cartList.value.length
    } catch (e) {
      console.error('获取购物车列表失败:', e)
      cartList.value = []
      totalCount.value = 0
    }
  }

  // 清空本地购物车数据
  function clearCart(): void {
    cartList.value = []
    totalCount.value = 0
  }

  // 设置购物车列表
  function setCartList(list: CartItem[]): void {
    cartList.value = list || []
    totalCount.value = cartList.value.length
  }

  return {
    cartList,
    totalCount,
    checkedItems,
    checkedCount,
    totalPrice,
    isAllChecked,
    fetchCartList,
    clearCart,
    setCartList
  }
})
