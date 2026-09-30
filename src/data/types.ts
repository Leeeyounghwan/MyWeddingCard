/**
 * 청첩장 데이터 타입 정의.
 * 실제 내용은 같은 폴더의 wedding.ts / gallery.ts ... 에서 수정합니다.
 * (이 파일은 구조만 정의하므로 보통 수정할 필요가 없습니다.)
 */

/** 공개 폴더(public/) 기준 경로. 예: 'images/hero.webp' → public/images/hero.webp */
export type AssetPath = string

export interface Parent {
  /** 성함. 비워두면('') 화면에 표시되지 않습니다. */
  name: string
  /** 휴대폰 번호. 예: '010-1234-5678'. 비워두면 연락하기에서 '등록 예정'으로 표시됩니다. */
  phone: string
  /** 고인인 경우 true → 성함 앞에 국화 표시(故)가 붙습니다. */
  deceased?: boolean
}

export interface PersonProfile {
  label: string
  value: string
}

export interface Person {
  /** 한글 이름 (성 포함) */
  name: string
  /** 이름만 (성 제외) - '장남 영환' 같은 표기에 사용 */
  firstName: string
  /** 영문 이름 (레터링용) */
  nameEn: string
  /** 가족 관계. 예: '장남', '차녀' */
  relation: string
  phone: string
  photo: AssetPath
  /** 한 줄 소개 (선택) */
  intro?: string
  /** 생년월일, MBTI, 취미, 직업 등 자유롭게 추가 (선택) */
  profile?: PersonProfile[]
  father: Parent
  mother: Parent
}

export interface Venue {
  name: string
  nameEn: string
  /** 홀 이름. 예: '3층 그랜드볼룸'. 비워두면 표시되지 않습니다. */
  hall: string
  address: string
  /** 지번 등 보조 주소 (선택) */
  addressDetail?: string
  tel: string
  cityEn: string
  /**
   * 좌표 (WGS84). 지도 핀 · 길찾기 딥링크에 사용됩니다.
   * 카카오/네이버 지도에서 예식장을 검색해 정확한 값으로 확인해 주세요.
   */
  lat: number
  lng: number
}

export interface Ceremony {
  /**
   * 예식 일시 (ISO 8601, 한국 시간 +09:00).
   * 예식 시간이 정해지면 시간 부분만 바꾸고 timeConfirmed 를 true 로 변경하세요.
   */
  dateTime: string
  /** false 이면 시간은 표시하지 않고 날짜만 표시합니다. */
  timeConfirmed: boolean
  /** 예식 진행 시간(분). 카운트다운 종료 문구 전환에 사용됩니다. */
  durationMinutes: number
}

export interface BankAccount {
  /** 예: '신랑', '신랑 아버지' */
  role: string
  bank: string
  number: string
  holder: string
  /** 카카오페이 송금 링크 (선택) */
  kakaoPayUrl?: string
}

export interface GalleryImage {
  src: AssetPath
  width: number
  height: number
  alt: string
}

export type TransportKind = 'subway' | 'bus' | 'car' | 'parking' | 'shuttle' | 'train'

export interface TransportInfo {
  kind: TransportKind
  title: string
  lines: string[]
}

