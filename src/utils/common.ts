// 通用工具函数

// 格式化价格（保留两位小数）
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '0.00'
  return Number(price).toFixed(2)
}

// 格式化时间
export function formatDate(
  date: string | Date | number,
  format: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const o: Record<string, number> = {
    'M+': d.getMonth() + 1,
    'd+': d.getDate(),
    'H+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
    'q+': Math.floor((d.getMonth() + 3) / 3),
    S: d.getMilliseconds()
  }

  let result = format
  if (/(y+)/.test(result)) {
    result = result.replace(
      RegExp.$1,
      (d.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }

  for (const k in o) {
    if (new RegExp('(' + k + ')').test(result)) {
      result = result.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? String(o[k])
          : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return result
}

// 订单状态映射
export function getOrderStatusText(status: number | string): string {
  const statusMap: Record<string, string> = {
    '0': '待付款',
    '1': '待发货',
    '2': '已发货',
    '3': '已完成',
    '-1': '已取消'
  }
  return statusMap[String(status)] || '未知'
}

// 订单状态样式
export function getOrderStatusStyle(
  status: number | string
): { color: string; bgColor: string } {
  const styleMap: Record<string, { color: string; bgColor: string }> = {
    '0': { color: '#E4393C', bgColor: '#FFF0F0' },
    '1': { color: '#FF9900', bgColor: '#FFF7E6' },
    '2': { color: '#19BE6B', bgColor: '#E8F8F0' },
    '3': { color: '#909399', bgColor: '#F5F5F5' },
    '-1': { color: '#C0C4CC', bgColor: '#FAFAFA' }
  }
  return styleMap[String(status)] || { color: '#909399', bgColor: '#F5F5F5' }
}

// 节流函数
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 验证手机号
export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 获取图片完整路径
export function getImageUrl(path: string): string {
  if (!path) return '/static/images/errorImage.jpg'
  if (/^https?:\/\//.test(path)) return path
  if (/^\//.test(path)) return path
  return `/static/images/${path}`
}

// 复制文本到剪贴板
export function copyText(text: string): void {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}
