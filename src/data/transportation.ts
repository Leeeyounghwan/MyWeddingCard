/**
 * 🚇 교통 안내 (Location 섹션 아래 표시)
 *
 * kind: 'subway' | 'bus' | 'car' | 'parking' | 'shuttle' | 'train' (아이콘이 바뀝니다)
 * lines: 한 줄씩 표시됩니다. 필요 없는 항목은 통째로 지우면 됩니다.
 *
 * ⚠️ 아래 내용은 임시(Placeholder)입니다. 예식장 안내문을 받아 정확히 수정해 주세요.
 */
import type { TransportInfo } from './types'

export const transportation: TransportInfo[] = [
  {
    kind: 'subway',
    title: '지하철',
    lines: ['인천 1호선 갈산역 2번 출구 앞', '✏️ 도보 소요 시간 등 상세 안내 입력'],
  },
  {
    kind: 'bus',
    title: '버스',
    lines: ['✏️ 정류장 이름 하차', '✏️ 간선 000, 000 / 지선 000'],
  },
  {
    kind: 'car',
    title: '자가용',
    lines: ['내비게이션 “웨스턴팰리스웨딩” 또는', '“인천 부평구 부평대로278번길 16” 검색'],
  },
  {
    kind: 'parking',
    title: '주차',
    lines: ['✏️ 건물 내 주차장 이용 (예식 하객 0시간 무료)', '✏️ 주차 등록은 안내 데스크에서 해주세요.'],
  },
  {
    kind: 'shuttle',
    title: '셔틀버스',
    lines: ['✏️ 운행 여부 확정 후 안내드리겠습니다.'],
  },
]
