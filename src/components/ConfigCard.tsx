import type { ComponentType } from 'react'
import type { DataItem, TransferState, TransferStatus } from '../types'
import { CookieKeyInput } from './CookieKeyInput'
import {
  IconArrowDown,
  IconArrowRight,
  IconCheck,
  IconError,
  IconTrash,
  IconWarn,
} from './icons'

interface ConfigCardProps {
  index: number
  item: DataItem
  status: TransferStatus
  onPatch: (index: number, patch: Partial<DataItem>) => void
  onDelete: (index: number) => void
  onTransfer: (index: number) => void
}

// 反馈态对应的图标
const STATUS_ICON: Partial<Record<TransferState, ComponentType<{ className?: string }>>> = {
  success: IconCheck,
  error: IconError,
  warn: IconWarn,
}

export function ConfigCard({
  index,
  item,
  status,
  onPatch,
  onDelete,
  onTransfer,
}: ConfigCardProps) {
  const loading = status.state === 'loading'
  const StatusIcon = STATUS_ICON[status.state]

  return (
    <div className="card">
      <div className="card-head">
        <span className="idx">{index + 1}</span>
        <input
          className="title-input"
          type="text"
          value={item.title}
          placeholder="未命名配置"
          onChange={(e) => onPatch(index, { title: e.target.value })}
        />
        <button
          className="btn-del"
          onClick={() => onDelete(index)}
          title="删除此配置"
        >
          <IconTrash />
        </button>
      </div>

      <div className="card-body">
        <div className="field">
          <div className="field-label">
            <span className="dot src" />
            源网址
            <span className="tag">线上</span>
          </div>
          <input
            type="text"
            value={item.sourceUrl}
            placeholder="https://example.com"
            onChange={(e) => onPatch(index, { sourceUrl: e.target.value })}
          />
        </div>

        <div className="flow">
          <div className="arrow">
            <IconArrowDown />
            复制 Cookie 到
          </div>
        </div>

        <div className="field">
          <div className="field-label">
            <span className="dot dst" />
            目标网址
            <span className="tag">本地</span>
          </div>
          <input
            type="text"
            value={item.targetUrl}
            placeholder="http://localhost:8099"
            onChange={(e) => onPatch(index, { targetUrl: e.target.value })}
          />
        </div>

        <CookieKeyInput
          value={item.cookieKey}
          onChange={(v) => onPatch(index, { cookieKey: v })}
        />
      </div>

      <div className="card-foot">
        <button
          className="btn-transfer"
          disabled={loading}
          onClick={() => onTransfer(index)}
        >
          {loading ? (
            <>
              <span className="spinner" />
              传输中…
            </>
          ) : (
            <>
              <IconArrowRight />
              传输 Cookie
            </>
          )}
        </button>

        {StatusIcon && (
          <div className={`status ${status.state}`}>
            <StatusIcon />
            {status.message}
          </div>
        )}
      </div>
    </div>
  )
}
