// Vite 설정에서도 사용하므로 브라우저 환경변수에 의존하지 않습니다.
export const media = {
  /** 메인 히어로 사진 (세로형 권장, 1200×1800 내외 WebP) */
  heroImage: 'images/hero.jpg', // ✏️
  /** 청첩장 이미지 저장에 쓰일 사진 (비우면 heroImage 사용) */
  cardImage: 'images/hero.jpg',
  /** 배경음악. public/audio/bgm.mp3 파일을 넣으면 자동으로 동작합니다. */
  bgm: {
    src: 'audio/bgm.mp3',
    volume: 0.45,
  },
}

/** 카카오톡 · SNS 공유 미리보기 (빌드 시 index.html 메타태그로 들어갑니다) */
export const meta = {
  title: '영환🤍은진 결혼식 💍',
  description: '2027.04.25(일) 12:00\n웨스턴팰리스 호텔 웨딩, 7층 웨스턴홀',
  /** SNS 공유 미리보기에 사용할 사진 */
  ogImage: 'og-couple-wide-large-title-v2.png',
  kakaoImage: 'kakao-couple-names-close.png',
  themeColor: '#F8F4EE',
}
