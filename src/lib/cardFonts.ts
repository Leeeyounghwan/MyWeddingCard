/**
 * html-to-image 는 기본적으로 페이지의 모든 웹폰트(한글 폰트는 수십 개 파일)를 임베드하려 해서 매우 느립니다.
 * 카드에 실제로 쓰인 글자만 담은 Google Fonts 서브셋(text= 파라미터)을 받아
 * base64 로 인라인한 @font-face CSS 를 만들어 전달합니다.
 */
const FAMILIES = ['Gowun+Batang:wght@400;700', 'Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400']

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}

export async function buildCardFontCss(text: string): Promise<string | null> {
  try {
    const chars = Array.from(new Set(Array.from(`${text}0123456789.·&, `))).join('')
    const url = `https://fonts.googleapis.com/css2?${FAMILIES.map((f) => `family=${f}`).join('&')}&text=${encodeURIComponent(chars)}`
    let css = await (await fetch(url)).text()
    const fontUrls = Array.from(new Set(Array.from(css.matchAll(/url\((https:[^)]+)\)/g), (m) => m[1])))
    const inlined = await Promise.all(
      fontUrls.map(async (u) => [u, await blobToDataUrl(await (await fetch(u)).blob())] as const),
    )
    for (const [u, data] of inlined) css = css.split(u).join(data)
    return css
  } catch {
    return null
  }
}
