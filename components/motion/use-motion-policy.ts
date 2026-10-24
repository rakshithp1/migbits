"use client";
import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
const subscribe=(notify:()=>void)=>{document.addEventListener("visibilitychange",notify);return()=>document.removeEventListener("visibilitychange",notify);};
export function useMotionPolicy(paused=false){const visible=useSyncExternalStore(subscribe,()=>document.visibilityState!=="hidden",()=>true);const reduced=useReducedMotion();return paused||reduced===true||!visible;}
