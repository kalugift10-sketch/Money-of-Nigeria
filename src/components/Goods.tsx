"use client";

import { useState } from "react";
import { Lightbox } from "./Lightbox";
import s from "./Story.module.css";

/** Goods that served as money before currency. */
export function Goods({ goods, tint }: { goods: { name: string; note: string; image?: string }[]; tint: string }) {
  const imgs = goods.map((g) => g.image).filter(Boolean) as string[];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={s.goods}>
      <p className="label">Used as money</p>
      <div className={s.goodsRow}>
        {goods.map((g) => (
          <div key={g.name} className={s.good}>
            <button className={s.goodImg} style={{ background: tint }} onClick={() => g.image && setOpen(imgs.indexOf(g.image))} aria-label={`View ${g.name}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {g.image && <img src={g.image} alt="" />}
            </button>
            <strong>{g.name}</strong>
            {g.note && <span>{g.note}</span>}
          </div>
        ))}
      </div>
      {open !== null && <Lightbox images={imgs} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
