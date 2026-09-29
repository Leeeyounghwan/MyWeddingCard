import { gallery } from '../../data/gallery'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'
import { Carousel } from './Carousel'

/** 웨딩화보 — 그리드가 아니라 한 장씩 좌우로 넘겨보는 캐러셀입니다. (data/gallery.ts) */
export function Gallery() {
  if (gallery.length === 0) return null

  return (
    <Section id="gallery" eyebrow="Gallery" title="우리의 순간들" flush>
      <Reveal variant="fade">
        <Carousel images={gallery} />
      </Reveal>
    </Section>
  )
}
