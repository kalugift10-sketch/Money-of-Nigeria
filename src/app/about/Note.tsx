"use client";

import { useEffect, useRef } from "react";
import s from "./about.module.css";

/** Gift's G-Money note. Tilts with the cursor (desktop) or phone movement (mobile).
 *  Replace /public/images/g-money-2026.webp with the final generated note. */
export function Note() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const set = (x: number, y: number) => { if (el.current) el.current.style.transform = `rotate(-3deg) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`; };
    const onMove = (e: MouseEvent) => set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    const onTilt = (e: DeviceOrientationEvent) => set(((e.gamma ?? 0) / 45), (((e.beta ?? 45) - 45) / 45));
    window.addEventListener("mousemove", onMove);
    window.addEventListener("deviceorientation", onTilt);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("deviceorientation", onTilt); };
  }, []);
  return (
    <div className={s.noteScene}>
      <div ref={el} className={s.note}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/g-money-2026.webp" alt="Gift Kalu on a G-Money note" />
      </div>
    </div>
  );
}
