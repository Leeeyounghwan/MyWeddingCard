import { information } from '../../data/information'
import { RevealGroup, RevealItem } from '../common/Reveal'
import { Section } from '../common/Section'
import styles from './Information.module.css'

/** 식사 · 화환 등 안내 사항 (data/information.ts). 비어 있으면 숨김 */
export function Information() {
  if (information.length === 0) return null
  return (
    <Section id="information" eyebrow="Information" title="안내 말씀" tone="surface">
      <RevealGroup as="ol" className={styles.list} stagger={0.12}>
        {information.map((item, i) => (
          <RevealItem as="li" key={item.title} className={styles.item}>
            <span className={styles.index} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.desc}>{item.description}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  )
}
