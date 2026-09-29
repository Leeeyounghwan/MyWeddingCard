import { bride, groom } from '../../data/wedding'
import type { Person } from '../../data/types'
import { Photo } from '../common/Photo'
import { ImageReveal, Reveal, RevealGroup, RevealItem } from '../common/Reveal'
import { Section } from '../common/Section'
import styles from './Couple.module.css'

function Profile({ person, role, align }: { person: Person; role: 'Groom' | 'Bride'; align: 'left' | 'right' }) {
  const profile = person.profile?.filter((p) => p.label && p.value) ?? []
  return (
    <article className={styles.person} data-align={align}>
      <ImageReveal className={styles.photo}>
        <Photo src={person.photo} alt={`${role === 'Groom' ? '신랑' : '신부'} ${person.name}`} ratio={3 / 4} />
      </ImageReveal>
      <RevealGroup className={styles.text} stagger={0.1} delay={0.2}>
        <RevealItem as="p" className={styles.role}>
          {role}
        </RevealItem>
        <RevealItem as="h3" className={styles.name}>
          {person.name}
        </RevealItem>
        <RevealItem as="p" className={styles.nameEn}>
          {person.nameEn}
        </RevealItem>
        {person.intro && (
          <RevealItem as="p" className={styles.intro}>
            {person.intro}
          </RevealItem>
        )}
        {profile.length > 0 && (
          <RevealItem>
            <dl className={styles.profile}>
              {profile.map((p) => (
                <div key={p.label}>
                  <dt>{p.label}</dt>
                  <dd>{p.value}</dd>
                </div>
              ))}
            </dl>
          </RevealItem>
        )}
      </RevealGroup>
    </article>
  )
}

/** 신랑 · 신부 소개 — 좌우로 엇갈린 매거진 레이아웃 */
export function Couple() {
  return (
    <Section id="couple" eyebrow="About Us" title="저희 두 사람을 소개합니다" tone="surface">
      <div className={styles.grid}>
        <Profile person={groom} role="Groom" align="left" />
        <Reveal variant="fade" className={styles.amp}>
          <span aria-hidden="true">&amp;</span>
        </Reveal>
        <Profile person={bride} role="Bride" align="right" />
      </div>
    </Section>
  )
}
