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
  readonly VITE_GROOM_PHONE?: string
  readonly VITE_BRIDE_PHONE?: string
  readonly VITE_GROOM_FATHER_PHONE?: string
  readonly VITE_GROOM_MOTHER_PHONE?: string
  readonly VITE_BRIDE_FATHER_PHONE?: string
  readonly VITE_BRIDE_MOTHER_PHONE?: string
  readonly VITE_GROOM_ACCOUNT_BANK?: string
  readonly VITE_GROOM_ACCOUNT_NUMBER?: string
  readonly VITE_GROOM_ACCOUNT_HOLDER?: string
  readonly VITE_BRIDE_ACCOUNT_BANK?: string
  readonly VITE_BRIDE_ACCOUNT_NUMBER?: string
  readonly VITE_BRIDE_ACCOUNT_HOLDER?: string
  readonly VITE_GROOM_FATHER_ACCOUNT_BANK?: string
  readonly VITE_GROOM_FATHER_ACCOUNT_NUMBER?: string
  readonly VITE_GROOM_FATHER_ACCOUNT_HOLDER?: string
  readonly VITE_GROOM_MOTHER_ACCOUNT_BANK?: string
  readonly VITE_GROOM_MOTHER_ACCOUNT_NUMBER?: string
  readonly VITE_GROOM_MOTHER_ACCOUNT_HOLDER?: string
  readonly VITE_BRIDE_FATHER_ACCOUNT_BANK?: string
  readonly VITE_BRIDE_FATHER_ACCOUNT_NUMBER?: string
  readonly VITE_BRIDE_FATHER_ACCOUNT_HOLDER?: string
  readonly VITE_BRIDE_MOTHER_ACCOUNT_BANK?: string
  readonly VITE_BRIDE_MOTHER_ACCOUNT_NUMBER?: string
  readonly VITE_BRIDE_MOTHER_ACCOUNT_HOLDER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
