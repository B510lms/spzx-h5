import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(() => ({
  plugins: [
    AutoImport({
      imports: [
        'vue',
        'pinia',
        {
          '@dcloudio/uni-app': [
            'onLaunch',
            'onShow',
            'onHide',
            'onLoad',
            'onReady',
            'onUnload',
            'onPullDownRefresh',
            'onReachBottom',
            'onPageScroll',
            'onShareAppMessage',
          ],
        },
      ],
      dts: 'src/types/auto-imports.d.ts',
      dirs: ['src/store', 'src/utils'],
    }),
    Components({
      dirs: ['src/components'],
      dts: 'src/types/components.d.ts',
      extensions: ['vue'],
    }),
    uni(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8500',
        changeOrigin: true,
      },
    },
  },
}))
