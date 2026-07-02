interface IconProps {
  className?: string
}

// 统一的线性图标基础属性
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function IconLogo({ className }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 9h.01M15 9h.01M9.5 15c.8.6 1.6.9 2.5.9s1.7-.3 2.5-.9" />
    </svg>
  )
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2.2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  )
}

export function IconArrowDown({ className }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  )
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  )
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2.2}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export function IconError({ className }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2.2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  )
}

export function IconWarn({ className }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2.2}>
      <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  )
}

export function IconClose({ className }: IconProps) {
  return (
    <svg className={className} {...base} strokeWidth={2.5}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
