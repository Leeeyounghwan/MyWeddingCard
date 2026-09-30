import { Minus, Plus } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { isLocalMock, toUserMessage } from '../../lib/supabase'
import { rsvpSubmittedName, submitRsvp, type Meal, type Side } from '../../lib/rsvp'
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
 * - 수집 · 이용 동의 필수, 제출 데이터는 신랑신부만 Supabase 대시보드에서 확인 가능 (클라이언트 조회 불가)
 */
export default function RsvpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
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
  const [done, setDone] = useState(false)
  const openedAt = useRef(Date.now())
  const ids = useId()
  const previous = rsvpSubmittedName()

  // 다시 열 때마다 완료 화면 초기화
  useEffect(() => {
    if (!open) return
    openedAt.current = Date.now()
    setDone(false)
    setError(null)
    if (previous) toast(`${previous}님의 회신이 이미 전달되었어요.\n변경사항이 있으면 다시 보내주세요.`, 3600)
  }, [open, previous])
  const attending = attend === 'yes'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const n = normalize(name)
    if (!n || n.length > LIMITS.name) return setError(`성함을 1~${LIMITS.name}자로 입력해 주세요.`)
    if (phone && !PHONE_RE.test(phone.trim())) return setError('연락처 형식을 확인해 주세요. (예: 010-1234-5678)')
    if (hasLink(memo) || hasBlockedWord(memo) || hasBlockedWord(n)) return setError('입력 내용을 다시 확인해 주세요.')
    if (!agree) return setError('개인정보 수집 · 이용에 동의해 주세요.')
    // 봇 방지: 숨김 필드가 채워졌거나 3초 안에 제출되면 조용히 성공 처리
    if (honey || Date.now() - openedAt.current < 3000) {
      setDone(true)
      return
    }
    setLoading(true)
    try {
      await submitRsvp({ side, name: n, attending, partySize: party, meal, phone, memo })
      setDone(true)
    } catch (err) {
      setError(toUserMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} eyebrow="R.S.V.P." title="참석 여부 전달">
      {done ? (
        <div className={f.done}>
          <p className={f.doneTitle}>소중한 회신 감사합니다</p>
          <p className={f.doneText}>
            {attending ? '예식 당일 반갑게 맞이하겠습니다.' : '마음으로 함께해 주셔서 감사합니다.'}
          </p>
          <Button variant="primary" block onClick={onClose}>
            닫기
          </Button>
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
            전달하기
          </Button>
        </form>
      )}
    </Sheet>
  )
}
