import { IconLogo, IconPlus } from './icons'

interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="ic">
        <IconLogo />
      </div>
      <div className="et">还没有 Cookie 配置</div>
      <div className="es">
        创建一条配置，把线上环境的登录 Cookie 一键复制到本地调试页面。
      </div>
      <button className="btn-add" onClick={onAdd}>
        <IconPlus />
        新建配置
      </button>
    </div>
  )
}
