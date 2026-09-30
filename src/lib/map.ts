import { venue } from '../data/wedding'
import { isAndroid, isIOS, isMobile } from './platform'
import { toast } from './toast'

/**
 * 길찾기 딥링크 / 웹 URL 모음.
 * 앱이 설치되어 있으면 앱으로, 없으면 웹 지도(또는 스토어)로 연결합니다.
 */
export interface LatLng {
  lat: number
  lng: number
}

const dest = { name: venue.name, lat: venue.lat, lng: venue.lng }
const destName = venue.hall ? `${venue.name} ${venue.hall}` : venue.name

/** 지도 SDK 가 주소로 좌표를 보정한 경우, 길찾기 링크도 보정된 좌표를 사용합니다. */
export function setResolvedDestination(p: LatLng) {
  dest.lat = Number(p.lat.toFixed(6))
  dest.lng = Number(p.lng.toFixed(6))
}
const enc = encodeURIComponent
const APP_NAME = typeof location !== 'undefined' ? location.hostname || 'wedding' : 'wedding'

/**
 * 앱 스킴을 시도하고, 일정 시간 안에 페이지가 백그라운드로 전환되지 않으면 fallback URL 로 이동합니다.
 */
function openApp(appUrl: string, fallbackUrl: string | null, fallbackMessage?: string) {
  let hidden = false
  const onHide = () => {
    if (document.hidden) hidden = true
  }
  document.addEventListener('visibilitychange', onHide)
  window.location.href = appUrl
  window.setTimeout(() => {
    document.removeEventListener('visibilitychange', onHide)
    if (hidden) return
    if (fallbackUrl) window.location.href = fallbackUrl
    else if (fallbackMessage) toast(fallbackMessage, 3000)
  }, 1600)
}

/** 카카오맵 — 웹/앱 공통 URL (모바일에서는 앱이 있으면 앱으로 열림) */
export function kakaoMapUrl(from?: LatLng | null): string {
  const to = `${enc(destName)},${dest.lat},${dest.lng}`
  if (from) return `https://map.kakao.com/link/from/${enc('현재 위치')},${from.lat},${from.lng}/to/${to}`
  return `https://map.kakao.com/link/to/${to}`
}

/** 카카오맵 — 위치만 보기 */
export function kakaoMapViewUrl(): string {
  return `https://map.kakao.com/link/map/${enc(destName)},${dest.lat},${dest.lng}`
}

export function naverMapWebUrl(from?: LatLng | null): string {
  if (from) {
    return `https://map.naver.com/p/directions/${from.lng},${from.lat},${enc('현재 위치')},PLACE_POI/${dest.lng},${dest.lat},${enc(destName)},PLACE_POI/-/transit`
  }
  return `https://map.naver.com/p/search/${enc(venue.address)}`
}

export function openKakaoMap(from?: LatLng | null) {
  window.open(kakaoMapUrl(from), '_blank', 'noopener')
}

export function openNaverMap(from?: LatLng | null) {
  if (!isMobile) {
    window.open(naverMapWebUrl(from), '_blank', 'noopener')
    return
  }
  const start = from ? `slat=${from.lat}&slng=${from.lng}&sname=${enc('현재 위치')}&` : ''
  const app = `nmap://route/public?${start}dlat=${dest.lat}&dlng=${dest.lng}&dname=${enc(destName)}&appname=${enc(APP_NAME)}`
  openApp(app, naverMapWebUrl(from))
}

export function openTmap(_from?: LatLng | null) {
  if (!isMobile) {
    toast('티맵은 모바일 앱에서 이용할 수 있어요.', 2600)
    return
  }
  const app = `tmap://route?goalname=${enc(destName)}&goalx=${dest.lng}&goaly=${dest.lat}`
  const store = isIOS
    ? 'https://apps.apple.com/kr/app/id431589174'
    : isAndroid
      ? 'https://play.google.com/store/apps/details?id=com.skt.tmap.ku'
      : null
  openApp(app, store)
}

export type GeoResult = { ok: true; position: LatLng } | { ok: false; reason: 'denied' | 'unavailable' | 'timeout' }

/** 현재 위치 요청 — 실패해도 길찾기는 목적지만으로 계속 진행됩니다. */
export function getCurrentPosition(): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator) || !window.isSecureContext) {
      resolve({ ok: false, reason: 'unavailable' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ ok: true, position: { lat: p.coords.latitude, lng: p.coords.longitude } }),
      (err) =>
        resolve({
          ok: false,
          reason: err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'unavailable',
        }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  })
}
