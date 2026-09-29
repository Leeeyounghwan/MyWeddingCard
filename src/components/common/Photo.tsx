import { useState, type CSSProperties } from 'react'
import { asset } from '../../lib/asset'
import styles from './Photo.module.css'

interface PhotoProps {
  src: string
  alt: string
  /** 가로/세로 비율 예약 → 로딩 중 레이아웃 흔들림(CLS) 방지 */
  ratio?: number
  className?: string
  priority?: boolean
  style?: CSSProperties
  objectPosition?: string
}

/**
 * 공통 이미지 컴포넌트
 * - 기본 lazy loading + async decoding
 * - 로딩 완료 시 부드럽게 페이드 인 (placeholder 는 따뜻한 베이지 톤)
 * - priority 인 경우(히어로) 즉시 로드 + fetchpriority=high
 */
export function Photo({ src, alt, ratio, className, priority, style, objectPosition }: PhotoProps) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div
      className={[styles.frame, className].filter(Boolean).join(' ')}
      style={{ ...(ratio ? { aspectRatio: String(ratio) } : null), ...style }}
      data-loaded={loaded || undefined}
    >
      <img
        src={asset(src)}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        ref={(el) => {
          // 캐시된 이미지는 onLoad 가 먼저 끝나 있을 수 있음
          if (el?.complete && !loaded) setLoaded(true)
        }}
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  )
}
