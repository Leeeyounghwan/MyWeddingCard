import { LocateFixed, LocateOff, MapPin, Navigation } from 'lucide-react'
import { useEffect, useState } from 'react'
import { venue } from '../../data/wedding'
import { getCurrentPosition, kakaoMapViewUrl, openKakaoMap, openNaverMap, openTmap, type LatLng } from '../../lib/map'
import { Sheet } from '../common/Sheet'
import styles from './DirectionsSheet.module.css'

type State = { kind: 'locating' } | { kind: 'ready'; from: LatLng } | { kind: 'fallback'; reason: string }

const REASONS: Record<string, string> = {
  denied: '위치 권한이 허용되지 않았어요.',
  timeout: '현재 위치를 확인하는 데 시간이 오래 걸리고 있어요.',
  unavailable: '이 환경에서는 현재 위치를 확인할 수 없어요.',
}

/**
 * 현재 위치 → 예식장 길찾기.
 * 위치 권한은 선택 사항이며, 거부해도 각 지도 앱이 스스로 현재 위치를 출발지로 잡습니다.
 */
export default function DirectionsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, setState] = useState<State>({ kind: 'locating' })

  useEffect(() => {
    if (!open) return
    let alive = true
    setState({ kind: 'locating' })
    getCurrentPosition().then((r) => {
      if (!alive) return
      setState(r.ok ? { kind: 'ready', from: r.position } : { kind: 'fallback', reason: REASONS[r.reason] })
    })
    return () => {
      alive = false
    }
  }, [open])

  const from = state.kind === 'ready' ? state.from : null

  return (
    <Sheet open={open} onClose={onClose} eyebrow="Directions" title="길찾기">
      <div className={styles.route}>
        <div className={styles.point}>
          <span className={styles.icon} data-state={state.kind}>
            {state.kind === 'fallback' ? (
              <LocateOff size={16} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <LocateFixed size={16} strokeWidth={1.5} aria-hidden="true" />
            )}
          </span>
          <div>
            <p className={styles.label}>출발지</p>
            <p className={styles.value} aria-live="polite">
              {state.kind === 'locating' && '현재 위치 확인 중…'}
              {state.kind === 'ready' && '현재 위치'}
              {state.kind === 'fallback' && '지도 앱에서 선택'}
            </p>
          </div>
        </div>
        <span className={styles.connector} aria-hidden="true" />
        <div className={styles.point}>
          <span className={styles.icon} data-state="dest">
            <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div>
            <p className={styles.label}>도착지</p>
            <p className={styles.value}>{venue.name}</p>
          </div>
        </div>
      </div>

      {state.kind === 'fallback' && (
        <p className={styles.notice}>
          {state.reason}
          <br />
          아래 지도 앱을 열면 앱에서 현재 위치를 출발지로 안내해 드려요.
        </p>
      )}

      <div className={styles.apps}>
        <button type="button" className={styles.app} onClick={() => openNaverMap(from)}>
          <Navigation size={16} strokeWidth={1.5} aria-hidden="true" /> 네이버지도로 길찾기
        </button>
        <button type="button" className={styles.app} onClick={() => openKakaoMap(from)}>
          <Navigation size={16} strokeWidth={1.5} aria-hidden="true" /> 카카오맵으로 길찾기
        </button>
        <button type="button" className={styles.app} onClick={() => openTmap()}>
          <Navigation size={16} strokeWidth={1.5} aria-hidden="true" /> 티맵으로 길찾기
        </button>
      </div>

      <a className={styles.view} href={kakaoMapViewUrl()} target="_blank" rel="noopener noreferrer">
        {venue.name} 위치를 지도에서 확인하기
      </a>
    </Sheet>
  )
}
