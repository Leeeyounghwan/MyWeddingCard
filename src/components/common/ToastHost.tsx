import { AnimatePresence, m } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useToast } from '../../lib/toast'
import styles from './ToastHost.module.css'

export function ToastHost() {
  const t = useToast()
  return createPortal(
    <div className={styles.host} role="status" aria-live="polite">
      <AnimatePresence>
        {t && (
          <m.div
            key={t.id}
            className={styles.toast}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
          >
            {t.message}
          </m.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
