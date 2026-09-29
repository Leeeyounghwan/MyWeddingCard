import { forwardRef } from 'react'
import { bride, groom, media, venue } from '../../data/wedding'
import { asset } from '../../lib/asset'
import { dotDate, timeKo, weekdayEn } from '../../lib/date'
import styles from './InvitationCard.module.css'

export const CARD_WIDTH = 360
export const CARD_HEIGHT = 640 // × pixelRatio 3 = 1080 × 1920

/** 카드에 쓰이는 모든 글자 (폰트 서브셋 생성용) */
export const CARD_TEXT = [
  'WEDDING INVITATION',
  groom.name,
  bride.name,
  groom.nameEn,
  bride.nameEn,
  dotDate,
  weekdayEn,
  timeKo,
  venue.name,
  venue.hall,
  venue.address,
  venue.nameEn,
].join('')

/**
 * 이미지 저장 전용 레이아웃 (웹페이지 스크린샷이 아닌 별도 디자인).
 * 360×640 으로 그린 뒤 3배율로 렌더링해 1080×1920 PNG 를 만듭니다.
 */
export const InvitationCard = forwardRef<HTMLDivElement, { onImageLoad?: () => void }>(function InvitationCard(
  { onImageLoad },
  ref,
) {
  return (
    <div ref={ref} className={styles.card} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      <div className={styles.photo}>
        <img src={asset(media.cardImage || media.heroImage)} alt="" onLoad={onImageLoad} onError={onImageLoad} />
      </div>
      <div className={styles.text}>
        <p className={styles.label}>WEDDING INVITATION</p>
        <p className={styles.names}>
          {groom.name}
          <span className={styles.amp}>&amp;</span>
          {bride.name}
        </p>
        <p className={styles.date}>
          {dotDate} {weekdayEn}
          {timeKo && <span className={styles.time}> · {timeKo}</span>}
        </p>
        <span className={styles.rule} />
        <p className={styles.venue}>
          {venue.name}
          {venue.hall && ` ${venue.hall}`}
        </p>
        <p className={styles.address}>{venue.address}</p>
      </div>
    </div>
  )
})
