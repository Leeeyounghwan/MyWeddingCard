/**
 * 🖼️ 웨딩화보 사진
 *
 * 1) 사진을 public/images/gallery/ 폴더에 넣습니다. (WebP, 4:5 비율에 가깝게 크롭하면 가장 깔끔합니다)
 * 2) 아래 목록의 src / width / height / alt 를 실제 파일에 맞게 수정합니다.
 *
 * 화면에는 그리드가 아니라 한 장씩, 좌우로 스와이프해서 넘겨보는 캐러셀로 표시됩니다.
 */
import type { GalleryImage } from './types'

const placeholder = (n: number, width: number, height: number): GalleryImage => ({
  src: `images/gallery/${String(n).padStart(2, '0')}.svg`,
  width,
  height,
  alt: `웨딩 사진 ${n}`,
})

export const gallery: GalleryImage[] = [
  placeholder(1, 1600, 1200),
  placeholder(2, 1200, 1600),
  placeholder(3, 1200, 1500),
  placeholder(4, 1200, 1600),
  placeholder(5, 1600, 1200),
  placeholder(6, 1200, 1800),
  placeholder(7, 1200, 1500),
  placeholder(8, 1200, 1600),
  placeholder(9, 1600, 1200),
  placeholder(10, 1200, 1500),
  placeholder(11, 1200, 1600),
  placeholder(12, 1200, 1800),
]
