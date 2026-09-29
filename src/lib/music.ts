import { useSyncExternalStore } from 'react'
import { features, media } from '../data/wedding'
import { asset } from './asset'
import { readStorage, writeStorage } from './storage'

/**
 * 배경음악 컨트롤러.
 * - 오디오는 첫 재생 시점에 생성되어(preload 없음) 초기 로딩에 영향을 주지 않습니다.
 * - 모바일 자동재생 정책 때문에 반드시 사용자 클릭(초대장 열기 등) 안에서 play() 를 호출합니다.
 * - 사용자가 직접 끈 경우 localStorage 에 기억하여 다음 방문 때 자동 재생하지 않습니다.
 */
export type MusicStatus = 'idle' | 'playing' | 'paused' | 'unavailable'

const PREF_KEY = 'music-muted'

let audio: HTMLAudioElement | null = null
let status: MusicStatus = features.music && media.bgm.src ? 'idle' : 'unavailable'
const listeners = new Set<() => void>()

function set(next: MusicStatus) {
  if (status === next) return
  status = next
  listeners.forEach((l) => l())
}

function ensureAudio(): HTMLAudioElement | null {
  if (status === 'unavailable') return null
  if (audio) return audio
  audio = new Audio()
  audio.src = asset(media.bgm.src)
  audio.loop = true
  audio.preload = 'auto'
  audio.volume = media.bgm.volume
  audio.setAttribute('playsinline', '')
  audio.addEventListener('play', () => set('playing'))
  audio.addEventListener('pause', () => set('paused'))
  // 파일이 없거나 재생할 수 없는 형식이면 음악 버튼을 숨깁니다.
  audio.addEventListener('error', () => set('unavailable'))
  return audio
}

async function play(): Promise<boolean> {
  const el = ensureAudio()
  if (!el) return false
  try {
    await el.play()
    writeStorage(PREF_KEY, '0')
    return true
  } catch {
    // 자동재생 차단 등 — 버튼으로 다시 재생 가능
    if (status !== 'unavailable') set('paused')
    return false
  }
}

function pause() {
  audio?.pause()
  writeStorage(PREF_KEY, '1')
}

export const music = {
  play,
  pause,
  toggle() {
    if (status === 'playing') pause()
    else void play()
  },
  /** 사용자가 이전에 음악을 끈 적이 있으면 자동 재생하지 않습니다. */
  get userMuted() {
    return readStorage(PREF_KEY) === '1'
  },
}

export function useMusicStatus(): MusicStatus {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => status,
    () => status,
  )
}

/** 음악 파일이 실제로 있는지 가볍게(HEAD) 확인 → 없으면 음악 UI 를 숨깁니다. */
if (status !== 'unavailable' && typeof fetch !== 'undefined') {
  fetch(asset(media.bgm.src), { method: 'HEAD' })
    .then((r) => {
      const type = r.headers.get('content-type') ?? ''
      if (!r.ok || type.includes('text/html')) set('unavailable')
    })
    .catch(() => undefined)
}

// 다른 앱으로 전환하거나 화면이 꺼졌다 돌아올 때 재생 상태를 동기화
let resumeOnVisible = false
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!audio) return
    if (document.hidden && !audio.paused) {
      audio.pause()
      resumeOnVisible = true
    } else if (!document.hidden && resumeOnVisible) {
      resumeOnVisible = false
      void audio.play().catch(() => set('paused'))
    }
  })
}
