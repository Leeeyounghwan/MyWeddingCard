import { animate, m, useMotionValue, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import type { GalleryImage } from '../../data/types'
import { asset } from '../../lib/asset'
import styles from './Carousel.module.css'

/**
 * 웨딩화보 캐러셀 — 그리드가 아닌 한 번에 한 장만 보여주고 좌우로 스와이프해서 넘깁니다.
 * 사진 보호를 위해 드래그·우클릭 저장·핀치 확대를 막아둡니다 (styles/global.css, index.html 참고).
 */
export function Carousel({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [target, setTarget] = useState<{ index: number; dir: number } | null>(null)
  const [imageError, setImageError] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const destinationRef = useRef<HTMLImageElement>(null)
  const request = useRef(0)
  const reducedMotion = useReducedMotion()
  const moving = useRef(false)
  const dragX = useMotionValue(0)
  const count = images.length

  useLayoutEffect(() => {
    dragX.set(0)
    // MotionValue rendering is deferred; rebase the DOM in this same paint.
    if (trackRef.current) trackRef.current.style.transform = 'none'
    moving.current = false
  }, [index, dragX])

  useEffect(() => () => {
    request.current += 1
    dragX.stop()
  }, [dragX])

  useLayoutEffect(() => {
    if (!target) return
    let cancelled = false
    let stopAnimation: (() => void) | undefined
    // Wait for the actual displayed node, not only a separate preload Image.
    void destinationRef.current?.decode().then(() => {
      if (cancelled) return
      const width = frameRef.current?.clientWidth ?? 0
      const animation = animate(dragX, -target.dir * width, {
        duration: reducedMotion ? 0 : 0.7,
        ease: [0.4, 0, 0.2, 1],
        onComplete: () => {
          setIndex(target.index)
          setTarget(null)
        },
      })
      stopAnimation = () => animation.stop()
    }).catch(() => {
      if (cancelled) return
      setImageError(true)
      setSelectedIndex(index)
      setTarget(null)
      dragX.set(0)
      moving.current = false
    })
    return () => {
      cancelled = true
      stopAnimation?.()
    }
  }, [target, reducedMotion, dragX, index])

  useEffect(() => {
    if (count < 2) return
    ;[-1, 0, 1].forEach((delta) => {
      const image = images[(index + delta + count) % count]
      const img = new Image()
      img.src = asset(image.src)
      void img.decode?.().catch(() => {})
    })
  }, [count, images, index])

  const go = useCallback(
    async (delta: number) => {
      if (count < 2 || moving.current) return
      const nextIndex = (index + delta + count) % count
      if (nextIndex === index) return
      moving.current = true
      setSelectedIndex(nextIndex)
      dragX.stop()
      setImageError(false)
      const currentRequest = ++request.current
      const nextImage = new Image()
      nextImage.src = asset(images[nextIndex].src)
      try {
        await nextImage.decode()
        if (currentRequest !== request.current) return
        setTarget({ index: nextIndex, dir: Math.sign(delta) })
      } catch {
        if (currentRequest !== request.current) return
        setImageError(true)
        setSelectedIndex(index)
        animate(dragX, 0, { duration: 0.3, onComplete: () => { moving.current = false } })
      }
    },
    [count, dragX, images, index],
  )

  const gesture = useRef<{ x: number; y: number; t: number; axis: 'x' | 'y' | null; id: number } | null>(null)

  const onPointerDown = (e: PointerEvent) => {
    if (moving.current || (e.target as HTMLElement).closest('button')) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragX.stop()
    gesture.current = { x: e.clientX, y: e.clientY, t: performance.now(), axis: null, id: e.pointerId }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent) => {
    const g = gesture.current
    if (!g || g.id !== e.pointerId) return
    const dx = e.clientX - g.x
    const dy = e.clientY - g.y
    if (!g.axis && Math.hypot(dx, dy) > 8) g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (g.axis === 'x' && count > 1) {
      const width = frameRef.current?.clientWidth ?? 0
      dragX.set(Math.max(-width, Math.min(width, dx)))
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    const g = gesture.current
    gesture.current = null
    if (!g || g.id !== e.pointerId) return
    if (g.axis === 'x' && count > 1) {
      const dx = e.clientX - g.x
      const velocity = Math.abs(dx) / Math.max(1, performance.now() - g.t)
      if (Math.abs(dx) > 50 || velocity > 0.5) {
        void go(dx < 0 ? 1 : -1)
        return
      }
    }
    animate(dragX, 0, { duration: 0.35, ease: [0.4, 0, 0.2, 1] })
  }

  if (!count) return null

  return (
    <div className={styles.wrap}>
      <div
        ref={frameRef}
        className={styles.frame}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          gesture.current = null
          animate(dragX, 0, { duration: 0.2 })
        }}
        role="group"
        aria-roledescription="carousel"
        aria-label={`웨딩화보 ${index + 1} / ${count}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
          e.preventDefault()
          void go(e.key === 'ArrowRight' ? 1 : -1)
        }}
      >
        <m.div ref={trackRef} className={styles.track} style={{ x: dragX }}>
          {(target ? [0, target.dir] : count > 1 ? [-1, 0, 1] : [0]).map((slot) => {
            const imageIndex = target && slot === target.dir
              ? target.index
              : (index + slot + count) % count
            const img = images[imageIndex]
            return (
              <div key={!target && count === 2 && slot === -1 ? `clone-${imageIndex}` : imageIndex}
                className={styles.slide} style={{ left: `${slot * 100}%` }} aria-hidden={slot !== 0}>
                <img ref={target && slot === target.dir ? destinationRef : undefined}
                  src={asset(img.src)} alt={slot === 0 ? img.alt : ''}
                  width={img.width} height={img.height} draggable={false} loading="eager" decoding="async" />
              </div>
            )
          })}
        </m.div>

        {count > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.prev}`}
              onClick={() => { void go(-1) }}
              aria-label="이전 사진"
            >
              <ChevronLeft size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.next}`}
              onClick={() => { void go(1) }}
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
                data-active={i === selectedIndex || undefined}
                aria-pressed={i === selectedIndex}
                onClick={() => {
                  if (i !== index) void go(i - index)
                }}
                aria-label={`웨딩 사진 ${i + 1} 보기`}
              >
                <img
                  src={asset(thumb.src)}
                  alt=""
                  width={thumb.width}
                  height={thumb.height}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </button>
            ))}
          </div>
          {imageError && <p className={styles.hint} role="status">사진을 불러오지 못했어요. 다시 눌러 주세요.</p>}
        </>
      )}
    </div>
  )
}
