/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}

declare global {
  interface Uni {
    $u: any
    $systemInfo: any
  }
}

declare module 'uview-plus' {
  const uviewPlus: any
  export default uviewPlus
}
