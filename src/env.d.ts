/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 补充环境变量类型
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_ENV?: string
  readonly VITE_APP_TITLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 自动导入类型声明引用
/// <reference types="./types/auto-imports.d.ts" />
/// <reference types="./types/components.d.ts" />

export {}

declare global {
  interface Uni {
    $u: any
    $systemInfo: any
  }
}

