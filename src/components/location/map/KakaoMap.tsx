/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'
import { loadScript } from '../../../lib/loadScript'
import { dotDate, timeKo } from '../../../lib/date'
import { setResolvedDestination } from '../../../lib/map'
import { venue } from '../../../data/wedding'
import { KAKAO_KEY, type MapViewProps } from './MapProvider'
import styles from './MapCanvas.module.css'

declare global {
  interface Window {
    kakao?: any
  }
}

/**
 * 카카오 지도 (JavaScript 키 필요)
 * Kakao Developers → 내 애플리케이션 → 플랫폼 → Web 에 배포 도메인과 http://localhost:5173 을 등록해야 합니다.
 */
export default function KakaoMap({ lat, lng, title, address, onError }: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    let cleanup = () => {}
    const src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`
    loadScript(src)
      .then(() => {
        const kakao = window.kakao
        if (!kakao?.maps) throw new Error('kakao sdk missing')
        kakao.maps.load(() => {
          if (cancelled || !ref.current) return
          const center = new kakao.maps.LatLng(lat, lng)
          const mapCenter = new kakao.maps.LatLng(lat + 0.0006, lng)
          const map = new kakao.maps.Map(ref.current, { center: mapCenter, level: 3, draggable: false })
          map.setZoomable(false) // 스크롤 중 지도에 갇히지 않도록 고정형으로 표시
          const mapLabel = timeKo ? `${dotDate} ${timeKo}` : dotDate
          const overlayEl = document.createElement('div')
          overlayEl.className = styles.marker
          overlayEl.setAttribute('aria-label', `${title} 위치: ${mapLabel}, ${venue.hall}`)
          const label = document.createElement('span')
          label.className = styles.markerLabel
          const date = document.createElement('strong')
          date.textContent = mapLabel
          const hall = document.createElement('small')
          hall.textContent = venue.hall
          label.append(date, hall)
          const dot = document.createElement('span')
          dot.className = styles.markerDot
          dot.setAttribute('aria-hidden', 'true')
          const stem = document.createElement('span')
          stem.className = styles.markerStem
          stem.setAttribute('aria-hidden', 'true')
          overlayEl.append(label, dot, stem)
          const overlay = new kakao.maps.CustomOverlay({
            position: center,
            content: overlayEl,
            xAnchor: 0.5,
            yAnchor: 1,
            zIndex: 10,
          })
          overlay.setMap(map)

          // 주소로 정확한 좌표 보정 (data 의 좌표가 대략값이어도 핀이 정확히 찍히도록)
          if (kakao.maps.services) {
            const geocoder = new kakao.maps.services.Geocoder()
            geocoder.addressSearch(address, (result: any[], status: string) => {
              if (cancelled || status !== kakao.maps.services.Status.OK || !result[0]) return
              const pos = { lat: Number(result[0].y), lng: Number(result[0].x) }
              const p = new kakao.maps.LatLng(pos.lat, pos.lng)
              const viewCenter = new kakao.maps.LatLng(pos.lat + 0.0006, pos.lng)
              overlay.setPosition(p)
              map.setCenter(viewCenter)
              setResolvedDestination(pos)
            })
          }
          const relayout = () => {
            map.relayout()
            const pos = overlay.getPosition()
            map.setCenter(new kakao.maps.LatLng(pos.getLat() + 0.0006, pos.getLng()))
          }
          window.addEventListener('resize', relayout)
          cleanup = () => window.removeEventListener('resize', relayout)
        })
      })
      .catch(onError)
    return () => {
      cancelled = true
      cleanup()
    }
  }, [lat, lng, title, address, onError])

  return <div ref={ref} className={styles.canvas} role="img" aria-label={`${title} 위치 지도`} />
}
