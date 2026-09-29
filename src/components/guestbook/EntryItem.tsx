import { AnimatePresence, m } from 'framer-motion'
import { X } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { formatDotDate } from '../../lib/date'
import { guestbookApi, type GuestbookEntry } from '../../lib/guestbook'
import { toast } from '../../lib/toast'
import { toUserMessage } from '../../lib/supabase'
import { LIMITS } from '../../lib/validation'
import { Button } from '../common/Button'
import styles from './EntryItem.module.css'

/**
 * 방명록 글 하나.
 * 메시지는 React 텍스트 노드로만 렌더링되므로(HTML 해석 없음) XSS 가 발생하지 않습니다.
 * 삭제는 글 아래에 비밀번호 입력창이 펼쳐지는 인라인 방식입니다.
 */
export function EntryItem({ entry, onDeleted }: { entry: GuestbookEntry; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const id = useId()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < LIMITS.passwordMin) {
      setError('비밀번호를 입력해 주세요.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await guestbookApi.remove(entry.id, password)
      toast('메시지가 삭제되었습니다')
      onDeleted()
    } catch (err) {
      setError(toUserMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <li className={styles.item}>
      <div className={styles.head}>
        <p className={styles.from}>
          <span className={styles.fromLabel}>from.</span> {entry.name}
        </p>
        <button
          type="button"
          className={styles.delete}
          onClick={() => {
            setConfirming((v) => !v)
            setError(null)
          }}
          aria-expanded={confirming}
          aria-controls={id}
          aria-label={`${entry.name}님의 메시지 삭제`}
        >
          <X size={14} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
      <p className={styles.message}>{entry.message}</p>
      <time className={styles.date} dateTime={entry.created_at}>
        {formatDotDate(entry.created_at)}
      </time>

      <AnimatePresence initial={false}>
        {confirming && (
          <m.form
            id={id}
            className={styles.confirm}
            onSubmit={submit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.confirmRow}>
              <label className="sr-only" htmlFor={`${id}-pw`}>
                작성 시 입력한 비밀번호
              </label>
              <input
                id={`${id}-pw`}
                type="password"
                className={styles.pw}
                placeholder="작성 시 입력한 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={LIMITS.passwordMax}
                autoComplete="off"
                autoFocus
              />
              <Button type="submit" size="sm" variant="primary" loading={loading}>
                삭제
              </Button>
            </div>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </m.form>
        )}
      </AnimatePresence>
    </li>
  )
}
