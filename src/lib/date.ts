import { ceremony } from '../data/wedding'

const TZ = 'Asia/Seoul'
const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토']
const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export interface KstParts {
  year: number
  month: number // 1-12
  day: number
  weekday: number // 0=일
  hour: number
  minute: number
}

/** 방문자 기기의 시간대와 관계없이 항상 한국 시간 기준으로 날짜를 계산합니다. */
export function toKstParts(date: Date): KstParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    weekday: WEEKDAYS_EN.indexOf(get('weekday').toUpperCase().slice(0, 3)),
    hour: Number(get('hour')) % 24,
    minute: Number(get('minute')),
  }
}

export const weddingDate = new Date(ceremony.dateTime)
export const wd = toKstParts(weddingDate)

const pad = (n: number) => String(n).padStart(2, '0')

export const weekdayKo = WEEKDAYS_KO[wd.weekday]
export const weekdayEn = WEEKDAYS_EN[wd.weekday]
export const monthEn = MONTHS_EN[wd.month - 1]
export const WEEKDAY_LABELS = WEEKDAYS_EN

/** 2027.04.25 */
export const dotDate = `${wd.year}.${pad(wd.month)}.${pad(wd.day)}`

/** 12:30 (시간 미정이면 '') */
export const timeKo = ceremony.timeConfirmed ? `${pad(wd.hour)}:${pad(wd.minute)}` : ''

/** PM 12:30 (시간 미정이면 '') */
export const timeEn = (() => {
  if (!ceremony.timeConfirmed) return ''
  const ampm = wd.hour < 12 ? 'AM' : 'PM'
  const h = wd.hour % 12 === 0 ? 12 : wd.hour % 12
  return `${ampm} ${h}:${pad(wd.minute)}`
})()

/** 2027년 4월 25일 일요일 [12:30] */
export const fullDateKo = `${wd.year}년 ${wd.month}월 ${wd.day}일 ${weekdayKo}요일${timeKo ? ` ${timeKo}` : ''}`

export const weddingStart = weddingDate.getTime()
/** 시간이 미정이면 예식 당일 자정까지를 '진행 중'으로 봅니다. */
export const weddingEnd = ceremony.timeConfirmed
  ? weddingStart + ceremony.durationMinutes * 60_000
  : weddingStart + 24 * 60 * 60_000

/** 달력 칸 배열 (앞쪽 빈칸은 null) */
export function monthMatrix(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null)
  for (let d = 1; d <= days; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

/** 방명록 날짜 표기: 2027.03.01 */
export function formatDotDate(iso: string): string {
  const p = toKstParts(new Date(iso))
  return `${p.year}.${pad(p.month)}.${pad(p.day)}`
}
