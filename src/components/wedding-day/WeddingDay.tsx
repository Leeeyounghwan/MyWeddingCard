import { m, useReducedMotion } from 'framer-motion'
import { CalendarPlus, Download } from 'lucide-react'
import type { ReactNode } from 'react'
import { venue } from '../../data/wedding'
import { downloadIcs, googleCalendarUrl } from '../../lib/calendar'
import { fullDateKo, monthEn, monthMatrix, WEEKDAY_LABELS, wd } from '../../lib/date'
import { viewportOnce } from '../../lib/motion'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'
import styles from './WeddingDay.module.css'

/** 직접 디자인한 예식 월 달력. 예식일은 하트가 그려지며 강조됩니다. */
export function WeddingDay({ children }: { children?: ReactNode }) {
  const reduce = useReducedMotion()
  const cells = monthMatrix(wd.year, wd.month)

  return (
    <Section id="wedding-day" eyebrow="The Day" title="예식 안내" tone="surface" className={styles.section}>
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
                            <m.svg
                              className={styles.heart}
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                              initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={viewportOnce}
                              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                            >
                              <path d="M24 41.2S8.5 32 8.5 18.8A8.6 8.6 0 0 1 24 13.7a8.6 8.6 0 0 1 15.5 5.1C39.5 32 24 41.2 24 41.2Z" />
                            </m.svg>
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
        <div className={styles.calendarActions}>
          <a className={styles.calendarButton} href={googleCalendarUrl()} target="_blank" rel="noreferrer">
            <CalendarPlus size={15} strokeWidth={1.5} aria-hidden="true" />
            Google 캘린더
          </a>
          <button type="button" className={styles.calendarButton} onClick={downloadIcs}>
            <Download size={15} strokeWidth={1.5} aria-hidden="true" />
            기본 캘린더
          </button>
        </div>
      </Reveal>

      {/* Countdown 등 달력 아래에 이어지는 콘텐츠 */}
      {children}
    </Section>
  )
}
