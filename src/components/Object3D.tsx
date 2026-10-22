"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Object3D.module.css";

type Props = {
  front?: string;
  back?: string;
  alt: string;
  kind?: "coin" | "note" | null;
  turn?: boolean; // can this object be turned in 3D?
  size?: "lg" | "md";
};

/**
 * Real 3D from the photos we already have:
 * coins become a disc with thickness, notes a thin card.
 * Desktop: spins while hovered. Touch: turns on its own, drag to turn.
 */
export function Object3D({ front, back, alt, kind, turn = true, size = "lg" }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  const [touch, setTouch] = useState(false);
  const [hover, setHover] = useState(false);
  const drag = useRef<{ x: number; a: number } | null>(null);
  const reduce = useRef(false);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Animate: hover on desktop, always on touch (unless dragging).
  useEffect(() => {
    if (!turn || reduce.current) return;
    const spinning = touch ? true : hover;
    if (!spinning) {
      // ease back to the front
      setAngle((a) => Math.round(a / 360) * 360);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      if (!drag.current) setAngle((a) => a + dt * (touch ? 0.03 : 0.05));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hover, touch, turn]);

  // The coin's edge takes the coin's own colour (sampled from the photo), slightly darker.
  const [edge, setEdge] = useState<string | null>(null);
  useEffect(() => {
    if (kind !== "coin" || !front) return;
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = c.height = 16;
        const g = c.getContext("2d")!;
        g.drawImage(img, 0, 0, 16, 16);
        const d = g.getImageData(0, 0, 16, 16).data;
        let r = 0, gg = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
        if (n) setEdge(`rgb(${Math.round((r / n) * 0.72)}, ${Math.round((gg / n) * 0.72)}, ${Math.round((b / n) * 0.72)})`);
      } catch {}
    };
    img.src = front;
  }, [front, kind]);

  const isCoin = kind === "coin";
  const layers = isCoin ? 10 : 2;

  return (
    <div
      ref={el}
      className={`${styles.scene} ${styles[size]}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPointerDown={(e) => {
        if (!turn || !touch) return;
        drag.current = { x: e.clientX, a: angle };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        setAngle(drag.current.a + (e.clientX - drag.current.x) * 0.6);
      }}
      onPointerUp={() => (drag.current = null)}
    >
      <div
        className={`${styles.obj} ${isCoin ? styles.coin : styles.flat} ${hover || touch ? "" : styles.settle}`}
        style={{ transform: `rotateY(${angle}deg)` }}
      >
        {isCoin &&
          Array.from({ length: layers }).map((_, i) => (
            <div key={i} className={styles.edge} style={{ transform: `translateZ(${i - layers / 2 + 0.5}px) scale(0.985)`, background: edge ?? undefined, WebkitMaskImage: `url(${front})`, maskImage: `url(${front})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }} />
          ))}
        <Face src={front} alt={alt} cls={styles.front} z={isCoin ? layers / 2 + 1 : 1} round={isCoin} />
        <Face src={back ?? front} alt="" cls={styles.back} z={isCoin ? layers / 2 + 1 : 1} round={isCoin} flip />
      </div>
    </div>
  );
}

function Face({ src, alt, cls, z, round, flip }: { src?: string; alt: string; cls: string; z: number; round: boolean; flip?: boolean }) {
  return (
    <div className={`${styles.face} ${cls} ${round ? styles.round : ""}`} style={{ transform: `${flip ? "rotateY(180deg) " : ""}translateZ(${z}px)` }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} draggable={false} onError={(ev) => { ev.currentTarget.style.visibility = "hidden"; }} />
      ) : (
        <span className={styles.ph} aria-hidden>₦</span>
      )}
    </div>
  );
}
