import { Bus, Car, CircleParking, TrainFront, TramFront, Van, type LucideIcon } from 'lucide-react'
import type { TransportInfo, TransportKind } from '../../data/types'
import { RevealGroup, RevealItem } from '../common/Reveal'
import styles from './Transportation.module.css'

const ICONS: Record<TransportKind, LucideIcon> = {
  subway: TramFront,
  train: TrainFront,
  bus: Bus,
  car: Car,
  parking: CircleParking,
  shuttle: Van,
}

/** 교통 안내 (data/transportation.ts) */
export function Transportation({ items }: { items: TransportInfo[] }) {
  return (
    <RevealGroup as="dl" className={styles.list} stagger={0.08}>
      {items.map((t) => {
        const Icon = ICONS[t.kind] ?? Car
        return (
          <RevealItem key={t.title} className={styles.item}>
            <dt className={styles.title}>
              <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
              {t.title}
            </dt>
            <dd className={styles.lines}>
              {t.lines.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </dd>
          </RevealItem>
        )
      })}
    </RevealGroup>
  )
}
