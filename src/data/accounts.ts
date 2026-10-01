/**
 * 💳 마음 전하실 곳 (계좌번호)
 *
 * ⚠️ 개인정보입니다. 공개 저장소(GitHub Public Repo)에 올리면 누구나 볼 수 있습니다.
 *    청첩장 자체가 공개 페이지이므로 계좌가 노출되는 것은 동일하지만,
 *    원치 않는 정보(주민번호, 주소 등)는 절대 넣지 마세요.
 *
 * bank / number / holder 를 비워두면 '등록 예정'으로 표시되고 복사 버튼이 비활성화됩니다.
 * 필요 없는 줄은 삭제하세요.
 */
import type { BankAccount } from './types'

export const accountsTitle = {
  eyebrow: 'With Heart',
  title: '마음 전하실 곳',
  description: '참석이 어려우신 분들을 위해 기재했습니다.\n너그러운 마음으로 양해 부탁드립니다.',
}

export const groomAccounts: BankAccount[] = [
  { role: '신랑', bank: '테스트은행', number: '000-0000-0000', holder: '이영환' }, // ✏️ 실제 계좌로 교체
  { role: '신랑 아버지', bank: '', number: '', holder: '' }, // ✏️
  { role: '신랑 어머니', bank: '', number: '', holder: '' }, // ✏️
]

export const brideAccounts: BankAccount[] = [
  { role: '신부', bank: '테스트은행', number: '111-1111-1111', holder: '오은진' }, // ✏️ 실제 계좌로 교체
  { role: '신부 아버지', bank: '', number: '', holder: '' }, // ✏️
  { role: '신부 어머니', bank: '', number: '', holder: '' }, // ✏️
]
