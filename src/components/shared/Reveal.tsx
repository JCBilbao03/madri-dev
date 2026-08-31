import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

const MOTION_TAGS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  header: motion.header,
} as const;

type RevealTag = keyof typeof MOTION_TAGS;

interface RevealProps {
  children: ReactNode;
  /** Seconds to hold before animating, used to stagger sibling items. */
  delay?: number;
  className?: string;
  as?: RevealTag;
}

/**
 * Single source of truth for the site's scroll-reveal motion. Renders a plain,
 * static element when the visitor prefers reduced motion.
 */
export function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
