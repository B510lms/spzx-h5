/// <reference types="@dcloudio/types" />

// uni-app 编译指令的类型忽略
declare const __UNI_PLATFORM__: string

// uview-plus 模块声明（必须放在 ambient context 中，不能在包含 import/export 的文件里）
declare module 'uview-plus' {
  const uviewPlus: any
  export default uviewPlus
}
