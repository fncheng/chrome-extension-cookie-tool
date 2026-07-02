import { produce } from 'immer'
import { useEffect, useState } from 'react'
import type { ChromeMessage, ChromeResponse, DataItem, TransferStatus } from './types'
import { ConfigCard } from './components/ConfigCard'
import { EmptyState } from './components/EmptyState'
import { IconLogo, IconPlus } from './components/icons'

const INIT_ITEM: DataItem = {
  title: '',
  sourceUrl: '',
  targetUrl: '',
  cookieKey: '',
}
const IDLE_STATUS: TransferStatus = { state: 'idle', message: '' }
const MESSAGE_TRANSFER_SUCCESS = 'Cookie 传输成功！'
const MESSAGE_TRANSFER_FAILED = 'Cookie 传输失败！'
const MESSAGE_TRANSFER_EMPTY = '请填写完整的源、目标网址和 Cookie Key'

const getLocalItems = (): DataItem[] => {
  try {
    const stored = localStorage.getItem('items')
    return stored ? (JSON.parse(stored) as DataItem[]) : []
  } catch (e) {
    console.error('Failed to parse items from localStorage', e)
    return []
  }
}

function App() {
  const [items, setItems] = useState<DataItem[]>(getLocalItems)
  const [statuses, setStatuses] = useState<TransferStatus[]>(() =>
    items.map(() => ({ ...IDLE_STATUS }))
  )

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items))
  }, [items])

  const handleAddItem = () => {
    setItems(produce((draft) => { draft.push({ ...INIT_ITEM }) }))
    setStatuses(produce((draft) => { draft.push({ ...IDLE_STATUS }) }))
  }

  const handleDeleteItem = (index: number) => {
    setItems(produce((draft) => { draft.splice(index, 1) }))
    setStatuses(produce((draft) => { draft.splice(index, 1) }))
  }

  // 局部更新单条配置字段
  const handlePatch = (index: number, patch: Partial<DataItem>) => {
    setItems(produce((draft) => { Object.assign(draft[index], patch) }))
  }

  const setStatus = (index: number, status: TransferStatus) => {
    setStatuses(produce((draft) => { draft[index] = status }))
  }

  const handleTransfer = (index: number) => {
    const item = items[index]
    if (!item.sourceUrl || !item.targetUrl || !item.cookieKey) {
      setStatus(index, { state: 'warn', message: MESSAGE_TRANSFER_EMPTY })
      return
    }

    setStatus(index, { state: 'loading', message: '' })

    try {
      chrome.runtime.sendMessage<ChromeMessage, ChromeResponse>(
        { action: 'transferCookie', info: item },
        (response) => {
          const success = response?.success ?? false
          setStatus(index, {
            state: success ? 'success' : 'error',
            message:
              response?.message ||
              (success ? MESSAGE_TRANSFER_SUCCESS : MESSAGE_TRANSFER_FAILED),
          })
        }
      )
    } catch (error) {
      console.error('transfer error: ', error)
      setStatus(index, { state: 'error', message: MESSAGE_TRANSFER_FAILED })
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">
          <IconLogo />
        </div>
        <div className="app-title-group">
          <span className="t">Cookie 传输</span>
          <span className="s">
            {items.length > 0 ? `${items.length} 条配置` : '暂无配置'}
          </span>
        </div>
        <div className="header-spacer" />
        {items.length > 0 && (
          <button className="btn-add" onClick={handleAddItem}>
            <IconPlus />
            新增
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState onAdd={handleAddItem} />
      ) : (
        <div className="list">
          {items.map((item, index) => (
            <ConfigCard
              key={index}
              index={index}
              item={item}
              status={statuses[index] ?? IDLE_STATUS}
              onPatch={handlePatch}
              onDelete={handleDeleteItem}
              onTransfer={handleTransfer}
            />
          ))}
        </div>
      )}

      <footer className="app-footer">Cookie 传输工具 v1.0</footer>
    </div>
  )
}

export default App
