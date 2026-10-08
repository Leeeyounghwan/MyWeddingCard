import { AnimatePresence, m, useInView, useReducedMotion } from 'framer-motion'
import { PenLine } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useDisclosure } from '../../hooks/useDisclosure'
import { guestbookApi, guestbookAvailable, type GuestbookEntry } from '../../lib/guestbook'
import { toUserMessage } from '../../lib/supabase'
import { Button } from '../common/Button'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'
import { EntryItem } from './EntryItem'
import styles from './Guestbook.module.css'

const WriteSheet = lazy(() => import('./WriteSheet'))
const AllSheet = lazy(() => import('./AllSheet'))

const PREVIEW = 4

/**
 * 방명록
 * - 섹션이 화면 가까이 올 때 처음 불러옵니다(supabase-js 도 이때 로드).
 * - 최근 글 몇 개만 보여주고, 전체는 시트에서 페이지 단위로 불러옵니다.
 */
export function Guestbook() {
  const ref = useRef<HTMLDivElement>(null)
  const near = useInView(ref, { once: true, margin: '1000px 0px' })
  const reduce = useReducedMotion()
  const [entries, setEntries] = useState<GuestbookEntry[] | null>(null)
  const [total, setTotal] = useState(0)
  const [allEntries, setAllEntries] = useState<GuestbookEntry[] | null>(null)
  const [allTotal, setAllTotal] = useState(0)
  const [allLoading, setAllLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const write = useDisclosure()
  const all = useDisclosure()

  const load = useCallback(async () => {
    setError(null)
    try {
      const page = await guestbookApi.list(PREVIEW, 0)
      setEntries(page.entries)
      setTotal(page.total)
    } catch (e) {
      setError(toUserMessage(e))
    }
  }, [])

  const openAll = useCallback(async () => {
    setAllLoading(true)
    setError(null)
    try {
      const page = await guestbookApi.list(10, 0)
      setAllEntries(page.entries)
      setAllTotal(page.total)
      all.show()
    } catch (e) {
      setError(toUserMessage(e))
    } finally {
      setAllLoading(false)
    }
  }, [all])

  useEffect(() => {
    if (near && guestbookAvailable) void load()
  }, [near, load])

  if (!guestbookAvailable) return null
  const stateKey = error ? 'error' : entries === null ? 'loading' : entries.length === 0 ? 'empty' : 'list'

  return (
    <Section id="guestbook" eyebrow="Guestbook" title="축하의 한마디" tone="paper">
      <m.div ref={ref} className={styles.preview} aria-busy={entries === null && !error} layout={!reduce}>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={stateKey}
            className={styles.content}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {error ? (
              <div className={styles.state}>
                <p>{error}</p>
                <Button size="sm" variant="ghost" onClick={load}>
                  다시 불러오기
                </Button>
              </div>
            ) : entries === null ? (
              <p className={styles.state}>축하 메시지를 불러오는 중이에요.</p>
            ) : entries.length === 0 ? (
              <p className={styles.state}>
                아직 남겨진 메시지가 없어요.
                <br />첫 번째 축하 메시지를 남겨주세요.
              </p>
            ) : (
              <ul className={styles.list}>
                {entries.map((e) => (
                  <EntryItem key={e.id} entry={e} onDeleted={load} />
                ))}
              </ul>
            )}
          </m.div>
        </AnimatePresence>
      </m.div>

      <Reveal className={styles.actions}>
        <Button
          variant="primary"
          block
          icon={<PenLine size={15} strokeWidth={1.5} aria-hidden="true" />}
          onClick={write.show}
          aria-haspopup="dialog"
        >
          축하 메시지 남기기
        </Button>
        {total > 0 && (
          <Button variant="outline" block loading={allLoading} onClick={openAll} aria-haspopup="dialog">
            방명록 전체보기
          </Button>
        )}
      </Reveal>

      <Suspense fallback={null}>
        {write.mounted && <WriteSheet open={write.open} onClose={write.hide} onCreated={load} />}
        {all.mounted && allEntries && (
          <AllSheet
            open={all.open}
            onClose={all.hide}
            onChanged={load}
            initialEntries={allEntries}
            initialTotal={allTotal}
          />
        )}
      </Suspense>
    </Section>
  )
}
