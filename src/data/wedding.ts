/**
 * ─────────────────────────────────────────────────────────────
 *  💍 청첩장 핵심 정보 — 대부분의 수정은 이 파일에서 합니다.
 * ─────────────────────────────────────────────────────────────
 *  - 신랑/신부/혼주 이름                 → groom, bride
 *  - 연락처                               → .env.local / GitHub Actions Secrets
 *  - 예식 일시                            → ceremony
 *  - 예식장                               → venue
 *  - 초대 문구                            → invitation
 *  - 대표 사진 · 배경음악 · 공유 문구     → site.ts 의 media, meta
 *  - 섹션 표시 여부                       → features
 *
 *  빈 문자열('')로 둔 값은 화면에서 자동으로 숨겨지거나 '등록 예정'으로 표시됩니다.
 */
import type { Ceremony, Person, Venue } from './types.ts'

export { media, meta } from './site'

export const groom: Person = {
  name: '이영환',
  firstName: '영환',
  nameEn: 'Young Hwan',
  relation: '아들', // ✏️ 예: '장남', '차남'
  phone: import.meta.env.VITE_GROOM_PHONE ?? '',
  photo: 'images/couple/groom-12.jpg', // ✏️ public/images/couple/ 에 사진을 넣고 경로 변경
  intro: '', // ✏️ 한 줄 소개 (선택)
  profile: [
    // ✏️ 필요한 항목만 추가하세요. 비워두면 표시되지 않습니다.
    // { label: 'MBTI', value: 'INFJ' },
    // { label: '직업', value: '개발자' },
  ],
  father: { name: '', phone: import.meta.env.VITE_GROOM_FATHER_PHONE ?? '' }, // ✏️ 신랑 아버지
  mother: { name: '', phone: import.meta.env.VITE_GROOM_MOTHER_PHONE ?? '' }, // ✏️ 신랑 어머니
}

export const bride: Person = {
  name: '오은진',
  firstName: '은진',
  nameEn: 'Eun Jin',
  relation: '딸', // ✏️ 예: '장녀', '차녀'
  phone: import.meta.env.VITE_BRIDE_PHONE ?? '',
  photo: 'images/couple/bride-11.jpg',
  intro: '',
  profile: [],
  father: { name: '', phone: import.meta.env.VITE_BRIDE_FATHER_PHONE ?? '' }, // ✏️ 신부 아버지
  mother: { name: '', phone: import.meta.env.VITE_BRIDE_MOTHER_PHONE ?? '' }, // ✏️ 신부 어머니
}

export const ceremony: Ceremony = {
  // ✏️ 예식 시간이 정해지면 'T00:00' 부분을 변경하고 timeConfirmed 를 true 로 바꾸세요.
  //    예) 12:30 → '2027-04-25T12:30:00+09:00'
  dateTime: '2027-04-25T12:00:00+09:00',
  timeConfirmed: true,
  durationMinutes: 90,
}

export const venue: Venue = {
  name: '웨스턴팰리스 호텔 웨딩',
  nameEn: 'Western Palace Hotel Wedding',
  hall: '7층 웨스턴홀',
  address: '인천 부평구 부평대로278번길 16',
  addressDetail: '갈산역 2번 출구 앞',
  tel: '032-524-5000', // ✏️ 예식장 대표번호 (선택)
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
    '8년이라는 시간 동안',
    '함께 웃고 서로에게 기대며,',
    '가장 편안하고 소중한 사람이 되었습니다.',
    '',
    '이제 부부라는 이름으로',
    '새로운 날들을 함께 걸어가려 합니다.',
    '귀한 발걸음으로 저희의 시작을 축복해 주시면',
    '감사하겠습니다.',
  ],
}

export const ending = {
  eyebrow: 'Our New Beginning',
  lines: ['귀한 걸음으로', '저희의 시작을 함께해 주세요.'],
  photo: 'images/ending/moment-02.jpg', // ✏️ 엔딩 배경 사진
}

/** 섹션 표시 여부 / 동작 옵션 */
export const features = {
  countdown: true,
  rsvp: true,
  guestbook: true,
  account: true,
  contact: true,
  music: true,
  /** RSVP 마감일 (선택, ISO). 지나면 폼 대신 마감 안내를 보여줍니다. */
  rsvpDeadline: '2027-04-18T23:59:59+09:00',
}
