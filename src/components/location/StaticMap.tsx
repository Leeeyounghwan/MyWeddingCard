import { MapPin } from 'lucide-react'
import { venue } from '../../data/wedding'
import { kakaoMapViewUrl } from '../../lib/map'
import styles from './StaticMap.module.css'

/**
 * 지도 API 키가 없거나 SDK 로드에 실패했을 때 보여주는 대체 화면.
 * 누르면 카카오맵 웹에서 위치를 확인할 수 있습니다.
 */
export function StaticMap() {
  return (
    <a className={styles.static} href={kakaoMapViewUrl()} target="_blank" rel="noopener noreferrer">
      <svg className={styles.lines} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M-20 210 C 80 190, 150 230, 240 170 S 360 120, 430 140" />
          <path d="M-20 90 L 430 110" opacity=".6" />
          <path d="M120 -20 L 170 320" />
          <path d="M280 -20 C 260 80, 300 180, 250 320" opacity=".6" />
          <path d="M-20 260 L 430 240" opacity=".4" />
          <path d="M40 -20 L 60 320" opacity=".35" />
          <path d="M350 -20 L 360 320" opacity=".35" />
        </g>
      </svg>
      <span className={styles.pin}>
        <MapPin size={26} strokeWidth={1.25} aria-hidden="true" />
      </span>
      <span className={styles.label}>
        {venue.name}
        <small>지도에서 위치 확인하기</small>
      </span>
    </a>
  )
}
