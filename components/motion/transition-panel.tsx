// Derived from Motion Primitives (MIT). See LICENSE and ORIGIN.json in this directory.
'use client';
import {
  AnimatePresence,
  Transition,
  Variant,
  motion,
  MotionProps,
} from 'motion/react';
import { useMotionPolicy } from './use-motion-policy';
import { cn } from '../../lib/utils';

export type TransitionPanelProps = {
  children: React.ReactNode[];
  className?: string;
  transition?: Transition;
  activeIndex: number;
  paused?: boolean;
  variants?: { enter: Variant; center: Variant; exit: Variant };
} & MotionProps;

export function TransitionPanel({
  children,
  className,
  transition,
  variants,
  activeIndex,
  paused = false,
  ...motionProps
}: TransitionPanelProps) {
  const disabled=useMotionPolicy(paused);
  const index=Math.max(0,Math.min(children.length-1,Number.isFinite(activeIndex)?Math.trunc(activeIndex):0));
  if(disabled)return <div className={className}>{children[index]}</div>;
  return (
    <div className={cn('relative', className)}>
      <AnimatePresence
        initial={false}
        mode='popLayout'
        custom={motionProps.custom}
      >
        <motion.div
          key={index}
          variants={variants}
          transition={transition}
          initial='enter'
          animate='center'
          exit='exit'
          {...motionProps}
        >
          {children[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
