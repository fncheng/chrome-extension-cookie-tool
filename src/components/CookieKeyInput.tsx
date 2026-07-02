import { useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { IconClose } from './icons'

interface CookieKeyInputProps {
  // 逗号分隔的键名字符串（存储格式，与后台解析一致）
  value: string
  onChange: (value: string) => void
}

// 逗号字符串 -> 去重后的键名数组
const parseKeys = (value: string): string[] => {
  const seen = new Set<string>()
  return value
    .split(',')
    .map((k) => k.trim())
    .filter((k) => {
      if (!k || seen.has(k)) return false
      seen.add(k)
      return true
    })
}

export function CookieKeyInput({ value, onChange }: CookieKeyInputProps) {
  const [draft, setDraft] = useState('')
  const keys = parseKeys(value)

  // 把草稿内容中的键名合并进已有列表
  const commit = (raw: string) => {
    const merged = parseKeys([value, raw].join(','))
    onChange(merged.join(','))
    setDraft('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && draft === '' && keys.length > 0) {
      onChange(keys.slice(0, -1).join(','))
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    // 粘贴或输入逗号时立即拆分为 chip
    if (next.includes(',')) commit(next)
    else setDraft(next)
  }

  const removeKey = (target: string) => {
    onChange(keys.filter((k) => k !== target).join(','))
  }

  return (
    <div className="field cookie">
      <div className="field-label">Cookie Key</div>
      {keys.length > 0 && (
        <div className="chips">
          {keys.map((key) => (
            <span className="chip" key={key}>
              {key}
              <button type="button" onClick={() => removeKey(key)} title="移除">
                <IconClose />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={draft}
        placeholder="输入键名后按回车 / 逗号添加"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
      />
      <div className="hint">支持多个 Cookie，逗号分隔或逐个添加</div>
    </div>
  )
}
