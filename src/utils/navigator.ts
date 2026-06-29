// 导航工具函数

// 跳转到登录页（记录来源页面）
export function toLogin(): void {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const route = currentPage?.route || ''
  uni.navigateTo({
    url: `/pages/public/login?redirect=${encodeURIComponent(route)}`
  })
}
