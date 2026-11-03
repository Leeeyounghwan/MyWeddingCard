import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { GalleryImage } from '../../data/types'
import { asset } from '../../lib/asset'
import styles from './Carousel.module.css'

/** Native scrolling keeps touch gestures and buttons on the same slide track. */
export function Carousel({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)
  const requestedIndex = useRef(0)
  const count = images.length

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const observer = new ResizeObserver(() => {
      track.scrollLeft = requestedIndex.current * track.clientWidth
    })
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  const goTo = (next: number) => {
    const track = trackRef.current
    if (!track || !count) return
    const destination = (next + count) % count
    requestedIndex.current = destination
    track.scrollTo({ left: destination * track.clientWidth, behavior: 'instant' })
    setIndex(destination)
    centerThumb(destination)
  }

  const centerThumb = (next: number) => {
    const thumbs = thumbsRef.current
    const thumb = thumbs?.children[next] as HTMLElement | undefined
    if (thumbs && thumb) thumbs.scrollTo({ left: thumb.offsetLeft - (thumbs.clientWidth - thumb.offsetWidth) / 2, behavior: 'smooth' })
  }

  if (!count) return null
  return (
    <div className={styles.wrap}>
      <div className={styles.frame} role="group" aria-roledescription="carousel"
        aria-label={`웨딩화보 ${index + 1} / ${count}`} tabIndex={0}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
          event.preventDefault()
          goTo(requestedIndex.current + (event.key === 'ArrowRight' ? 1 : -1))
        }}>
        <div ref={trackRef} className={styles.track} onScroll={(event) => {
          const track = event.currentTarget
          const next = Math.max(0, Math.min(count - 1, Math.round(track.scrollLeft / track.clientWidth)))
          requestedIndex.current = next
          setIndex(next)
          centerThumb(next)
        }}>
          {images.map((image, i) => (
            <div key={image.src} className={styles.slide} aria-hidden={i !== index}>
              <img src={asset(image.src)} alt={image.alt} width={image.width} height={image.height}
                draggable={false} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
            </div>
          ))}
        </div>
        {count > 1 && <>
          <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label="이전 사진"
            onClick={() => goTo(requestedIndex.current - 1)}><ChevronLeft size={22} aria-hidden="true" /></button>
          <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="다음 사진"
            onClick={() => goTo(requestedIndex.current + 1)}><ChevronRight size={22} aria-hidden="true" /></button>
        </>}
      </div>
      {count > 1 && <>
        <p className={styles.counter} aria-hidden="true">{index + 1}<span className={styles.slash}>/</span>{count}</p>
        <div ref={thumbsRef} className={styles.thumbs} aria-label="갤러리 사진 선택">
          {images.map((image, i) => <button key={image.src} type="button" className={styles.thumb}
            data-active={i === index || undefined} aria-pressed={i === index}
            aria-label={`웨딩 사진 ${i + 1} 보기`} onClick={() => goTo(i)}>
            <img src={asset(image.src)} alt="" width={image.width} height={image.height} loading="lazy" draggable={false} />
          </button>)}
        </div>
      </>}
    </div>
  )
}
