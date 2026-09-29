import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { venue } from '../../data/wedding'
import { fullDateKo, monthEn, monthMatrix, WEEKDAY_LABELS, wd } from '../../lib/date'
import { viewportOnce } from '../../lib/motion'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'
import styles from './WeddingDay.module.css'

/** 직접 디자인한 예식 월 달력. 예식일은 원이 그려지며 강조됩니다. */
export function WeddingDay({ children }: { children?: ReactNode }) {
  const reduce = useReducedMotion()
  const cells = monthMatrix(wd.year, wd.month)

  return (
    <Section id="wedding-day" eyebrow="The Day" title="예식 안내">
      <Reveal className={styles.head}>
        <p className={styles.month}>{monthEn}</p>
        <p className={styles.year}>{wd.year}</p>
      </Reveal>

      <Reveal delay={0.15}>
        <table className={styles.calendar} aria-label={`${wd.year}년 ${wd.month}월 달력`}>
          <thead>
            <tr>
              {WEEKDAY_LABELS.map((d, i) => (
                <th key={d} scope="col" data-sunday={i === 0 || undefined} data-saturday={i === 6 || undefined}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: cells.length / 7 }, (_, row) => (
              <tr key={row}>
                {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                  const isDay = day === wd.day
                  return (
                    <td
                      key={col}
                      data-sunday={col === 0 || undefined}
                      data-wedding={isDay || undefined}
                      aria-current={isDay ? 'date' : undefined}
                    >
                      {day && (
                        <span className={styles.cell}>
                          {isDay && (
                            <svg className={styles.circle} viewBox="0 0 40 40" aria-hidden="true">
                              <m.circle
                                cx="20"
                                cy="20"
                                r="18"
                                initial={reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                viewport={viewportOnce}
                                transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.6 }}
                              />
                            </svg>
                          )}
                          <span className={styles.num}>{day}</span>
                          {isDay && <span className="sr-only">예식일</span>}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <Reveal className={styles.info} delay={0.2}>
        <p className={styles.date}>{fullDateKo}</p>
        <p className={styles.venue}>
          {venue.name}
          {venue.hall && <span> {venue.hall}</span>}
        </p>
      </Reveal>

      {/* Countdown 등 달력 아래에 이어지는 콘텐츠 */}
      {children}
    </Section>
  )
}
