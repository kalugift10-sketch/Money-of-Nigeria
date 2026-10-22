"use client";

import { useState } from "react";
import type { Version } from "@/lib/data";
import { Lightbox } from "./Lightbox";
import s from "./Versions.module.css";

/** Every version we have images of, in release order, each on old paper. */
export function Versions({ versions, named = false, active = false }: { versions: Version[]; named?: boolean; active?: boolean }) {
  const shown = versions.filter((v) => v.images.front || v.images.back);
  const all = shown.flatMap((v) => [v.images.front, v.images.back].filter(Boolean) as string[]);
  const [open, setOpen] = useState<number | null>(null);
  if (shown.length < 2) return null;
  let n = 0;
  return (
    <section className={s.wrap}>
      <p className="label">Versions</p>
      <div className={s.row}>
        {shown.map((v, vi) => {
          const imgs = [v.images.front, v.images.back].filter(Boolean) as string[];
          const start = n; n += imgs.length;
          const current = active && vi === shown.length - 1;
          return (
            <div key={v.key} className={s.v}>
              <div className={`paper ${s.paper}`}>
                {imgs.map((src, i) => (
                  <button key={src} className={s.img} onClick={() => setOpen(start + i)} aria-label={`View ${v.label}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
              <p className={`${s.year} ${current ? s.current : ""} ${v.year === "Date unknown" ? s.unknown : ""}`}>{named ? `${v.label.replace(/\s*\(.*\)$/, "")} · ` : ""}{v.year}{current ? " – till date" : ""}</p>
            </div>
          );
        })}
      </div>
      <p className={s.foot}>Click to view.</p>
      {open !== null && <Lightbox images={all} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
