/**
 * 실제 사진이 준비되기 전까지 사용할 임시 이미지(Placeholder)를 생성합니다.
 *   npm run placeholders
 *
 * - public/images/**.svg : 따뜻한 톤의 추상 이미지 + 교체할 파일 경로 표시
 * - public/og-image.png, public/apple-touch-icon.png : 외부 라이브러리 없이 PNG 직접 인코딩
 *
 * 실제 사진으로 교체한 뒤에는 이 스크립트를 다시 실행하지 마세요(덮어쓰지 않도록 기존 파일은 건너뜁니다).
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const force = process.argv.includes('--force')

function write(rel, content) {
  const file = join(root, rel)
  if (existsSync(file) && !force) return console.log('skip', rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
  console.log('write', rel)
}

const PALETTES = [
  ['#eaf2e2', '#cfe4c3', '#6f8f6a'],
  ['#f3e8ec', '#eec3d3', '#c97b96'],
  ['#e6f0e6', '#bcdcc0', '#4f724f'],
  ['#fbeef2', '#f4c9d6', '#a8456a'],
  ['#eef4e8', '#cfe0c8', '#7a9974'],
  ['#f6ecef', '#e8bccb', '#b1607e'],
]

function photoSvg({ w, h, seed, label, dark = false }) {
  const [a, b, c] = PALETTES[seed % PALETTES.length]
  const r = (n) => ((Math.sin(seed * 97.13 + n * 13.7) + 1) / 2).toFixed(3)
  const cx1 = (w * (0.2 + 0.6 * r(1))).toFixed(0)
  const cy1 = (h * (0.25 + 0.5 * r(2))).toFixed(0)
  const cx2 = (w * (0.2 + 0.6 * r(3))).toFixed(0)
  const cy2 = (h * (0.3 + 0.5 * r(4))).toFixed(0)
  const s = Math.min(w, h)
  const text = dark ? 'rgba(255,253,249,.55)' : 'rgba(58,50,44,.42)'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${dark ? c : a}"/>
      <stop offset="1" stop-color="${dark ? '#1c231c' : b}"/>
    </linearGradient>
    <radialGradient id="l1"><stop offset="0" stop-color="#fffaf3" stop-opacity=".75"/><stop offset="1" stop-color="#fffaf3" stop-opacity="0"/></radialGradient>
    <radialGradient id="l2"><stop offset="0" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="${cx1}" cy="${cy1}" r="${(s * 0.55).toFixed(0)}" fill="url(#l1)"/>
  <circle cx="${cx2}" cy="${cy2}" r="${(s * 0.5).toFixed(0)}" fill="url(#l2)"/>
  <g fill="none" stroke="${text}" stroke-width="${(s / 400).toFixed(2)}">
    <rect x="${(w * 0.08).toFixed(0)}" y="${(h * 0.08).toFixed(0)}" width="${(w * 0.84).toFixed(0)}" height="${(h * 0.84).toFixed(0)}"/>
  </g>
  <text x="50%" y="${(h * 0.5).toFixed(0)}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="${(s * 0.07).toFixed(0)}" fill="${text}">Photo</text>
  <text x="50%" y="${(h * 0.5 + s * 0.07).toFixed(0)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${(s * 0.028).toFixed(0)}" letter-spacing="1" fill="${text}">${label}</text>
</svg>`
}

// 히어로 · 엔딩
write('images/hero.svg', photoSvg({ w: 1200, h: 1800, seed: 2, label: 'public/images/hero.webp', dark: true }))
write('images/ending.svg', photoSvg({ w: 1200, h: 1600, seed: 4, label: 'public/images/ending.webp' }))

// 신랑 · 신부
write('images/couple/groom.svg', photoSvg({ w: 900, h: 1200, seed: 1, label: 'images/couple/groom.webp' }))
write('images/couple/bride.svg', photoSvg({ w: 900, h: 1200, seed: 3, label: 'images/couple/bride.webp' }))

// 갤러리 (data/gallery.ts 의 비율과 동일)
const sizes = [
  [1600, 1200], [1200, 1600], [1200, 1500], [1200, 1600], [1600, 1200], [1200, 1800],
  [1200, 1500], [1200, 1600], [1600, 1200], [1200, 1500], [1200, 1600], [1200, 1800],
]
sizes.forEach(([w, h], i) => {
  const n = String(i + 1).padStart(2, '0')
  write(`images/gallery/${n}.svg`, photoSvg({ w, h, seed: i + 11, label: `images/gallery/${n}.webp` }))
})

// 파비콘 (SVG 모노그램)
write(
  'favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#fbfaf6"/><circle cx="32" cy="32" r="22" fill="none" stroke="#a8456a" stroke-width="1.5"/><text x="32" y="39" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="20" fill="#2f332c">Y&amp;E</text></svg>`,
)

/* ── 최소 PNG 인코더 ── */
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function png(w, h, pixel) {
  const raw = Buffer.alloc((w * 3 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0
    for (let x = 0; x < w; x++) {
      const [r, g, b] = pixel(x, y)
      const o = y * (w * 3 + 1) + 1 + x * 3
      raw[o] = r
      raw[o + 1] = g
      raw[o + 2] = b
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const IVORY = [251, 250, 246]
const BEIGE = [230, 237, 224] // 세이지 그린 톤
const ROSE = [168, 69, 106] // 벚꽃 핑크

// 두 개의 겹친 원(링) 모노그램 — 두 사람을 상징
function rings(w, h, scale) {
  const cx = w / 2
  const cy = h / 2
  const R = scale
  const thick = Math.max(1.2, scale / 40)
  return (x, y) => {
    const t = (x / w + y / h) / 2
    let c = mix(IVORY, BEIGE, t)
    for (const dx of [-R * 0.42, R * 0.42]) {
      const d = Math.abs(Math.hypot(x - (cx + dx), y - cy) - R)
      if (d < thick) c = mix(c, ROSE, Math.min(1, (thick - d) / thick) * 0.9)
    }
    return c
  }
}

write('og-image.png', png(1200, 630, rings(1200, 630, 120)))
write('apple-touch-icon.png', png(180, 180, rings(180, 180, 42)))
