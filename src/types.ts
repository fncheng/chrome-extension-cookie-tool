// 单条 Cookie 传输配置
export interface DataItem {
  title: string
  sourceUrl: string
  targetUrl: string
  // Cookie 键名，多个以英文逗号分隔（与后台 background.js 的解析约定保持一致）
  cookieKey: string
}

// 发送给后台 Service Worker 的消息
export interface ChromeMessage {
  action: 'transferCookie'
  info: DataItem
}

// 后台返回的响应
export interface ChromeResponse {
  success: boolean
  message?: string
}

// 单条配置的传输状态
export type TransferState = 'idle' | 'loading' | 'success' | 'error' | 'warn'

export interface TransferStatus {
  state: TransferState
  message: string
}
