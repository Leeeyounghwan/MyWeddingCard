import { useId, type ReactNode } from 'react'
import { Reveal } from './Reveal'
import styles from './Section.module.css'

interface SectionProps {
  id?: string
  eyebrow?: string
  title?: string
  description?: string
  children: ReactNode
  tone?: 'default' | 'surface' | 'paper'
  className?: string
  /** 여백 없이 가장자리까지 쓰는 섹션 */
  flush?: boolean
}

/** 모든 본문 섹션의 공통 틀: 영문 이탤릭 라벨 + 한글 세리프 제목 + 순차 등장 */
export function Section({ id, eyebrow, title, description, children, tone = 'default', className, flush }: SectionProps) {
  const headingId = useId()
  return (
    <section
      id={id}
      className={[styles.section, className].filter(Boolean).join(' ')}
      data-tone={tone}
      data-flush={flush || undefined}
      aria-labelledby={title ? headingId : undefined}
    >
      {(eyebrow || title) && (
        <header className={styles.header}>
          {eyebrow && (
            <Reveal as="p" variant="fade" className={styles.eyebrow}>
              {eyebrow}
            </Reveal>
          )}
          {title && (
            <Reveal as="h2" delay={0.12} className={styles.title}>
              <span id={headingId}>{title}</span>
            </Reveal>
          )}
          {description && (
            <Reveal as="p" delay={0.24} className={styles.description}>
              {description}
            </Reveal>
          )}
        </header>
      )}
      {children}
    </section>
  )
}
