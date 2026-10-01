/**
 * 🖼️ 웨딩화보 사진
 *
 * 1) 사진을 public/images/gallery/ 폴더에 넣습니다. (WebP, 4:5 비율에 가깝게 크롭하면 가장 깔끔합니다)
 * 2) 아래 목록의 src / width / height / alt 를 실제 파일에 맞게 수정합니다.
 *
 * 화면에는 그리드가 아니라 한 장씩, 좌우로 스와이프해서 넘겨보는 캐러셀로 표시됩니다.
 */
import type { GalleryImage } from './types'

export const gallery: GalleryImage[] = [
  { src: 'images/gallery/generated-01.png', width: 1024, height: 1536, alt: '아이보리 스튜디오에 앉은 신랑 신부' },
  { src: 'images/gallery/generated-02.png', width: 1024, height: 1536, alt: '부케를 든 신랑 신부 클로즈업' },
  { src: 'images/gallery/generated-03.png', width: 1024, height: 1536, alt: '신랑 프로필 화보' },
  { src: 'images/gallery/generated-04.png', width: 1024, height: 1536, alt: '신부 프로필 화보' },
]
