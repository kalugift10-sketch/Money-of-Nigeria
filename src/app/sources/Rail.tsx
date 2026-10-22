"use client";
import { useEffect, useState } from "react";
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
  useEffect(() => {
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setOn(e.target.id); }, { rootMargin: "-30% 0px -65% 0px" });
    items.forEach((i) => { const el = document.getElementById(i.slug); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  return (
    <nav className={`${s.rail} ${open ? s.open : ""}`} aria-label="Jump to an item"
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
