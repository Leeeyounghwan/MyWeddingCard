import { MapPin } from 'lucide-react'
import { venue } from '../../data/wedding'
import styles from './StaticMap.module.css'

/**
 * 지도 API 키가 없거나 SDK 로드에 실패했을 때 보여주는 대체 약도.
 * 외부 지도 버튼은 아래에 따로 있으므로, 이 영역은 본문 안에서 위치를 바로 보여주는 데 집중합니다.
 */
export function StaticMap() {
  return (
    <div className={styles.static} role="img" aria-label={`${venue.name} 위치 약도`}>
      <svg className={styles.lines} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g className={styles.minorRoads} fill="none">
          <path d="M-20 56 H420" />
          <path d="M-20 222 H420" />
          <path d="M76 -20 V320" />
          <path d="M326 -20 V320" />
          <path d="M-20 268 C90 250 140 278 220 244 S340 202 430 224" />
        </g>
        <g className={styles.mainRoads} fill="none">
          <path d="M188 -24 C202 58 182 120 196 196 S212 278 196 324" />
          <path d="M-20 148 C84 134 152 158 236 134 S344 88 430 110" />
        </g>
        <text className={styles.roadLabel} x="197" y="40" transform="rotate(83 197 40)">
          부평대로
        </text>
        <text className={styles.station} x="142" y="216">
          갈산역 2번 출구
        </text>
        <circle className={styles.exit} cx="186" cy="196" r="10" />
        <text className={styles.exitText} x="186" y="200">
          2
        </text>
      </svg>
      <span className={styles.pin}>
        <MapPin size={26} strokeWidth={1.25} aria-hidden="true" />
      </span>
      <span className={styles.label}>
        {venue.name}
        {venue.hall && <small>{venue.hall}</small>}
      </span>
    </div>
  )
}
