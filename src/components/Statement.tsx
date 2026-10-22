"use client";

import { useEffect, useRef, useState } from "react";
import type { Statement as S } from "@/lib/data";
import s from "./Story.module.css";

/** Reads in order: lead, the number (counts up when seen), tail. */
export function Statement({ lead, number, tail }: S) {
  const ref = useRef<HTMLElement>(null);
  const m = number.match(/[\d.,]+/);
  const target = m ? parseFloat(m[0].replace(/,/g, "")) : 0;
  const decimals = m && m[0].includes(".") ? m[0].split(".")[1].length : 0;
  const [val, setVal] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !m) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      setVal(0);
      const t0 = performance.now();
      const run = (t: number) => {
        const k = Math.min(1, (t - t0) / 1400);
        setVal(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number]);

  const shown = val === null || !m ? number : number.replace(m[0], val.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  return (
    <section ref={ref} className={s.statement}>
      <p className={s.lead}>{lead}</p>
      <p className={s.number}>{shown}</p>
      <p className={s.lead}>{tail}</p>
    </section>
  );
}
