/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_MAP_PROVIDER?: 'kakao' | 'naver'
  readonly VITE_KAKAO_MAP_KEY?: string
  readonly VITE_KAKAO_SHARE_KEY?: string
  readonly VITE_NAVER_MAP_CLIENT_ID?: string
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
