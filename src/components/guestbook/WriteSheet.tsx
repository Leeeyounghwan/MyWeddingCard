import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { guestbookApi } from '../../lib/guestbook'
import { readStorage, writeStorage } from '../../lib/storage'
import { isLocalMock, toUserMessage } from '../../lib/supabase'
import { toast } from '../../lib/toast'
import { LIMITS, validateGuestbook } from '../../lib/validation'
import { Button } from '../common/Button'
import { Sheet } from '../common/Sheet'
import f from '../common/Form.module.css'

const COOLDOWN_MS = 30_000
const LAST_KEY = 'guestbook-last-post'

/**
 * 방명록 작성
 * 스팸 대응(클라이언트 1차): 허니팟 필드, 최소 작성 시간, 연속 작성 쿨다운, 링크/금칙어 차단
 * → 서버(RPC)에서 IP 기반 rate limit · 금칙어 · 중복 검사를 다시 수행합니다.
 */
export default function WriteSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [honey, setHoney] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const openedAt = useRef(Date.now())
  const ids = useId()

  useEffect(() => {
    if (open) {
      openedAt.current = Date.now()
      setError(null)
    }
  }, [open])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const invalid = validateGuestbook({ name, message, password })
    if (invalid) return setError(invalid)

    const last = Number(readStorage(LAST_KEY) ?? 0)
    if (Date.now() - last < COOLDOWN_MS) return setError('잠시 후 다시 작성해 주세요.')

    // 봇으로 판단되면 저장하지 않고 조용히 닫음
    if (honey || Date.now() - openedAt.current < 3000) {
      onClose()
      return
    }

    setLoading(true)
    setError(null)
    try {
      await guestbookApi.create({ name, message, password })
      writeStorage(LAST_KEY, String(Date.now()))
      setMessage('')
      setPassword('')
      toast('축하 메시지가 등록되었습니다')
      onCreated()
      onClose()
    } catch (err) {
      setError(toUserMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} eyebrow="Guestbook" title="축하 메시지 남기기">
      <form className={f.form} onSubmit={submit} noValidate>
        {isLocalMock && <p className={f.notice}>개발 모드: Supabase 미설정으로 이 브라우저에만 저장됩니다.</p>}
        <div className={f.row}>
          <div className={f.field}>
            <label className={f.label} htmlFor={`${ids}-name`}>
              이름
            </label>
            <input
              id={`${ids}-name`}
              className={f.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={LIMITS.name}
              autoComplete="name"
              placeholder="이름"
            />
          </div>
          <div className={f.field}>
            <label className={f.label} htmlFor={`${ids}-pw`}>
              비밀번호
            </label>
            <input
              id={`${ids}-pw`}
              type="password"
              className={f.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={LIMITS.passwordMax}
              autoComplete="new-password"
              placeholder="삭제 시 필요"
            />
          </div>
        </div>

        <div className={f.field}>
          <label className={f.label} htmlFor={`${ids}-msg`}>
            메시지
          </label>
          <textarea
            id={`${ids}-msg`}
            className={f.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={LIMITS.message}
            placeholder="두 사람에게 따뜻한 축하의 말을 남겨주세요"
            rows={5}
          />
          <span className={f.counter} aria-hidden="true">
            {message.length} / {LIMITS.message}
          </span>
        </div>

        <div className={f.honeypot} aria-hidden="true">
          <label>
            Homepage
            <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
          </label>
        </div>

        <p className={f.help}>
          비밀번호는 암호화되어 저장되며, 작성한 글을 삭제할 때 사용됩니다.
          <br />
          부적절한 내용은 예고 없이 숨김 처리될 수 있습니다.
        </p>

        {error && (
          <p className={f.error} role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" block loading={loading}>
          등록하기
        </Button>
      </form>
    </Sheet>
  )
}
