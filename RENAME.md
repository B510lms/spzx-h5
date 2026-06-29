# 项目架构说明（spzx-h5 — 尚品甑选电商小程序）

> uni-app + Vue 3 + TypeScript + Pinia + uview-plus  
> 后端代码：`E:\工作文件\Project\spzx-parent`  
> 代码格式参考：`E:\PUTE\wise-match-mini`

本项目是一个 **B2C 电商小程序**，支持 H5 和微信小程序双端运行，采用 **TypeScript 严格模式**、**按业务域分层的 API 架构**、**Pinia 组合式状态管理**。

---

## 一、技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API) | ^3.4.21 |
| 语言 | TypeScript | ^4.9.4 |
| 跨平台 | uni-app (DCloud) | 3.0.0-alpha |
| 构建 | Vite | ^5.2.0 |
| 状态管理 | Pinia (setup syntax) | ^2.1.7 |
| UI 库 | uview-plus | ^3.1.47 |
| CSS | Sass/SCSS | ^1.77.0 |
| 类型检查 | vue-tsc | ^1.0.24 |
| 后端 | Java (Spring Boot) | localhost:8500 |

---

## 二、根目录结构

```text
spzx-h5/
├── index.html                  # Vite 入口 HTML
├── vite.config.ts              # Vite 配置（uni-app 插件 + proxy + path alias）
├── tsconfig.json               # TypeScript 配置
├── package.json                # 依赖与脚本
├── RENAME.md                   # 本架构文档
│
└── src/
    ├── main.ts                 # 应用入口（SSR app 创建、Pinia + uview-plus 注册）
    ├── App.vue                 # 根组件（onLaunch 初始化、登录状态检查）
    ├── manifest.json           # uni-app 应用配置
    ├── pages.json              # 页面路由 + 原生 tabBar 配置
    ├── uni.scss                # 全局设计系统（变量 + 工具类）
    ├── env.d.ts                # TypeScript 环境声明（模块、ImportMeta、Uni 扩展）
    ├── shims-uni.d.ts          # uni-app 编译指令类型 shim
    │
    ├── api/                    # API 接口层（按业务域拆分）
    ├── request/                # HTTP 请求封装
    ├── store/                  # Pinia 状态管理
    ├── type/                   # 全局类型定义
    ├── utils/                  # 工具函数
    ├── components/             # 公共组件
    ├── pages/                  # 页面视图
    └── static/                 # 静态资源
```

---

## 三、API 接口层（`src/api/`）

> 按业务域拆分为独立子目录，每个域包含 `index.ts`（API 函数）和 `type.ts`（请求/响应类型）。

```text
api/
├── product/                   # 商品模块
│   ├── index.ts               # getIndexData, getCategoryTree, getProductList,
│   │                          #   getProductDetail, getAllBrands, getSkuById
│   └── type.ts                # IndexData, CategoryNode, ProductItem, ProductDetail,
│                              #   Brand, SkuInfo, ProductListParams
│
├── user/                      # 用户模块
│   ├── index.ts               # login, register, sendSms, getCurrentUserInfo
│   └── type.ts                # LoginParams, RegisterParams, LoginResponse, UserInfo
│
├── cart/                      # 购物车模块
│   ├── index.ts               # getCartList, addToCart, deleteCartItem, checkCartItem,
│   │                          #   checkAllCart, clearCart, getCheckedItems, deleteCheckedItems
│   └── type.ts                # CartItem
│
├── order/                     # 订单模块
│   ├── index.ts               # getTrade, submitOrder, getOrderList, getOrderDetail,
│   │                          #   buyNow, getOrderByOrderNo
│   └── type.ts                # TradeVo, OrderItemVo, SubmitOrderParams, OrderInfo, AddressInfo
│
├── address/                   # 地址模块
│   ├── index.ts               # getAddressList, getAddress
│   └── type.ts                # AddressInfo
│
└── pay/                       # 支付模块
    ├── index.ts               # submitAlipay
    └── type.ts                # PayResult
```

**设计约定：**
- API 函数命名：`camelCase`，如 `getProductDetail`、`submitOrder`
- URL 中带 `/auth/` 的接口需要登录态（token 自动注入）
- 所有函数返回 `Promise<T>`，由 `request<T>()` 泛型保证类型安全
- 后端响应格式：`{ code: 200（成功）, 208（未登录）, message, data }`

---

## 四、请求层（`src/request/`）

```text
request/
├── index.ts                   # 核心泛型请求函数 request<T>()
└── type.ts                    # ApiResponse<T> 接口
```

**`request<T>(url, method, data?, header?)` 核心逻辑：**

```
发起请求
  ├─ 开发环境: BASE_URL = ''（走 Vite proxy → localhost:8500）
  ├─ 生产环境: BASE_URL = import.meta.env.VITE_API_BASE_URL
  ├─ 自动注入 token 请求头（从 storage 读取）
  ├─ 超时: 10s
  │
  └─ 响应处理:
      ├─ statusCode ≠ 200  → toast "网络异常" + reject
      ├─ code === 200      → resolve(data)   ✅ 成功
      ├─ code === 208      → logout + 跳转登录 🔒 未登录
      └─ 其他 code          → toast message + reject ❌
```

---

## 五、状态管理（`src/store/`）

> 采用 Pinia **Composition API（setup syntax）** 风格。

```text
store/
├── app.ts                     # useAppStore — 系统信息、状态栏/导航栏高度
├── user.ts                    # useUserStore — token、用户信息、登录/登出
└── cart.ts                    # useCartStore — 购物车列表、选中状态、总价计算
```

| Store | 关键状态 | 计算属性 | 方法 |
|-------|---------|---------|------|
| `useAppStore` | `systemInfo`, `statusBarHeight`, `navBarHeight` | — | `getSystemInfo()`, `init()` |
| `useUserStore` | `token`, `refreshToken`, `userInfo` | `isLogin`, `nickName`, `avatar` | `checkLogin()`, `login()`, `logout()`, `setToken()`, `setUserInfo()` |
| `useCartStore` | `cartList`, `totalCount` | `checkedItems`, `checkedCount`, `totalPrice`, `isAllChecked` | `fetchCartList()`, `clearCart()`, `setCartList()` |

**持久化策略：** 手动调用 `uni.setStorageSync` / `uni.getStorageSync`，不使用 Pinia 持久化插件。

---

## 六、页面路由（`src/pages.json`）

### 原生 TabBar（4 个标签）

| Tab | 路径 | 说明 |
|-----|------|------|
| 首页 | `pages/index/index` | 商品搜索、轮播图、分类导航、热销推荐 |
| 分类 | `pages/category/category` | 商品分类树、分类筛选 |
| 购物车 | `pages/cart/cart` | 购物车列表、选中/数量/删除 |
| 我的 | `pages/user/user` | 用户中心、订单入口、设置 |

### 功能页面（21 个页面）

```text
pages/
├── index/index.vue               # 首页
├── category/category.vue         # 分类页
├── cart/cart.vue                 # 购物车
├── user/user.vue                 # 个人中心
├── detail/detail.vue             # 商品详情（含 SKU 选择）
├── product/list.vue              # 商品列表（搜索/筛选结果）
├── search/index.vue              # 搜索页（历史记录）
├── public/login.vue              # 登录
├── public/register.vue           # 注册
├── order/order.vue               # 订单列表
├── order/create.vue              # 确认订单（结算页）
├── order/show.vue                # 订单详情
├── address/addressManage.vue     # 地址列表管理
├── address/address.vue           # 地址编辑
├── money/pay.vue                 # 支付页
├── money/paySuccess.vue          # 支付结果
├── notice/notice.vue             # 通知页
├── set/set.vue                   # 设置页
├── userinfo/userinfo.vue         # 个人信息编辑
├── userinfo/userBrowse.vue       # 浏览记录
└── userinfo/userCollect.vue      # 我的收藏
```

---

## 七、公共组件（`src/components/`）

```text
components/
├── navbar/navbar.vue             # 自定义导航栏（状态栏适配 + 返回按钮 + 标题 + 右侧插槽）
├── goods-card/goods-card.vue     # 商品卡片（图片、价格、销量、点击跳转详情）
├── goods-list/goods-list.vue     # 商品网格列表（1/2 列 + 加载更多 + 空状态）
└── no-data/no-data.vue           # 空状态占位图
```

---

## 八、工具函数（`src/utils/`）

```text
utils/
├── env.ts                        # BASE_URL（从 import.meta.env 读取）
├── common.ts                     # 通用工具函数
│   ├── formatPrice(price)        # 价格格式化（保留两位小数）
│   ├── formatDate(date, format)  # 日期格式化
│   ├── getOrderStatusText(s)     # 订单状态码 → 中文
│   ├── getOrderStatusStyle(s)    # 订单状态码 → 样式 {color, bgColor}
│   ├── throttle(fn, delay)       # 节流
│   ├── debounce(fn, delay)       # 防抖
│   ├── isPhone(phone)            # 手机号验证
│   ├── getImageUrl(path)         # 图片路径解析
│   └── copyText(text)            # 复制到剪贴板
└── navigator.ts                  # 导航工具
    └── toLogin()                 # 跳转登录页（记录来源路由）
```

---

## 九、全局类型（`src/type/`）

```text
type/
└── common.ts                     # Pagination<T> — 通用分页响应 {records, total, size, current, pages}
```

> 业务域专属类型定义在对应 `api/<domain>/type.ts` 中，与 API 函数就近维护。

---

## 十、设计系统（`src/uni.scss`）

### 主题色变量
```scss
$u-primary: #E4393C    // 品牌红
$u-warning: #FF9900
$u-success: #19BE6B
$u-error:   #FA3534
$u-info:    #909399
```

### 工具类体系
- **字号**: `.fs-xs` ~ `.fs-2xl`（20rpx ~ 40rpx）
- **间距**: `.mt-*`, `.mb-*`, `.px-*`, `.py-*`（xs/sm/md/lg/xl/2xl）
- **颜色**: `.text-primary`, `.text-muted`, `.text-content` 等
- **布局**: `.flex`, `.flex-center`, `.flex-between`, `.flex-col` 等
- **圆角**: `.radius-sm`, `.radius-md`, `.radius-lg`, `.radius-round`
- **其他**: `.text-ellipsis`, `.text-ellipsis-2`, `.price-red`, `.btn-primary`, `.btn-ghost`, `.safe-area-bottom`

---

## 十一、架构核心原则

1. **TypeScript 严格模式** — 所有代码使用 `.ts` / `<script setup lang="ts">`，零隐式 `any`
2. **API 按域分层** — 每个业务域独立目录，`index.ts` + `type.ts` 就近维护
3. **泛型请求** — `request<T>()` 保证请求-响应类型链路安全
4. **Pinia setup syntax** — 统一使用 Composition API 风格定义 Store
5. **手动持久化** — 不使用 Pinia 插件，显式调用 `uni.setStorageSync`
6. **Vite proxy 开发** — 开发环境 `/api` 请求代理到 `localhost:8500`，无需跨域
7. **token 请求头** — 后端使用 `{ token }` 自定义头认证，非 JWT Bearer 标准
8. **响应码约定** — `code: 200` 成功，`code: 208` 未登录

---

## 十二、开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev:h5` | 启动 H5 开发服务器（localhost:8080） |
| `npm run build:h5` | 构建 H5 生产版本 |
| `npm run dev:mp-weixin` | 启动微信小程序开发 |
| `npm run build:mp-weixin` | 构建微信小程序 |
| `npm run type-check` | TypeScript 类型检查（vue-tsc --noEmit） |

---

## 十三、后端接口规范

后端地址：`E:\工作文件\Project\spzx-parent`，运行端口 `8500`。

**统一响应格式：**
```json
{
  "code": 200,       // 200=成功, 208=未登录
  "message": "操作成功",
  "data": {}
}
```

**认证方式：** 请求头携带 `{ token: "xxx" }`，非标准 Bearer 方式。

**鉴权 URL 约定：** 需登录接口路径包含 `/auth/`，如 `/api/user/userInfo/auth/getCurrentUserInfo`。
