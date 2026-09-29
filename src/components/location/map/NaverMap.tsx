/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'
import { loadScript } from '../../../lib/loadScript'
import { NAVER_KEY, type MapViewProps } from './MapProvider'
import styles from './MapCanvas.module.css'

declare global {
  interface Window {
    naver?: any
    navermap_authFailure?: () => void
  }
}

/**
 * 네이버 지도 (NAVER Cloud Platform → Maps → Application 의 Client ID 필요)
 * 애플리케이션 설정의 'Web 서비스 URL' 에 배포 도메인과 http://localhost:5173 을 등록해야 합니다.
 */
export default function NaverMap({ lat, lng, title, onError }: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    // 인증 실패 시 네이버 SDK 가 호출하는 전역 콜백
    window.navermap_authFailure = onError
    loadScript(`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_KEY}`)
      .then(() => {
        const naver = window.naver
        if (cancelled || !ref.current) return
        if (!naver?.maps) throw new Error('naver sdk missing')
        const center = new naver.maps.LatLng(lat, lng)
        const map = new naver.maps.Map(ref.current, {
          center,
          zoom: 16,
          draggable: false,
          pinchZoom: false,
          scrollWheel: false,
          keyboardShortcuts: false,
          disableDoubleTapZoom: true,
          disableDoubleClickZoom: true,
          disableTwoFingerTapZoom: true,
        })
        new naver.maps.Marker({ position: center, map, title })
      })
      .catch(onError)
    return () => {
      cancelled = true
    }
  }, [lat, lng, title, onError])

  return <div ref={ref} className={styles.canvas} role="img" aria-label={`${title} 위치 지도`} />
}
