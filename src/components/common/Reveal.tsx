import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { baseTransition, revealVariants, staggerContainer, viewportOnce, type RevealVariant } from '../../lib/motion'

interface RevealProps {
  children: ReactNode
  variant?: RevealVariant
  delay?: number
  duration?: number
  className?: string
  as?: 'div' | 'p' | 'li' | 'h2' | 'h3' | 'span' | 'figure' | 'section'
}

/**
 * 스크롤로 화면에 들어올 때 한 번 나타나는 래퍼.
 * framer-motion 의 whileInView 는 IntersectionObserver 기반이라 스크롤 이벤트를 쓰지 않습니다.
 */
export function Reveal({ children, variant = 'fadeUp', delay = 0, duration, className, as = 'div' }: RevealProps) {
  const Comp = m[as]
  return (
    <Comp
      className={className}
      variants={revealVariants[variant]}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ ...baseTransition, ...(duration ? { duration } : null), delay }}
    >
      {children}
    </Comp>
  )
}

/** 자식 RevealItem 들을 순서대로(stagger) 등장시킵니다. */
export function RevealGroup({
  children,
  className,
  stagger = 0.14,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  as?: 'div' | 'ul' | 'ol' | 'dl'
}) {
  const Comp = m[as]
  return (
    <Comp
      className={className}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </Comp>
  )
}

export function RevealItem({
  children,
  className,
  variant = 'fadeUp',
  as = 'div',
}: {
  children: ReactNode
  className?: string
  variant?: RevealVariant
  as?: 'div' | 'li' | 'p' | 'span' | 'h2' | 'h3'
}) {
  const Comp = m[as]
  return (
    <Comp className={className} variants={revealVariants[variant]} transition={baseTransition}>
      {children}
    </Comp>
  )
}

/**
 * 사진이 마스크(clip-path)가 열리듯 드러나는 효과 + 살짝 줌아웃.
 * prefers-reduced-motion 환경에서는 단순 페이드로 대체됩니다.
 */
export function ImageReveal({
  children,
  className,
  delay = 0,
  from = 'bottom',
}: {
  children: ReactNode
  className?: string
  delay?: number
  from?: 'bottom' | 'center' | 'left'
}) {
  const reduce = useReducedMotion()
  const hiddenClip =
    from === 'center' ? 'inset(10% 10% 10% 10%)' : from === 'left' ? 'inset(0% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)'
  return (
    <m.div
      className={className}
      initial={reduce ? { opacity: 0 } : { clipPath: hiddenClip, opacity: 1 }}
      whileInView={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={viewportOnce}
      transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1], delay }}
      style={{ overflow: 'hidden' }}
    >
      <m.div
        style={{ height: '100%' }}
        initial={reduce ? false : { scale: 1.14 }}
        whileInView={reduce ? undefined : { scale: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {children}
      </m.div>
    </m.div>
  )
}
