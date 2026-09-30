/**
 * 🚇 교통 안내 (Location 섹션 아래 표시)
 *
 * kind: 'subway' | 'bus' | 'car' | 'parking' | 'shuttle' | 'train' (아이콘이 바뀝니다)
 * lines: 한 줄씩 표시됩니다. 필요 없는 항목은 통째로 지우면 됩니다.
 *
 */
import type { TransportInfo } from './types'

export const transportation: TransportInfo[] = [
  {
    kind: 'subway',
    title: '지하철',
    lines: ['인천 1호선 갈산역 2번 출구 도보 1~2분', '부평역 또는 인천시외버스터미널에서 인천 1호선 이용'],
  },
  {
    kind: 'bus',
    title: '버스',
    lines: [
      '갈산역 또는 한국지엠기술교육원 정류장 하차',
      '일반 90 · 간선 12, 30, 34, 67-1',
      '지선 526, 555, 582, 583, 584-1 · 광역 1400, 9500',
    ],
  },
  {
    kind: 'car',
    title: '자가용',
    lines: ['내비게이션에 “부평 우림라이온스밸리 주차장” 검색', '주소: 인천 부평구 부평대로 283'],
  },
  {
    kind: 'parking',
    title: '주차',
    lines: [
      '부평 우림라이온스밸리 3시간 무료',
      '지하 2층 A동 기둥번호 A05 주변 주차',
      '주차 후 갈산역 2번 출구 방향으로 이동해 주세요.',
    ],
  },
]
