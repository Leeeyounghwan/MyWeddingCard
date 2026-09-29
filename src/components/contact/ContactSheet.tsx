import { MessageSquare, Phone } from 'lucide-react'
import { bride, groom } from '../../data/wedding'
import type { Person } from '../../data/types'
import { Sheet } from '../common/Sheet'
import styles from './ContactSheet.module.css'

interface ContactRow {
  role: string
  name: string
  phone: string
}

function rows(person: Person, side: '신랑' | '신부'): ContactRow[] {
  const list: ContactRow[] = [{ role: side, name: person.name, phone: person.phone }]
  if (person.father.name || person.father.phone)
    list.push({ role: `${side} 아버지`, name: person.father.name, phone: person.father.phone })
  if (person.mother.name || person.mother.phone)
    list.push({ role: `${side} 어머니`, name: person.mother.name, phone: person.mother.phone })
  return list
}

const tel = (phone: string) => phone.replace(/[^0-9+]/g, '')

function Group({ title, items }: { title: string; items: ContactRow[] }) {
  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <ul>
        {items.map((c) => (
          <li key={c.role} className={styles.row}>
            <div className={styles.who}>
              <span className={styles.role}>{c.role}</span>
              <span className={styles.name}>{c.name || '-'}</span>
            </div>
            {c.phone ? (
              <div className={styles.buttons}>
                <a className={styles.icon} href={`tel:${tel(c.phone)}`} aria-label={`${c.role} ${c.name}에게 전화하기`}>
                  <Phone size={17} strokeWidth={1.5} aria-hidden="true" />
                </a>
                <a className={styles.icon} href={`sms:${tel(c.phone)}`} aria-label={`${c.role} ${c.name}에게 문자 보내기`}>
                  <MessageSquare size={17} strokeWidth={1.5} aria-hidden="true" />
                </a>
              </div>
            ) : (
              <span className={styles.pending}>등록 예정</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** 신랑 · 신부 · 혼주 연락처 (tel: / sms: 링크). 번호는 data/wedding.ts 에서 입력합니다. */
export default function ContactSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} eyebrow="Contact" title="축하 인사 전하기">
      <Group title="신랑측" items={rows(groom, '신랑')} />
      <Group title="신부측" items={rows(bride, '신부')} />
    </Sheet>
  )
}
