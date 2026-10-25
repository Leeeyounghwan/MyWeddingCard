/**
 * html-to-image 는 기본적으로 페이지의 모든 웹폰트(한글 폰트는 수십 개 파일)를 임베드하려 해서 매우 느립니다.
 * 카드에 실제로 쓰인 글자만 담은 폰트 CSS 를 base64 로 인라인해 전달합니다.
 */
const FAMILIES = ['Noto+Serif+KR:wght@400;500;600;700', 'Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400']

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
    const fontFiles = [
      ['NanumSquareRoundL.ttf', 300],
      ['NanumSquareRoundR.ttf', 400],
      ['NanumSquareRoundB.ttf', 700],
      ['NanumSquareRoundEB.ttf', 800],
    ] as const
    const embeddedFonts = await Promise.all(
      fontFiles.map(async ([file, weight]) => {
        const response = await fetch(new URL(`fonts/${file}`, document.baseURI))
        const data = await blobToDataUrl(await response.blob())
        return `@font-face { font-family: 'NanumSquareRound'; src: url(${data}) format('truetype'); font-style: normal; font-weight: ${weight}; }`
      }),
    )
    css = `${embeddedFonts.join('\n')}\n${css}`
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
