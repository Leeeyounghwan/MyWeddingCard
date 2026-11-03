import { Download, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { adminAvailable, deleteGuestbookAdmin, listGuestbookAdmin, listRsvps, type RsvpRow } from '../../lib/admin'
import type { GuestbookEntry } from '../../lib/guestbook'
import { toUserMessage } from '../../lib/supabase'
import { toast } from '../../lib/toast'
import { Button } from '../common/Button'
import styles from './AdminRsvp.module.css'

type Filter = 'all' | 'attending' | 'absent'
type AdminTab = 'rsvp' | 'guestbook'

const sideLabel = { groom: '신랑측', bride: '신부측' } as const
const mealLabel = { yes: '식사', no: '식사 안 함', undecided: '식사 미정' } as const

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(new Date(iso))

const csvCell = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`

function downloadCsv(rows: RsvpRow[]) {
  const header = ['제출일', '구분', '성함', '참석', '인원', '식사', '연락처', '메모']
  const body = rows.map((r) => [
    fmtDate(r.created_at),
    sideLabel[r.side],
    r.name,
    r.attending ? '참석' : '불참',
    r.party_size,
    r.attending ? mealLabel[r.meal] : '',
    r.phone ?? '',
    r.memo ?? '',
  ])
  const csv = '\ufeff' + [header, ...body].map((row) => row.map(csvCell).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `rsvp-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadGuestbookCsv(rows: GuestbookEntry[]) {
  const header = ['작성일', '이름', '내용']
  const body = rows.map((entry) => [fmtDate(entry.created_at), entry.name, entry.message])
  const csv = '\ufeff' + [header, ...body].map((row) => row.map(csvCell).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `guestbook-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AdminRsvp({ adminKey }: { adminKey: string }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('rsvp')
  const [rows, setRows] = useState<RsvpRow[]>([])
  const [guestbookRows, setGuestbookRows] = useState<GuestbookEntry[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [side, setSide] = useState<'all' | RsvpRow['side']>('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guestbookLoading, setGuestbookLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [rsvpRows, entries] = await Promise.all([listRsvps(adminKey), listGuestbookAdmin(adminKey)])
      setRows(rsvpRows)
      setGuestbookRows(entries)
    } catch (e) {
      setError(toUserMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const removeGuestbook = async (entry: GuestbookEntry) => {
    if (!window.confirm(`'${entry.name}'님의 방명록을 삭제할까요?`)) return
    setGuestbookLoading(true)
    setError(null)
    try {
      await deleteGuestbookAdmin(adminKey, entry.id)
      setGuestbookRows((current) => current.filter((item) => item.id !== entry.id))
      toast('방명록이 삭제되었습니다')
    } catch (e) {
      setError(toUserMessage(e))
    } finally {
      setGuestbookLoading(false)
    }
  }

  useEffect(() => {
    if (adminAvailable) void load()
  }, [])

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filter === 'attending' && !r.attending) return false
        if (filter === 'absent' && r.attending) return false
        if (side !== 'all' && r.side !== side) return false
        if (query && !`${r.name} ${r.phone ?? ''} ${r.memo ?? ''}`.toLowerCase().includes(query.toLowerCase())) {
          return false
        }
        return true
      }),
    [rows, filter, side, query],
  )

  const summary = useMemo(
    () => ({
      responses: rows.length,
      attendingPeople: rows.reduce((sum, r) => sum + (r.attending ? r.party_size : 0), 0),
      meal: rows.reduce((sum, r) => sum + (r.attending && r.meal === 'yes' ? r.party_size : 0), 0),
      absent: rows.filter((r) => !r.attending).length,
    }),
    [rows],
  )

  if (!adminKey) {
    return <main className={styles.page}>관리 URL의 키가 비어 있습니다.</main>
  }

  if (!adminAvailable) {
    return <main className={styles.page}>Supabase 설정 후 사용할 수 있습니다.</main>
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>YE Admin</p>
        <h1>{activeTab === 'rsvp' ? '참석 여부 관리' : '방명록 관리'}</h1>
        <nav className={styles.tabs} aria-label="관리 메뉴">
          <button type="button" className={styles.tab} data-active={activeTab === 'rsvp'} onClick={() => setActiveTab('rsvp')}>
            참석 여부 관리
            <span>{rows.length}</span>
          </button>
          <button type="button" className={styles.tab} data-active={activeTab === 'guestbook'} onClick={() => setActiveTab('guestbook')}>
            방명록 관리
            <span>{guestbookRows.length}</span>
          </button>
        </nav>
        <div className={styles.actions}>
          <Button size="sm" variant="soft" icon={<RefreshCw size={14} aria-hidden="true" />} loading={loading} onClick={load}>
            새로고침
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Download size={14} aria-hidden="true" />}
            disabled={activeTab === 'rsvp' ? filtered.length === 0 : guestbookRows.length === 0}
            onClick={() => activeTab === 'rsvp' ? downloadCsv(filtered) : downloadGuestbookCsv(guestbookRows)}
          >
            CSV
          </Button>
        </div>
      </header>

      {activeTab === 'rsvp' && <section className={styles.summary} aria-label="참석 집계">
        <div>
          <span>응답</span>
          <strong>{summary.responses}</strong>
        </div>
        <div>
          <span>참석 인원</span>
          <strong>{summary.attendingPeople}</strong>
        </div>
        <div>
          <span>식사</span>
          <strong>{summary.meal}</strong>
        </div>
        <div>
          <span>불참</span>
          <strong>{summary.absent}</strong>
        </div>
      </section>}

      {activeTab === 'rsvp' && <section className={styles.filters} aria-label="필터">
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">전체</option>
          <option value="attending">참석</option>
          <option value="absent">불참</option>
        </select>
        <select value={side} onChange={(e) => setSide(e.target.value as typeof side)}>
          <option value="all">양가 전체</option>
          <option value="groom">신랑측</option>
          <option value="bride">신부측</option>
        </select>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름, 연락처, 메모 검색" />
      </section>}

      {error ? <p className={styles.error}>{error}</p> : null}

      {activeTab === 'rsvp' && <section className={styles.list} aria-busy={loading}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>{loading ? '불러오는 중입니다.' : '조건에 맞는 회신이 없습니다.'}</p>
        ) : (
          filtered.map((r) => (
            <article key={r.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <strong>{r.name}</strong>
                  <span>{sideLabel[r.side]}</span>
                </div>
                <em data-attending={r.attending}>{r.attending ? '참석' : '불참'}</em>
              </div>
              <dl className={styles.meta}>
                <div>
                  <dt>인원</dt>
                  <dd>{r.attending ? `${r.party_size}명` : '-'}</dd>
                </div>
                <div>
                  <dt>식사</dt>
                  <dd>{r.attending ? mealLabel[r.meal] : '-'}</dd>
                </div>
                <div>
                  <dt>연락처</dt>
                  <dd>{r.phone || '-'}</dd>
                </div>
                <div>
                  <dt>제출</dt>
                  <dd>{fmtDate(r.created_at)}</dd>
                </div>
              </dl>
              {r.memo && <p className={styles.memo}>{r.memo}</p>}
            </article>
          ))
        )}
      </section>}

      {activeTab === 'guestbook' && <section className={styles.guestbook} aria-label="방명록 목록">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Guestbook</p>
          <span className={styles.count}>{guestbookRows.length}건</span>
        </div>
        {guestbookRows.length === 0 ? (
          <p className={styles.empty}>{guestbookLoading ? '불러오는 중입니다.' : '등록된 방명록이 없습니다.'}</p>
        ) : (
          <div className={styles.guestbookList} aria-busy={guestbookLoading}>
            {guestbookRows.map((entry) => (
              <article key={entry.id} className={styles.guestbookCard}>
                <div className={styles.guestbookHead}>
                  <strong>{entry.name}</strong>
                  <time dateTime={entry.created_at}>{fmtDate(entry.created_at)}</time>
                </div>
                <p>{entry.message}</p>
                <button type="button" className={styles.deleteButton} onClick={() => void removeGuestbook(entry)} disabled={guestbookLoading}>
                  <Trash2 size={14} aria-hidden="true" />
                  삭제
                </button>
              </article>
            ))}
          </div>
        )}
      </section>}
    </main>
  )
}
