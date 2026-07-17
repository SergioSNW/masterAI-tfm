export const colors = {
  bg: {
    primary: '#07070d',
    secondary: '#0c0c14',
  },
  glass: {
    bg: 'rgba(255,255,255,0.04)',
    bgHover: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.08)',
    borderHover: 'rgba(255,255,255,0.14)',
  },
  text: {
    primary: 'rgba(255,255,255,0.92)',
    secondary: 'rgba(255,255,255,0.55)',
    tertiary: 'rgba(255,255,255,0.32)',
  },
  accent: {
    1: '#6366f1',
    2: '#a855f7',
    3: '#ec4899',
  },
  status: {
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
  },
} as const

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

export const fontFamily = 'System'
