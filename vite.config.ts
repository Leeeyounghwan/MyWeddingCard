import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { media, meta } from './src/data/wedding.ts'

/**
 * index.html 의 __OG_TITLE__ 등 자리표시자를 src/data/wedding.ts 의 값으로 치환합니다.
 * 카카오톡은 og:image 에 절대 URL 이 필요하므로 VITE_SITE_URL(배포 주소)을 사용합니다.
 */
function htmlMeta(siteUrl: string, base: string): Plugin {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const abs = (p: string) => (/^https?:/.test(p) ? p : `${siteUrl}/${p.replace(/^\//, '')}`)
  return {
    name: 'wedding-html-meta',
    transformIndexHtml(html, ctx) {
      if (!siteUrl && !ctx.server) {
        console.warn('\n⚠️  VITE_SITE_URL 이 비어 있어 og:image 가 상대경로로 들어갑니다. (카카오톡 미리보기 이미지가 안 나올 수 있음)\n')
      }
      return html
        .replaceAll('__OG_TITLE__', escape(meta.title))
        .replaceAll('__OG_DESCRIPTION__', escape(meta.description.replace(/\n/g, ' · ')))
        .replaceAll('__OG_IMAGE__', escape(siteUrl ? abs(meta.ogImage) : `${base}${meta.ogImage}`))
        .replaceAll('__SITE_URL__', escape(siteUrl ? `${siteUrl}/` : base))
        .replaceAll('__HERO_IMAGE__', escape(`${base}${media.heroImage.replace(/^\//, '')}`))
        .replaceAll('__THEME_COLOR__', meta.themeColor)
        .replaceAll('__BASE__', base)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // GitHub Pages 프로젝트 사이트는 https://<user>.github.io/<repo>/ 이므로 base 가 '/<repo>/' 여야 합니다.
  // GitHub Actions 에서는 BASE_PATH 가 자동으로 주입됩니다(.github/workflows/deploy.yml).
  const rawBase = env.BASE_PATH || '/'
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '')

  return {
    base,
    plugins: [react(), htmlMeta(siteUrl, base)],
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      assetsInlineLimit: 2048,
    },
    server: { host: true, port: 5173 },
    preview: { host: true, port: 4173 },
  }
})
