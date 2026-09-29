import { AnimatePresence, m } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useScrollLock } from '../../hooks/useScrollLock'
import styles from './Sheet.module.css'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  /** 제목 위 작은 영문 라벨 */
  eyebrow?: string
  children: ReactNode
  /** sheet: 하단에서 올라오는 시트 / dialog: 가운데 모달 */
  variant?: 'sheet' | 'dialog'
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * 접근성을 갖춘 Bottom Sheet / Modal.
 * - role="dialog" + aria-modal, 제목 연결
 * - 열릴 때 첫 입력 요소로 포커스, Tab 순환(focus trap), Esc 로 닫기
 * - 닫히면 열기 전 버튼으로 포커스 복귀
 * - 배경 스크롤 잠금
 */
export function Sheet(props: SheetProps) {
  return createPortal(<AnimatePresence>{props.open && <SheetInner {...props} />}</AnimatePresence>, document.body)
}

function SheetInner({ onClose, title, eyebrow, children, variant = 'sheet' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useScrollLock(true)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    // 첫 포커스: 입력 요소가 있으면 거기로, 없으면 패널 자체로 (모바일에서 키보드가 갑자기 올라오지 않도록 입력요소는 제외)
    const first = panel?.querySelector<HTMLElement>('[data-autofocus]')
    ;(first ?? panel)?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === firstEl || document.activeElement === panel)) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      // 스크롤 잠금 해제 후 포커스 복귀
      requestAnimationFrame(() => prev?.focus?.({ preventScroll: true }))
    }
  }, [])

  const isSheet = variant === 'sheet'

  return (
    <div className={styles.root} data-variant={variant}>
      <m.div
        className={styles.backdrop}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      />
      <m.div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 12 }}
        animate={isSheet ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {isSheet && <div className={styles.handle} aria-hidden="true" />}
        <header className={styles.header}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </m.div>
    </div>
  )
}
