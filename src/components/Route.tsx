"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate, type Change } from "@/lib/data";
import s from "./Story.module.css";

/**
 * The journey: a line that draws as you scroll, with each change as a stop.
 * Desktop winds left/right; mobile is one straight line. Click a stop to expand.
 */
export function Route({ changes }: { changes: Change[] }) {
  const box = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(1);
  const [seen, setSeen] = useState<number>(changes.length);
  const [open, setOpen] = useState<Set<number>>(() => new Set(changes.map((_, i) => i)));

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    setDrawn(0);
    setSeen(0);
    const onScroll = () => {
      const el = box.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const k = Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (r.height * 0.9)));
      setDrawn(k);
      setSeen(Math.ceil(k * changes.length + 0.01));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [changes.length]);

  const step = 260;
  const H = changes.length * step + 40;
  const pts = changes.map((_, i) => ({ x: i % 2 === 0 ? 300 : 1060, y: 60 + i * step }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    d += ` C ${a.x} ${a.y + step * 0.6} ${b.x} ${b.y - step * 0.6} ${b.x} ${b.y}`;
  }

  return (
    <section className={s.journey}>
      <p className="label">Details</p>
      <div ref={box} className={s.route} style={{ ["--h" as string]: `${H}px` }}>
        <svg className={s.line} viewBox={`0 0 1360 ${H}`} preserveAspectRatio="none" aria-hidden>
          <path d={d} className={s.track} />
          <path ref={path} d={d} pathLength={1} style={{ strokeDasharray: "1", strokeDashoffset: 1 - drawn }} />
        </svg>
        <div className={s.rail} aria-hidden><span style={{ transform: `scaleY(${drawn})` }} /></div>
        <ol className={s.stops}>
          {changes.map((c, i) => (
            <li key={i} className={`${s.stop} ${i % 2 ? s.r : s.l} ${i < seen ? s.in : ""}`} style={{ ["--y" as string]: `${pts[i].y}px` }}>
              <span className={s.dot} />
              <button className={s.card} onClick={() => setOpen((o) => { const n = new Set(o); if (n.has(i)) n.delete(i); else n.add(i); return n; })} aria-expanded={open.has(i)}>
                <span className={s.year}>{formatDate(c.date)}</span>
                <span className={s.ctitle}>{c.title}</span>
                <span className={`${s.what} ${open.has(i) ? s.show : ""}`}>
                  {c.what}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
