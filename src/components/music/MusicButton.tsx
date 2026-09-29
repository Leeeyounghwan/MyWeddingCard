import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useState } from 'react'
import { music, useMusicStatus } from '../../lib/music'
import styles from './MusicButton.module.css'

/**
 * 우측 상단 플로팅 음악 버튼.
 * 재생 중에는 이퀄라이저 막대가 움직이고, 정지 상태에서는 멈춘 막대로 표시됩니다.
 * bgm 파일이 없으면(로드 실패) 자동으로 사라집니다.
 */
export function MusicButton({ visible }: { visible: boolean }) {
  const status = useMusicStatus()
  const playing = status === 'playing'
  const [hint, setHint] = useState(false)

  // 인트로 없이 들어온 경우(재방문 등) 음악을 켤 수 있다는 힌트를 잠깐 표시
  useEffect(() => {
    if (!visible || status !== 'idle') return
    setHint(true)
    const t = window.setTimeout(() => setHint(false), 3600)
    return () => window.clearTimeout(t)
  }, [visible, status])

  if (status === 'unavailable') return null

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          className={styles.wrap}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <AnimatePresence>
            {hint && !playing && (
              <m.span
                className={styles.hint}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                aria-hidden="true"
              >
                배경음악 켜기
              </m.span>
            )}
          </AnimatePresence>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              setHint(false)
              music.toggle()
            }}
            aria-label={playing ? '배경음악 끄기' : '배경음악 켜기'}
            aria-pressed={playing}
            data-playing={playing || undefined}
          >
            <span className={styles.bars} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </button>
        </m.div>
      )}
    </AnimatePresence>
  )
}
