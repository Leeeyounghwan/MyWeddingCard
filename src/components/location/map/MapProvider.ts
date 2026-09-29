import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * 지도 제공자 선택.
 *
 * .env 의 VITE_MAP_PROVIDER 로 'kakao' | 'naver' 를 고르고 해당 키를 넣으면 됩니다.
 * 값이 없으면 키가 설정된 쪽을 자동 선택하고, 둘 다 없으면 지도 대신
 * 주소 카드(StaticMap)와 길찾기 버튼만 보여줍니다.
 *
 * 새 제공자(예: Google)를 추가하려면 MapViewProps 를 받는 컴포넌트를 만들고 아래 PROVIDERS 에 등록하세요.
 */
export interface MapViewProps {
  lat: number
  lng: number
  title: string
  address: string
  /** SDK 로드 실패 · 인증 오류 시 호출 → 대체 화면으로 전환 */
  onError: () => void
}

export type MapProviderName = 'kakao' | 'naver'

const env = import.meta.env
export const KAKAO_KEY = (env.VITE_KAKAO_MAP_KEY as string | undefined) ?? ''
export const NAVER_KEY = (env.VITE_NAVER_MAP_CLIENT_ID as string | undefined) ?? ''

const PROVIDERS: Record<MapProviderName, { key: string; component: LazyExoticComponent<ComponentType<MapViewProps>> }> =
  {
    kakao: { key: KAKAO_KEY, component: lazy(() => import('./KakaoMap')) },
    naver: { key: NAVER_KEY, component: lazy(() => import('./NaverMap')) },
  }

function resolveProvider(): MapProviderName | null {
  const wanted = (env.VITE_MAP_PROVIDER as string | undefined)?.toLowerCase() as MapProviderName | undefined
  if (wanted && PROVIDERS[wanted]?.key) return wanted
  if (KAKAO_KEY) return 'kakao'
  if (NAVER_KEY) return 'naver'
  return null
}

export const mapProvider = resolveProvider()
export const MapView = mapProvider ? PROVIDERS[mapProvider].component : null
