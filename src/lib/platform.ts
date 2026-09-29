const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent

export const isIOS =
  /iPad|iPhone|iPod/.test(ua) ||
  (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const isAndroid = /Android/i.test(ua)

export const isMobile = isIOS || isAndroid

export const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua)

/** 카카오톡 · 인스타그램 · 네이버 등 인앱 브라우저 */
export const isInAppBrowser = /KAKAOTALK|Instagram|NAVER|FBAN|FBAV|Line\//i.test(ua)
