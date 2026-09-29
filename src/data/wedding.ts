/**
 * ─────────────────────────────────────────────────────────────
 *  💍 청첩장 핵심 정보 — 대부분의 수정은 이 파일에서 합니다.
 * ─────────────────────────────────────────────────────────────
 *  - 신랑/신부/혼주 이름 · 연락처        → groom, bride
 *  - 예식 일시                            → ceremony
 *  - 예식장                               → venue
 *  - 초대 문구                            → invitation
 *  - 대표 사진 · 배경음악 · 공유 문구     → media, meta
 *  - 섹션 표시 여부                       → features
 *
 *  빈 문자열('')로 둔 값은 화면에서 자동으로 숨겨지거나 '등록 예정'으로 표시됩니다.
 *  이 파일은 vite.config.ts 에서도 읽어 OG 메타태그를 만들므로
 *  다른 파일을 import 하지 마세요(타입 import 는 괜찮습니다).
 */
import type { Ceremony, Person, Venue } from './types.ts'

export const groom: Person = {
  name: '이영환',
  firstName: '영환',
  nameEn: 'Young Hwan',
  relation: '아들', // ✏️ 예: '장남', '차남'
  phone: '', // ✏️ 예: '010-0000-0000'
  photo: 'images/couple/groom.svg', // ✏️ public/images/couple/ 에 사진을 넣고 경로 변경
  intro: '', // ✏️ 한 줄 소개 (선택)
  profile: [
    // ✏️ 필요한 항목만 추가하세요. 비워두면 표시되지 않습니다.
    // { label: 'MBTI', value: 'INFJ' },
    // { label: '직업', value: '개발자' },
  ],
  father: { name: '', phone: '' }, // ✏️ 신랑 아버지
  mother: { name: '', phone: '' }, // ✏️ 신랑 어머니
}

export const bride: Person = {
  name: '오은진',
  firstName: '은진',
  nameEn: 'Eun Jin',
  relation: '딸', // ✏️ 예: '장녀', '차녀'
  phone: '',
  photo: 'images/couple/bride.svg',
  intro: '',
  profile: [],
  father: { name: '', phone: '' }, // ✏️ 신부 아버지
  mother: { name: '', phone: '' }, // ✏️ 신부 어머니
}

export const ceremony: Ceremony = {
  // ✏️ 예식 시간이 정해지면 'T00:00' 부분을 변경하고 timeConfirmed 를 true 로 바꾸세요.
  //    예) 12:30 → '2027-04-25T12:30:00+09:00'
  dateTime: '2027-04-25T12:00:00+09:00',
  timeConfirmed: true,
  durationMinutes: 90,
}

export const venue: Venue = {
  name: '웨스턴팰리스웨딩',
  nameEn: 'Western Palace Wedding',
  hall: '7층 웨스턴홀',
  address: '인천 부평구 부평대로278번길 16',
  addressDetail: '갈산역 2번 출구 앞',
  tel: '', // ✏️ 예식장 대표번호 (선택)
  cityEn: 'Incheon',
  // ⚠️ 대략적인 좌표입니다. 카카오맵에서 예식장을 검색 → 우클릭 '좌표' 로 정확한 값을 확인해 교체하세요.
  //    (카카오 지도 키가 설정되어 있으면 지도는 주소로 자동 보정됩니다.)
  lat: 37.51685,
  lng: 126.72155,
}

export const invitation = {
  eyebrow: 'Invitation',
  title: '소중한 분들을 초대합니다',
  // ✏️ 빈 문자열('')은 문단 사이 여백이 됩니다.
  lines: [
    '서로 다른 길을 걸어온 두 사람이',
    '이제 같은 곳을 바라보며',
    '함께 걸어가려 합니다.',
    '',
    '저희의 새로운 시작에',
    '귀한 걸음으로 함께해 주신다면',
    '더없는 기쁨으로 간직하겠습니다.',
  ],
}

export const ending = {
  eyebrow: 'Our New Beginning',
  lines: ['귀한 걸음으로', '저희의 시작을 함께해 주세요.'],
  photo: 'images/ending.svg', // ✏️ 엔딩 배경 사진
}

export const media = {
  /** 메인 히어로 사진 (세로형 권장, 1200×1800 내외 WebP) */
  heroImage: 'images/hero.svg', // ✏️
  /** 청첩장 이미지 저장에 쓰일 사진 (비우면 heroImage 사용) */
  cardImage: '',
  /** 배경음악. public/audio/bgm.mp3 파일을 넣으면 자동으로 동작합니다. */
  bgm: {
    src: 'audio/bgm.mp3',
    volume: 0.45,
  },
}

/** 카카오톡 · SNS 공유 미리보기 (빌드 시 index.html 메타태그로 들어갑니다) */
export const meta = {
  title: '이영환 ♥ 오은진 결혼합니다',
  description: '2027년 4월 25일 일요일\n웨스턴팰리스웨딩',
  /** 1200×630 JPG/PNG 권장. 카카오톡은 SVG/WebP 를 지원하지 않으니 JPG 나 PNG 를 사용하세요. */
  ogImage: 'og-image.png', // ✏️ public/og-image.png 교체
  themeColor: '#F8F4EE',
}

/** 섹션 표시 여부 / 동작 옵션 */
export const features = {
  intro: true,
  /** true 이면 인트로는 브라우저 탭(세션)당 한 번만 보여줍니다. URL 뒤에 ?intro 를 붙이면 항상 다시 볼 수 있습니다. */
  introOncePerSession: true,
  countdown: true,
  timeline: true,
  rsvp: true,
  guestbook: true,
  account: true,
  contact: true,
  music: true,
  /** RSVP 마감일 (선택, ISO). 지나면 폼 대신 마감 안내를 보여줍니다. */
  rsvpDeadline: '2027-04-18T23:59:59+09:00',
}
