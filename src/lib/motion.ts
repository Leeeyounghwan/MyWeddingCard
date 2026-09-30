import type { Transition, Variants } from 'framer-motion'

/** 모든 스크롤 애니메이션이 공유하는 이징 · 시간 (0.5 ~ 1.0초) */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const baseTransition: Transition = { duration: 1.02, ease: EASE_OUT }

/** 뷰포트 하단 12% 지점에 들어올 때 한 번만 재생 */
export const viewportOnce = { once: true, margin: '0px 0px -12% 0px' } as const

export type RevealVariant = 'fadeUp' | 'fade' | 'scale' | 'fadeDown'

export const revealVariants: Record<RevealVariant, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 10, scale: 0.995 },
    show: { opacity: 1, y: 0, scale: 1 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -6, scale: 0.995 },
    show: { opacity: 1, y: 0, scale: 1 },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.985 },
    show: { opacity: 1, scale: 1 },
  },
}

export const staggerContainer = (stagger = 0.14, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})
