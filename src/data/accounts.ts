/**
 * 💳 마음 전하실 곳 (계좌번호)
 *
 * ⚠️ 개인정보입니다. 공개 저장소(GitHub Public Repo)에 올리면 누구나 볼 수 있습니다.
 *    청첩장 자체가 공개 페이지이므로 계좌가 노출되는 것은 동일하지만,
 *    원치 않는 정보(주민번호, 주소 등)는 절대 넣지 마세요.
 *
 * 실제 값은 .env.local / GitHub Actions Secrets 에서 관리합니다.
 * bank 또는 number 를 비워두면 '등록 예정'으로 표시되고 복사 버튼이 비활성화됩니다.
 * 필요 없는 줄은 삭제하세요.
 */
import type { BankAccount } from './types'

export const accountsTitle = {
  eyebrow: 'With Heart',
  title: '마음 전하실 곳',
  description: '참석이 어려우신 분들을 위해 기재했습니다.\n너그러운 마음으로 양해 부탁드립니다.',
}

export const groomAccounts: BankAccount[] = [
  {
    role: '신랑',
    bank: import.meta.env.VITE_GROOM_ACCOUNT_BANK ?? '',
    number: import.meta.env.VITE_GROOM_ACCOUNT_NUMBER ?? '',
    holder: import.meta.env.VITE_GROOM_ACCOUNT_HOLDER ?? '',
  },
  {
    role: '신랑 아버지',
    bank: import.meta.env.VITE_GROOM_FATHER_ACCOUNT_BANK ?? '',
    number: import.meta.env.VITE_GROOM_FATHER_ACCOUNT_NUMBER ?? '',
    holder: import.meta.env.VITE_GROOM_FATHER_ACCOUNT_HOLDER ?? '',
  },
  {
    role: '신랑 어머니',
    bank: import.meta.env.VITE_GROOM_MOTHER_ACCOUNT_BANK ?? '',
    number: import.meta.env.VITE_GROOM_MOTHER_ACCOUNT_NUMBER ?? '',
    holder: import.meta.env.VITE_GROOM_MOTHER_ACCOUNT_HOLDER ?? '',
  },
]

export const brideAccounts: BankAccount[] = [
  {
    role: '신부',
    bank: import.meta.env.VITE_BRIDE_ACCOUNT_BANK ?? '',
    number: import.meta.env.VITE_BRIDE_ACCOUNT_NUMBER ?? '',
    holder: import.meta.env.VITE_BRIDE_ACCOUNT_HOLDER ?? '',
  },
  {
    role: '신부 아버지',
    bank: import.meta.env.VITE_BRIDE_FATHER_ACCOUNT_BANK ?? '',
    number: import.meta.env.VITE_BRIDE_FATHER_ACCOUNT_NUMBER ?? '',
    holder: import.meta.env.VITE_BRIDE_FATHER_ACCOUNT_HOLDER ?? '',
  },
  {
    role: '신부 어머니',
    bank: import.meta.env.VITE_BRIDE_MOTHER_ACCOUNT_BANK ?? '',
    number: import.meta.env.VITE_BRIDE_MOTHER_ACCOUNT_NUMBER ?? '',
    holder: import.meta.env.VITE_BRIDE_MOTHER_ACCOUNT_HOLDER ?? '',
  },
]
