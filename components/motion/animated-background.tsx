// Derived from Motion Primitives (MIT). See LICENSE and ORIGIN.json.
'use client';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { Children, cloneElement, useState, useId, type ReactElement, type ReactNode, type MouseEventHandler } from 'react';
import { useMotionPolicy } from './use-motion-policy';
type ChildProps={'data-id':string;className?:string;children?:ReactNode;onClick?:MouseEventHandler<HTMLElement>;onMouseEnter?:MouseEventHandler<HTMLElement>;onMouseLeave?:MouseEventHandler<HTMLElement>};
export type AnimatedBackgroundProps={children:ReactElement<ChildProps>[]|ReactElement<ChildProps>;defaultValue?:string;value?:string|null;onValueChange?:(value:string|null)=>void;className?:string;transition?:Transition;enableHover?:boolean;paused?:boolean};
export function AnimatedBackground({children,defaultValue,value,onValueChange,className,transition,enableHover=false,paused=false}:AnimatedBackgroundProps){
 const [internal,setInternal]=useState<string|null>(defaultValue??null);const unique=useId(),disabled=useMotionPolicy(paused);const active=value===undefined?internal:value;
 const choose=(id:string|null)=>{setInternal(id);onValueChange?.(id);};
 return Children.map(children,child=>{const id=child.props['data-id'];const interaction=enableHover?{onMouseEnter:((event)=>{child.props.onMouseEnter?.(event);if(!event.defaultPrevented)choose(id);})as MouseEventHandler<HTMLElement>,onMouseLeave:((event)=>{child.props.onMouseLeave?.(event);if(!event.defaultPrevented)choose(null);})as MouseEventHandler<HTMLElement>}:{onClick:((event)=>{child.props.onClick?.(event);if(!event.defaultPrevented)choose(id);})as MouseEventHandler<HTMLElement>};
 return cloneElement(child,{key:id,className:cn('relative inline-flex',child.props.className),...interaction,'data-id':id},<>{active===id&&(disabled?<span className={cn('absolute inset-0',className)} aria-hidden="true"/>:<AnimatePresence initial={false}><motion.span layoutId={`background-${unique}`} className={cn('absolute inset-0',className)} transition={transition} initial={{opacity:defaultValue?1:0}} animate={{opacity:1}} exit={{opacity:0}} aria-hidden="true"/></AnimatePresence>)}<span className="relative z-10">{child.props.children}</span></>);});
}
