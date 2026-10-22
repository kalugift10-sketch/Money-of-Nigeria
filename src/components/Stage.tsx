"use client";

import { useEffect, useState } from "react";
import type { Entry } from "@/lib/data";
import { Guilloche } from "./Guilloche";
import { Object3D } from "./Object3D";
import { Lightbox } from "./Lightbox";
import s from "./Stage.module.css";

/** The coloured box the object sits in. Colour comes from the object. */
export function Stage({ e }: { e: Entry }) {
  const images = [e.images.front, e.images.back].filter(Boolean) as string[];
  const [sel, setSel] = useState(0);
  const [zoom, setZoom] = useState(false); // full view (lightbox)
  const [level, setLevel] = useState(1); // zoom level; 1 = not zoomed
  const mag = level > 1;
  const [origin, setOrigin] = useState("50% 50%");
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(window.matchMedia("(pointer: coarse)").matches), []);
  useEffect(() => { setLevel(1); setSel(0); }, [e.slug]); // new item: back to normal
  const canTurn = !!e.turn || e.kind === "coin" || e.kind === "note";
  const front = images[sel] ?? images[0];
  const back = images.length > 1 ? images[(sel + 1) % images.length] : undefined;

  return (
    <div className={s.media}>
      <div className={s.stage} style={{ background: e.tintColors[0] }} onMouseLeave={() => { if (!touch) setLevel(1); }}
        onClick={(ev) => { if ((ev.target as HTMLElement).closest("button")) return; if (front && !mag) setZoom(true); }}>
        <Guilloche color={e.tintColors[1]} />
        {!front ? (
          <span className={`${s.ph} ${e.status === "Never issued" ? s.word : ""}`}>{e.status === "Never issued" ? "Proposed" : "₦"}</span>
        ) : e.type === "story" && !e.turn ? (
          front ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={front} alt={e.name} className={`${s.flat} ${e.slug === "trade-by-barter" ? s.fill : ""}`} onError={(ev) => { ev.currentTarget.style.visibility = "hidden"; }} />
          ) : <span className={s.ph}>₦</span>
        ) : (
          <Object3D front={front} back={back} alt={e.name} kind={e.kind} turn={canTurn} />
        )}
        {front && (
          mag ? (
            <div className={s.zoomPair}>
              <button className={s.zoom2} onClick={() => setLevel((l) => Math.min(4, l + 0.5))} aria-label="Zoom in" disabled={level >= 4}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
              <button className={s.zoom2} onClick={() => setLevel((l) => Math.max(1, l - 0.5))} aria-label="Zoom out">
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
          ) : (
            <button className={s.zoom} onClick={() => setLevel(1.5)} aria-label="Zoom in">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" /><path d="M11 11l3 3M5 7h4M7 5v4" stroke="currentColor" /></svg>
            </button>
          )
        )}
        {mag && front && (
          <div className={s.mag} onMouseMove={(ev) => { const r = ev.currentTarget.getBoundingClientRect(); setOrigin(`${((ev.clientX - r.left) / r.width) * 100}% ${((ev.clientY - r.top) / r.height) * 100}%`); }}
            onTouchMove={(ev) => { const r = ev.currentTarget.getBoundingClientRect(); const t0 = ev.touches[0]; setOrigin(`${((t0.clientX - r.left) / r.width) * 100}% ${((t0.clientY - r.top) / r.height) * 100}%`); }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={front} alt="" style={{ transformOrigin: origin, transform: `scale(${level})` }} />
          </div>
        )}
      </div>
      {images.length > 0 && (
        <div className={s.boxes}>
          {images.map((src, i) => (
            <button key={src + i} className={`${s.box} ${i === sel ? s.on : ""}`} style={{ background: e.tintColors[0] }} onClick={() => { setSel(i); setLevel(1); }} aria-label={`Show image ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" onError={(ev) => { ev.currentTarget.style.visibility = "hidden"; }} />
            </button>
          ))}
        </div>
      )}
      {zoom && images.length > 0 && <Lightbox images={images} index={sel} onIndex={setSel} onClose={() => setZoom(false)} />}
    </div>
  );
}
