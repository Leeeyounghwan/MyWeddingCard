import { Minus, Plus } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { isLocalMock, toUserMessage } from '../../lib/supabase'
import { getRsvp, submitRsvp, type Meal, type Side } from '../../lib/rsvp'
import { createRsvpEditKey } from '../../lib/rsvpEditLink'
import { toast } from '../../lib/toast'
import { hasBlockedWord, hasLink, LIMITS, normalize, PHONE_RE } from '../../lib/validation'
import { Button } from '../common/Button'
import { Segment } from '../common/Segment'
import { Sheet } from '../common/Sheet'
import f from '../common/Form.module.css'

function formatPhoneInput(value: string, previous: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (!'01'.startsWith(digits) && !digits.startsWith('01')) return previous
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

/**
 * RSVP 폼
 * - 개인정보 최소 수집: 이름 · 참석여부 · 인원 · 식사 · (선택)연락처 · (선택)메모
 * - 수집 · 이용 동의 필수, 수정 키가 있는 경우에만 본인의 응답 조회 가능
 */
export default function RsvpSheet({ open, onClose, editKey, onSaved, onLoaded }: {
  open: boolean
  onClose: () => void
  editKey: string | null
  onSaved: (key: string) => void
  onLoaded: (key: string) => void
}) {
  const [side, setSide] = useState<Side>('groom')
  const [attend, setAttend] = useState<'yes' | 'no'>('yes')
  const [name, setName] = useState('')
  const [party, setParty] = useState(1)
  const [meal, setMeal] = useState<Meal>('yes')
  const [phone, setPhone] = useState('')
  const [memo, setMemo] = useState('')
  const [agree, setAgree] = useState(false)
  const [honey, setHoney] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const ids = useId()
  const submissionKey = useRef(editKey)
  const submitting = useRef(false)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(editKey !== null ? 'loading' : 'ready')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!open) return
    setError(null)
    setAgree(false)
    if (editKey === null) return
    let active = true
    setLoadState('loading')
    void getRsvp(editKey).then((input) => {
      if (!active) return
      setSide(input.side)
      setAttend(input.attending ? 'yes' : 'no')
      setName(input.name)
      setParty(Math.max(1, input.partySize))
      setMeal(input.meal)
      setPhone(input.phone)
      setMemo(input.memo)
      onLoaded(editKey)
      setLoadState('ready')
    }).catch((err) => {
      if (!active) return
      setError(toUserMessage(err))
      setLoadState('error')
    })
    return () => { active = false }
  }, [open, editKey, retry, onLoaded])
  const attending = attend === 'yes'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting.current || loadState !== 'ready') return
    setError(null)
    const n = normalize(name)
    if (!n || n.length > LIMITS.name) return setError(`성함을 1~${LIMITS.name}자로 입력해 주세요.`)
    if (phone && !PHONE_RE.test(phone.trim())) return setError('연락처 형식을 확인해 주세요. (예: 010-1234-5678)')
    if (hasLink(memo) || hasBlockedWord(memo) || hasBlockedWord(n)) return setError('입력 내용을 다시 확인해 주세요.')
    if (!agree) return setError('개인정보 수집 · 이용에 동의해 주세요.')
    // 봇 방지: 숨김 필드가 채워지면 조용히 성공 처리
    if (honey) {
      onClose()
      toast('소중한 회신 감사합니다')
      return
    }
    submitting.current = true
    setLoading(true)
    try {
      submissionKey.current ??= createRsvpEditKey()
      await submitRsvp({ side, name: n, attending, partySize: party, meal, phone, memo }, submissionKey.current, editKey === null)
      onSaved(submissionKey.current)
      toast(editKey !== null ? '수정사항이 전달되었습니다' : '소중한 회신 감사합니다')
    } catch (err) {
      setError(toUserMessage(err))
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onClose={loading ? () => {} : onClose} eyebrow="R.S.V.P." title={editKey !== null ? '참석 여부 수정' : '참석 여부 전달'}>
      {loadState !== 'ready' ? (
        <div className={f.done} style={{ minHeight: 260 }} aria-busy={loadState === 'loading'}>
          {loadState === 'loading' ? <p role="status">기존 회신을 불러오고 있습니다.</p> : <>
            <p className={f.error} role="alert">{error}</p>
            <Button onClick={() => setRetry((value) => value + 1)}>다시 시도</Button>
          </>}
        </div>
      ) : (
      <form className={f.form} onSubmit={submit} noValidate>
        {isLocalMock && <p className={f.notice}>개발 모드: Supabase 미설정으로 이 브라우저에만 저장됩니다.</p>}

        <Segment
          name="side"
          legend="어느 분의 하객이신가요?"
          value={side}
          onChange={setSide}
          options={[
            { value: 'groom', label: '신랑측' },
            { value: 'bride', label: '신부측' },
          ]}
        />

          <div className={f.field}>
            <label className={f.label} htmlFor={`${ids}-name`}>
              성함
            </label>
            <input
              id={`${ids}-name`}
              className={f.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={LIMITS.name}
              autoComplete="name"
              placeholder="성함을 입력해 주세요"
              required
            />
          </div>

          <Segment
            name="attend"
            legend="참석 여부"
            value={attend}
            onChange={setAttend}
            options={[
              { value: 'yes', label: '참석할게요' },
              { value: 'no', label: '어려워요' },
            ]}
          />

          {attending && (
            <>
              <div className={f.field}>
                <span className={f.label} id={`${ids}-party`}>
                  참석 인원 <span className={f.optional}>(본인 포함)</span>
                </span>
                <div className={f.stepper} role="group" aria-labelledby={`${ids}-party`}>
                  <button
                    type="button"
                    onClick={() => setParty((p) => Math.max(1, p - 1))}
                    disabled={party <= 1}
                    aria-label="인원 줄이기"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <output aria-live="polite">{party}명</output>
                  <button
                    type="button"
                    onClick={() => setParty((p) => Math.min(LIMITS.partyMax, p + 1))}
                    disabled={party >= LIMITS.partyMax}
                    aria-label="인원 늘리기"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <Segment
                name="meal"
                legend="식사 여부"
                value={meal}
                onChange={setMeal}
                options={[
                  { value: 'yes', label: '예정' },
                  { value: 'no', label: '안 함' },
                  { value: 'undecided', label: '미정' },
                ]}
              />
            </>
          )}

          <div className={f.field}>
            <label className={f.label} htmlFor={`${ids}-phone`}>
              연락처 <span className={f.optional}>(선택)</span>
            </label>
            <input
              id={`${ids}-phone`}
              className={f.input}
              value={phone}
              onChange={(e) => setPhone((prev) => formatPhoneInput(e.target.value, prev))}
              inputMode="tel"
              autoComplete="tel"
              maxLength={13}
              placeholder="010-0000-0000"
            />
          </div>

          <div className={f.field}>
            <label className={f.label} htmlFor={`${ids}-memo`}>
              전하실 말씀 <span className={f.optional}>(선택)</span>
            </label>
            <textarea
              id={`${ids}-memo`}
              className={f.textarea}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={LIMITS.memo}
              rows={3}
              style={{ minHeight: 88 }}
            />
          </div>

          <div className={f.honeypot} aria-hidden="true">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
            </label>
          </div>

          <label className={f.check}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>
              [필수] 개인정보 수집 · 이용 동의
              <br />
              <span className={f.help}>
                수집 항목: 성함, 참석 정보, (선택)연락처 · 이용 목적: 예식 준비 · 보유 기간: 예식 후 1개월 이내 파기
              </span>
            </span>
          </label>

          {error && (
            <p className={f.error} role="alert">
              {error}
            </p>
          )}

        <Button type="submit" variant="primary" block loading={loading}>
          {editKey !== null ? '수정사항 전달하기' : '전달하기'}
        </Button>
      </form>
      )}
    </Sheet>
  )
}
