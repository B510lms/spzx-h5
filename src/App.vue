<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

onLaunch(() => {
  // 获取系统信息
  uni.getSystemInfo({
    success: (res: any) => {
      // 存储系统信息
      uni.$systemInfo = res
    }
  })

  // 检查登录状态
  userStore.checkLogin()

  // 获取应用更新（小程序环境）
  // #ifdef MP-WEIXIN
  checkUpdate()
  // #endif
})

onShow(() => {
  // 应用显示时刷新登录状态
  userStore.checkLogin()
})

// #ifdef MP-WEIXIN
function checkUpdate() {
  const updateManager = uni.getUpdateManager()
  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success: (res) => {
        if (res.confirm) {
          updateManager.applyUpdate()
        }
      }
    })
  })
}
// #endif
</script>

<style lang="scss">
/* 全局样式已通过 uni.scss 引入 */
</style>
