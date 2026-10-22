"use client";

import { useEffect } from "react";
import s from "./Lightbox.module.css";

/** Full-screen image view used for every clickable image on the site.
 *  Only the image, an X, and arrows where there is a previous/next image. */
export function Lightbox({ images, index, onIndex, onClose }: { images: string[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onIndex(index - 1);
      if (e.key === "ArrowRight" && hasNext) onIndex(index + 1);
    };
    window.addEventListener("keydown", onKey);
    const o = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = o; };
  }, [index, hasPrev, hasNext, onIndex, onClose]);

  return (
    <div className={s.back} onClick={onClose} role="dialog" aria-modal="true">
      <button className={s.x} onClick={onClose} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.6" /></svg>
      </button>
      {hasPrev && (
        <button className={`${s.arrow} ${s.l}`} onClick={(e) => { e.stopPropagation(); onIndex(index - 1); }} aria-label="Previous image">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden><path d="M11 3L5 9l6 6" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[index]} alt="" className={s.img} onClick={(e) => e.stopPropagation()} />
      {hasNext && (
        <button className={`${s.arrow} ${s.r}`} onClick={(e) => { e.stopPropagation(); onIndex(index + 1); }} aria-label="Next image">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden><path d="M7 3l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
      )}
    </div>
  );
}
