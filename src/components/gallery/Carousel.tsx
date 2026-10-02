import { animate, AnimatePresence, m, useMotionValue, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import type { GalleryImage } from '../../data/types'
import { asset } from '../../lib/asset'
import styles from './Carousel.module.css'

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

/**
 * 웨딩화보 캐러셀 — 그리드가 아닌 한 번에 한 장만 보여주고 좌우로 스와이프해서 넘깁니다.
 * 사진 보호를 위해 드래그·우클릭 저장·핀치 확대를 막아둡니다 (styles/global.css, index.html 참고).
 */
export function Carousel({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(0)
  const dragX = useMotionValue(0)
  const count = images.length

  useEffect(() => {
    images.forEach((image) => {
      const img = new Image()
      img.src = asset(image.src)
      void img.decode?.().catch(() => {})
    })
  }, [images])

  const go = useCallback(
    (delta: number) => {
      setDir(delta)
      dragX.set(0)
      setIndex((i) => (i + delta + count) % count)
    },
    [count, dragX],
  )

  const gesture = useRef<{ x: number; y: number; t: number; axis: 'x' | 'y' | null; id: number } | null>(null)

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    gesture.current = { x: e.clientX, y: e.clientY, t: performance.now(), axis: null, id: e.pointerId }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent) => {
    const g = gesture.current
    if (!g || g.id !== e.pointerId) return
    const dx = e.clientX - g.x
    const dy = e.clientY - g.y
    if (!g.axis && Math.hypot(dx, dy) > 8) g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (g.axis === 'x') dragX.set(dx)
  }

  const onPointerUp = (e: PointerEvent) => {
    const g = gesture.current
    gesture.current = null
    if (!g || g.id !== e.pointerId) return
    if (g.axis === 'x' && count > 1) {
      const dx = e.clientX - g.x
      const velocity = Math.abs(dx) / Math.max(1, performance.now() - g.t)
      if (Math.abs(dx) > 50 || velocity > 0.5) {
        go(dx < 0 ? 1 : -1)
        return
      }
    }
    animate(dragX, 0, { type: 'spring', stiffness: 420, damping: 38 })
  }

  const img = images[index]

  return (
    <div className={styles.wrap}>
      <div
        className={styles.frame}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="group"
        aria-roledescription="carousel"
        aria-label={`웨딩화보 ${index + 1} / ${count}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1)
          else if (e.key === 'ArrowLeft') go(-1)
        }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <m.div
            key={index}
            className={styles.slide}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <m.img
              src={asset(img.src)}
              alt={img.alt}
              style={{ x: dragX }}
              draggable={false}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </m.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.prev}`}
              onClick={() => go(-1)}
              aria-label="이전 사진"
            >
              <ChevronLeft size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.next}`}
              onClick={() => go(1)}
              aria-label="다음 사진"
            >
              <ChevronRight size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <>
          <p className={styles.counter} aria-hidden="true">
            <span>{index + 1}</span>
            <span className={styles.slash}>/</span>
            <span>{count}</span>
          </p>
          <div className={styles.thumbs} aria-label="갤러리 사진 선택">
            {images.map((thumb, i) => (
              <button
                key={thumb.src}
                type="button"
                className={styles.thumb}
                data-active={i === index || undefined}
                onClick={() => {
                  setDir(i > index ? 1 : -1)
                  dragX.set(0)
                  setIndex(i)
                }}
                aria-label={`웨딩 사진 ${i + 1} 보기`}
              >
                <img src={asset(thumb.src)} alt="" loading="lazy" decoding="async" draggable={false} />
              </button>
            ))}
          </div>
          <p className={styles.hint}>사진을 좌우로 넘기거나 썸네일을 눌러보세요</p>
        </>
      )}
    </div>
  )
}
