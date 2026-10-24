// Derived from Motion Primitives (MIT). See LICENSE and ORIGIN.json.
'use client';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence, type Transition, type Variants, type AnimatePresenceProps } from 'motion/react';
import { useState, useEffect, useRef, Children, type ReactNode } from 'react';
import { useMotionPolicy } from './use-motion-policy';
export type TextLoopProps={children:ReactNode[];className?:string;interval?:number;transition?:Transition;variants?:Variants;onIndexChange?:(index:number)=>void;trigger?:boolean;mode?:AnimatePresenceProps['mode'];paused?:boolean};
export function TextLoop({children,className,interval=2,transition={duration:.3},variants,onIndexChange,trigger=true,mode='popLayout',paused=false}:TextLoopProps){
 const [currentIndex,setCurrentIndex]=useState(0),index=useRef(0);const disabled=useMotionPolicy(paused);const items=Children.toArray(children);
 useEffect(()=>{if(disabled||!trigger||items.length<2)return;const delay=Number.isFinite(interval)?Math.min(60,Math.max(.2,interval)):2;const timer=setInterval(()=>{index.current=(index.current+1)%items.length;setCurrentIndex(index.current);onIndexChange?.(index.current);},delay*1000);return()=>clearInterval(timer);},[disabled,trigger,interval,items.length,onIndexChange]);
 if(!items.length)return null;const value=items[currentIndex%items.length];
 if(disabled)return <div className={cn('relative inline-block whitespace-nowrap',className)}>{value}</div>;
 return <div className={cn('relative inline-block whitespace-nowrap',className)}><AnimatePresence mode={mode} initial={false}><motion.div key={currentIndex} initial='initial' animate='animate' exit='exit' transition={transition} variants={variants||{initial:{y:20,opacity:0},animate:{y:0,opacity:1},exit:{y:-20,opacity:0}}}>{value}</motion.div></AnimatePresence></div>;
}
