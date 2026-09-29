/**
 * 💞 Our Story (연애 타임라인)
 *
 * - date / title 은 필수, description / image 는 선택입니다.
 * - 배열을 비우면( [] ) 섹션 전체가 자동으로 숨겨집니다.
 *   (또는 wedding.ts → features.timeline = false)
 * - 이미지는 public/images/story/ 에 넣고 경로를 적어주세요. (가로형 4:3 권장)
 */
import type { TimelineEvent } from './types'

export const timelineTitle = {
  eyebrow: 'Our Story',
  title: '우리가 걸어온 시간',
}

export const timeline: TimelineEvent[] = [
  {
    date: '2019',
    title: '처음 만난 날',
    description: '✏️ 두 사람이 처음 만난 이야기를 적어주세요.',
    image: 'images/story/01.svg',
  },
  {
    date: '2020',
    title: '첫 여행',
    description: '✏️ 함께 떠난 첫 여행의 기억을 적어주세요.',
    image: 'images/story/02.svg',
  },
  {
    date: '2026',
    title: '프로포즈',
    description: '✏️ 평생을 약속한 날의 이야기를 적어주세요.',
    image: 'images/story/03.svg',
  },
  {
    date: '2027.04.25',
    title: 'Wedding Day',
    description: '그리고 오늘, 저희 두 사람이 부부가 됩니다.',
  },
]
