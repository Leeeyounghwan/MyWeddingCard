import { useCallback, useState } from 'react'
import { guestbookApi, type GuestbookEntry } from '../../lib/guestbook'
import { toUserMessage } from '../../lib/supabase'
import { Button } from '../common/Button'
import { Sheet } from '../common/Sheet'
import { EntryItem } from './EntryItem'
import styles from './Guestbook.module.css'

const PAGE = 10

/** 방명록 전체보기 — 10개씩 이어서 불러옵니다. */
export default function AllSheet({
  open,
  onClose,
  onChanged,
  initialEntries,
  initialTotal,
}: {
  open: boolean
  onClose: () => void
  onChanged: () => void
  initialEntries: GuestbookEntry[]
  initialTotal: number
}) {
  const [entries, setEntries] = useState(initialEntries)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPage = useCallback(async (offset: number) => {
    setLoading(true)
    setError(null)
    try {
      const page = await guestbookApi.list(PAGE, offset)
      setEntries((prev) => (offset === 0 ? page.entries : [...prev, ...page.entries]))
      setTotal(page.total)
    } catch (e) {
      setError(toUserMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDeleted = () => {
    void fetchPage(0)
    onChanged()
  }

  return (
    <Sheet open={open} onClose={onClose} eyebrow="Guestbook" title="방명록 전체보기">
      {error && (
        <div className={styles.state}>
          <p>{error}</p>
        </div>
      )}
      <ul className={`${styles.list} ${styles.cardList}`}>
        {entries.map((e) => (
          <EntryItem key={e.id} entry={e} onDeleted={handleDeleted} variant="card" />
        ))}
      </ul>
      {!loading && !error && entries.length === 0 && <p className={styles.state}>아직 남겨진 메시지가 없어요.</p>}
      {(entries.length < total || loading) && (
        <div className={styles.actions}>
          <Button variant="soft" block loading={loading} onClick={() => fetchPage(entries.length)}>
            더 불러오기
          </Button>
        </div>
      )}
    </Sheet>
  )
}
