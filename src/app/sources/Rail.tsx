"use client";
import { useEffect, useRef, useState } from "react";
import s from "./sources.module.css";

type Item = { slug: string; name: string; era: string };
const ERA: Record<string, string> = {
  "pre-colonial": "Pre-colonial", colonial: "Colonial", "pound-era": "The Pound Era",
  biafra: "Biafra", "naira-era": "The Naira Era", digital: "Digital",
};

/** Left rail: short lines at rest (longer line = start of an era, green = where you are).
 *  Hover (or tap on phones) opens it to show era names and item names. */
export function Rail({ items }: { items: Item[] }) {
  const [on, setOn] = useState(items[0]?.slug);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false); // hide over the footer
  const nav = useRef<HTMLElement>(null);
  // Keep the green line in view: the rail scrolls with the page when it is taller than the screen.
  useEffect(() => {
    const r = nav.current; const a = r?.querySelector(`a[href="#${on}"]`) as HTMLElement | null;
    if (!r || !a) return;
    const t = a.offsetTop - r.clientHeight / 2;
    r.scrollTo({ top: Math.max(0, t), behavior: "smooth" });
  }, [on]);
  useEffect(() => {
    const f = document.querySelector("footer"); if (!f) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting));
    io.observe(f); return () => io.disconnect();
  }, []);
  // Active item = the last section whose top has passed 35% of the screen.
  // Works for short sections too (an observer skipped them), and to the very end.
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let cur = items[0]?.slug;
      for (const i of items) {
        const el = document.getElementById(i.slug);
        if (el && el.getBoundingClientRect().top <= line) cur = i.slug;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const f = document.querySelector("footer");
        if (!f || f.getBoundingClientRect().top > window.innerHeight) cur = items[items.length - 1]?.slug;
      }
      setOn(cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [items]);
  return (
    <nav ref={nav} className={`${s.rail} ${open ? s.open : ""} ${hidden ? s.hidden : ""}`} aria-label="Jump to an item"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setOpen(true); }} onPointerLeave={(e) => { if (e.pointerType === "mouse") setOpen(false); }}>
      <button className={s.railToggle} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Show the list of items" />
      {items.map((i, k) => {
        const first = k === 0 || items[k - 1].era !== i.era;
        return (
          <div key={i.slug}>
            {first && <p className={s.era}><span className={s.tickEra} /><span className={s.label}>{ERA[i.era] ?? i.era}</span></p>}
            <a href={`#${i.slug}`} className={i.slug === on ? s.railOn : ""} onClick={() => setOpen(false)}>
              <span className={s.tick} /><span className={s.label}>{i.name}</span>
            </a>
          </div>
        );
      })}
    </nav>
  );
}
