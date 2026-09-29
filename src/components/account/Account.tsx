import { AnimatePresence, m } from 'framer-motion'
import { ChevronDown, Copy } from 'lucide-react'
import { useId, useState } from 'react'
import { accountsTitle, brideAccounts, groomAccounts } from '../../data/accounts'
import type { BankAccount } from '../../data/types'
import { copyText } from '../../lib/share'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'
import styles from './Account.module.css'

function AccountRow({ a }: { a: BankAccount }) {
  const ready = Boolean(a.bank && a.number)
  return (
    <li className={styles.row}>
      <div className={styles.info}>
        <p className={styles.role}>
          {a.role}
          {a.holder && <span className={styles.holder}>{a.holder}</span>}
        </p>
        {ready ? (
          <p className={styles.number}>
            {a.bank} <span>{a.number}</span>
          </p>
        ) : (
          <p className={styles.pending}>등록 예정</p>
        )}
      </div>
      <div className={styles.buttons}>
        {a.kakaoPayUrl && (
          <a className={styles.pay} href={a.kakaoPayUrl} target="_blank" rel="noopener noreferrer">
            pay
          </a>
        )}
        <button
          type="button"
          className={styles.copy}
          disabled={!ready}
          onClick={() => copyText(`${a.bank} ${a.number} ${a.holder}`.trim(), '계좌번호가 복사되었습니다')}
          aria-label={`${a.role} 계좌번호 복사`}
        >
          <Copy size={13} strokeWidth={1.5} aria-hidden="true" />
          복사
        </button>
      </div>
    </li>
  )
}

function Group({ title, items }: { title: string; items: BankAccount[] }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  if (items.length === 0) return null
  return (
    <div className={styles.group} data-open={open || undefined}>
      <h3>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={id}
        >
          {title}
          <ChevronDown className={styles.chevron} size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <m.ul
            id={id}
            className={styles.panel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {items.map((a) => (
              <AccountRow key={a.role} a={a} />
            ))}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 마음 전하실 곳 — 기본은 접힌 아코디언 (data/accounts.ts) */
export function Account() {
  return (
    <Section id="account" eyebrow={accountsTitle.eyebrow} title={accountsTitle.title} description={accountsTitle.description}>
      <Reveal className={styles.groups}>
        <Group title="신랑측 마음 전하실 곳" items={groomAccounts} />
        <Group title="신부측 마음 전하실 곳" items={brideAccounts} />
      </Reveal>
    </Section>
  )
}
