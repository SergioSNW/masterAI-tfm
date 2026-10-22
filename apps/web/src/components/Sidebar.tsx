import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface SidebarProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

/** Fixed sidebar on desktop; off-canvas drawer (closed by default) on narrow screens. */
export function Sidebar({ open, onClose, children }: SidebarProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div
        className={`sidebar-backdrop${open ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
        data-testid="sidebar-backdrop"
      />
      <aside id="app-sidebar" className={`sidebar glass${open ? ' open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-header">
          <div className="logo">MasterAI</div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">✕</button>
        </div>
        {children}
      </aside>
    </>
  )
}

export function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      className="menu-btn"
      onClick={onClick}
      aria-label="Open menu"
      aria-expanded={open}
      aria-controls="app-sidebar"
    >
      <span /><span /><span />
    </button>
  )
}
